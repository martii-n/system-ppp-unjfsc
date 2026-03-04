<?php

namespace App\Services\Registration;

use App\Enums\Assignment\AssignmentStatus;
use App\Enums\Assignment\AssignmentAccessStatus;
use App\Enums\Assignment\AssignmentApprovalStatus;
use App\Enums\Assignment\AssignmentReviewStatus;
use App\Models\Assignment;
use App\Models\Dossier;
use App\Models\Person;
use App\Models\Section;
use App\Models\Semester;
use App\Models\User;
use App\Enums\Academic\SemesterStatus;
use App\Enums\PersonStatus;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class UserRegistrationService
{
    /**
     * Validate the data for the first step of the registration process.
     *
     * @param array $data The data to validate.
     * @return array An array of errors, if any.
     */
    public function validateStepOne(array $data): array
    {
        // El semestre debe obtenerse de forma dinámica.
        $currentSemester = Semester::query()->where('status', SemesterStatus::ACTIVE)->first() ?? Semester::query()->latest('id')->first();
        if (!$currentSemester) {
            throw ValidationException::withMessages(['semester' => 'No se encontró un semestre activo para la operación.']);
        }
        $semesterId = $currentSemester->id;

        $user = User::query()->where('email', $data['email'])->first();

        $person = collect();
        if ($user) {
            $this->validateRoleRules($user, $data['role_id'], $data['section_id'], $semesterId);
            $person = Person::query()->where('id', $user->person_id)->select('dni', 'names', 'surnames')->first() ?? collect();
        }

        return [
            'user_exists' => (bool) $user,
            'user_id' => $user?->id,
            'email' => $data['email'],
            'role_id' => $data['role_id'],
            'section_id' => $data['section_id'],
            'semester_id' => $semesterId,
            'next_step' => 'PERSON_LOOKUP',
            'person' => $person,
        ];
    }

    /**
     * Validate step two of the registration process.
     *
     * @param array $data
     * @return array
     */
    public function validateStepTwo(array $data): array
    {
        $person = Person::query()->where('dni', $data['dni'])->first();

        if (!$person) {
            return [
                'person_exists' => false,
                'dni' => $data['dni'],
                'next_step' => 'PERSON_CREATE'
            ];
        }

        return [
            'person_exists' => true,
            'person' => [
                'id' => $person->id,
                'dni' => $person->dni,
                'names' => $person->names,
                'surnames' => $person->surnames,
            ],
            'next_step' => 'FINALIZE_REGISTRATION'
        ];
    }

    /**
     * Finalize the registration process by creating the necessary records.
     * This method includes a security check to re-validate data consistency.
     *
     * @param array $data The validated data from the frontend.
     * @return array The result of the operation.
     */
    public function validateStepThree(array $data): array
    {
        // --- INICIO DEL BLOQUE DE SEGURIDAD Y COHERENCIA ---
        $currentSemester = Semester::query()->where('status', SemesterStatus::ACTIVE)->first() ?? Semester::query()->latest('id')->first();
        if (!$currentSemester) {
            throw new Exception('No se encontró un semestre activo para la asignación.');
        }

        $user = null;
        if (!empty($data['user_id'])) {
            $user = User::find($data['user_id']);
            // Verificación: El email del payload debe coincidir con el del user_id encontrado.
            if ($user && $user->email !== $data['email']) {
                 throw ValidationException::withMessages(['user_id' => 'Inconsistencia de datos: El ID de usuario no corresponde al email proporcionado.']);
            }
        } else {
            // Si no hay user_id, buscamos por email. Si existe, es un usuario existente.
             $user = User::where('email', $data['email'])->first();
        }

        // Si después de las verificaciones tenemos un usuario, aplicamos las reglas de negocio.
        if ($user) {
            // Re-validación de Reglas de Negocio (reutilizando la lógica de Step 1)
            $this->validateRoleRules($user, $data['role_id'], $data['section_id'], $currentSemester->id);

            // Verificación de Coherencia: El person_id del usuario debe coincidir con el del payload.
            if (!empty($data['person']['id']) && $user->person_id != $data['person']['id']) {
                throw ValidationException::withMessages(['person' => 'Inconsistencia de datos: La persona indicada no corresponde al usuario existente.']);
            }
        }
        // --- FIN DEL BLOQUE DE SEGURIDAD ---

        try {
            $result = DB::transaction(function () use ($data, $user, $currentSemester) {
                $person = null;
                if (!empty($data['person']['id'])) {
                    $person = Person::query()->findOrFail($data['person']['id']);
                } else {
                    // Para una persona nueva, usamos los nombres del payload.
                    $person = Person::query()->create([
                        'dni' => $data['person']['dni'],
                        'names' => $data['person']['names'],
                        'surnames' => $data['person']['surnames'],
                        'status' => PersonStatus::ACTIVE
                    ]);
                }

                $finalUser = $user; // Usamos el usuario ya verificado de la fase de seguridad.
                $temporaryPassword = null;
                if (!$finalUser) {
                    // Si llegamos aquí, es porque el usuario no existía. Lo creamos.
                    $temporaryPassword = Str::password(10, true, true, false, false);
                    $finalUser = User::query()->create([
                        'name' => $data['person']['names'],
                        'email' => $data['email'],
                        'password' => Hash::make($temporaryPassword),
                        'person_id' => $person->id,
                    ]);
                }

                $assignment = Assignment::query()->create([
                    'user_id' => $finalUser->id,
                    'role_id' => $data['role_id'],
                    'section_id' => $data['section_id'],
                    'semester_id' => $currentSemester->id,
                    'status' => AssignmentStatus::ACTIVE,
                    'access_status' => AssignmentAccessStatus::LIMITED,
                    'approval_status' => AssignmentApprovalStatus::PENDING,
                    'review_status' => AssignmentReviewStatus::NONE,
                ]);

                // Register in Dossiers
                Dossier::query()->create([
                    'assignment_id' => $assignment->id,
                ]);

                return [
                    'user' => $finalUser->load('person'),
                    'assignment' => $assignment,
                    'temporary_password' => $temporaryPassword,
                ];
            });

            return [
                'success' => true,
                'message' => '¡Registro completado exitosamente!',
                'data' => $result,
            ];
        } catch (ValidationException $e) {
            // Capturamos específicamente las excepciones de validación para devolver los mensajes correctos.
            throw $e;
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Ocurrió un error durante el registro: ' . $e->getMessage(),
                'data' => null,
            ];
        }
    }

    private function  authorizeUserAction(User $authUser, int $targetRoleId, int $targetSectionId): void
    {
        $authAssignment = Assignment::query()->where('user_id', $authUser->id)
            ->where('status', AssignmentStatus::ACTIVE)
            ->first();

        if (!$authAssignment) {
            throw ValidationException::withMessages([
                'auth' => "No tienes un asignación activa para realizar registros."
            ]);
        }

        $myRole = $authAssignment->role_id;

        // Rule 1: Roles 4 and 5 not register
        if (in_array($myRole, [4, 5])) {
            throw ValidationException::withMessages([
                'auth' => "Tu rol actual no tiene permiso para realizar registros."
            ]);
        }

        if ($myRole === 3) {
            if (!in_array($targetRoleId, [4, 5])) {
                throw ValidationException::withMessages([
                    'role' => "Como Docente Titular, solo puede registrar a Docentes Supervisores o Estudiantes."
                ]);
            }

            if ($authAssignment->section_id !== $targetSectionId) {
                throw ValidationException::withMessages([
                    'section' => "Solo puedes realizar registros para tu propia sección asignada."
                ]);
            }
        }

        if ($myRole === 1) {
            return;
        }
    }

    private function validateRoleRules(User $user, int $newRoleId, int $newSectionId, int $semesterId): void
    {
        // 1. Obtener todas las asignaciones actuales del usuario para este semestre
        // Incluimos la relación 'section' para saber a qué facultad pertenecen
        $currentAssignments = Assignment::with(['section', 'role'])
            ->where('user_id', $user->id)
            ->where('semester_id', $semesterId)
            ->where('status', AssignmentStatus::ACTIVE)
            ->get();

        if ($currentAssignments->isEmpty()) {
            return; // Si no tiene asignaciones, puede registrarse en cualquier rol
        }

        $roleNames = $currentAssignments->pluck('role.name')->unique()->toArray();

        $firstAssignment = $currentAssignments->first();
        $existingRoleName = $firstAssignment->role->name;

        // --- CASE 1: ROLES OF ASSIGNMENT UNIQUE (1, 2, 3, 5) ---
        if (in_array($newRoleId, [1, 2, 3, 5])) {
            if ($firstAssignment->section_id === $newSectionId) {
                throw ValidationException::withMessages([
                    'section' => 'El usuario ya se encuentra registrado en esta sección como '.$existingRoleName.'. Revise la lista.'
                ]);
            }

            throw ValidationException::withMessages([
                'role' => 'El usuario ya cuenta con una asignación activa en este semestre como '.$existingRoleName.'.'
            ]);
        }

        // --- CASE 2: THE NEW ROLE IS SUPERVISOR (4), BUT THE USER HAS ANOTHER ROLE ---
        if ($newRoleId === 4) {
            if ($firstAssignment->role_id !== 4) {
                throw ValidationException::withMessages([
                    'role' => "El usuario no puede ser Docente Supervisor porque ya está registrado como {$existingRoleName}."
                ]);
            }

            $newSection = Section::query()->findOrFail($newSectionId);
            $newFacultyId = $newSection->faculty_id;

            foreach ($currentAssignments as $assignment) {
                if ($assignment->section->faculty_id !== $newFacultyId) {
                    throw ValidationException::withMessages([
                        'section' => "Como Docente Supervisor, todas sus asignaciones deben pertenecer a la misma Facultad."
                    ]);
                }

                if ($assignment->section_id === $newSectionId) {
                    throw ValidationException::withMessages([
                        'section_id' => 'El usuario ya se encuentra registrado en esta sección como Docente Supervisor.'
                    ]);
                }
            }
        }

        // --- CASE 3: THEY TRY TO REGISTER OTHER ROLE WHEN THE USER IS SUPERVISOR ---
        if (in_array(4, $currentAssignments->pluck('role_id')->toArray()) && $newRoleId !== 4) {
            throw ValidationException::withMessages([
                'role' => "El usuario ya está registrado como Docente Supervisor y no puede tener un rol diferente."
            ]);
        }
    }
}

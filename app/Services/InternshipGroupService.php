<?php

namespace App\Services;

use App\Models\Assignment;
use App\Models\InternshipGroup;
use App\Models\StudentGroup;
use Exception;
use Illuminate\Support\Facades\DB;
use App\Services\SupervisionService;

class InternshipGroupService
{

    private $supervisionService;

    public function __construct(SupervisionService $supervisionService)
    {
        $this->supervisionService = $supervisionService;
    }

    /**
     * Create a new internship group.
     *
     * @param array $data The data for the new internship group.
     * @return array The created internship group.
     */
    public function createGroup(array $data): array
    {
        try {
            $teacher = Assignment::query()->findOrFail($data['teacher_assignment_id']);
            $supervisor = Assignment::query()->findOrFail($data['supervisor_assignment_id']);

            /*if ($teacher->approval_status !== 1 || $supervisor->approval_status !== 1) {
                throw new Exception('No se puede crear el grupo. Los docentes asignados no tienen el expediente aprobado.');
            }*/

            $alreadyAssigned = InternshipGroup::query()
                ->where('supervisor_assignment_id', $supervisor->id)
                ->where('status', 1)
                ->exists();

            if ($alreadyAssigned) {
                throw new Exception('El docente supervisor ya tiene un grupo asignado en esta sección.');
            }

            $group = InternshipGroup::query()->create([
                'name' => $data['name'],
                'teacher_assignment_id' => $teacher->id,
                'supervisor_assignment_id' => $supervisor->id,
                'section_id' => $data['section_id'],
                'module_id' => 1,
                'status' => 1,
            ]);

            return [
                'success' => true,
                'message' => '¡Grupo de prácticas creado exitosamente!',
                'data' => $group->load(['teacher.user.person', 'supervisor.user.person', 'section'])
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Asigna estudiantes a un grupo de prácticas.
     *
     * @param int $groupId
     * @param array $studentIds
     * @return void
     */
    public function attachStudents(int $groupId, array $studentIds): array
    {
        try {
            $group = InternshipGroup::query()->findOrFail($groupId);

            $processed = DB::transaction(function () use ($group, $studentIds) {
                $count = 0;
                foreach ($studentIds as $assignmentId) {
                    $assignment = Assignment::query()->findOrFail($assignmentId);

                    if ($assignment->access_status != 1) continue;

                    StudentGroup::query()->updateOrCreate(
                        [
                            'internship_group_id' => $group->id,
                            'student_assignment_id' => $assignment->id,
                        ],
                        [
                            'status' => 1,
                        ]
                    );
                    $this->supervisionService->initializeStudentProgress($assignment->id);

                    $count++;
                }
                return $count;
            });

            $this->supervisionService->syncGroupModule($group->id);

            return [
                'success' => true,
                'message' => "Se han asignado {$processed} estudiantes al grupo correctamente.",
                'data' => $group->load('students.user.person'),
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al asignar estudiante: '.$e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Desasigna estudiantes de un grupo de prácticas.
     *
     * @param int $groupId El ID del grupo de prácticas.
     * @param array $studentIds Los IDs de los estudiantes a desasignar.
     * @return array Un array con el resultado de la operación.
     */
    public function detachStudents(int $groupId, array $studentIds): array
    {
        try {
            $deleted = StudentGroup::query()->where('internship_group_id', $groupId)
                ->whereIn('student_assignment_id', $studentIds)
                ->delete();

            $this->supervisionService->syncGroupModule($groupId);

            return [
                'success' => true,
                'message' => "Se han retirado {$deleted} estudiantes del grupo",
                'data' => InternshipGroup::query()->find($groupId)->load('students.user.person')
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al desasignar estudiantes: '.$e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Mueve estudiantes de un grupo a otro.
     *
     * @param array $studentIds
     * @return array
     */
    public function moveStudents(int $currentGroupId, int $targetGroupId, array $studentIds): array
    {
        try {
            return DB::transaction(function () use ($currentGroupId, $targetGroupId, $studentIds) {
                StudentGroup::query()->where('internship_group_id', $currentGroupId)
                    ->whereIn('student_assignment_id', $studentIds)
                    ->delete();

                $this->supervisionService->syncGroupModule($currentGroupId);

                $result = $this->attachStudents($targetGroupId, $studentIds);

                return [
                    'success' => true,
                    'message' => "Se han movido ". count($studentIds). " estudiantes exitosamente.",
                    'data' => [
                        'from_group_id' => $currentGroupId,
                        'to_group' => $result['data']
                    ]
                ];
            });
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al mover estudiantes: '.$e->getMessage(),
                'data' => null
            ];
        }
    }
}

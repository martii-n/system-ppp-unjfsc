<?php

namespace App\Services\Auth;

use App\Enums\Role;
use App\Models\Assignment;
use App\Models\Semester;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class SyncAcademicSessionService
{
    public function sync(User $user): void
    {
        $assignment = $user->assignments()
            ->where('status', 1)
            ->where('is_select', 1)
            ->first();

        if (! $assignment) {
            $assignment = $user->assignments()->latest()->first();
            if ($assignment) {
                $assignment->update(['is_select' => 1]);
            }
        }

        if (! $assignment) {
            return;
        }

        session(['assignment_id' => $assignment->id]);

        if (in_array($assignment->role_id, [Role::ADMIN, Role::SUBADMIN])) {
            if (! session()->has('semester_id')) {
                session(['semester_id' => Semester::getActiveSemester()?->id]);
            }
            return;
        }

        session(['semester_id' => $assignment->semester_id]);
    }

    public function syncSemester(User $user, Semester $semester): void
    {
        DB::transaction(function () use ($user, $semester) {
            $currentAssignmentId = session('assignment_id');
            $current = Assignment::find($currentAssignmentId);

            if (in_array($current->role_id, [1,2])) {
                // actualizamos el semester del current assignment
                $current->semester_id = $semester->id;
                $current->save();
                session(['semester_id' => $semester->id]);
                return;
            }

            $newAssignment = $user->assignments()
                ->where('semester_id', $semester->id)
                ->where('status', 1)
                ->first();
            if (! $newAssignment) {
                throw new \Exception('No hay asignaciones disponibles para este semestre');
            }

            $this->syncAssignment($user, $newAssignment);
        });
    }

    public function syncAssignment(User $user, Assignment $assignment): void
    {
        DB::transaction(function () use ($user, $assignment) {
            if ($assignment->user_id !== $user->id) {
                throw new \Exception('No puedes seleccionar esta asignación');
            }

            $oldAssignment = $user->assignments()->where('is_select', 1)->first();
            if ($oldAssignment) {
                $oldAssignment->update([
                    'is_select' => 0,
                ]);
            }

            $assignment->update([
                'is_select' => 1,
            ]);

            session(['assignment_id' => $assignment->id]);
            session(['semester_id' => $assignment->semester_id]);
        });
    }
}

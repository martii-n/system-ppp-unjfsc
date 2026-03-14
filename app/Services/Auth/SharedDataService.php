<?php

namespace App\Services\Auth;

use App\Models\Assignment;
use App\Models\Company;
use App\Models\Person;
use App\Models\Semester;
use App\Models\User;
use Illuminate\Support\Collection;

class SharedDataService
{
    public function __construct(protected SyncAcademicSessionService $syncService) {}

    public function getSharedPayload(User $user): array
    {
        $type = $user->typeUser;

        $payload = [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'type_id' => $type->id,
                'type' => $type->name,
                'avatar' => $this->getProfilePhoto($user),
                'profile_name' => $this->getProfileName($user),
            ],
        ];

        if ($type->id === 2) {
            $this->syncService->sync($user);

            $payload['academic'] = fn () => $this->getAcademicContext($user);
        }

        return $payload;
    }

    private function getProfileName(User $user): string
    {
        $profile = $user->authenticable;

        return match ($user->authenticable_type) {
            Person::class => "{$profile->names} {$profile->surnames}",
            Company::class => $profile->name,
            default => 'Sin nombre',
        };
    }

    private function getProfilePhoto(User $user): string | null
    {
        $profile = $user->authenticable;

        return match ($user->authenticable_type) {
            Person::class => $profile->path_photo,
            Company::class => $profile->path_photo,
            default => null,
        };
    }

    private function getAcademicContext(User $user): array
    {
        $semester_id = session('semester_id');

        return [
            'semesters' => $this->getAcademicSemesters($user),
            'assignments' => $this->getUserAssignments($user, $semester_id),
            'role_id' => $this->getSelectedRoleId($user),
            'selected_semester_id' => $semester_id,
        ];
    }

    /**
     * Get the user's assignments for the given semester.
     */
    private function getUserAssignments(User $user, int $semester_id): Collection
    {
        if (! $user || ! $semester_id) {
            return [];
        }

        return $user->assignments()
            ->where('status', 1)
            ->where(function ($query) use ($semester_id) {
                $query->where('semester_id', $semester_id)
                ->orWhereIn('role_id', [1, 2]);
            })
            ->with(['role', 'section.school'])
            ->get()
            ->map(fn ($asig) => [
                'id' => $asig->id,
                'role' => $asig->role->name,
                'initials' => substr($asig->role->name, 0, 2),
                'context' => $this->getAssignmentContext($asig),
                'selected' => $this->getAssignmentSelected($asig),
            ]);
    }

    private function getAssignmentContext(Assignment $asig): string
    {
        if ($asig->role_id === 1) {
            return 'Gestión de Sistema';
        }

        if ($asig->role_id === 2) {
            $faculty = $asig->section->school->faculty;

            return $faculty->name;
        }

        $school = $asig->section->school->name ?? 'N/A';
        $section = $asig->section->name ?? 'N/A';
        if (in_array($asig->role_id, [3, 4, 5])) {
            return "{$section} - {$school}";
        }

        return 'N/A';
    }

    private function getAssignmentSelected(Assignment $asig): bool
    {
        return session('assignment_id') === $asig->id;
    }

    private function getAcademicSemesters(User $user): Collection
    {
        $assignmentId = session('assignment_id');
        $assignment = Assignment::find($assignmentId);

        if (! $assignment) {
            return collect();
        }

        if ($assignment->role_id === 1) {
            return Semester::all();
        }

        $semesterIds = $user->assignments()->distinct()->pluck('semester_id');

        return Semester::whereIn('id', $semesterIds)->get();
    }

    private function getSelectedRoleId(?User $user): ?int
    {
        if (! $user) {
            return null;
        }

        $assignmentId = session('assignment_id');

        if (! $assignmentId) {
            return null;
        }

        return Assignment::find($assignmentId)?->role_id;
    }
}

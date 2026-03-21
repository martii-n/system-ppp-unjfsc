<?php

namespace App\Services;

use App\Models\Assignment;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class UserAssignmentService
{
    /**
     * Obtener asignaciones por rol y semestre.
     *
     * @param int $roleId
     * @param int $semesterId
     * @return Collection
     */
    public function getAssignmentsByRole(int $roleId, int $semesterId): Collection
    {
        return Assignment::query()
            ->with([
            'user.authenticable', // Carga Person o Company según sea el caso
            'role',
            'section.school.faculty', // Jerarquía académica para estudiantes/docentes
            'section.faculty', // Para casos donde la sección está ligada directamente a facultad
        ])
            ->where('role_id', $roleId)
            ->where('semester_id', $semesterId)
            ->get();
    }
}
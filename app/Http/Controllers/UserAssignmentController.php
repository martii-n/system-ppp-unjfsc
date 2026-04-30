<?php

namespace App\Http\Controllers;

use App\Http\Requests\Assignment\StoreAssignmentManageRequest;
use App\Models\Assignment;
use App\Models\Faculty;
use App\Services\AssignmentService;
use App\Services\UserAssignmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserAssignmentController extends Controller
{
    public function __construct(protected UserAssignmentService $assignmentService)
    {
    }

    /**
     * Listar Sub-Administradores (Role 2)
     */
    public function listSubAdmins(Request $request): Response
    {
        return $this->renderList($request, 2, 'Sub-Administradores');
    }

    /**
     * Listar Docentes Titulares (Role 3)
     */
    public function listTeachers(Request $request): Response
    {
        return $this->renderList($request, 3, 'Docentes Titulares');
    }

    /**
     * Listar Docentes Supervisores (Role 4)
     */
    public function listSupervisors(Request $request): Response
    {
        return $this->renderList($request, 4, 'Docentes Supervisores');
    }

    /**
     * Listar Estudiantes (Role 5)
     */
    public function listStudents(Request $request): Response
    {
        return $this->renderList($request, 5, 'Estudiantes');
    }

    /**
     * Método centralizado para renderizar la lista por rol.
     */
    private function renderList(Request $request, int $roleId, string $title): Response
    {
        $semesterId = session('semester_id');
        $currentAssignmentId = session('assignment_id');
        $currentAssignment = Assignment::find($currentAssignmentId);

        // Lógica Híbrida:
        // Admin/Subadmin (1, 2) o Estudiantes (5) -> Lista vacía al inicio (Server-side)
        // Docentes/Supervisores (3, 4) -> Cargamos data de su sección (Local-side)
        $assignments = [
            'data' => [],
            'current_page' => 1,
            'last_page' => 1,
            'total' => 0,
            'links' => []
        ];

        if ($currentAssignment && in_array($currentAssignment->role_id, [3, 4])) {
            $assignments = $this->assignmentService->getAssignmentsByRole($roleId, $semesterId, ['section_id' => $currentAssignment->section_id], false);
        }

        $faculties = Faculty::with('schools.sections')->where('status', 1)->get();

        return Inertia::render('academic/user/management/index', [
            'assignments' => $assignments,
            'faculties' => $faculties,
            'roleId' => $roleId,
            'title' => $title,
        ]);
    }

    /**
     * Endpoint API para filtrado de usuarios (Estilo Dossier).
     */
    public function getAssignmentsByFilter(Request $request): JsonResponse
    {
        $semesterId = session('semester_id');
        $roleId = $request->input('target_role_id');
        $filters = $request->only(['faculty_id', 'school_id', 'section_id', 'search']);

        $assignments = $this->assignmentService->getAssignmentsByRole($roleId, $semesterId, $filters, true);

        return response()->json(['assignments' => $assignments]);
    }

    public function storeAssignmentManage(StoreAssignmentManageRequest $request, Assignment $assignment, AssignmentService $assignmentService): RedirectResponse
    {
        $assignmentId = session('assignment_id');

        $sender = Assignment::query()->findOrFail($assignmentId);

        $data = $request->validated();

        $assignmentService->requestAssignmentManage($data, $assignment, $sender);

        return back()->with('message', 'Solicitud generada y enviada correctamente.');
    }
}
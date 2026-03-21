<?php

namespace App\Http\Controllers;

use App\Http\Requests\Assignment\StoreAssignmentManageRequest;
use App\Models\Assignment;
use App\Services\AssignmentService;
use App\Services\UserAssignmentService;
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
        // El semester_id lo obtenemos de la sesión (como en otros controladores)
        $semesterId = session('semester_id');

        $assignments = $this->assignmentService->getAssignmentsByRole($roleId, $semesterId);

        return Inertia::render('academic/user/management/index', [
            'assignments' => $assignments,
            'roleId' => $roleId,
            'title' => $title,
        ]);
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
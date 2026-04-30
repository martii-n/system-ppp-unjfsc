<?php
namespace App\Http\Controllers\Academic;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dossier\UploadDocumentDossierRequest;
use App\Http\Requests\Document\UpdateDocumentStatusRequest;
use App\Models\Assignment;
use App\Models\Document;
use App\Models\Dossier;
use App\Models\Faculty;
use App\Models\User;
use App\Services\DossierService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DossierController extends Controller
{
    protected DossierService $dossierService;

    public function __construct(DossierService $dossierService)
    {
        $this->dossierService = $dossierService;
    }

    /**
     * Store a document for a dossier.
     *
     * @param UploadDocumentDossierRequest $request
     * @return JsonResponse
     */
    public function storeDocumentDossier(UploadDocumentDossierRequest $request): RedirectResponse
    {
        $assignmentId = session('assignment_id');
        $assignment = Assignment::query()->find($assignmentId);

        $data = $request->validated();

        $this->dossierService->storeDocumentDossier($data, $assignment);

        return back()->with('message', 'Documento del dossier registrado correctamente.');
    }

    /**
     * Update the status of a document for a dossier.
     *
     * @param UpdateDocumentStatusRequest $request
     * @param Document $document
     * @return JsonResponse
     */
    public function updateDossierStatus(UpdateDocumentStatusRequest $request, Document $document): RedirectResponse
    {
        $user = Auth::user() ?? User::first();
        $assignment = $user->activeAssignment;

        $data = $request->validated();

        $document = $this->dossierService->updateDossierStatus($data, $document, $assignment);

        return back()->with('message', 'Estado del documento del dossier actualizado correctamente.');
    }

    /**
     * Render the view for the user's submission.
     *
     * @return Response
     */
    public function SubmissionIndex(): Response
    {
        $assignmentId = session('assignment_id');
        $assignment = Assignment::with(['role'])->findOrFail($assignmentId);

        $requirements = $this->dossierService->getDossierData($assignment);

        return Inertia::render('academic/dossier/submission/index', [
            'assignment' => $assignment,
            'requirements' => $requirements,
            'dossier' => $assignment->dossiers->first()?->id
        ]);
    }

    public function TeacherDossierIndex(): Response
    {
        return $this->renderValidationView(3, 'Validación de Docentes Titulares');
    }

    public function SupervisorDossierIndex(): Response
    {
        return $this->renderValidationView(4, 'Validación de Supervisores');
    }

    public function StudentDossierIndex(): Response
    {
        return $this->renderValidationView(5, 'Validación de Estudiantes');
    }

    /**
     * Helper para renderizar la vista de validación con los filtros correctos.
     */
    private function renderValidationView(int $roleId, string $title): Response
    {
        $currentAssignmentId = session('assignment_id');
        $currentAssignment = Assignment::query()->find($currentAssignmentId);

        $raId = request('a');

        $assignments = [
            'data' => [],
            'current_page' => 1,
            'last_page' => 1,
            'total' => 0,
            'links' => []
        ];

        if ($raId) {
            $assignments = Assignment::with(['user.person', 'section.school.faculty', 'section.faculty', 'dossiers'])
                ->where('id', $raId)
                ->get();
        } else {
            if ($currentAssignment && in_array($currentAssignment->role_id, [3, 4])) {
                $assignments = Assignment::with(['user.person', 'section.school.faculty', 'section.faculty', 'dossiers'])
                    ->where('role_id', $roleId)
                    ->where('section_id', $currentAssignment->section_id)
                    ->get();
            }
        }

        $faculties = Faculty::with('schools.sections')->where('status', 1)->get();

        return Inertia::render('academic/dossier/validation/index', [
            'assignments' => $assignments,
            'title' => $title,
            'faculties' => $faculties,
            'target_role_id' => $roleId
        ]);
    }

    public function getAssignmentsByFilter(\Illuminate\Http\Request $request): JsonResponse
    {
        $request->validate([
            'target_role_id' => 'required|integer',
            'faculty_id' => 'nullable|integer',
            'school_id' => 'nullable|integer',
            'section_id' => 'nullable|integer',
            'search' => 'nullable|string'
        ]);

        $query = Assignment::with(['user.person', 'section.school.faculty', 'section.faculty', 'dossiers'])
            ->where('role_id', $request->target_role_id);

        if ($request->filled('faculty_id')) {
            $query->whereHas('section.school.faculty', function ($q) use ($request) {
                $q->where('id', $request->faculty_id);
            });
        }
        if ($request->filled('school_id')) {
            $query->whereHas('section.school', function ($q) use ($request) {
                $q->where('id', $request->school_id);
            });
        }
        if ($request->filled('section_id')) {
            $query->where('section_id', $request->section_id);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%");
            });
        }

        return response()->json(['assignments' => $query->paginate(5)]);
    }

    public function getDetailDossier(Assignment $assignment): JsonResponse
    {
        // Cargar las relaciones necesarias para el frontend
        $assignment->load(['user.person', 'section.school.faculty', 'section.faculty']);

        // Usamos el servicio exacto que ya da la estructura con history, latest, etc.
        $requirements = $this->dossierService->getDossierData($assignment);

        return response()->json([
            'assignment' => $assignment,
            'requirements' => $requirements,
            'dossier' => $assignment->dossiers->first()?->id
        ]);
    }

    /**
     * Render the detailed view for validating a specific dossier.
     *
     * @param Dossier $dossier
     * @return Response
     */
    public function showValidation(Dossier $dossier): Response
    {
        $dossier->load(['assignment.user', 'assignment.role', 'documents.type']);

        return Inertia::render('academic/dossier/validation/details', [
            'dossier' => $dossier
        ]);
    }
}

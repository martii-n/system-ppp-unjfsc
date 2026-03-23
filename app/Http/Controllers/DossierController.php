<?php

namespace App\Http\Controllers;

use App\Http\Requests\Dossier\UploadDocumentDossierRequest;
use App\Http\Requests\Document\UpdateDocumentStatusRequest;
use App\Models\Assignment;
use App\Models\Document;
use App\Models\Dossier;
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
        $user = Auth::user() ?? User::first();
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
    public function updateDossierStatus(UpdateDocumentStatusRequest $request, Document $document): JsonResponse
    {
        $user = Auth::user() ?? User::first();
        $assignment = $user->activeAssignment;

        $data = $request->validated();

        $document = $this->dossierService->updateDossierStatus($data, $document, $assignment);

        return response()->json([
            'message' => 'Estado del documento del dossier actualizado correctamente.',
            'data' => $document
        ], 200);
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
        $assignments = Assignment::with(['user.authenticable', 'section.school.faculty', 'section.faculty', 'dossiers'])
            ->where('role_id', $roleId)
            ->get();

        return Inertia::render('academic/dossier/validation/index', [
            'assignments' => $assignments,
            'title' => $title
        ]);
    }

    public function getDetailDossier(Assignment $assignment): JsonResponse
    {
        // Cargar las relaciones necesarias para el frontend
        $assignment->load(['user.authenticable', 'section.school.faculty', 'section.faculty']);
        
        // Usamos el servicio exacto que ya da la estructura con history, latest, etc.
        $requirements = $this->dossierService->getDossierData($assignment);

        return response()->json([
            'assignment' => $assignment,
            'requirements' => $requirements,
            'dossier' => $assignment->dossiers->first()?->id
        ]);
    }

    /**
     * Render the list of dossiers to validate.
     * 
     * @return Response
     */
    public function indexValidation(): Response
    {
        // Simple implementation for now: show all dossiers with pending/observed documents
        $dossiers = Dossier::with(['assignment.user', 'assignment.role', 'documents.type'])
            ->latest()
            ->get();

        return Inertia::render('academic/dossier/validation/index', [
            'dossiers' => $dossiers
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
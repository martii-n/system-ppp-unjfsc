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
    public function storeDocumentDossier(UploadDocumentDossierRequest $request): JsonResponse
    {
        $user = Auth::user() ?? User::first();
        $assignmentId = session('assignment_id');
        $assignment = Assignment::query()->find($assignmentId);

        $data = $request->validated();

        $document = $this->dossierService->storeDocumentDossier($data, $assignment);

        return response()->json([
            'message' => 'Documento del dossier registrado correctamente.',
            'data' => $document
        ], 201);
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
    public function myDossier(): Response
    {
        $assignmentId = session('assignment_id');
        $assignment = Assignment::with(['role', 'dossiers.documents.documentType'])->findOrFail($assignmentId);

        // Create dossier if it doesn't exist
        if (!$assignment->dossier) {
            $assignment->dossiers()->create([
                'approval_status' => 2,
                'status' => 1
            ]);
            $assignment->load(['dossiers.documents.documentType']);
        }

        $types = [
            [
                "code" => "ficha",
            ],
            [
                "code" => "record",
            ],
        ];

        return Inertia::render('academic/dossier/submission/index', [
            'assignment' => $assignment,
            'dossier' => $assignment->dossiers
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
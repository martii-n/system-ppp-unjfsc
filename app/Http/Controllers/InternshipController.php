<?php

namespace App\Http\Controllers;

use App\Http\Requests\Internship\StoreInternshipRequest;
use App\Http\Requests\Document\UpdateDocumentStatusRequest;
use App\Http\Requests\Internship\UploadDocumentInternshipRequest;
use App\Http\Requests\Internship\StoreGradeInternshipRequest;
use App\Http\Requests\Internship\StoreRequestGradeChangeInternshipRequest;
use App\Http\Requests\Internship\StoreRequestTypeChangeInternshipRequest;

use App\Models\Assignment;
use App\Models\Document;
use App\Models\Internship;
use App\Models\User;
use App\Services\InternshipService;
use Illuminate\Http\JsonResponse;

use Illuminate\Support\Facades\Auth;

class InternshipController extends Controller
{
    protected  $internshipService;

    public function __construct(InternshipService $internshipService)
    {
        $this->internshipService = $internshipService;
    }

    public function store(StoreInternshipRequest $request, Assignment $assignment): JsonResponse
    {
        $data = $request->validated();

        $internship = $this->internshipService->registerInternship($data, $assignment);

        return response()->json([
            'message' => 'Tipo de práctica seleccionado. Por favor, complete la Etapa 1.',
            'data' => $internship
        ], 201);
    }

    /**
     * Store a document for an internship.
     *
     * @param UploadDocumentInternshipRequest $request
     * @return JsonResponse
     */
    public function storeDocumentInternship(UploadDocumentInternshipRequest $request): JsonResponse
    {
        $user = Auth::user() ?? User::first();
        $assignment = $user->activeAssignment;

        $data = $request->validated();

        $document = $this->internshipService->stepTwoToFourInternship($data, $assignment);

        return response()->json([
            'message' => 'Documento registrado correctamente.',
            'data' => $document
        ], 201);
    }

    /**
     * Update the status of a document for an internship.
     *
     * @param UpdateDocumentStatusRequest $request
     * @param Document $document
     * @return JsonResponse
     */
    public function updateInternshipStatus(UpdateDocumentStatusRequest $request, Document $document): JsonResponse
    {
        $user = Auth::user() ?? User::first();
        $assignment = $user->activeAssignment;

        $data = $request->validated();

        $document = $this->internshipService->updateInternshipStatus($data, $document, $assignment);

        return response()->json([
            'message' => 'Estado del documento actualizado correctamente.',
            'data' => $document
        ], 200);
    }

    /**
     * Store a grade for an internship.
     *
     * @param StoreGradeInternshipRequest $request
     * @param Internship $internship
     * @return JsonResponse
     */
    public function storeGradeInternship(StoreGradeInternshipRequest $request, Internship $internship): JsonResponse
    {
        $user = Auth::user() ?? User::first();
        $assignment = $user->activeAssignment;

        $data = $request->validated();

        $internship = $this->internshipService->stepFiveInternship($data, $internship, $assignment);

        return response()->json([
            'message' => 'Calificación registrada correctamente.',
            'data' => $internship
        ], 201);
    }

    /**
     * Store a request for changing the type of an internship.
     *
     * @param StoreRequestTypeChangeInternshipRequest $request
     * @param Internship $internship
     * @return JsonResponse
     */
    public function storeRequestTypeChangeInternship(StoreRequestTypeChangeInternshipRequest $request, Internship $internship): JsonResponse
    {
        $user = Auth::user() ?? User::first();
        $assignment = $user->activeAssignment;

        $data = $request->validated();

        $internship = $this->internshipService->requestTypeChange($data, $internship, $assignment);

        return response()->json([
            'message' => 'Solicitud de cambio de tipo registrada correctamente.',
            'data' => $internship
        ], 201);
    }

    /**
     * Store a request for changing the grade of an internship.
     *
     * @param StoreRequestGradeChangeInternshipRequest $request
     * @param Internship $internship
     * @return JsonResponse
     */
    public function storeRequestGradeChangeInternship(StoreRequestGradeChangeInternshipRequest $request, Internship $internship): JsonResponse
    {
        $user = Auth::user() ?? User::first();
        $assignment = $user->activeAssignment;

        $data = $request->validated();

        $internship = $this->internshipService->requestGradeChange($data, $internship, $assignment);

        return response()->json([
            'message' => 'Solicitud de cambio de calificación registrada correctamente.',
            'data' => $internship
        ], 201);
    }
}

<?php

namespace App\Services;

use App\Exceptions\Document\DocumentAlreadyApprovedException;
use App\Exceptions\Internship\InternshipAlreadyActiveException;
use App\Exceptions\ResourceNotFoundException;
use App\Models\Assignment;
use App\Models\Document;
use App\Models\DocumentType;
use App\Models\Internship;
use App\Models\Request;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class InternshipService
{
    protected $documentService;
    protected $requestService;

    public function __construct(DocumentService $documentService, RequestService $requestService)
    {
        $this->documentService = $documentService;
        $this->requestService = $requestService;
    }

    /**
     * Register a new internship for a user.
     *
     * @param array $data The data for the internship.
     * @param Assignment $assignment The assignment associated with the internship.
     * @return array The result of the operation.
     */
    public function registerInternship(array $data, Assignment $assignment): array
    {
        return DB::transaction(function () use ($data, $assignment) {
            $activeInternship = Internship::query()->where('assignment_id', $assignment->id)->where('status', 1)->latest()->first();

            if ($activeInternship) {
                throw new InternshipAlreadyActiveException();
            }

            $internship = Internship::query()->create([
                'assignment_id' => $assignment->id,
                'internship_type' => $data['internship_type']
            ]);

            $internship->save();

            return $internship;
        });
    }

    /**
     * Step 1: Asociation with Company and Boss.
     * @param array $data
     * @param Assignment $assignment
     * @return array
     */
     public function stepOneInternship(array $data, Assignment $assignment): array
     {
        return DB::transaction(function () use ($data, $assignment) {
            $internship = Internship::query()->where('assignment_id', $assignment->id)->where('status', 1)->latest()->first();

            if (!$internship) {
                throw new \Exception('No se encontró un registro de práctica activo.');
            }

            if ($internship->internship_step > 1) {
                throw new \Exception('Esta etapa ya fue completa y aprobada.');
            }

            $internship->update([
                'boss_id' => $data['boss_id'],
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'approval_status' => 2
            ]);

            return $internship->load('boss.company');
        });
    }

    /**
     * Actualiza el estado de la práctica interna a la etapa 2.
     *
     * @param array $data
     * @param Internship $internship
     * @param Assignment $assignment
     * @return Internship
     */
    public function stepTwoToFourInternship(array $data, Assignment $assignment): Document
    {
        return DB::transaction(function () use ($data, $assignment) {
            $model = $this->documentService->validateOwnership('internship', $data['target_id'], $assignment);

            $this->validateCorrectDocument('internship', $data['document_type_id'], $model);

            $data['context'] = 'internship';

            $document = $this->documentService->registerDocument($data, $assignment, $model);

            return $document;
        });
    }

    /**
     * Actualiza el estado de la práctica interna a la etapa 5.
     *
     * @param array $array
     * @param Internship $internship
     * @param Assignment $assignment
     * @return Internship
     */
    public function stepFiveInternship(array $array, Internship $internship, Assignment $assignment): Internship
    {
        return DB::transaction(function () use ($array, $internship, $assignment) {
            $this->validateOwnership($internship, $assignment);
            $internship->update($array);
            return $internship;
        });
    }

    private function validateOwnership(Model $model, Assignment $assignment): void
    {
        if(in_array($assignment->role_id, [1,2]))
        {
            return;
        }

        if ($model->assignment_id !== $assignment->id) {
            throw new ResourceNotFoundException();
        }
    }

    private function validateCorrectDocument(string $context, int $documentTypeId, Internship $internship): void
    {

        $codeType = DocumentType::query()->find($documentTypeId)->code;

        // validad si es un tipo de documento válido para el internship y en esa etapa de internship
        /*$documentTypeDispStep = [
            2 => [
                'desarrollo' => ['fut', 'carta_presentacion'],
                'convalidacion' => ['fut', 'carta_presentacion', 'carta_aceptacion'],
            ],
            3 => [
                'desarrollo' => ['carta_aceptacion', 'plan_ppp'],
                'convalidacion' => ['plan_ppp', 'control_mensual', 'informe_final_ppp'],
            ],
            4 => [
                'desarrollo' => ['informe_final_ppp', 'constancia_ppp'],
                'convalidacion' => ['informe_final_ppp', 'constancia_ppp'],
            ],
        ];

        $step = $internship->internship_step;
        $type = $internship->internship_type;
        $documentTypes = $documentTypeDispStep[$step][$type];
        if (!in_array($codeType, $documentTypes)) {
            throw new \Exception('No es un tipo de documento válido para este internship en esta etapa.');
            }*/


        // validar si hay un document de ese tipo pendiente o ya aprobado
        $oldDocument = $internship->documents()->where('document_type_id', $documentTypeId)->latest()->first();

        if ($oldDocument && in_array($oldDocument->approval_status, [1, 2])) {
            throw new DocumentAlreadyApprovedException();
        }
    }

    public function approveStepInternship(Internship $internship): array
    {
        return DB::transaction(function () use ($internship) {


            $internship->update([
                'internship_step' => 2,
                'approval_status' => 1
            ]);

            return $internship->load('boss.company');
        });
    }

    /**
     * @param array $data
     * @param Document $document
     * @param Assignment $assignment
     * @return Document
     */
    public function updateInternshipStatus(array $data, Document $document, Assignment $assignment): Document
    {
        return DB::transaction(function () use ($data, $document, $assignment) {
            $model = $this->documentService->validateOwnership('internship', $document->documentable_id, $assignment);

            $result = $this->documentService->updateStatus($document, [
                'approval_status' => $data['approval_status'],
                'comment'         => $data['comment']
            ]);

            return $result;
        });
    }

    /**
     * @param array $data
     * @param Internship $internship
     * @param Assignment $sender
     * @return Request
     */
    public function requestTypeChange(array $data, Internship $internship, Assignment $sender): Request
    {
        return DB::transaction(function () use ($internship, $data, $sender) {
            $this->validateOwnership($internship, $sender);

            if ($internship->internship_step >= 3) {
                throw new \Exception("No puede solicitar el cambio de tipo, no está en la etapa correcta.");
            }

            $this->hasPendingRequest($internship, 'CHANGE_INTERNSHIP_TYPE');

            $internship->review_status = 2;
            $internship->save();

            $request = $this->requestService->createRequest(
                $sender,
                $internship,
                'CHANGE_INTERNSHIP_TYPE',
                [
                    'new_type' => $data['new_type'],
                    'old_type' => $internship->internship_type,
                ],
                $data['reason'] ?? 'Solicitud de cambio de tipo de prácticas.'
            );

            return $request->load('requestable');
        });
    }

    /**
     * Request a grade change for an internship.
     *
     * @param array $data
     * @param Internship $internship
     * @param Assignment $sender
     * @return Request
     */
    public function requestGradeChange(array $data, Internship $internship, Assignment $sender): Request
    {
        return DB::transaction(function () use ($internship, $data, $sender) {
            $this->validateOwnership($internship, $sender);

            if ($internship->internship_step !== 5) {
                throw new \Exception("No puede solicitar el cambio de nota, no está en la etapa correcta.");
            }

            $this->hasPendingRequest($internship, 'CHANGE_INTERNSHIP_GRADE');

            $internship->review_status = 3;
            $internship->save();

            $request = $this->requestService->createRequest(
                $sender,
                $internship,
                'CHANGE_INTERNSHIP_GRADE',
                [
                    'new_grade' => $data['new_grade'],
                    'old_grade' => $internship->grade,
                ],
                $data['reason'] ?? 'Sin motivo especificado'
            );

            return $request->load('requestable');
        });
    }

    private function hasPendingRequest(Internship $internship, string $type): void
    {
        $exists = $internship->requests()->where('type', $type)->where('approval_status', 2)->latest()->exists();

        if ($exists) {
            throw new \Exception("Ya existe una solicitud pendiente.");
        }
    }
}

<?php

namespace App\Services;

use App\Models\Assignment;
use App\Models\Document;
use App\Models\Dossier;
use Illuminate\Support\Facades\DB;

class DossierService
{
    protected DocumentService $documentService;

    public function __construct(DocumentService $documentService)
    {
        $this->documentService = $documentService;
    }

    /**
     * Store a document for a dossier.
     *
     * @param array $data
     * @param Assignment $assignment
     * @return Document
     */
    public function storeDocumentDossier(array $data, Assignment $assignment): Document
    {
        return DB::transaction(function () use ($data, $assignment) {
            $model = $this->documentService->validateOwnership('dossier', $data['target_id'], $assignment);

            $data['context'] = 'dossier';

            return $this->documentService->registerDocument($data, $assignment, $model);
        });
    }

    /**
     * Update the status of a dossier document.
     *
     * @param array $data
     * @param Document $document
     * @param Assignment $assignment
     * @return Document
     */
    public function updateDossierStatus(array $data, Document $document, Assignment $assignment): Document
    {
        return DB::transaction(function () use ($data, $document, $assignment) {
            
            $result = $this->documentService->updateStatus($document, [
                'approval_status' => $data['approval_status'],
                'comment'         => $data['comment'] ?? ''
            ]);

            return $result;
        });
    }
}
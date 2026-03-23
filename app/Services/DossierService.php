<?php

namespace App\Services;

use App\Models\Assignment;
use App\Models\Document;
use App\Models\DocumentType;
use App\Models\Dossier;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DossierService
{
    protected DocumentService $documentService;

    public function __construct(DocumentService $documentService)
    {
        $this->documentService = $documentService;
    }

    public function getDossierByAssignment(Assignment $assignment): Dossier
    {
        return $assignment->dossiers()->first();
    }

    public function getDossierData(Assignment $assignment)
    {
        $dossier = $assignment->dossiers()->firstOrCreate([
            'assignment_id' => $assignment->id,
        ]);

        $requerimentsConfig = $this->getRequirementsByRole($assignment->role_id);

        $allDocuments = $dossier->documents()
            ->with('documentType')
            ->latest()
            ->get();

        return collect($requerimentsConfig)->map(function ($item) use ($allDocuments) {
            $docsOfType = $allDocuments->filter(function ($doc) use ($item) {
                    return $doc->documentType->code === $item['code'];
                }
                );

                $transform = function ($doc) {
                    if (!$doc)
                        return null;
                    $data = $doc->toArray();
                    // Transformamos el path a una URL pública
                    $data['path'] = Storage::url($doc->path);
                    return $data;
                }
                    ;

                return [
                    'code' => $item['code'],
                    'title' => $item['title'],
                    'has_template' => $item['has_template'] ?? false,
                    'latest' => $transform($docsOfType->first()),
                    'history' => $docsOfType->map(fn($d) => $transform($d))->values()->all(),
                    'status' => $docsOfType->first()->approval_status ?? 0,
                ];
            });
    }

    private function getRequirementsByRole(int $roleId)
    {
        $configs = [
            3 => [
                ["code" => "horario", "title" => "Horario"],
                ["code" => "carga_lectiva", "title" => "Carga Lectiva"],
            ],
            4 => [
                ["code" => "horario", "title" => "Horario"],
                ["code" => "carga_lectiva", "title" => "Carga Lectiva"],
                ["code" => "resolucion_designacion", "title" => "Resolución de designación"]

            ],
            5 => [
                ["code" => "ficha", "title" => "Ficha de Matrícula"],
                ["code" => "record", "title" => "Record Académico"]
            ],
        ];

        return $configs[$roleId] ?? [];
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
            $data['document_type_id'] = DocumentType::where('code', $data['code'])->first()->id;

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
                'comment' => $data['comment'] ?? ''
            ]);

            return $result;
        });
    }
}
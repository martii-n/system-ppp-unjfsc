<?php
namespace App\Services;

use App\Exceptions\EvaluationAlreadyApprovedException;
use App\Models\Evaluation;
use App\Models\InternshipGroup;
use App\Models\StudentGroup;
use App\Models\Supervision;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Services\DocumentService;

class SupervisionService
{

    private $documentService;

    public function __construct(DocumentService $documentService)
    {
        $this->documentService = $documentService;
    }

    public function initializeStudentProgress(int $studentAssignmentId): void
    {
        for ($i = 1; $i <= 4; $i++) {
            $supervision = Supervision::query()->firstOrCreate([
                'assignment_id' => $studentAssignmentId,
                'module_id' => $i,
            ]);
        }
    }

    public function syncGroupModule(int $groupId): int
    {
        $group = InternshipGroup::query()->findOrFail($groupId);

        $studentIds = StudentGroup::query()
            ->where('internship_group_id', $groupId)
            ->pluck('student_assignment_id');

        if ($studentIds->isEmpty()) {
            $group->update(['module_id' => 1]);
            return 1;
        }

        $studentProgress = [];

        foreach ($studentIds as $id) {
            // Buscamos el PRIMER módulo que este estudiante NO tiene aprobado.
            // Si aprobó el 1, este query devolverá el 2.
            // Si aprobó todo, devolverá null.
            $nextPendingModule = Supervision::query()
                ->where('assignment_id', $id)
                ->where('approval_status', '!=', 1)
                ->orderBy('module_id', 'asc')
                ->value('module_id');

            // Si es null, significa que el estudiante ya terminó todo (completó el 4),
            // así que le asignamos 5 simbólicamente para que no baje el promedio del grupo.
            $studentProgress[] = $nextPendingModule ?? 5;
        }

        // El módulo del grupo es el mínimo de lo que les falta a los alumnos.
        // Si todos terminaron el Mod 1, el min será 2.
        $calculatedModule = min($studentProgress);

        // No podemos exceder el módulo 4 (limite académico)
        $finalModule = $calculatedModule > 4 ? 4 : $calculatedModule;

        $group->update(['module_id' => $finalModule]);

        return $finalModule;
    }

    /**
     * Registra una evaluación y un documento asociado.
     *
     * @param array $data Datos de la evaluación.
     * @param User $user Usuario que realiza la acción.
     * @return array Resultado de la operación.
     */
    public function registerEvaluation(array $data, User $user, Supervision $supervision): array
    {
        return DB::transaction(function () use ($data, $user, $supervision) {
            $oldEvaluation = Evaluation::query()->where('supervision_id', $supervision->id)
                ->whereHas('documents', function ($query) use ($data) {
                $query->where('document_type_id', $data['document_type_id']);
            }
            )->latest()->first();

            if ($oldEvaluation && in_array($oldEvaluation->approval_status, [1, 2])) {
                throw new EvaluationAlreadyApprovedException();
            }

            $evaluation = Evaluation::query()->updateOrCreate([
                'supervision_id' => $supervision->id,
                'grade' => $data['grade'],
                'comment' => $data['comment'] ?? '',
            ]);

            $documentData = [
                'context' => 'evaluation',
                'target_id' => $evaluation->id,
                'document_type_id' => $data['document_type_id']
            ];

            if ($oldEvaluation) {
                $oldDocument = $supervision->documents()->where('document_type_id', $data['document_type_id'])->latest()->first();

                switch ($oldEvaluation->approval_status) {
                    case 3:
                        $evaluation->grade = $oldEvaluation->grade;
                        $evaluation->save();
                        $documentData['file'] = $data['file'];
                        $document = $this->documentService->registerDocument($documentData, $user);
                        break;
                    case 4:
                        $evaluation->grade = $data['grade'];
                        $evaluation->save();
                        $documentData['path'] = $oldDocument->path;
                        $documentData['name'] = $oldDocument->name;
                        $document = $this->documentService->updatePathDocument($documentData, $user);
                        break;
                }
            }
            else {
                $documentData['file'] = $data['file'];
                $document = $this->documentService->registerDocument($documentData, $user);
            }

            return $evaluation->load('supervision', 'documents');
        });
    }

    /**
     * Actualiza el estado de evaluación y procesa el progreso de la evaluación.
     *
     * @param Evaluation $evaluation La evaluación a actualizar.
     * @param array $data Los datos de la evaluación.
     * @return array Los resultados de la operación.
     */
    public function updateEvaluationStatus(Evaluation $evaluation, array $data): array
    {
        try {
            return DB::transaction(function () use ($evaluation, $data) {
                $evaluation->update([
                    'approval_status' => $data['approval_status'],
                    'comment' => $data['comment']
                ]);

                $documentStatus = ($data['approval_status'] >= 3) ? 3 : $data['approval_status'];

                $document = $evaluation->documents()->first();
                if ($document) {
                    // Llamamos al servicio de documentos para que él se encargue de la lógica física
                    // y de disparar el progreso si el estado es 1.
                    $this->documentService->updateStatus($document, [
                        'approval_status' => $documentStatus,
                        'comment' => $data['comment']
                    ]);
                }

                if ((int)$data['approval_status'] === 1)
                    $this->processEvaluationProgress($evaluation);

                return [
                    'success' => true,
                    'message' => 'Estado de evaluación actualizado correctamente.',
                    'data' => $evaluation->load('supervision', 'documents')
                ];
            });

        }
        catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al actualizar el estado de evaluación.',
                'error' => $e->getMessage()
            ];
        }
    }

    public function processEvaluationProgress(Evaluation $evaluation): void
    {
        $required = 1;
        $supervision = $evaluation->supervision;

        if (!$supervision) {
            return;
        }

        $approvedCount = $supervision->documents()->where('approval_status', 1)->count();

        if ($approvedCount >= $required) {
            $supervision->update(['approval_status' => 1]);

            $groupId = StudentGroup::query()->where('student_assignment_id', $supervision->assignment_id)
                ->value('internship_group_id');

            if ($groupId) {
                $this->syncGroupModule($groupId);
            }
        }
    }
}
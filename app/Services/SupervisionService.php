<?php
namespace App\Services;

use App\Exceptions\EvaluationAlreadyApprovedException;
use App\Models\Assignment;
use App\Models\DocumentType;
use App\Models\Evaluation;
use App\Models\InternshipGroup;
use App\Models\StudentGroup;
use App\Models\Supervision;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Services\DocumentService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

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
    public function registerEvaluation(array $data, Assignment $assignment, Supervision $supervision): void
    {
        DB::transaction(function () use ($data, $assignment, $supervision) {
            $document_type_id = DocumentType::where('code', $data['code'])->first()->id;

            $oldEvaluation = Evaluation::query()
                ->where('supervision_id', $supervision->id)
                ->whereHas('documents', function ($query) use ($document_type_id) {
                $query->where('document_type_id', $document_type_id);
            }
            )
                ->latest()
                ->first();

            if ($oldEvaluation && in_array($oldEvaluation->approval_status, [1, 2])) {
                throw new EvaluationAlreadyApprovedException();
            }

            $evaluation = Evaluation::query()->create([
                'supervision_id' => $supervision->id,
                'grade' => $data['grade'],
                'comment' => $data['comment'] ?? '',
            ]);

            $documentData = [
                'context' => 'evaluation',
                'target_id' => $evaluation->id,
                'document_type_id' => $document_type_id,
            ];

            if ($oldEvaluation) {
                $oldDocument = $supervision->documents()->where('document_type_id', $document_type_id)->latest()->first();

                switch ($oldEvaluation->approval_status) {
                    case 3: // AMBOS
                        if (isset($data['file'])) {
                            $documentData['file'] = $data['file'];
                            $document = $this->documentService->registerDocument($documentData, $assignment, $evaluation);
                        }
                        break;
                    case 4: // CALIFICACIÓN
                        if ($oldDocument) {
                            $documentData['path'] = $oldDocument->path;
                            $documentData['name'] = $oldDocument->name;
                            $document = $this->documentService->updatePathDocument($documentData, $assignment);
                        }
                        break;
                    case 5: // ARCHIVO
                        $evaluation->update(['grade' => $oldEvaluation->grade]);
                        if (isset($data['file'])) {
                            $documentData['file'] = $data['file'];
                            $document = $this->documentService->registerDocument($documentData, $assignment, $evaluation);
                        }
                        break;
                }
            }
            else {
                $documentData['file'] = $data['file'];
                $document = $this->documentService->registerDocument($documentData, $assignment, $evaluation);
            }

        //return $evaluation->load('supervision', 'documents');
        });
    }

    /**
     * Actualiza el estado de evaluación y procesa el progreso de la evaluación.
     *
     * @param Evaluation $evaluation La evaluación a actualizar.
     * @param array $data Los datos de la evaluación.
     * @return void
     */
    public function updateEvaluationStatus(Evaluation $evaluation, array $data): void
    {

        DB::transaction(function () use ($evaluation, $data) {
            $evaluation->update([
                'approval_status' => $data['approval_status'],
                //'comment' => $data['comment']
            ]);

            $documentStatus = ($data['approval_status'] >= 3) ? 3 : $data['approval_status'];

            $document = $evaluation->documents()->first();
            if ($document) {
                $this->documentService->updateStatus($document, [
                    'approval_status' => $documentStatus,
                    'comment' => $data['comment']
                ]);
            }

            if ((int)$data['approval_status'] === 1)
                $this->processEvaluationProgress($evaluation);
        });
    }

    public function processEvaluationProgress(Evaluation $evaluation): void
    {
        $required = 2;
        $supervision = $evaluation->supervision;

        if (!$supervision) {
            return;
        }

        $approvedCount = $supervision->documents()->where('documents.approval_status', 1)->count();

        if ($approvedCount >= $required) {
            $supervision->update(['approval_status' => 1]);

            $groupId = StudentGroup::query()->where('student_assignment_id', $supervision->assignment_id)
                ->value('internship_group_id');

            if ($groupId) {
                $this->syncGroupModule($groupId);
            }
        }
    }

    public function getGroupsByFilter(array $filters): Collection
    {
        $query = InternshipGroup::with([
            'section.school.faculty',
            'module',
            'teacher.user.authenticable',
            'supervisor.user.authenticable',
        ])->where('status', 1);

        if (!empty($filters['section_id'])) {
            $query->where('section_id', $filters['section_id']);
        } elseif (!empty($filters['school_id'])) {
            $query->whereHas('section', fn($q) => $q->where('school_id', $filters['school_id']));
        } elseif (!empty($filters['faculty_id'])) {
            $query->whereHas('section.school', fn($q) => $q->where('faculty_id', $filters['faculty_id']));
        }

        return $query->get()->map(fn($group) => [
            'id'        => $group->id,
            'name'      => $group->name,
            'module_id' => $group->module_id,
            'module'    => $group->module ? ['id' => $group->module->id, 'name' => $group->module->name] : null,
            'teacher' => [
                'user' => [
                    'person' => [
                        'names'    => $group->teacher?->user?->authenticable?->names,
                        'surnames' => $group->teacher?->user?->authenticable?->surnames,
                    ]
                ]
            ],
            'supervisor' => [
                'user' => [
                    'person' => [
                        'names'    => $group->supervisor?->user?->authenticable?->names,
                        'surnames' => $group->supervisor?->user?->authenticable?->surnames,
                    ]
                ]
            ],
            'section' => [
                'id'   => $group->section->id,
                'name' => $group->section->name,
                'school' => [
                    'name'    => $group->section->school->name,
                    'faculty' => ['name' => $group->section->school->faculty->name],
                ],
            ],
        ]);
    }

    public function getStudentsByGroupAndModule(InternshipGroup $group, int $moduleId): Collection
    {
        // Get student assignment IDs from the group
        $studentIds = $group->studentGroups()->pluck('student_assignment_id');

        // Fetch assignments with user+person data and their supervision for the given module
        return Assignment::whereIn('id', $studentIds)
            ->with(['user.authenticable'])
            ->get()
            ->map(function ($assignment) use ($moduleId) {
                $supervision = Supervision::where('assignment_id', $assignment->id)
                    ->where('module_id', $moduleId)
                    ->first();

                return [
                    'id' => $assignment->id,
                    'user' => [
                        'email' => $assignment->user->email,
                        'person' => [
                            'names'    => $assignment->user->authenticable->names,
                            'surnames' => $assignment->user->authenticable->surnames,
                        ],
                    ],
                    'supervision' => $supervision ? [
                        'id'              => $supervision->id,
                        'module_id'       => $supervision->module_id,
                        'approval_status' => $supervision->approval_status,
                    ] : null,
                ];
            });
    }

    public function getSupervisionAnnexes(Supervision $supervision): array
    {
        $annexCodes = ['anexo_7', 'anexo_8'];
        $result = [];

        foreach ($annexCodes as $code) {
            $docType = DocumentType::where('code', $code)->first();

            if (!$docType) {
                $result[] = [
                    'code'    => $code,
                    'title'   => strtoupper(str_replace('_', ' ', $code)),
                    'status'  => 0,
                    'latest'  => null,
                    'history' => [],
                    'supervision_id' => $supervision->id,
                ];
                continue;
            }

            // All evaluations for this supervision that have a document of this type
            $evaluations = $supervision->evaluations()
                ->with(['documents' => fn($q) => $q->where('document_type_id', $docType->id)])
                ->get()
                ->filter(fn($e) => $e->documents->isNotEmpty());

            $history = $evaluations->map(fn($e) => [
                'id'              => $e->id,
                'approval_status' => $e->documents->first()?->approval_status,
                'comment'         => $e->documents->first()?->comment,
                'name'            => $e->documents->first()?->name,
                'path'            => $e->documents->first() ? Storage::url($e->documents->first()->path) : null,
                'created_at'      => $e->created_at,
            ])->values();

            $latest = $evaluations->sortByDesc('created_at')->first();
            $latestDoc = $latest?->documents->first();

            $result[] = [
                'code'    => $code,
                'title'   => $docType->name ?? strtoupper(str_replace('_', ' ', $code)),
                'status'  => $latest?->approval_status ?? 0,
                'latest'  => $latestDoc ? [
                    'id'      => $latestDoc->id,
                    'name'    => $latestDoc->name,
                    'path'    => Storage::url($latestDoc->path),
                    'comment' => $latest->comment,
                    'justification' => $latestDoc->comment,
                ] : null,
                'history' => $history,
                'evaluation_id'   => $latest?->id,
                'grade'           => $latest?->grade,
                'supervision_id'  => $supervision->id,
            ];
        }

        return $result;
    }
}
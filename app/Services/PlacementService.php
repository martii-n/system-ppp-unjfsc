<?php

namespace App\Services;

use App\Enums\Role;
use App\Models\Area;
use App\Models\Assignment;
use App\Models\Company;
use App\Models\Internship;
use App\Models\Placement;
use App\Models\Staff;
use App\Models\DocumentType;
use App\Services\Company\CompanyService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PlacementService
{
    public function __construct(
        protected CompanyService $companyService,
        protected DocumentService $documentService,
        protected NotificationService $notificationService
    ) {
    }

    // Se debe enviar el Placement y los archivos asociados
    public function getSubmissionData(Assignment $assignment): array
    {
        // 1. Cargar relaciones necesarias del assignment
        $assignment->loadMissing([
            'section.school.faculty',
            'placement.company',
            'placement.area',
            'placement.documents.documentType'
        ]);

        $placement = $assignment->placement;

        $reqsConfig = [
            ['code' => 'fut', 'title' => 'FUT', 'locked' => false],
            ['code' => 'carta_presentacion', 'title' => 'Carta de Presentación', 'locked' => false],
            ['code' => 'carta_aceptacion', 'title' => 'Carta de Aceptación', 'locked' => false],
        ];

        if (!$placement) {
            return [
                'placement' => null,
                'requirements' => $reqsConfig,
                'isApproved' => false,
            ];
        }

        $allDocs = $placement->documents;

        return [
            'placement' => [
                'id' => $placement->id,
                'internship_type' => $placement->internship_type,
                'origin_type' => $placement->origin_type,
                'approval_status' => $placement->approval_status,
                'company' => $placement->company,
                'area_id' => $placement->area_id, // Usamos directamente el ID del modelo
                'area' => $placement->area,
                'boss_name' => $placement->boss_name,
                'boss_position' => $placement->boss_position,
                'boss_phone' => $placement->boss_phone,
                'boss_email' => $placement->boss_email,
                'position' => $placement->position,
                'description' => $placement->description,
                'start_date' => $placement->start_date,
                'end_date' => $placement->end_date,
            ],
            'requirements' => $this->mapRequirements($reqsConfig, $allDocs),
            'isApproved' => $placement->approval_status === 1 && $placement->validation_status === 1,
        ];
    }

    public function mapRequirements(array $config, $documentCollection): array
    {
        return collect($config)->map(function ($item) use ($documentCollection) {
            $docsOfType = $documentCollection->filter(fn($doc) => $doc->documentType->code === $item['code']);
            $latest = $docsOfType->first();
            return [
                'code' => $item['code'],
                'title' => $item['title'],
                'locked' => $item['locked'] ?? false,
                'status' => $latest->approval_status ?? 0,
                'latest' => $latest ? [
                    'id' => $latest->id,
                    'name' => $latest->name,
                    'path' => Storage::url($latest->path),
                    'approval_status' => $latest->approval_status,
                    'comment' => $latest->comment,
                    'created_at' => $latest->created_at,
                ] : null,
                'history' => $docsOfType->map(fn($d) => [
                    'id' => $d->id,
                    'name' => $d->name,
                    'approval_status' => $d->approval_status,
                    'comment' => $d->comment,
                    'created_at' => $d->created_at,
                ])->values()->all(),
            ];
        })->values()->all();
    }

    public function registerPlacement(array $data, Assignment $assignment): Placement
    {
        return DB::transaction(function () use ($data, $assignment) {
            // Resolver company_id: usar el ID provisto, buscarlo por RUC, o crear uno nuevo
            $companyId = $data['company']['id'] ?? null;

            if (!$companyId) {
                // Buscar si ya existe un empresa con ese RUC antes de crear
                $existing = Company::where('ruc', $data['company']['ruc'])->first();
                if ($existing) {
                    $companyId = $existing->id;
                } else {
                    $company = $this->companyService->registerCompany($data['company']);
                    $companyId = $company->id;
                }
            }

            $areaId = $data['placement']['area_id'] ?? null;
            if (!$areaId && !empty($data['placement']['area_name'])) {
                $area = $this->companyService->registerArea([
                    'name' => $data['placement']['area_name'],
                    'description' => $data['placement']['area_description'] ?? null,
                    'company_id' => $companyId,
                ]);
                $areaId = $area->id;
            }

            $placement = Placement::query()->updateOrCreate(
                ['assignment_id' => $assignment->id],
                [
                    'company_id' => $companyId,
                    'area_id' => $areaId,
                    'boss_name' => $data['placement']['staff_name'] ?? null,
                    'boss_position' => $data['placement']['staff_position'] ?? null,
                    'boss_phone' => $data['placement']['staff_phone'] ?? null,
                    'boss_email' => $data['placement']['staff_email'] ?? null,
                    'position' => $data['placement']['position'],
                    'description' => $data['placement']['description'] ?? null,
                    'start_date' => $data['placement']['start_date'],
                    'end_date' => $data['placement']['end_date'] ?? null,
                    'internship_type' => $data['internship_type'],
                    'origin_type' => $data['origin_type'] ?? 'direct',
                    'status' => 1,
                    'approval_status' => 2, // 2: Pending (Data)
                    'validation_status' => 2, // 2: Pending (Global)
                ]
            );

            // Guardar archivos usando DocumentService
            /*if (isset($data['files']['fut'])) {
                $this->savePlacementDocument($placement, $assignment, 'fut', $data['files']['fut']);
            }

            if (isset($data['files']['carta_presentacion'])) {
                $this->savePlacementDocument($placement, $assignment, 'carta_presentacion', $data['files']['carta_presentacion']);
            }

            if (isset($data['files']['carta_aceptacion'])) {
                $this->savePlacementDocument($placement, $assignment, 'carta_aceptacion', $data['files']['carta_aceptacion']);
            }*/

            // Notificar al Admin, Subadmin y Docente del registro de formalización
            $assignment->loadMissing('user.person');
            $person = $assignment->user->person;
            $studentName = trim(($person->surnames ?? '') . ' ' . ($person->names ?? ''));

            $this->notificationService->notify(
                type: 'PLACEMENT_REGISTER',
                actor: $assignment,
                subject: $placement,
                payload: [
                    'action' => [
                        'route' => 'internship.validation',
                        'params' => ['a' => $assignment->id],
                    ],
                    'meta' => [
                        'message' => "El estudiante {$studentName} ha hecho su registro para la formalización de prácticas.",
                        'sender' => $studentName,
                        'entity' => 'placement',
                    ],
                ],
                resolver: fn($subject, $actor) => $this->notificationService->resolveAcademicRoles(
                    $actor->section_id,
                    [Role::ADMIN, Role::SUBADMIN, Role::DTITULAR]
                )
            );

            return $placement;
        });
    }

    public function updatePlacement(Placement $placement, array $data, Assignment $assignment): Placement
    {
        return DB::transaction(function () use ($placement, $data, $assignment) {
            // si el placemente ya esta aprobado, no se puede editar
            if ($placement->approval_status === 1 || $placement->validation_status === 1) {
                throw new \Exception('El placement ya esta aprobado, no se puede editar');
            }

            // Actualizar datos de empresa (sin tocar el RUC)
            if (isset($data['company'])) {
                $placement->company->update([
                    'name' => $data['company']['name'] ?? $placement->company->name,
                    'address' => $data['company']['address'] ?? $placement->company->address,
                    'phone' => $data['company']['phone'] ?? $placement->company->phone,
                    'email' => $data['company']['email'] ?? $placement->company->email,
                ]);
            }

            // Actualizar datos del placement
            $placement->update([
                'boss_name' => $data['placement']['staff_name'] ?? $placement->boss_name,
                'boss_position' => $data['placement']['staff_position'] ?? $placement->boss_position,
                'boss_phone' => $data['placement']['staff_phone'] ?? $placement->boss_phone,
                'boss_email' => $data['placement']['staff_email'] ?? $placement->boss_email,
                'position' => $data['placement']['position'] ?? $placement->position,
                'description' => $data['placement']['description'] ?? $placement->description,
                'start_date' => $data['placement']['start_date'] ?? $placement->start_date,
                'end_date' => $data['placement']['end_date'] ?? $placement->end_date,
                'approval_status' => 2, // Reset a Pendiente (Data)
                'validation_status' => 2, // Reset Global a Pendiente
            ]);

            // Gestión de área:
            // Si area_id es null → crear nueva área vinculada a la empresa
            // Si area_id tiene valor → asociar área existente (no la sobreescribimos)
            $areaId = $data['placement']['area_id'] ?? null;
            if ($areaId === null || $areaId === '') {
                $area = Area::create([
                    'name' => $data['placement']['area_name'],
                    'company_id' => $placement->company_id,
                ]);
                $placement->area()->associate($area);
                $placement->save();
            } else {
                // Asociar área existente (sin modificar su nombre)
                $placement->area()->associate($areaId);
                $placement->save();
            }

            // Notificar al Admin, Subadmin y Docente del registro de formalización
            $assignment->loadMissing('user.person');
            $person = $assignment->user->person;
            $studentName = trim(($person->surnames ?? '') . ' ' . ($person->names ?? ''));

            $this->notificationService->notify(
                type: 'PLACEMENT_UPDATE',
                actor: $assignment,
                subject: $placement,
                payload: [
                    'action' => [
                        'route' => 'internship.validation',
                        'params' => ['a' => $assignment->id],
                    ],
                    'meta' => [
                        'message' => "El estudiante {$studentName} ha actualizado los datos para la formalización de prácticas.",
                        'sender' => $studentName,
                        'entity' => 'placement',
                    ],
                ],
                resolver: fn($subject, $actor) => $this->notificationService->resolveAcademicRoles(
                    $actor->section_id,
                    [Role::ADMIN, Role::SUBADMIN, Role::DTITULAR]
                )
            );

            return $placement->fresh();
        });
    }

    public function updateDocument(Placement $placement, Assignment $assignment, array $data): void
    {
        $this->savePlacementDocument($placement, $assignment, $data['code'], $data['file']);
    }

    public function checkAndFinalizeValidation(Placement $placement, Assignment $assignment): void
    {
        // 1. Verificar si los datos (empresa/jefe) están aprobados
        if ($placement->approval_status !== 1)
            return;

        // 2. Verificar si los 3 documentos obligatorios están aprobados
        $requiredCodes = ['fut', 'carta_presentacion', 'carta_aceptacion'];

        $approvedDocsCount = $placement->documents()
            ->whereHas('documentType', function ($q) use ($requiredCodes) {
                $q->whereIn('code', $requiredCodes);
            })
            ->where('approval_status', 1)
            ->get()
            ->unique('document_type_id')
            ->count();

        if ($approvedDocsCount < count($requiredCodes))
            return;

        // 3. Si todo está aprobado, finalizar formalización y crear Internship
        DB::transaction(function () use ($placement, $assignment) {
            $placement->update(['validation_status' => 1]);

            // Crear el registro de Internship (Etapa 2)
            Internship::updateOrCreate(
                ['placement_id' => $placement->id, 'assignment_id' => $placement->assignment_id],
                [
                    'internship_step' => 1,
                    'status' => 1
                ]
            );

            $this->notificationService->notify(
                type: 'PLACEMENT_FINALIZED',
                actor: $assignment,
                subject: $placement,
                payload: [
                    'action' => [
                        'route' => 'internship.submission',
                        'params' => [],
                    ],
                    'meta' => [
                        'message' => "Se ha formalizado la solicitud de prácticas. Ahora puedes continuar con el siguiente paso.",
                        'entity' => 'placement',
                    ],
                ],
                resolver: function ($subject, $actor) {
                    return collect([$subject->assignment->user]);
                }
            );
        });
    }

    private function savePlacementDocument(Placement $placement, Assignment $assignment, string $code, $file): void
    {
        $docType = DocumentType::where('code', $code)->first();
        if ($docType) {
            $this->documentService->registerDocument([
                'file' => $file,
                'context' => 'placement',
                'target_id' => $placement->id,
                'document_type_id' => $docType->id,
                'comment' => ''
            ], $assignment, $placement);
        }
    }
}
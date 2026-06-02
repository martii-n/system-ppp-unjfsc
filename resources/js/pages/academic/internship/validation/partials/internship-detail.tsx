import { useState } from 'react';
import { Stepper } from '@/components/general/stepper';
import { Badge } from '@/components/ui/badge';
import { Info, FileText, EyeOff, Eye } from 'lucide-react';
import RequirementsList from '@/components/academic/requirements-list';
import FilePreview from '@/components/document/FilePreview';
import { EvaluationView } from '../../submission/parts/EvaluationView';
import { ValidationPanel } from '@/components/academic/validation-panel';
import { router } from '@inertiajs/react';
import internship from '@/routes/academic/internship';
import { Button } from '@/components/ui/button';

interface InternshipDetailProps {
    detailData: any;
    loadDetail: (id?: number, step?: number) => void;
    onStatusUpdateSuccess: () => void;
}

export default function InternshipDetail({
    detailData,
    loadDetail,
    onStatusUpdateSuccess,
}: InternshipDetailProps) {
    const [selectedReqIndex, setSelectedReqIndex] = useState(0);
    const [previewEnabled, setPreviewEnabled] = useState(true);
    const [viewStep, setViewStep] = useState(detailData?.currentStep || 1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const steps = detailData?.steps || [];
    const requirements = detailData?.requirements || [];
    const currentRequirement = requirements[selectedReqIndex] || null;
    const isViewingPastStep = viewStep !== detailData?.currentStep;
    const isEvalStage =
        steps.find((s: any) => s.id === viewStep)?.is_evaluation ?? false;

    const handleStepClick = (id: number) => {
        if (id <= detailData?.currentStep && id !== viewStep) {
            loadDetail(undefined, id);
            setViewStep(id);
            setSelectedReqIndex(0);
        }
    };

    const handleValidation = (payloadValidation: {
        status: number;
        comment: string;
    }) => {
        if (!currentRequirement?.latest?.id) return;

        const url = internship.documents.status.url(
            currentRequirement.latest.id,
        );
        const payload = {
            approval_status: payloadValidation.status,
            comment: payloadValidation.comment,
        };

        router.patch(url, payload, {
            onBefore: () => setIsSubmitting(true),
            onFinish: () => setIsSubmitting(false),
            onSuccess: () => {
                onStatusUpdateSuccess();
            },
        });
    };

    if (steps.length === 0) {
        const sectionId = detailData?.assignment?.section_id || detailData?.assignment?.section?.id || '';
        const schoolId = detailData?.assignment?.section?.school_id || detailData?.assignment?.section?.school?.id || '';
        const facultyId = detailData?.assignment?.section?.school?.faculty_id || detailData?.assignment?.section?.school?.faculty?.id || '';
        const settingsUrl = `/settings/internship?faculty_id=${facultyId}&school_id=${schoolId}&section_id=${sectionId}`;

        return (
            <div className="flex h-full flex-col items-center justify-center p-8">
                <div className="flex max-w-md flex-col items-center text-center">
                    <div className="mb-4 flex size-12 items-center justify-center rounded-full border border-dashed bg-muted/10">
                        <Info className="size-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-sm font-bold tracking-tight uppercase">Etapas no configuradas</h3>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                        Las etapas y requisitos del flujo de prácticas aún no han sido configurados para esta sección. Por favor, establezca la configuración antes de continuar.
                    </p>
                    
                    {detailData?.assignment?.section && (
                        <div className="mt-6 w-full rounded-lg border bg-muted/20 p-4 text-left text-[11px] text-muted-foreground space-y-1">
                            <p className="font-bold text-foreground mb-1.5 uppercase tracking-wider text-[10px]">Detalle Académico:</p>
                            <p><span className="font-medium text-foreground">Facultad:</span> {detailData?.assignment?.section?.school?.faculty?.name || 'N/A'}</p>
                            <p><span className="font-medium text-foreground">Escuela:</span> {detailData?.assignment?.section?.school?.name || 'N/A'}</p>
                            <p><span className="font-medium text-foreground">Sección:</span> {detailData?.assignment?.section?.name || 'N/A'}</p>
                        </div>
                    )}

                    <Button 
                        onClick={() => router.get(settingsUrl)}
                        className="mt-6 font-bold text-xs uppercase"
                        size="sm"
                    >
                        Configurar etapas
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col gap-6 overflow-hidden p-4">
            {/* Stepper Superior */}
            <Stepper
                currentStep={detailData?.currentStep}
                steps={steps}
                onStepClick={handleStepClick}
            />

            {/* Info de Etapa */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <Badge
                        variant="outline"
                        className="border-primary/20 bg-primary/5 px-3 font-bold text-primary"
                    >
                        {steps.find((s: any) => s.id === viewStep)?.label ||
                            `Etapa ${viewStep}`}
                    </Badge>
                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                        Paso {viewStep} de {steps.length}
                    </span>
                    {isViewingPastStep && (
                        <Badge
                            variant="outline"
                            className="animate-pulse border-amber-200 bg-amber-50 text-[10px] text-amber-700"
                        >
                            Modo Histórico
                        </Badge>
                    )}
                </div>
                {!isEvalStage && (
                    <span className="text-xs font-bold tracking-tighter text-muted-foreground uppercase">
                        Progreso:{' '}
                        {requirements.filter((r: any) => r.status === 1).length}{' '}
                        / {requirements.length} Aprobados
                    </span>
                )}
            </div>

            {/* Contenido Principal */}
            {isEvalStage ? (
                <div className="flex-1 overflow-y-auto">
                    <EvaluationView internship={detailData?.internship} />
                </div>
            ) : requirements.length > 0 ? (
                <div className="flex min-h-0 flex-1 gap-6 overflow-hidden">
                    {/* COL 2: Visor de Documento */}
                    <main className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border bg-background shadow-sm">
                        <div className="flex shrink-0 items-center justify-between border-b bg-muted/10 px-4 py-2">
                            <div className="flex items-center gap-2">
                                <FileText className="size-4 text-primary" />
                                <span className="truncate text-xs font-bold">
                                    {currentRequirement?.title}
                                </span>
                            </div>
                            <button
                                onClick={() =>
                                    setPreviewEnabled(!previewEnabled)
                                }
                                className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground transition-colors hover:text-primary"
                            >
                                {previewEnabled ? (
                                    <EyeOff className="size-3.5" />
                                ) : (
                                    <Eye className="size-3.5" />
                                )}
                                {previewEnabled ? 'Ocultar' : 'Ver'}
                            </button>
                        </div>
                        <div className="relative flex-1 bg-slate-50">
                            <FilePreview
                                path={currentRequirement?.latest?.path}
                                name={currentRequirement?.title}
                                previewEnabled={previewEnabled}
                            />
                        </div>
                    </main>

                    {/* COL 3: Dictamen */}
                    <aside className="custom-scrollbar flex shrink-0 flex-col gap-4 overflow-y-auto lg:w-64 xl:w-72">
                        <RequirementsList
                            requirements={requirements}
                            selectedType={selectedReqIndex}
                            onSelectType={setSelectedReqIndex}
                            previewEnabled={previewEnabled}
                            onTogglePreview={() =>
                                setPreviewEnabled(!previewEnabled)
                            }
                        />
                        <ValidationPanel
                            status={currentRequirement?.status}
                            history={currentRequirement?.history || []}
                            onSuccess={handleValidation}
                            isSubmitting={isSubmitting}
                            hasSelection={!!currentRequirement}
                            showFileInfo={
                                currentRequirement?.latest
                                    ? {
                                          name: currentRequirement.title,
                                          meta: 'Documento adjunto',
                                      }
                                    : undefined
                            }
                        />
                        <div className="mt-4 space-y-2 rounded-lg border border-dashed bg-muted/20 p-4">
                            <h5 className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                                <Info className="size-3" /> Ayuda al Validador
                            </h5>
                            <p className="text-[11px] leading-relaxed text-muted-foreground">
                                Revise detenidamente cada documento. Si observa
                                errores, indique el motivo detallado para que el
                                estudiante pueda corregirlo.
                            </p>
                        </div>
                    </aside>
                </div>
            ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/5 text-muted-foreground">
                    <Info className="size-10 opacity-20" />
                    <p className="text-sm font-medium">
                        No hay documentos en esta etapa.
                    </p>
                    <Button size="sm" className="">
                        Waaa
                    </Button>
                </div>
            )}
        </div>
    );
}

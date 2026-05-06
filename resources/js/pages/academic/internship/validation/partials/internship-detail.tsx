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

interface InternshipDetailProps {
    detailData: any;
    loadDetail: (id?: number, step?: number) => void;
    onStatusUpdateSuccess: () => void;
}

export default function InternshipDetail({ detailData, loadDetail, onStatusUpdateSuccess }: InternshipDetailProps) {
    const [selectedReqIndex, setSelectedReqIndex] = useState(0);
    const [previewEnabled, setPreviewEnabled] = useState(true);
    const [viewStep, setViewStep] = useState(detailData?.currentStep || 1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const steps = detailData?.steps || [];
    const requirements = detailData?.requirements || [];
    const currentRequirement = requirements[selectedReqIndex] || null;
    const isViewingPastStep = viewStep !== detailData?.currentStep;
    const isEvalStage = steps.find((s: any) => s.id === viewStep)?.is_evaluation ?? false;

    const handleStepClick = (id: number) => {
        if (id <= detailData?.currentStep && id !== viewStep) {
            loadDetail(undefined, id);
            setViewStep(id);
            setSelectedReqIndex(0);
        }
    };

    const handleValidation = (payloadValidation: { status: number; comment: string }) => {
        if (!currentRequirement?.latest?.id) return;
        
        const url = internship.documents.status.url(currentRequirement.latest.id);
        const payload = { approval_status: payloadValidation.status, comment: payloadValidation.comment };

        router.patch(url, payload, {
            onBefore: () => setIsSubmitting(true),
            onFinish: () => setIsSubmitting(false),
            onSuccess: () => {
                onStatusUpdateSuccess();
            },
        });
    };

    return (
        <div className="flex flex-col gap-6 p-4 overflow-hidden h-full">
            {/* Stepper Superior */}
            <Stepper
                currentStep={detailData?.currentStep}
                steps={steps}
                onStepClick={handleStepClick}
            />

            {/* Info de Etapa */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-primary/20 bg-primary/5 font-bold text-primary px-3">
                        {steps.find((s: any) => s.id === viewStep)?.label || `Etapa ${viewStep}`}
                    </Badge>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Paso {viewStep} de {steps.length}
                    </span>
                    {isViewingPastStep && (
                        <Badge variant="outline" className="animate-pulse border-amber-200 bg-amber-50 text-amber-700 text-[10px]">
                            Modo Histórico
                        </Badge>
                    )}
                </div>
                {!isEvalStage && (
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">
                        Progreso: {requirements.filter((r: any) => r.status === 1).length} / {requirements.length} Aprobados
                    </span>
                )}
            </div>

            {/* Contenido Principal */}
            {isEvalStage ? (
                <div className="flex-1 overflow-y-auto">
                    <EvaluationView internship={detailData?.internship} />
                </div>
            ) : requirements.length > 0 ? (
                <div className="flex flex-1 gap-6 overflow-hidden min-h-0">
                    {/* COL 2: Visor de Documento */}
                    <main className="flex-1 flex flex-col min-w-0 border rounded-xl overflow-hidden bg-background shadow-sm">
                        <div className="flex shrink-0 items-center justify-between border-b px-4 py-2 bg-muted/10">
                            <div className="flex items-center gap-2">
                                <FileText className="size-4 text-primary" />
                                <span className="text-xs font-bold truncate">{currentRequirement?.title}</span>
                            </div>
                            <button
                                onClick={() => setPreviewEnabled(!previewEnabled)}
                                className="text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                            >
                                {previewEnabled ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                                {previewEnabled ? 'Ocultar' : 'Ver'}
                            </button>
                        </div>
                        <div className="flex-1 relative bg-slate-50">
                            <FilePreview
                                path={currentRequirement?.latest?.path}
                                name={currentRequirement?.title}
                                previewEnabled={previewEnabled}
                            />
                        </div>
                    </main>

                    {/* COL 3: Dictamen */}
                    <aside className="lg:w-64 xl:w-72 shrink-0 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                        <RequirementsList
                            requirements={requirements}
                            selectedType={selectedReqIndex}
                            onSelectType={setSelectedReqIndex}
                            previewEnabled={previewEnabled}
                            onTogglePreview={() => setPreviewEnabled(!previewEnabled)}
                        />
                        <ValidationPanel
                            status={currentRequirement?.status}
                            history={currentRequirement?.history || []}
                            onSuccess={handleValidation}
                            isSubmitting={isSubmitting}
                            hasSelection={!!currentRequirement}
                            showFileInfo={currentRequirement?.latest ? {
                                name: currentRequirement.title,
                                meta: "Documento adjunto"
                            } : undefined}
                        />
                        <div className="mt-4 p-4 bg-muted/20 border border-dashed rounded-lg space-y-2">
                            <h5 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                                <Info className="size-3" /> Ayuda al Validador
                            </h5>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Revise detenidamente cada documento. Si observa errores, indique el motivo detallado
                                para que el estudiante pueda corregirlo.
                            </p>
                        </div>
                    </aside>
                </div>
            ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 border border-dashed rounded-xl text-muted-foreground bg-muted/5">
                    <Info className="size-10 opacity-20" />
                    <p className="text-sm font-medium">No hay documentos en esta etapa.</p>
                </div>
            )}
        </div>
    );
}

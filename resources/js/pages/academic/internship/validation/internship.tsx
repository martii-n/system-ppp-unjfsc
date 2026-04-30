import { FileText, EyeOff, Eye, GraduationCap, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RequirementsList from "@/components/academic/requirements-list";
import FilePreview from "@/components/document/FilePreview";
import FileHistory from "@/components/document/FileHistory";
import { useState, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stepper } from "@/components/general/stepper";
import RequestGradeChangeModal from "./partials/request-grade-change-modal";
import PendingGradeChangeModal from "./partials/pending-grade-change-modal";

// ─────────────────────────────────────────────
// Sub-component: Stage for grade evaluation
// ─────────────────────────────────────────────
function EvalStageContent({ internshipData, pendingRequest, loadDetail }: any) {
    const { role } = usePage().props as any;
    const isAdmin = [1, 2].includes(role);

    const currentGrade = internshipData?.grade;
    const hasPendingRequest = !!pendingRequest;

    const [gradeInput, setGradeInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showPendingModal, setShowPendingModal] = useState(false);

    const handleSaveGrade = () => {
        const gradeValue = parseFloat(gradeInput);
        if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 20) {
            toast.error("Por favor, ingrese una nota válida entre 0 y 20.");
            return;
        }
        setIsSubmitting(true);
        router.patch(`/internship/${internshipData?.id}/grade`, { grade: gradeValue }, {
            onSuccess: () => loadDetail(),
            onError: (err) => toast.error(err.message || "Ocurrió un error al guardar la calificación."),
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 bg-amber-50/30 overflow-y-auto">
            <div className="size-20 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <GraduationCap className="size-10 text-amber-600" />
            </div>
            <div className="text-center">
                <h2 className="text-2xl font-bold text-amber-900 mb-2">Etapa de Evaluación Final</h2>
                <p className="text-sm text-amber-700 max-w-md mx-auto">
                    El estudiante ha completado todas las etapas documentales de sus prácticas.
                    Ingrese la calificación final obtenida.
                </p>
            </div>

            <div className="w-full max-w-md bg-white border rounded-xl p-6 shadow-sm space-y-6">
                {currentGrade !== null && currentGrade !== undefined ? (
                    <GradeRegistered
                        currentGrade={currentGrade}
                        hasPendingRequest={hasPendingRequest}
                        pendingRequest={pendingRequest}
                        isAdmin={isAdmin}
                        onReviewRequest={() => setShowPendingModal(true)}
                        onRequestChange={() => setShowRequestModal(true)}
                    />
                ) : (
                    <GradeForm
                        gradeInput={gradeInput}
                        setGradeInput={setGradeInput}
                        isSubmitting={isSubmitting}
                        onSave={handleSaveGrade}
                    />
                )}
            </div>

            <RequestGradeChangeModal
                internshipId={internshipData?.id}
                open={showRequestModal}
                onOpenChange={setShowRequestModal}
                onSuccess={loadDetail}
            />
            <PendingGradeChangeModal
                request={pendingRequest}
                open={showPendingModal}
                onOpenChange={setShowPendingModal}
                onSuccess={loadDetail}
            />
        </div>
    );
}

function GradeRegistered({ currentGrade, hasPendingRequest, pendingRequest, isAdmin, onReviewRequest, onRequestChange }: any) {
    return (
        <div className="flex flex-col items-center gap-4 text-center">
            <div>
                <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold mb-2">Nota Registrada</p>
                <span className="text-5xl font-black text-primary">{currentGrade}</span>
            </div>

            {hasPendingRequest ? (
                <PendingRequestBanner
                    pendingRequest={pendingRequest}
                    isAdmin={isAdmin}
                    onReview={onReviewRequest}
                />
            ) : (
                <NoRequestBanner onRequestChange={onRequestChange} />
            )}
        </div>
    );
}

function PendingRequestBanner({ pendingRequest, isAdmin, onReview }: any) {
    return (
        <div className="w-full space-y-4 mt-2">
            <div className="bg-blue-50 text-blue-800 p-4 rounded-lg flex items-start gap-3 text-xs border border-blue-100 text-left">
                <Clock className="size-5 shrink-0 text-blue-500" />
                <div>
                    <p className="font-bold mb-1">Solicitud de Cambio Pendiente</p>
                    <p className="opacity-90">
                        El docente ha solicitado cambiar la nota a <strong>{pendingRequest.payload.new_grade}</strong>. Justificación: "{pendingRequest.reason}"
                    </p>
                </div>
            </div>
            {isAdmin && (
                <Button variant="default" className="w-full h-11 font-bold bg-blue-600 hover:bg-blue-700" onClick={onReview}>
                    Revisar Solicitud
                </Button>
            )}
        </div>
    );
}

function NoRequestBanner({ onRequestChange }: any) {
    return (
        <>
            <div className="bg-slate-50 text-slate-600 p-3 rounded-md flex items-start gap-3 mt-2 text-xs border border-slate-200 text-left">
                <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-slate-400" />
                <p>La calificación ya ha sido registrada definitivamente. Si necesita modificarla, deberá solicitar un cambio de nota justificando el motivo.</p>
            </div>
            <Button variant="outline" className="w-full mt-2" onClick={onRequestChange}>
                Solicitar cambio de nota
            </Button>
        </>
    );
}

function GradeForm({ gradeInput, setGradeInput, isSubmitting, onSave }: any) {
    return (
        <div className="space-y-4">
            <div className="bg-amber-50 text-amber-800 p-3 rounded-md flex items-start gap-3 mt-2 text-xs border border-amber-200">
                <AlertCircle className="size-4 shrink-0 mt-0.5 text-amber-600" />
                <div>
                    <p className="font-bold mb-1">¡Importante!</p>
                    <p>Después de guardar la nota, <strong>ya no podrá modificarla directamente</strong>. Cualquier cambio posterior requerirá enviar una solicitud formal.</p>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="grade" className="text-sm font-bold text-slate-700">Calificación (0 - 20)</Label>
                <Input
                    id="grade"
                    type="number"
                    min="0"
                    max="20"
                    step="0.01"
                    placeholder="Ej. 16.5"
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                    className="text-lg font-semibold h-12"
                />
            </div>
            <Button className="w-full h-12 font-bold" onClick={onSave} disabled={isSubmitting || !gradeInput}>
                Registrar Calificación
            </Button>
        </div>
    );
}

// ─────────────────────────────────────────────
// Sub-component: Stage for document review
// ─────────────────────────────────────────────
function DocumentStageContent({ stepRequirements, selectedReqIndex, setSelectedReqIndex, previewEnabled, setPreviewEnabled, viewStep, realStep, setViewStep, ValidationForm, detailData, loadDetail }: any) {
    const currentRequirement = stepRequirements[selectedReqIndex] ?? null;
    const isViewingPastStep = viewStep !== realStep;

    return (
        <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col border-r min-w-0 bg-muted/10">
                {currentRequirement ? (
                    <>
                        <div className="h-10 border-b bg-muted/40 flex items-center px-4 shrink-0 justify-between">
                            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                                <FileText className="size-4" />
                                <span>{currentRequirement.title}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setPreviewEnabled(!previewEnabled)} className="text-[10px] flex items-center gap-1 hover:text-primary underline">
                                    {previewEnabled ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                                    {previewEnabled ? "Ocultar" : "Mostrar"}
                                </button>
                                <Badge variant="outline" className="text-[10px] bg-background uppercase tracking-tighter">DOCUMENTO DEL PASO {viewStep}</Badge>
                            </div>
                        </div>
                        <FilePreview path={currentRequirement.latest?.path} name={currentRequirement.title} previewEnabled={previewEnabled} />
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm font-medium italic">
                        No hay documentos registrados en esta etapa
                    </div>
                )}
            </div>

            <aside className="w-80 xl:w-85 shrink-0 flex flex-col bg-background h-full overflow-hidden border-l">
                <div className="p-4 flex-1 flex flex-col gap-5 overflow-y-auto scrollbar-thin">
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Requisitos de Etapa {viewStep}</h3>
                        <RequirementsList
                            requirements={stepRequirements}
                            selectedType={selectedReqIndex}
                            onSelectType={(idx: number) => setSelectedReqIndex(idx)}
                            previewEnabled={previewEnabled}
                            onTogglePreview={() => setPreviewEnabled(!previewEnabled)}
                        />
                    </div>

                    <div className="rounded-xl border shadow-sm flex flex-col overflow-hidden">
                        <Tabs defaultValue="validation" className="flex flex-col">
                            <TabsList className="w-full rounded-none border-b h-10 px-1 gap-1">
                                <TabsTrigger value="validation" className="flex-1 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none rounded-md">Dictamen</TabsTrigger>
                                <TabsTrigger value="history" className="flex-1 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none rounded-md">Historial</TabsTrigger>
                            </TabsList>

                            <TabsContent value="validation" className="p-4 pt-4 mt-0 text-center">
                                {isViewingPastStep ? (
                                    <div className="py-6 px-2">
                                        <Clock className="size-8 text-amber-500 mx-auto mb-3 opacity-50" />
                                        <p className="text-[11px] text-muted-foreground leading-relaxed uppercase font-bold tracking-tight">
                                            Estás visualizando una etapa pasada.<br />
                                            No es posible emitir dictámenes aquí.
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-4 text-[10px] h-7"
                                            onClick={() => {
                                                setViewStep(realStep);
                                                loadDetail();
                                            }}
                                        >
                                            Volver a etapa actual
                                        </Button>
                                    </div>
                                ) : currentRequirement ? (
                                    <ValidationForm
                                        type="document"
                                        requirement={currentRequirement}
                                        onSuccess={() => loadDetail(viewStep)}
                                        placementId={detailData?.placement?.id}
                                    />
                                ) : (
                                    <div className="text-xs text-center text-muted-foreground italic py-4">Seleccione un documento</div>
                                )}
                            </TabsContent>

                            <TabsContent value="history" className="p-4 mt-0 h-[300px] overflow-y-auto scrollbar-thin">
                                <FileHistory history={currentRequirement?.history || []} />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </aside>
        </div>
    );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export default function InternshipValidation({
    detailData,
    loadDetail,
    previewEnabled,
    setPreviewEnabled,
    selectedReqIndex,
    setSelectedReqIndex,
    ValidationForm,
}: any) {
    const realStep = detailData?.current_step || 1;

    // We maintain 'viewStep' locally. We initialize it to the real step or the step returned from detailData (if we queried it).
    // Let's rely on a piece of logic to sync viewStep with the displayed data if we want.
    // For simplicity, viewStep will drive the UI.
    const [viewStep, setViewStep] = useState(realStep);

    // Sync only on initial load or realStep change (when a student is swapped or real step progresses)
    useEffect(() => {
        // If we queried a specific step, we can either use that or keep our local state.
        // But since loadDetail is fully reloading detailData, and detailData.current_step is always the real step...
        // Let's ensure we only override viewStep when the selected assignment drastically changes.
        // The most robust way is to remember the assignmentId and only reset viewStep if it changes.
    }, [detailData?.assignment?.id]);

    const workflowSteps = detailData?.workflow_steps || [];
    const stepRequirements = detailData?.step_requirements || [];
    const internshipData = detailData?.assignment?.internship;
    const pendingRequest = detailData?.pending_request;

    const currentStepConfig = workflowSteps.find((s: any) => s.id === viewStep);
    const isEvalStage = currentStepConfig?.is_evaluation ?? false;

    const handleStepClick = (id: number) => {
        if (id <= realStep && id !== viewStep) {
            setViewStep(id);
            setSelectedReqIndex(0);
            loadDetail(id); // <--- Triggers backend to load requirements for the clicked step!
        }
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Always-visible Stepper header */}
            <div className="p-4 border-b bg-background shrink-0">
                <Stepper currentStep={realStep} steps={workflowSteps} onStepClick={handleStepClick} />
            </div>

            {/* Content area switchable by step */}
            {isEvalStage ? (
                <EvalStageContent
                    internshipData={internshipData}
                    pendingRequest={pendingRequest}
                    loadDetail={() => loadDetail(viewStep)}
                />
            ) : (
                <DocumentStageContent
                    stepRequirements={stepRequirements}
                    selectedReqIndex={selectedReqIndex}
                    setSelectedReqIndex={setSelectedReqIndex}
                    previewEnabled={previewEnabled}
                    setPreviewEnabled={setPreviewEnabled}
                    viewStep={viewStep}
                    realStep={realStep}
                    setViewStep={setViewStep}
                    ValidationForm={ValidationForm}
                    detailData={detailData}
                    loadDetail={loadDetail}
                />
            )}
        </div>
    );
}

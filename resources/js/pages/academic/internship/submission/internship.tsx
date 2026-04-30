import { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";
import {
    FileText, ArrowRight, AlertCircle,
    CheckCircle2, Clock, Info, RotateCcw, Trash2, GraduationCap
} from "lucide-react";

import { Stepper } from "@/components/general/stepper";
import RequirementsList from "@/components/academic/requirements-list";
import DocumentViewer from "@/components/document/DocumentViewer";
import FileHistory from "@/components/document/FileHistory";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import internship from "@/routes/academic/internship";

interface Props {
    assignment: any;
    internship: any;
    workflowSteps: { id: number; label: string; is_evaluation: boolean }[];
    currentStep: number;
    stepRequirements: any[];
}

export function InternshipWorkflow({
    assignment,
    internship: internshipData,
    workflowSteps,
    currentStep,
    stepRequirements,
}: Props) {
    const [selectedType, setSelectedType] = useState(0);
    const [previewEnabled, setPreviewEnabled] = useState(false);
    const [activeTab, setActiveTab] = useState<'estado' | 'historial'>('estado');
    const [isEditing, setIsEditing] = useState(false);
    const [tempFile, setTempFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // Estado local para saber qué etapa estamos visualizando
    // (Por defecto al cargar, vemos la etapa actual)
    const [viewStep, setViewStep] = useState(currentStep);

    // Si currentStep (etapa real) cambia por detrás, nos sincronizamos
    useEffect(() => {
        setViewStep(currentStep);
    }, [currentStep]);

    const safeIdx = selectedType >= stepRequirements.length ? 0 : selectedType;
    const currentReq = stepRequirements[safeIdx] ?? null;

    // isEvalStage ahora depende del viewStep, no de currentStep
    const isEvalStage = workflowSteps.find(s => s.id === viewStep)?.is_evaluation ?? false;
    const isViewingPastStep = viewStep !== currentStep;

    // Limpiar selección al cambiar de requisito
    useEffect(() => {
        setIsEditing(false);
        setTempFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    }, [selectedType]);

    const canUpload = !isViewingPastStep && currentReq && ((!currentReq.latest) || isEditing) && !tempFile;

    const onUpload = (file: File) => {
        setTempFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = () => {
        if (!tempFile || !internshipData?.id) return;

        const formData = new FormData();
        formData.append('file', tempFile);
        formData.append('code', currentReq.code);
        formData.append('target_id', internshipData.id);

        router.post(internship.documents.store.url(internshipData.id), formData, {
            onBefore: () => setUploading(true),
            onFinish: () => setUploading(false),
            onSuccess: () => {
                setTempFile(null);
                setPreviewUrl(null);
                setIsEditing(false);
            },
            onError: () => {
                toast.error("Error al subir el documento. Inténtalo de nuevo.");
            }
        });
    };

    const handleStepClick = (id: number) => {
        if (id <= currentStep && id !== viewStep) {
            // Cargar los requisitos de la etapa anterior usando Inertia
            router.get(`/internship?step=${id}`, {}, {
                preserveState: true,
                preserveScroll: true,
                only: ['step_requirements'],
                onSuccess: () => {
                    setViewStep(id);
                    setSelectedType(0);
                }
            });
        }
    };

    // ── Si es etapa de evaluación ────────────────────────────────────────────
    if (isEvalStage) {
        return (
            <div className="flex flex-col gap-6">
                <Stepper currentStep={currentStep} steps={workflowSteps} onStepClick={handleStepClick} />
                <div className="flex flex-col items-center justify-center gap-4 p-16 border-2 border-dashed border-amber-300 rounded-xl bg-amber-50/30 text-center">
                    <div className="size-16 rounded-full bg-amber-100 flex items-center justify-center">
                        <GraduationCap className="size-8 text-amber-600" />
                    </div>
                    <h2 className="text-xl font-bold text-amber-900">Etapa de Evaluación Final</h2>
                    <p className="text-sm text-amber-700 max-w-md">
                        Has completado todas las etapas documentales. Tu docente registrará
                        la calificación final de tus prácticas en breve.
                    </p>
                    {internshipData?.grade && (
                        <div className="mt-4 px-8 py-4 bg-amber-100 rounded-lg border border-amber-300">
                            <p className="text-xs text-amber-700 font-bold uppercase tracking-widest mb-1">Calificación</p>
                            <p className="text-4xl font-black text-amber-900">{internshipData.grade}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ── Si no hay workflow configurado ───────────────────────────────────────
    if (!workflowSteps.length || !stepRequirements.length) {
        return (
            <div className="flex flex-col gap-6">
                {workflowSteps.length > 0 && (
                    <Stepper currentStep={currentStep} steps={workflowSteps} onStepClick={handleStepClick} />
                )}
                <div className="flex flex-col items-center justify-center gap-3 p-12 border border-dashed rounded-xl text-muted-foreground">
                    <Info className="size-8 opacity-30" />
                    <p className="text-sm">No hay documentos en esta etapa.</p>
                </div>
            </div>
        );
    }

    const currentStageName = workflowSteps.find(s => s.id === viewStep)?.label ?? `Etapa ${viewStep}`;

    return (
        <div className="flex flex-col gap-6">
            {/* ── Stepper superior ────────────────────────────────────────── */}
            <Stepper currentStep={currentStep} steps={workflowSteps} onStepClick={handleStepClick} />

            {/* ── Contador de progreso ────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold">
                        {currentStageName}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                        Etapa {viewStep} de {workflowSteps.length}
                    </span>
                    {isViewingPastStep && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 animate-pulse ml-2">
                            Modo Visualización
                        </Badge>
                    )}
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                    {stepRequirements.filter((r: any) => r.status === 1).length} / {stepRequirements.length} Aprobados
                </span>
            </div>

            {/* ── Layout 3 paneles ────────────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">

                {/* PANEL IZQUIERDO — Lista de requisitos */}
                <div className="w-full lg:w-64 xl:w-72 flex flex-col gap-4 shrink-0">
                    <RequirementsList
                        requirements={stepRequirements}
                        selectedType={safeIdx}
                        onSelectType={setSelectedType}
                        previewEnabled={previewEnabled}
                        onTogglePreview={() => setPreviewEnabled(!previewEnabled)}
                    />
                    <div className="relative w-full rounded-lg border p-4 bg-background text-foreground [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7">
                        <AlertCircle className="h-4 w-4" />
                        <h5 className="mb-1 font-medium leading-none tracking-tight">¿Necesitas ayuda?</h5>
                        <div className="text-sm text-muted-foreground">
                            Sube archivos PDF menores a 10MB.
                        </div>
                    </div>
                </div>

                {/* PANEL CENTRAL — DocumentViewer */}
                <div className="flex-1 w-full rounded-xl border bg-card shadow-sm flex flex-col min-h-[500px] overflow-hidden relative">
                    {uploading && (
                        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2">
                                <Spinner className="animate-spin text-primary" />
                                <span className="text-xs font-medium">Subiendo documento...</span>
                            </div>
                        </div>
                    )}

                    {/* Header del visor */}
                    <div className="flex flex-row items-center justify-between px-4 py-3 border-b bg-muted/20">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-primary/5 border-primary/20">
                                <FileText className="size-4 text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-sm font-semibold leading-none tracking-tight">
                                    {currentReq?.title ?? "Selecciona un documento"}
                                </h3>
                                <p className="text-[11px] text-muted-foreground mt-1 uppercase font-bold tracking-widest italic opacity-60">
                                    {tempFile ? 'Vista previa local' : currentReq?.latest ? 'Versión cargada' : 'Sin archivo'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <DocumentViewer
                        currentFile={{
                            ...currentReq,
                            latest: tempFile
                                ? { path: previewUrl, name: tempFile.name }
                                : currentReq?.latest
                        }}
                        canUpload={canUpload}
                        onUpload={onUpload}
                        previewEnabled={previewEnabled}
                    />
                </div>

                {/* PANEL DERECHO — Gestión (Detalles + Historial + Envío) */}
                <div className="w-full xl:w-80 lg:w-72 flex flex-col gap-4 shrink-0">
                    <div className="rounded-xl border bg-card shadow-sm">
                        {/* Tabs */}
                        <div className="px-4 py-3 flex items-center border-b">
                            <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-full">
                                <button
                                    onClick={() => setActiveTab('estado')}
                                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all w-1/2 ${activeTab === 'estado' ? 'bg-background text-foreground shadow-sm' : 'hover:text-foreground'}`}
                                >
                                    Detalles
                                </button>
                                <button
                                    onClick={() => setActiveTab('historial')}
                                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all w-1/2 ${activeTab === 'historial' ? 'bg-background text-foreground shadow-sm' : 'hover:text-foreground'}`}
                                >
                                    Historial
                                </button>
                            </div>
                        </div>

                        <div className="p-4">
                            {activeTab === 'estado' ? (
                                <FileRequirementDetails
                                    requirement={currentReq}
                                    tempFile={tempFile}
                                    isEditing={isEditing}
                                    onSetEditing={setIsEditing}
                                    onRemoveTemp={() => { setTempFile(null); setPreviewUrl(null); }}
                                />
                            ) : (
                                <FileHistory history={currentReq?.history || []} />
                            )}
                        </div>

                        {/* Botón de envío */}
                        {(tempFile || isEditing) && (
                            <div className="p-4 border-t bg-muted/10">
                                <Button
                                    className="w-full gap-2"
                                    onClick={handleSubmit}
                                    disabled={uploading || !tempFile}
                                >
                                    {uploading ? (
                                        <Spinner className="size-4" />
                                    ) : (
                                        <CheckCircle2 className="size-4" />
                                    )}
                                    Enviar para Revisión
                                    <ArrowRight className="size-4" />
                                </Button>
                                <p className="text-[11px] text-center text-muted-foreground mt-2 leading-relaxed">
                                    Al confirmar, el docente revisará tu documento.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

// ── Componente de detalles del panel derecho (igual a files.tsx) ──────────────
function FileRequirementDetails({ requirement, tempFile, isEditing, onSetEditing, onRemoveTemp }: any) {
    const latest = requirement?.latest;
    const status = requirement?.status;

    if (!latest && !tempFile) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/10 rounded-lg border-2 border-dashed">
                <Info className="size-6 text-muted-foreground/30 mb-2" />
                <h4 className="text-xs font-bold uppercase">Sin archivo cargado</h4>
                <p className="text-[10px] text-muted-foreground">Por favor, selecciona o arrastra el documento para iniciar el proceso de validación.</p>
            </div>
        );
    }

    if (tempFile || isEditing) {
        return (
            <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 shadow-sm">
                    <FileText className="size-5 text-blue-600 shrink-0" />
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold text-blue-900 leading-none">Listo para enviar</h4>
                        <p className="text-[11px] text-blue-700 leading-relaxed truncate">{tempFile?.name ?? latest?.name}</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs gap-2" onClick={onRemoveTemp}>
                    <Trash2 className="size-3.5 text-destructive" />
                    Eliminar selección
                </Button>
            </div>
        );
    }

    if (status === 2) {
        return (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                <Clock className="size-5 text-amber-600 shrink-0" />
                <div className="space-y-1">
                    <h4 className="text-sm font-bold text-amber-900 leading-none">En Revisión</h4>
                    <p className="text-[11px] text-amber-700">No se permiten cambios mientras se valida.</p>
                </div>
            </div>
        );
    }

    if (status === 3) {
        return (
            <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3 shadow-sm italic">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="size-4 text-red-600" />
                        <h4 className="text-xs font-bold text-red-700 uppercase">Observación</h4>
                    </div>
                    <p className="text-sm text-red-900 leading-snug">"{latest?.comment || 'Revisar formato y datos.'}"</p>
                </div>
                <Button variant="outline" className="w-full gap-2 text-xs font-bold" onClick={() => onSetEditing(true)}>
                    <RotateCcw className="size-3.5" />
                    Corregir y Re-subir
                </Button>
            </div>
        );
    }

    if (status === 1) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3 shadow-sm">
                <CheckCircle2 className="size-5 text-green-600 shrink-0" />
                <div className="space-y-1">
                    <h4 className="text-sm font-bold text-green-900 leading-none">Aprobado</h4>
                    <p className="text-[11px] text-green-700">Este documento ha sido validado satisfactoriamente.</p>
                </div>
            </div>
        );
    }

    return null;
}
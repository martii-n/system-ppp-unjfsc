import RequirementsList from "@/components/academic/requirements-list";
import DocumentViewer from "@/components/document/DocumentViewer";
import FileHistory from "@/components/document/FileHistory";
import { useState, useMemo, useEffect } from "react";
import {
    FileText,
    Trash2,
    RotateCcw,
    AlertCircle,
    CheckCircle2,
    Clock,
    Info,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { router } from "@inertiajs/react";
import internship from "@/routes/academic/internship";
import { AlertHelp } from "@/components/document/AlertHelp";

export function Files({ data, setData, currentPlacement, initialRequirements = [] }: { data: any, setData: any, currentPlacement?: any, initialRequirements?: any[] }) {
    const [selectedType, setSelectedType] = useState(0);
    const [previewEnabled, setPreviewEnabled] = useState(false);
    const [activeTab, setActiveTab] = useState('estado');
    const [isEditing, setIsEditing] = useState(false);
    const [tempFile, setTempFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // Initial compute of requirements if not in "management" mode (initialRequirements)
    const baseRequirements = useMemo(() => {
        if (currentPlacement && initialRequirements.length > 0) return initialRequirements;

        const isDesarrolloDirecto = data.internship_type === 'desarrollo' && data.origin === 'direct';
        const reqs = [
            { id: 1, code: "fut", title: "FUT", status: 0, latest: null, history: [] }
        ];

        if (!isDesarrolloDirecto) {
            reqs.push({ id: 2, code: "carta_presentacion", title: "Carta de Presentación", status: 0, latest: null, history: [] });
            reqs.push({ id: 3, code: "carta_aceptacion", title: "Carta de Aceptación", status: 0, latest: null, history: [] });
        }
        return reqs;
    }, [data.internship_type, data.origin, currentPlacement, initialRequirements]);

    const safeSelectedType = selectedType >= baseRequirements.length ? 0 : selectedType;
    const currentRequirement = baseRequirements[safeSelectedType];

    // Sincronizar tempFile con los datos del formulario (Wizard mode)
    useEffect(() => {
        if (!currentPlacement && data.files[currentRequirement.code]) {
            const file = data.files[currentRequirement.code];
            setTempFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        } else if (!currentPlacement) {
            setTempFile(null);
            setPreviewUrl(null);
        }
    }, [safeSelectedType, currentPlacement]);

    const onUpload = (file: File) => {
        setTempFile(file);
        setPreviewUrl(URL.createObjectURL(file));

        if (!currentPlacement) {
            setData('files', { ...data.files, [currentRequirement.code]: file });
        }
    };

    const handleAtomicUpload = () => {
        if (!tempFile || !currentPlacement?.id) return;

        const formData = new FormData();
        formData.append('file', tempFile);
        formData.append('code', currentRequirement.code);

        const url = internship.placements.documents.store.url(currentPlacement.id);

        router.post(url, formData, {
            onBefore: () => setUploading(true),
            onFinish: () => setUploading(false),
            onSuccess: () => {
                setTempFile(null);
                setPreviewUrl(null);
                setIsEditing(false);
                // Toast es manejado por ExceptionHandler global
            },
            onError: () => {
                // Errores locales no cubiertos por Backend Flash
            }
        });
    };

    useEffect(() => {
        setIsEditing(false);
        // NOTA: No limpiamos tempFile aquí en modo Wizard para permitir persistencia entre pestañas
        if (currentPlacement) {
            setTempFile(null);
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
            }
        }
    }, [selectedType, currentPlacement]);

    // Calcular requisitos con checkmarks de "Listo" para el Wizard
    const uiRequirements = useMemo(() => {
        return baseRequirements.map(req => ({
            ...req,
            isStaged: !currentPlacement && !!data.files[req.code],
            status: (!currentPlacement && !!data.files[req.code]) ? 1 : req.status
        }));
    }, [baseRequirements, data.files, currentPlacement]);

    return (
        <div className="flex flex-col lg:flex-row gap-6 items-start animate-in fade-in duration-500">
            {/* 1. LISTA DE REQUISITOS */}
            <div className="w-full lg:w-64 xl:w-72 flex flex-col gap-4 shrink-0">
                <RequirementsList
                    requirements={uiRequirements}
                    selectedType={safeSelectedType}
                    onSelectType={setSelectedType}
                    previewEnabled={previewEnabled}
                    onTogglePreview={() => setPreviewEnabled(!previewEnabled)}
                />
                <AlertHelp />
            </div>

            {/* 2. VISOR CENTRAL */}
            <div className="flex-1 w-full rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col min-h-[500px] overflow-hidden relative border-blue-100/50 shadow-blue-900/5">
                {uploading && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                            <Spinner className="animate-spin text-primary" />
                            <span className="text-xs font-medium">Actualizando documento...</span>
                        </div>
                    </div>
                )}
                <div className="flex flex-row items-center justify-between px-4 py-3 border-b bg-muted/20">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-md border text-primary bg-primary/5`}>
                            <FileText className={`size-4`} />
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-sm font-semibold leading-none tracking-tight">
                                {currentRequirement?.title}
                            </h3>
                            <p className="text-[11px] text-muted-foreground mt-1 uppercase font-bold tracking-widest italic opacity-60">
                                {tempFile ? 'Vista Previa Local' : currentRequirement?.latest ? 'Versión Actual' : 'Pendiente de Carga'}
                            </p>
                        </div>
                    </div>
                </div>

                <DocumentViewer
                    currentFile={{
                        ...currentRequirement,
                        latest: tempFile ? { path: previewUrl, name: tempFile.name } : currentRequirement?.latest
                    }}
                    canUpload={((!currentRequirement?.latest) || isEditing || !currentPlacement) && !tempFile}
                    onUpload={onUpload}
                    previewEnabled={previewEnabled}
                />
            </div>

            {/* 3. PANEL DERECHO: GESTION (TABS) */}
            <div className="w-full xl:w-80 lg:w-72 flex flex-col gap-6 shrink-0">
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
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
                                requirement={currentRequirement}
                                tempFile={tempFile}
                                isEditing={isEditing}
                                onSetEditing={setIsEditing}
                                onRemoveTemp={() => { setTempFile(null); setPreviewUrl(null); }}
                            />
                        ) : (
                            <FileHistory history={currentRequirement?.history || []} />
                        )}
                    </div>

                    {currentPlacement && (tempFile || isEditing) && (
                        <div className="p-4 border-t bg-muted/10">
                            <Button
                                className="w-full gap-2"
                                onClick={handleAtomicUpload}
                                disabled={uploading || !tempFile}
                            >
                                {uploading ? <Spinner className="size-4" /> : <CheckCircle2 className="size-4" />}
                                Enviar Corrección
                                <ArrowRight className="size-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function FileRequirementDetails({ requirement, tempFile, isEditing, onSetEditing, onRemoveTemp }: any) {
    const latest = requirement?.latest;
    const status = requirement?.status;

    if (!latest && !tempFile) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/10 rounded-lg border-2 border-dashed">
                <Info className="size-6 text-muted-foreground/30 mb-2" />
                <h4 className="text-xs font-bold uppercase">Sin archivo</h4>
                <p className="text-[10px] text-muted-foreground">Seleccione un archivo para cargar.</p>
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
                        <p className="text-[11px] text-blue-700 leading-relaxed truncate">
                            {tempFile?.name || latest?.name}
                        </p>
                    </div>
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs gap-2" onClick={onRemoveTemp}>
                    <Trash2 className="size-3.5 text-destructive" />
                    Eliminar Selección
                </Button>
            </div>
        );
    }

    if (status === 2) {
        return (
            <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                    <Clock className="size-5 text-amber-600 shrink-0" />
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold text-amber-900 leading-none">En Revisión</h4>
                        <p className="text-[11px] text-amber-700">No se permiten cambios durante la validación.</p>
                    </div>
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
                    <p className="text-sm text-red-900 leading-snug">
                        "{latest?.comment || 'Revisar formato y datos.'}"
                    </p>
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
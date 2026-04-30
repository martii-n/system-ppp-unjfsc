import { ChevronRight, FileText, User, X, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import RequirementsList from '@/components/academic/requirements-list';
import DocumentViewer from '@/components/document/DocumentViewer';
import FileHistory from '@/components/document/FileHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { StudentSupervision } from '@/types';

interface SupervisionDetailPanelProps {
    selectedItem: StudentSupervision;
    selectedModuleId: number;
    annexes: any[];
    isLoading: boolean;
    onClose: () => void;
    // Selección externa (Hook)
    selectedIdx: number;
    onSelectIdx: (idx: number) => void;
    // Soporte para subida (Sumisión)
    canUpload?: boolean;
    onUpload?: (file: File) => void;
    tempFile?: File | null;
    // El formulario que irá en la pestaña principal, recibe el anexo seleccionado
    renderActionForm: (annex: any) => React.ReactNode; 
    actionTitle?: string;
}

export default function SupervisionDetailPanel({
    selectedItem,
    selectedModuleId,
    annexes,
    isLoading,
    onClose,
    selectedIdx,
    onSelectIdx,
    canUpload = false,
    onUpload = () => {},
    tempFile = null,
    renderActionForm,
    actionTitle = "Validación"
}: SupervisionDetailPanelProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (tempFile) {
            const url = URL.createObjectURL(tempFile);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl(null);
        }
    }, [tempFile]);

    const [previewEnabled, setPreviewEnabled] = useState(false);

    const currentAnnex = annexes[selectedIdx];

    return (
        <div className="flex h-full flex-1 flex-col overflow-hidden">
            {/* 1. Header del Alumno */}
            <div className="flex shrink-0 items-center justify-between border-stone-200/60 border-b bg-muted/20 p-4">
                <div className="flex items-center gap-3 overflow-hidden mr-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                        <User className="size-5" />
                    </div>
                    <div className="flex min-w-0 flex-col">
                        <h2 className="text-sm font-extrabold uppercase leading-none tracking-tight truncate">
                            {selectedItem.user?.person?.surnames}, {selectedItem.user?.person?.names}
                        </h2>
                        <div className="mt-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            <span>{selectedItem.section.school.name}</span>
                            <ChevronRight className="size-3" />
                            <span className="font-bold text-primary">{selectedItem.section.name}</span>
                            <ChevronRight className="size-3" />
                            <span className="font-bold">Módulo {selectedModuleId}</span>
                        </div>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="size-8 hover:bg-stone-200/50" onClick={onClose}>
                    <X className="size-4" />
                </Button>
            </div>

            <div className="flex-1 flex gap-6 mt-4 overflow-hidden relative pr-1">
                {isLoading ? (
                    <div className="flex flex-1 items-center justify-center animate-pulse text-muted-foreground font-medium">
                        Cargando información del estudiante...
                    </div>
                ) : (
                    <>
                        {/* 2. Cuerpo Central: Document Viewer */}
                        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border bg-card shadow-sm border-stone-200/60">
                            {/* Viewer Sub-Header */}
                            <div className="flex h-14 shrink-0 items-center justify-between border-b bg-stone-50/50 px-5">
                                <div className="flex items-center gap-3">
                                    <div className={`flex size-8 items-center justify-center rounded-md border ${tempFile || currentAnnex?.latest ? 'border-primary/20 bg-primary/10' : 'bg-muted/50'}`}>
                                        <FileText className={`size-4 ${tempFile || currentAnnex?.latest ? 'text-primary' : 'text-muted-foreground'}`} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold leading-none tracking-tight">
                                            {currentAnnex?.title || 'Seleccionar anexo'}
                                        </span>
                                        <span className="mt-1 text-[10px] text-muted-foreground font-medium uppercase">
                                            {tempFile ? 'Vista previa local' : currentAnnex?.latest ? 'Archivo cargado' : 'Sin archivo'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setPreviewEnabled((p) => !p)}
                                    className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground transition-colors hover:text-primary uppercase tracking-tighter"
                                >
                                    {previewEnabled ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    {previewEnabled ? 'Ocultar' : 'Previsualizar'}
                                </button>
                            </div>

                            <DocumentViewer
                                currentFile={tempFile ? { ...currentAnnex, latest: { path: previewUrl, name: tempFile.name } } : (currentAnnex ? { ...currentAnnex, latest: currentAnnex.latest } : { code: '', title: '', latest: null })}
                                canUpload={canUpload}
                                onUpload={onUpload}
                                previewEnabled={previewEnabled}
                            />
                        </div>

                        {/* 3. Panel Lateral: Lista y Tabs */}
                        <aside className="hidden md:flex w-64 shrink-0 flex-col gap-4 xl:w-72 overflow-hidden">
                            <RequirementsList
                                requirements={annexes}
                                selectedType={selectedIdx}
                                onSelectType={onSelectIdx}
                                previewEnabled={previewEnabled}
                                onTogglePreview={() => setPreviewEnabled(!previewEnabled)}
                            />

                            <div className="flex-1 flex flex-col rounded-xl border bg-card border-stone-200/60 overflow-hidden">
                                <Tabs defaultValue="action" className="flex flex-1 flex-col">
                                    <TabsList className="h-11 w-full gap-1 rounded-none border-b bg-stone-50/30 px-1">
                                        <TabsTrigger value="action" className="flex-1 rounded-md text-[10px] font-bold uppercase tracking-widest">
                                            {actionTitle}
                                        </TabsTrigger>
                                        <TabsTrigger value="history" className="flex-1 rounded-md text-[10px] font-bold uppercase tracking-widest">
                                            Historial {currentAnnex?.history?.length > 0 && `(${currentAnnex.history.length})`}
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="action" className="mt-0 flex-1 overflow-y-auto scrollbar-thin p-1">
                                        {currentAnnex && renderActionForm(currentAnnex)}
                                    </TabsContent>

                                    <TabsContent value="history" className="mt-0 flex-1 overflow-y-auto scrollbar-thin p-4">
                                        <FileHistory history={currentAnnex?.history ?? []} />
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </aside>
                    </>
                )}
            </div>
        </div>
    );
}
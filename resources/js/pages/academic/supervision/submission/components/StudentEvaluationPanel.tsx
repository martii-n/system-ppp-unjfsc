import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { FileText, Eye, EyeOff } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentViewer from "@/components/document/DocumentViewer";
import FileHistory from "@/components/document/FileHistory";
import RequirementsList from "@/components/academic/requirements-list";
import SubmitForm from "./SubmitForm";
import supervision from "@/routes/academic/supervision";

export interface AnnexRequirement {
    code: string;
    title: string;
    status: number;
    latest: {
        id: number;
        name: string;
        path: string;
        comment?: string;
    } | null;
    history: {
        id: number;
        approval_status: number;
        comment?: string;
        name?: string;
        created_at?: string;
    }[];
    evaluation_id?: number;
    grade?: number;
    supervision_id: number;
}

interface StudentEvaluationPanelProps {
    supervisionId: number;
}

export default function StudentEvaluationPanel({ supervisionId }: StudentEvaluationPanelProps) {
    const [annexes, setAnnexes] = useState<AnnexRequirement[]>([]);
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [previewEnabled, setPreviewEnabled] = useState(false);

    // Per-annex state
    const [isEditing, setIsEditing] = useState(false);
    const [tempFile, setTempFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const loadAnnexes = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(supervision.api.annexes.url(supervisionId));
            setAnnexes(res.data.annexes ?? []);
        } catch {
            toast.error("No se pudieron cargar los anexos.");
        } finally {
            setIsLoading(false);
        }
    }, [supervisionId]);

    // FUNCIÓN: Maneja la previsualización local antes de subir
    const onUpload = (file: File) => {
        setTempFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    useEffect(() => {
        loadAnnexes();
        setSelectedIdx(0);
    }, [supervisionId, loadAnnexes]);

    // Reset temporary states (editing and uploads) when switching between annexes
    useEffect(() => {
        setIsEditing(false);
        setTempFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    }, [selectedIdx, supervisionId]);

    const currentFile = annexes[selectedIdx];

    const onSubmissionSuccess = () => {
        setTempFile(null);
        setIsEditing(false);
        loadAnnexes();
    };

    const canUpload = !!currentFile && !tempFile && (!currentFile.latest || (isEditing && currentFile.status !== 4));
    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm italic">
                Cargando anexos...
            </div>
        );
    }

    if (annexes.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm italic">
                No se encontraron anexos para esta supervisión.
            </div>
        );
    }

    return (
        <div className="flex-1 flex gap-4 overflow-hidden min-h-0">

            {/* ── Center: Document Viewer ── */}
            <div className="flex-1 rounded-xl border bg-card overflow-hidden flex flex-col min-h-[480px]">
                {/* Viewer header */}
                <div className="flex items-center justify-between h-14 px-5 border-b bg-card shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`size-8 rounded-md border flex items-center justify-center ${tempFile || currentFile?.latest ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'}`}>
                            <FileText className={`size-4 ${tempFile || currentFile?.latest ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold leading-none">{currentFile?.title}</span>
                            <span className="text-[11px] text-muted-foreground mt-1">
                                {tempFile ? 'Archivo listo para enviar' : currentFile?.latest ? 'Archivo cargado' : 'Sin archivo'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setPreviewEnabled(p => !p)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {previewEnabled ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        <span className="hidden sm:block">{previewEnabled ? 'Desactivar' : 'Previsualizar'}</span>
                    </button>
                </div>

                <DocumentViewer
                    currentFile={{
                        ...currentFile,
                        latest: tempFile ? { ...tempFile, path: previewUrl, name: tempFile.name } : currentFile?.latest
                    }}
                    canUpload={canUpload}
                    onUpload={onUpload}
                    previewEnabled={previewEnabled}
                />
            </div>

            {/* ── Right column: Annex list + Tabs ── */}
            <aside className="w-64 xl:w-72 flex flex-col gap-4 shrink-0">
                <RequirementsList
                    requirements={annexes}
                    selectedType={selectedIdx}
                    onSelectType={setSelectedIdx}
                    previewEnabled={previewEnabled}
                    onTogglePreview={() => setPreviewEnabled(!previewEnabled)}
                />

                {/* Tabs: Submission / History */}
                <div className="rounded-xl border bg-card flex flex-col overflow-hidden1">
                    <Tabs defaultValue="submission" className="flex flex-col flex-1">
                        <TabsList className="w-full rounded-none border-b border-t-0 border-x-0 bg-transparent h-11 px-1 gap-1">
                            <TabsTrigger
                                value="submission"
                                className="flex-1 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none rounded-md"
                            >
                                Envío
                            </TabsTrigger>
                            <TabsTrigger
                                value="history"
                                className="flex-1 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none rounded-md"
                            >
                                Historial {currentFile?.history?.length > 0 && `(${currentFile.history.length})`}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="submission" className="flex-1 p-4 overflow-y-auto outline-none mt-0">
                            {currentFile && (
                                <SubmitForm
                                    annex={currentFile}
                                    tempFile={tempFile}
                                    isEditing={isEditing}
                                    onSetEditing={setIsEditing}
                                    onRemoveTemp={() => setTempFile(null)}
                                    onSuccess={onSubmissionSuccess}
                                />
                            )}
                        </TabsContent>

                        <TabsContent value="history" className="flex-1 p-4 overflow-y-auto outline-none mt-0">
                            <FileHistory history={currentFile?.history ?? []} />
                        </TabsContent>
                    </Tabs>
                </div>
            </aside>
        </div>
    );
}

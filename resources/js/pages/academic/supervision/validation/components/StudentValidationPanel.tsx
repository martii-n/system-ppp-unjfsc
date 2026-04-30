import axios from 'axios';
import { FileText, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import RequirementsList from '@/components/academic/requirements-list';
import DocumentViewer from '@/components/document/DocumentViewer';
import FileHistory from '@/components/document/FileHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import supervision from '@/routes/academic/supervision';
import ValidationForm from './ValidationForm';

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
    history: any[];
    evaluation_id?: number;
    grade?: number;
    supervision_id: number;
}

interface StudentValidationPanelProps {
    supervisionId: number;
    onSuccess?: () => void;
}

export default function StudentValidationPanel({
    supervisionId,
    onSuccess,
}: StudentValidationPanelProps) {
    const [annexes, setAnnexes] = useState<AnnexRequirement[]>([]);
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [previewEnabled, setPreviewEnabled] = useState(false); // Default previews to true for validation

    const loadAnnexes = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(
                supervision.api.annexes.url(supervisionId),
            );
            setAnnexes(res.data.annexes ?? []);
        } catch {
            toast.error('No se pudieron cargar los anexos.');
        } finally {
            setIsLoading(false);
        }
    }, [supervisionId]);

    useEffect(() => {
        loadAnnexes();
        setSelectedIdx(0);
    }, [supervisionId, loadAnnexes]);

    const currentAnnex = annexes[selectedIdx];

    if (isLoading)
        return (
            <div className="flex flex-1 animate-pulse items-center justify-center font-medium text-muted-foreground">
                Cargando anexos...
            </div>
        );
    if (annexes.length === 0)
        return (
            <div className="flex flex-1 items-center justify-center font-medium text-muted-foreground italic">
                No se encontraron anexos para esta supervisión.
            </div>
        );

    return (
        <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
            {/* ── Center: Document Viewer ── */}
            <div className="flex min-h-120 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
                {/* Viewer header */}
                <div className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-5">
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex size-8 items-center justify-center rounded-md border ${currentAnnex?.latest ? 'border-primary/20 bg-primary/5' : 'bg-muted/50'}`}
                        >
                            <FileText
                                className={`size-4 ${currentAnnex?.latest ? 'text-primary' : 'text-muted-foreground'}`}
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm leading-none font-semibold">
                                {currentAnnex?.title}
                            </span>
                            <span className="mt-1 text-[11px] text-muted-foreground">
                                {currentAnnex?.latest
                                    ? 'Archivo cargado'
                                    : 'Sin archivo'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setPreviewEnabled((p) => !p)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                        {previewEnabled ? (
                            <EyeOff className="size-4" />
                        ) : (
                            <Eye className="size-4" />
                        )}
                        <span className="hidden sm:block">
                            {previewEnabled ? 'Desactivar' : 'Previsualizar'}
                        </span>
                    </button>
                </div>

                <DocumentViewer
                    currentFile={
                        currentAnnex
                            ? {
                                  ...currentAnnex,
                                  title: currentAnnex.title,
                                  latest: currentAnnex.latest,
                              }
                            : { code: '', title: '', latest: null }
                    }
                    canUpload={false}
                    onUpload={() => {}}
                    previewEnabled={previewEnabled}
                />
            </div>

            {/* ── Right: List & Tabs ── */}
            <aside className="flex w-64 shrink-0 flex-col gap-4 xl:w-72">
                <RequirementsList
                    requirements={annexes}
                    selectedType={selectedIdx}
                    onSelectType={setSelectedIdx}
                    previewEnabled={previewEnabled}
                    onTogglePreview={() => setPreviewEnabled(!previewEnabled)}
                />

                <div className="overflow-hidden1 flex flex-col rounded-xl border bg-card">
                    <Tabs
                        defaultValue="validation"
                        className="flex flex-1 flex-col"
                    >
                        <TabsList className="h-11 w-full gap-1 rounded-none border-x-0 border-t-0 border-b bg-transparent px-1">
                            <TabsTrigger
                                value="validation"
                                className="flex-1 rounded-md text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
                            >
                                Envío
                            </TabsTrigger>
                            <TabsTrigger
                                value="history"
                                className="flex-1 rounded-md text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
                            >
                                Historial{' '}
                                {currentAnnex?.history?.length > 0 &&
                                    `(${currentAnnex.history.length})`}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="validation"
                            className="scrollbar-thin mt-0 flex-1 overflow-y-auto p-5"
                        >
                            {currentAnnex && (
                                <ValidationForm
                                    annex={currentAnnex}
                                    onSuccess={() => {
                                        loadAnnexes();
                                        if (onSuccess) onSuccess();
                                    }}
                                />
                            )}
                        </TabsContent>

                        <TabsContent
                            value="history"
                            className="scrollbar-thin mt-0 flex-1 overflow-y-auto p-5"
                        >
                            <FileHistory
                                history={currentAnnex?.history ?? []}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </aside>
        </div>
    );
}

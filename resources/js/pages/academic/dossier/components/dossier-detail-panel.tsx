import { Building2, Eye, EyeOff, FileText, User, X } from "lucide-react";
import { TabsDossier } from "../validation/tabs-dossier";
import RequirementsList from "@/components/academic/requirements-list";
import FilePreview from "@/components/document/FilePreview";
import { Button } from "@/components/ui/button";

interface DossierDetailPanelProps {
    selectedItem: any;
    detail: any;
    selectedType: number;
    setSelectedType: (val: number) => void;
    previewEnabled: boolean;
    setPreviewEnabled: (val: boolean | ((prev: boolean) => boolean)) => void;
    handleCloseSelected: () => void;
    handleSaveValidation: (status: number, message: string) => void;
    isSavingValidation: boolean;
}

export default function DossierDetailPanel({
    selectedItem,
    detail,
    selectedType,
    setSelectedType,
    previewEnabled,
    setPreviewEnabled,
    handleCloseSelected,
    handleSaveValidation,
    isSavingValidation,
}: DossierDetailPanelProps) {
    if (!selectedItem) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-semibold">Sin selección</h3>
                    <p className="text-muted-foreground">
                        Selecciona un expediente para ver los detalles.
                    </p>
                </div>
            </div>
        );
    }
    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            {/* Aqui el header Nombres / Escuela / Seccion*/}
            <div className="flex shrink-0 items-center justify-between border-b bg-muted/20 p-4">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                        <User className="size-5" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-base leading-none font-bold tracking-tight uppercase">
                            {
                                selectedItem?.user?.person
                                    ?.surnames
                            }
                            ,{' '}
                            {
                                selectedItem?.user?.person
                                    ?.names
                            }
                        </h2>
                        <span className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Building2 className="size-3" />{' '}
                            {
                                selectedItem?.section
                                    ?.school?.name
                            }{' '}
                            • {selectedItem?.section?.name}
                        </span>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCloseSelected}
                >
                    <X className="size-4" />
                </Button>
            </div>
            {/* --- CONTENEDOR 2 COLUMNAS (Viewer + Sidebar) --- */}
            <div className="mt-6 flex flex-1 flex-col gap-5 overflow-hidden xl:flex-row">
                {/* COLUMNA 1: VISOR DEL DOCUMENTO */}
                <div className="relative flex min-h-100 flex-1 flex-col overflow-hidden rounded-md border bg-card shadow-sm">
                    <div className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-5">
                        <div className="flex items-center gap-3">
                            <div
                                className={`flex size-8 items-center justify-center rounded-md border ${selectedItem?.requirements?.[selectedType]?.latest ? 'border-primary/20 bg-primary/5' : 'bg-muted/50'}`}
                            >
                                <FileText
                                    className={`size-4 ${detail?.requirements?.[selectedType]?.latest ? 'text-primary' : 'text-muted-foreground'}`}
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm leading-none font-semibold">
                                    {
                                        detail
                                            ?.requirements?.[
                                            selectedType
                                        ]?.title
                                    }
                                </span>
                                <span className="mt-1 text-[11px] text-muted-foreground">
                                    {detail
                                        ?.requirements?.[
                                        selectedType
                                    ]?.latest
                                        ? 'Archivo cargado'
                                        : 'Sin archivo'}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() =>
                                setPreviewEnabled((p) => !p)
                            }
                            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {previewEnabled ? (
                                <EyeOff className="size-4" />
                            ) : (
                                <Eye className="size-4" />
                            )}
                            <span className="hidden sm:block">
                                {previewEnabled
                                    ? 'Desactivar'
                                    : 'Previsualizar'}
                            </span>
                        </button>
                    </div>
                    <FilePreview
                        path={
                            detail?.requirements?.[
                                selectedType
                            ]?.latest?.path
                        }
                        name={
                            detail?.requirements?.[
                                selectedType
                            ]?.title || 'Documento adjunto'
                        }
                        previewEnabled={previewEnabled}
                    />
                </div>

                {/* COLUMNA 2: PANEL DE CONTROL */}
                <div className="flex h-full w-full shrink-0 flex-col gap-6 overflow-hidden text-foreground not-italic lg:w-64 xl:w-72">
                    {/* Arriba: Lista de Requisitos (Componente Reutilizable) */}

                    <RequirementsList
                        requirements={
                            detail?.requirements ||
                            []
                        }
                        selectedType={selectedType}
                        onSelectType={setSelectedType}
                        previewEnabled={previewEnabled}
                        onTogglePreview={() =>
                            setPreviewEnabled(
                                !previewEnabled,
                            )
                        }
                    />
                    <TabsDossier
                        requirement={
                            detail?.requirements?.[
                            selectedType
                            ]
                        }
                        onSaveValidation={
                            handleSaveValidation
                        }
                        isSaving={isSavingValidation}
                    />
                </div>
            </div>
        </div>
    );
}
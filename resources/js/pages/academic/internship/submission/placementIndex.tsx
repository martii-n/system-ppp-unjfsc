import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";
import { BreadcrumbItem } from "@/types";
import Heading from "@/components/heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TYPE_LABELS, TypeSelector } from "../components/type-selector";
import { AlertHelp } from "@/components/document/AlertHelp";
import RequirementsList from "@/components/academic/requirements-list";
import { usePlacementSubmission } from "../hooks/use-placement-submission";
import CompanyForm from "./components/company-form";
import DocumentForm from "./components/document-form";
import ContentDetailsDocument from "@/components/document/content-details-document";
import { Building2, Loader2, Save } from "lucide-react";

interface PlacementProps {
    data: {
        placement: any | null;
        requirements: any[];
        isApproved: boolean;
    };
    title: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Prácticas Pre-Profesionales', href: '/internship' },
];

function getContextLabel(activeContext: 'empresa' | number, requirements: any[]): string {
    if (activeContext === 'empresa') return 'Información de Empresa';
    const req = requirements[activeContext];
    return req?.title ?? '—';
}

export default function PlacementIndex({ data }: PlacementProps) {
    const {
        type, origin, setType, setOrigin, hasPlacement,
        activeContext, activeRequirement,
        setActiveContext,
        tempFile, setTempFile,
        previewUrl,
        isEditing, setIsEditing,
        canUploadDocument, onUploadTempFile,
        previewEnabled, setPreviewEnabled,
        handleSaveDocument,
        loading,
    } = usePlacementSubmission({
        placement: data.placement,
        requirements: data.requirements,
    });


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Formalización de Prácticas" />

            <div className="flex flex-col flex-1 min-h-screen p-4 md:p-6 lg:p-8 gap-6">

                {/* Header */}
                <div className="flex items-end justify-between">
                    <Heading
                        variant="small"
                        title="Formalización de Prácticas"
                        description="Registre su empresa y suba los documentos para iniciar sus prácticas."
                    />
                </div>

                {/* Layout de 3 columnas */}
                <div className="flex-1 flex gap-6 overflow-hidden relative">

                    {/* COL 1: Selector de Tipo ──────────────── */}
                    <aside className="w-full lg:w-64 xl:w-72 shrink-0 flex flex-col gap-4 overflow-hidden">
                        <div className="flex-1 overflow-y-auto">
                            <TypeSelector
                                type={type}
                                setType={setType}
                                origin={origin}
                                setOrigin={setOrigin}
                                disabled={hasPlacement}
                            />
                        </div>
                        <div className="flex-1 shrink-0">
                            <AlertHelp />
                        </div>
                    </aside>

                    {/* COL 2: Panel Central (cambia según selección) ──── */}
                    <main className="flex-1 flex flex-col min-w-0 rounded-md border bg-card overflow-hidden">

                        {/* Sub-header: tipo seleccionado + contexto activo */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/20 shrink-0 flex-wrap">
                            <Badge className="text-[10px] bg-blue-500 text-white border-none">
                                Formalización
                            </Badge>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                                {TYPE_LABELS[type] ?? '—'}
                            </span>
                            {type === 'development' && origin && (
                                <>
                                    <span className="text-muted-foreground/40 text-xs">→</span>
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                                        {TYPE_LABELS[origin] ?? '—'}
                                    </span>
                                </>
                            )}
                            {/* Separador + contexto del panel central */}
                            <span className="text-muted-foreground/30 text-xs mx-1">|</span>
                            <span className="text-[10px] font-bold text-foreground/70 uppercase tracking-tighter">
                                {getContextLabel(activeContext, data.requirements)}
                            </span>
                        </div>

                        {/* Contenido central reactivo */}
                        <div className="flex-1 flex flex-col items-stretch justify-start">
                            {activeContext === 'empresa' ? (
                                <CompanyForm
                                    placement={data.placement}
                                    type={type}
                                    origin={origin}
                                />
                            ) : activeRequirement ? (
                                <DocumentForm
                                    placementId={data.placement?.id}
                                    requirement={activeRequirement}
                                    tempFile={tempFile}
                                    previewUrl={previewUrl}
                                    canUpload={canUploadDocument}
                                    onUpload={onUploadTempFile}
                                    previewEnabled={previewEnabled}
                                    isEditing={isEditing}
                                    setIsEditing={setIsEditing}
                                    onClearTemp={() => {
                                        setTempFile(null);
                                        if (previewUrl) URL.revokeObjectURL(previewUrl);
                                    }}
                                />
                            ) : null}
                        </div>
                    </main>

                    {/* COL 3: Panel Derecho (Empresa + Requerimientos + Tabs) ── */}
                    <aside className="h-full w-full lg:w-64 xl:w-72 shrink-0 flex flex-col gap-4 overflow-y-auto">

                        {/* Botón de Empresa (misma lógica de selección que requirements) */}
                        <div className="rounded-xl border bg-card text-card-foreground overflow-hidden">
                            <div className="px-4 py-3 border-b">
                                <h3 className="font-semibold text-sm leading-none">Empresa</h3>
                                <p className="text-xs text-muted-foreground mt-1">Información del lugar de práctica</p>
                            </div>
                            <div className="px-3 py-2">
                                <Button
                                    variant={activeContext === 'empresa' ? 'default' : 'ghost'}
                                    className="w-full flex items-center justify-between"
                                    onClick={() => setActiveContext('empresa')}
                                >
                                    <div className="flex items-center gap-2 text-xs">
                                        <Building2 className="size-4" />
                                        Empresa / Jefe Directo
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className={`ml-2 text-[9px] ${hasPlacement ? 'bg-amber-100 text-amber-700' : ''}`}
                                    >
                                        {hasPlacement ? 'Pendiente' : 'Sin registro'}
                                    </Badge>
                                </Button>
                            </div>
                        </div>

                        {/* Lista de Requerimientos */}
                        <RequirementsList
                            requirements={data.requirements ?? []}
                            selectedType={typeof activeContext === 'number' ? activeContext : -1}
                            onSelectType={(idx) => setActiveContext(idx)}
                            previewEnabled={previewEnabled}
                            onTogglePreview={() => setPreviewEnabled(!previewEnabled)}
                        />

                        {/* Tabs de Dictamen / Historial */}
                        <Tabs defaultValue="validation" className="flex flex-col border rounded-md">
                            <TabsList className="w-full rounded-none border-b h-10 px-1 gap-1">
                                <TabsTrigger
                                    value="validation"
                                    className="flex-1 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none rounded-md"
                                >
                                    Dictamen
                                </TabsTrigger>
                                <TabsTrigger
                                    value="history"
                                    className="flex-1 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none rounded-md"
                                >
                                    Historial
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="validation" className="p-4 mt-0 text-center text-sm text-muted-foreground">
                                {activeContext === 'empresa' ? (
                                    <Button
                                        type="submit"
                                        form="form-company"
                                        size="sm"
                                        className="h-9 gap-2 shadow-sm uppercase font-bold text-xs"
                                        disabled={loading || (data.placement && data.placement.approval_status === 1)}
                                    >
                                        {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                                        {loading ? "Guardando..." : data.placement ? "Guardar Cambios" : "Registrar Empresa"}
                                    </Button>
                                ) : activeRequirement ? (
                                    <ContentDetailsDocument
                                        currentFile={activeRequirement}
                                        tempFile={tempFile}
                                        isEditing={isEditing}
                                        onSetEditing={setIsEditing}
                                        onRemoveTemp={setTempFile}
                                        onSave={handleSaveDocument}
                                    />
                                ) : null}
                            </TabsContent>
                            <TabsContent value="history" className="p-4 mt-0 h-[200px] overflow-y-auto text-sm text-muted-foreground italic">
                                Aquí va el historial
                            </TabsContent>
                        </Tabs>
                    </aside>
                </div>
            </div>
        </AppLayout>
    );
}

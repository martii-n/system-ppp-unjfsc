import { useState } from "react";
import { Building2, Briefcase, User, Calendar, FileText, EyeOff, Eye, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RequirementsList from "@/components/academic/requirements-list";
import FilePreview from "@/components/document/FilePreview";
import FileHistory from "@/components/document/FileHistory";
import { History } from "lucide-react";

export function InfoItem({ label, value, span = 1 }: { label: string, value?: string, span?: number }) {
    return (
        <div className={`flex flex-col gap-1 ${span === 2 ? 'col-span-2' : ''}`}>
            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{label}</span>
            <span className="text-sm font-medium border-b border-dashed border-muted pb-1">{value || 'No proporcionado'}</span>
        </div>
    );
}

export default function PlacementValidation({
    detailData,
    loadDetail,
    previewEnabled,
    setPreviewEnabled,
    currentRequirement,
    selectedReqIndex,
    setSelectedReqIndex,
    activeContext,
    setActiveContext,
    ValidationForm
}: any) {
    return (
        <div className="flex-1 flex overflow-hidden">
            {/* Lado Izquierdo: Información y Visor */}
            <div className="flex-1 flex flex-col border-r min-w-0">
                {/* Main Display Area (Details Table or PDF) */}
                <div className="flex-1 flex flex-col overflow-hidden relative">
                    {activeContext === 'data' ? (
                        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
                            <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-300">
                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 text-primary border-b pb-2">
                                        <Building2 className="size-5" />
                                        <h3 className="font-bold uppercase tracking-tight text-sm">Información de la Empresa</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 px-2">
                                        <InfoItem label="Nombre / Razón Social" value={detailData?.placement?.company?.name} />
                                        <InfoItem label="RUC" value={detailData?.placement?.company?.ruc} />
                                        <InfoItem label="Dirección" value={detailData?.placement?.company?.address} span={2} />
                                        <InfoItem label="Correo Corporativo" value={detailData?.placement?.company?.email} />
                                        <InfoItem label="Teléfono de Contacto" value={detailData?.placement?.company?.phone} />
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 text-primary border-b pb-2">
                                        <User className="size-5" />
                                        <h3 className="font-bold uppercase tracking-tight text-sm">Responsable / Jefe Directo</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 px-2">
                                        <InfoItem label="Nombre Completo" value={detailData?.placement?.boss_name} />
                                        <InfoItem label="Cargo / Posición" value={detailData?.placement?.boss_position} />
                                        <InfoItem label="Correo Electrónico" value={detailData?.placement?.boss_email} />
                                        <InfoItem label="Teléfono / Celular" value={detailData?.placement?.boss_phone} />
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 text-primary border-b pb-2">
                                        <Calendar className="size-5" />
                                        <h3 className="font-bold uppercase tracking-tight text-sm">Detalles Horarios y Áreas</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 px-2">
                                        <InfoItem label="Área de Desempeño" value={detailData?.placement?.area_name || "General"} />
                                        <InfoItem label="Puesto del Practicante" value={detailData?.placement?.position} />
                                        <InfoItem label="Fecha de Inicio" value={detailData?.placement?.start_date} />
                                        <InfoItem label="Fecha de Término" value={detailData?.placement?.end_date} />
                                        <InfoItem label="Descripción Curricular" value={detailData?.placement?.description} span={2} />
                                    </div>
                                </section>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="h-10 border-b bg-muted/30 flex items-center px-4 shrink-0 justify-between">
                                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                                    <FileText className="size-4" />
                                    <span>{currentRequirement?.title || "Seleccione un documento"}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setPreviewEnabled(!previewEnabled)} className="text-[10px] flex items-center gap-1 hover:text-primary underline">
                                        {previewEnabled ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                                        {previewEnabled ? "Ocultar" : "Mostrar"}
                                    </button>
                                    <Badge variant="outline" className="text-[10px] bg-background">OBLIGATORIO</Badge>
                                </div>
                            </div>
                            <FilePreview
                                path={currentRequirement?.latest?.path}
                                name={currentRequirement?.title || "Documento adjunto"}
                                previewEnabled={previewEnabled}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Lado Derecho: Sidebar de Gestión */}
            <aside className="w-80 xl:w-85 shrink-0 flex flex-col bg-background h-full overflow-hidden border-l">
                <div className="p-4 flex-1 flex flex-col gap-5 overflow-y-auto scrollbar-thin">
                    <button
                        onClick={() => setActiveContext('data')}
                        className={`p-4 rounded-xl border-2 transition-all text-left flex gap-4 ${activeContext === 'data' ? 'border-primary bg-primary/5 ring-3 ring-primary/10 shadow-sm' : 'border-muted hover:border-muted-foreground/30'}`}
                    >
                        <div className={`size-10 rounded-lg flex items-center justify-center shrink-0`}>
                            <Building2 className="size-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className={`font-bold text-xs uppercase tracking-wider ${activeContext === 'data' ? 'text-primary' : 'text-muted-foreground'}`}>
                                Datos de Formalización
                            </h3>
                            <p className="font-bold text-sm truncate mt-1">{detailData?.placement?.company?.name || 'Cargando...'}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className={`text-[9px] font-bold ${detailData?.placement?.approval_status === 1 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {detailData?.placement?.approval_status === 1 ? 'DATOS VALIDADOS' : 'PENDIENTE DATOS'}
                                </Badge>
                            </div>
                        </div>
                    </button>
                    <RequirementsList
                        requirements={detailData?.requirements || []}
                        selectedType={activeContext === 'document' ? selectedReqIndex : -1}
                        onSelectType={(idx) => {
                            setSelectedReqIndex(idx);
                            setActiveContext('document');
                        }}
                        previewEnabled={previewEnabled}
                        onTogglePreview={() => setPreviewEnabled(!previewEnabled)}
                    />

                    <div className="rounded-xl border shadow-sm flex flex-col overflow-hidden">
                        <Tabs defaultValue="validation" className="flex flex-col">
                            <TabsList className="w-full rounded-none border-b h-10 px-1 gap-1">
                                <TabsTrigger value="validation" className="flex-1 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none rounded-md">Dictamen</TabsTrigger>
                                <TabsTrigger value="history" className="flex-1 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none rounded-md">Historial</TabsTrigger>
                            </TabsList>

                            <TabsContent value="validation" className="p-4 pt-4 mt-0">
                                {activeContext === 'data' ? (
                                    <ValidationForm
                                        type="data"
                                        status={detailData?.placement?.approval_status}
                                        onSuccess={loadDetail}
                                        placementId={detailData?.placement?.id}
                                    />
                                ) : (
                                    <ValidationForm
                                        type="document"
                                        requirement={currentRequirement}
                                        onSuccess={loadDetail}
                                        placementId={detailData?.placement?.id}
                                    />
                                )}
                            </TabsContent>

                            <TabsContent value="history" className="p-4 mt-0 h-[300px] overflow-y-auto scrollbar-thin">
                                {activeContext === 'data' ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-center italic">
                                        <History className="size-8 opacity-20 mb-2" />
                                        <p className="text-xs">No hay historial para los datos textuales</p>
                                    </div>
                                ) : (
                                    <FileHistory history={currentRequirement?.history || []} />
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Botón de Finalización General */}
                    {detailData?.placement?.approval_status === 1 && detailData?.requirements?.every((r: any) => r.status === 1) && (
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200">
                            <CheckCircle2 className="size-4 mr-2" /> FINALIZAR FORMALIZACIÓN
                        </Button>
                    )}
                </div>
            </aside>
        </div>
    );
}

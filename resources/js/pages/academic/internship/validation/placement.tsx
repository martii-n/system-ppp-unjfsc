import { useState } from 'react';
import {
    Building2,
    Briefcase,
    User,
    Calendar,
    FileText,
    EyeOff,
    Eye,
    CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RequirementsList from '@/components/academic/requirements-list';
import FilePreview from '@/components/document/FilePreview';
import FileHistory from '@/components/document/FileHistory';
import { History } from 'lucide-react';

export function InfoItem({
    label,
    value,
    span = 1,
}: {
    label: string;
    value?: string;
    span?: number;
}) {
    return (
        <div
            className={`flex flex-col gap-1 ${span === 2 ? 'col-span-2' : ''}`}
        >
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                {label}
            </span>
            <span className="border-b border-dashed border-muted pb-1 text-sm font-medium">
                {value || 'No proporcionado'}
            </span>
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
    ValidationForm,
}: any) {
    return (
        <div className="flex flex-1 overflow-hidden">
            {/* Lado Izquierdo: Información y Visor */}
            <div className="flex min-w-0 flex-1 flex-col border-r">
                {/* Main Display Area (Details Table or PDF) */}
                <div className="relative flex flex-1 flex-col overflow-hidden">
                    {activeContext === 'data' ? (
                        <div className="scrollbar-thin flex-1 overflow-y-auto p-8">
                            <div className="mx-auto max-w-3xl animate-in space-y-10 duration-300 zoom-in-95 fade-in">
                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 border-b pb-2 text-primary">
                                        <Building2 className="size-5" />
                                        <h3 className="text-sm font-bold tracking-tight uppercase">
                                            Información de la Empresa
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 px-2">
                                        <InfoItem
                                            label="Nombre / Razón Social"
                                            value={
                                                detailData?.placement?.company
                                                    ?.name
                                            }
                                        />
                                        <InfoItem
                                            label="RUC"
                                            value={
                                                detailData?.placement?.company
                                                    ?.ruc
                                            }
                                        />
                                        <InfoItem
                                            label="Dirección"
                                            value={
                                                detailData?.placement?.company
                                                    ?.address
                                            }
                                            span={2}
                                        />
                                        <InfoItem
                                            label="Correo Corporativo"
                                            value={
                                                detailData?.placement?.company
                                                    ?.email
                                            }
                                        />
                                        <InfoItem
                                            label="Teléfono de Contacto"
                                            value={
                                                detailData?.placement?.company
                                                    ?.phone
                                            }
                                        />
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 border-b pb-2 text-primary">
                                        <User className="size-5" />
                                        <h3 className="text-sm font-bold tracking-tight uppercase">
                                            Responsable / Jefe Directo
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 px-2">
                                        <InfoItem
                                            label="Nombre Completo"
                                            value={
                                                detailData?.placement?.boss_name
                                            }
                                        />
                                        <InfoItem
                                            label="Cargo / Posición"
                                            value={
                                                detailData?.placement
                                                    ?.boss_position
                                            }
                                        />
                                        <InfoItem
                                            label="Correo Electrónico"
                                            value={
                                                detailData?.placement
                                                    ?.boss_email
                                            }
                                        />
                                        <InfoItem
                                            label="Teléfono / Celular"
                                            value={
                                                detailData?.placement
                                                    ?.boss_phone
                                            }
                                        />
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 border-b pb-2 text-primary">
                                        <Calendar className="size-5" />
                                        <h3 className="text-sm font-bold tracking-tight uppercase">
                                            Detalles Horarios y Áreas
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 px-2">
                                        <InfoItem
                                            label="Área de Desempeño"
                                            value={
                                                detailData?.placement
                                                    ?.area_name || 'General'
                                            }
                                        />
                                        <InfoItem
                                            label="Puesto del Practicante"
                                            value={
                                                detailData?.placement?.position
                                            }
                                        />
                                        <InfoItem
                                            label="Fecha de Inicio"
                                            value={
                                                detailData?.placement
                                                    ?.start_date
                                            }
                                        />
                                        <InfoItem
                                            label="Fecha de Término"
                                            value={
                                                detailData?.placement?.end_date
                                            }
                                        />
                                        <InfoItem
                                            label="Descripción Curricular"
                                            value={
                                                detailData?.placement
                                                    ?.description
                                            }
                                            span={2}
                                        />
                                    </div>
                                </section>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex h-10 shrink-0 items-center justify-between border-b bg-muted/30 px-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                                    <FileText className="size-4" />
                                    <span>
                                        {currentRequirement?.title ||
                                            'Seleccione un documento'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() =>
                                            setPreviewEnabled(!previewEnabled)
                                        }
                                        className="flex items-center gap-1 text-[10px] underline hover:text-primary"
                                    >
                                        {previewEnabled ? (
                                            <EyeOff className="size-3" />
                                        ) : (
                                            <Eye className="size-3" />
                                        )}
                                        {previewEnabled ? 'Ocultar' : 'Mostrar'}
                                    </button>
                                    <Badge
                                        variant="outline"
                                        className="bg-background text-[10px]"
                                    >
                                        OBLIGATORIO
                                    </Badge>
                                </div>
                            </div>
                            <FilePreview
                                path={currentRequirement?.latest?.path}
                                name={
                                    currentRequirement?.title ||
                                    'Documento adjunto'
                                }
                                previewEnabled={previewEnabled}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Lado Derecho: Sidebar de Gestión */}
            <aside className="flex h-full w-80 shrink-0 flex-col overflow-hidden border-l bg-background xl:w-85">
                <div className="scrollbar-thin flex flex-1 flex-col gap-5 overflow-y-auto p-4">
                    <button
                        onClick={() => setActiveContext('data')}
                        className={`flex gap-4 rounded-xl border-2 p-4 text-left transition-all ${activeContext === 'data' ? 'border-primary bg-primary/5 shadow-sm ring-3 ring-primary/10' : 'border-muted hover:border-muted-foreground/30'}`}
                    >
                        <div
                            className={`flex size-10 shrink-0 items-center justify-center rounded-lg`}
                        >
                            <Building2 className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3
                                className={`text-xs font-bold tracking-wider uppercase ${activeContext === 'data' ? 'text-primary' : 'text-muted-foreground'}`}
                            >
                                Datos de Formalización
                            </h3>
                            <p className="mt-1 truncate text-sm font-bold">
                                {detailData?.placement?.company?.name ||
                                    'Cargando...'}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className={`text-[9px] font-bold ${detailData?.placement?.approval_status === 1 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}
                                >
                                    {detailData?.placement?.approval_status ===
                                    1
                                        ? 'DATOS VALIDADOS'
                                        : 'PENDIENTE DATOS'}
                                </Badge>
                            </div>
                        </div>
                    </button>
                    <RequirementsList
                        requirements={detailData?.requirements || []}
                        selectedType={
                            activeContext === 'document' ? selectedReqIndex : -1
                        }
                        onSelectType={(idx) => {
                            setSelectedReqIndex(idx);
                            setActiveContext('document');
                        }}
                        previewEnabled={previewEnabled}
                        onTogglePreview={() =>
                            setPreviewEnabled(!previewEnabled)
                        }
                    />

                    <div className="flex flex-col overflow-hidden rounded-xl border shadow-sm">
                        <Tabs
                            defaultValue="validation"
                            className="flex flex-col"
                        >
                            <TabsList className="h-10 w-full gap-1 rounded-none border-b px-1">
                                <TabsTrigger
                                    value="validation"
                                    className="flex-1 rounded-md text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
                                >
                                    Dictamen
                                </TabsTrigger>
                                <TabsTrigger
                                    value="history"
                                    className="flex-1 rounded-md text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
                                >
                                    Historial
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent
                                value="validation"
                                className="mt-0 p-4 pt-4"
                            >
                                {activeContext === 'data' ? (
                                    <ValidationForm
                                        type="data"
                                        status={
                                            detailData?.placement
                                                ?.approval_status
                                        }
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

                            <TabsContent
                                value="history"
                                className="scrollbar-thin mt-0 h-75 overflow-y-auto p-4"
                            >
                                {activeContext === 'data' ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground italic">
                                        <History className="mb-2 size-8 opacity-20" />
                                        <p className="text-xs">
                                            No hay historial para los datos
                                            textuales
                                        </p>
                                    </div>
                                ) : (
                                    <FileHistory
                                        history={
                                            currentRequirement?.history || []
                                        }
                                    />
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Botón de Finalización General */}
                    {detailData?.placement?.approval_status === 1 &&
                        detailData?.requirements?.every(
                            (r: any) => r.status === 1,
                        ) && (
                            <Button className="w-full bg-indigo-600 font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700">
                                <CheckCircle2 className="mr-2 size-4" />{' '}
                                FINALIZAR FORMALIZACIÓN
                            </Button>
                        )}
                </div>
            </aside>
        </div>
    );
}

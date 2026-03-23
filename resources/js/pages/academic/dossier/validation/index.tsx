import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";
import { useEffect, useState } from "react";
import axios from 'axios';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Search, X, User, ChevronRight, FileText,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import Heading from "@/components/heading";
import { Input } from "@/components/ui/input";
import dossiers from "@/routes/dossiers";
import { toast } from "sonner";
import RequirementsList from "@/components/dossier/requirements-list";
import { TabsDossier } from "@/pages/academic/dossier/components/tabs-dossier";
import FilePreview from "@/pages/academic/dossier/submission/components/FilePreview";

// --- Props (Asumiendo que vienen de Laravel) ---
interface Props {
    assignments: any[];
    title: string;
}

export default function DossierValidationIndex({ assignments, title }: Props) {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [search, setSearch] = useState("");

    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [dossierDetail, setDossierDetail] = useState<any>(null);
    const [selectedType, setSelectedType] = useState(0);
    const [previewEnabled, setPreviewEnabled] = useState(false);
    const [isSavingValidation, setIsSavingValidation] = useState(false);
    // Buscamos el objeto seleccionado
    const selectedAssignment = assignments.find(a => a.id === selectedId);

    useEffect(() => {
        if (selectedId) {
            setIsLoadingDetail(true);
            axios.get(dossiers.api.validations.url(selectedId))
                .then(response => {
                    setDossierDetail(response.data);
                })
                .catch(error => {
                    console.error(error);
                })
                .finally(() => {
                    setIsLoadingDetail(false);
                });
        }
    }, [selectedId]);

    const handleSaveValidation = (status: number, message: string) => {
        const currentReq = dossierDetail?.requirements?.[selectedType];
        if (!currentReq?.latest) {
            toast.error("No hay documento adjunto para evaluar.");
            return;
        }

        const data = {
            approval_status: status,
            comment: message
        };

        setIsSavingValidation(true);

        const url = dossiers.document.status.url(currentReq.latest.id);

        axios.patch(url, data)
            .then(response => {
                toast.success(response.data.message || "Estado actualizado correctamente.");

                // Refrescar silenciosamente los datos actuales del dossier
                axios.get(dossiers.api.validations.url(selectedId!))
                    .then(res => setDossierDetail(res.data));
            })
            .catch(error => {
                console.error(error);
                toast.error(error.response?.data?.message || "Ocurrió un error al actualizar el estado.");
            })
            .finally(() => {
                setIsSavingValidation(false);
            });
    };

    const breadcrumbs = [
        { title: "Dashboard", href: "/dashboard" },
        { title: title, href: "#" }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Validación" />

            <div className="flex flex-col flex-1 min-h-screen p-4 md:p-6 lg:p-8 gap-6">

                {/* 1. HEADER INTEGRADO */}
                <div className="flex items-end justify-between">
                    <Heading
                        variant="small"
                        title={title}
                        description="Gestione y valide los archivos requeridos para su expediente."
                    />
                </div>

                {/* 2. CONTENEDOR SPLIT VIEW */}
                <div className="flex-1 flex gap-6 overflow-hidden relative pr-1 pb-1">

                    {/* PANEL IZQUIERDO: Maestros o Lista Seleccionada */}
                    <aside className={`
                        flex flex-col transition-all duration-300 ease-in-out shrink-0
                        ${selectedId ? 'w-[350px] lg:w-[400px]' : 'w-full'}
                    `}>
                        {/* Buscador Superior */}
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nombre o correo..."
                                    className="pl-9 h-9"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Listado / Tabla */}
                        <div className="rounded-md border bg-card mt-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre / Usuario</TableHead>
                                        {!selectedId && (
                                            <>
                                                <TableHead className="hidden md:table-cell">Facultad</TableHead>
                                                <TableHead className="hidden md:table-cell">Escuela</TableHead>
                                                <TableHead className="hidden lg:table-cell">Sección</TableHead>
                                            </>
                                        )}
                                        <TableHead className="text-center">Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assignments.map((item) => (
                                        <TableRow
                                            key={item.id}
                                            onClick={() => setSelectedId(item.id)}
                                            className={`cursor-pointer transition-colors group ${selectedId === item.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                                                        <User className="size-4 text-muted-foreground" />
                                                    </div>
                                                    <div className="flex flex-col overflow-hidden">
                                                        <span className="font-bold truncate max-w-[150px] lg:max-w-none">
                                                            {item.user?.authenticable?.surnames} {item.user?.authenticable?.names}
                                                        </span>
                                                        {!selectedId ? (
                                                            <span className="text-[10px] text-muted-foreground truncate">
                                                                {item.user?.email}
                                                            </span>
                                                        ) : (
                                                            <div className="flex gap-2">
                                                                <span className="text-[10px] text-muted-foreground truncate">
                                                                    {item.section?.school?.name}
                                                                </span>
                                                                <span className="text-[10px] text-muted-foreground truncate">
                                                                    - {item.section?.name}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Columnas que desaparecen en modo split */}
                                            {!selectedId && (
                                                <>
                                                    <TableCell className="hidden md:table-cell text-muted-foreground font-medium">
                                                        {item.section?.school?.faculty?.name || "N/A"}
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell text-muted-foreground font-medium">
                                                        {item.section?.school?.name || "N/A"}
                                                    </TableCell>
                                                    <TableCell className="hidden lg:table-cell font-bold">
                                                        {item.section?.name || "N/A"}
                                                    </TableCell>
                                                </>
                                            )}

                                            <TableCell className="text-center">
                                                {/* Badge de estado del dossier total */}

                                                {item.dossiers[0].approval_status === 1 && (
                                                    <Badge variant="outline" className="text-[9px] uppercase bg-green-500 text-white tracking-tighter h-5 px-1.5 font-bold">
                                                        Aprobado
                                                    </Badge>
                                                )}
                                                {item.dossiers[0].approval_status === 3 && item.dossiers[0].latest && (
                                                    <Badge variant="outline" className="text-[9px] uppercase bg-red-500 text-white tracking-tighter h-5 px-1.5 font-bold">
                                                        Rechazado
                                                    </Badge>
                                                )}
                                                {item.dossiers[0].approval_status === 2 && (
                                                    <Badge variant="outline" className="text-[9px] uppercase bg-amber-500 text-white tracking-tighter h-5 px-1.5 font-bold">
                                                        Pendiente
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            <TableCell className="text-right">
                                                <ChevronRight className={`size-4 text-muted-foreground transition-transform ${selectedId === item.id ? 'rotate-180 text-primary' : ''}`} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </aside>

                    {/* PANEL DERECHO: Detalle de Gestión (Aparece con animación) */}
                    <main className={`
                        flex-1 flex flex-col transition-all duration-500 ease-in-out min-w-0
                        ${selectedId ? 'translate-x-0 opacity-100' : 'translate-x-[50px] opacity-0 pointer-events-none'}
                    `}>
                        {selectedId ? (
                            <div className="flex-1 flex flex-col overflow-hidden">
                                {/* Aqui el header Nombres / Escuela / Seccion*/}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">

                                        <span className="text-sm font-medium">
                                            {selectedAssignment?.section?.school?.faculty?.name}
                                        </span>
                                        <ChevronRight className="size-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">
                                            {selectedAssignment?.section?.school?.name}
                                        </span>
                                        <ChevronRight className="size-4 text-muted-foreground" />
                                        <span className="text-sm font-semibold">
                                            {selectedAssignment?.section?.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => setSelectedId(null)}>
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                                {/* --- CONTENEDOR 2 COLUMNAS (Viewer + Sidebar) --- */}
                                <div className="flex-1 flex flex-col xl:flex-row gap-5 mt-6 overflow-hidden">
                                    {/* COLUMNA 1: VISOR DEL DOCUMENTO */}
                                    <div className="flex-1 rounded-md border bg-card flex flex-col overflow-hidden relative shadow-sm min-h-[400px]">
                                        <div className="h-10 border-b bg-muted/30 flex items-center px-4 shrink-0 justify-between">
                                            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                                                <FileText className="size-4" />
                                                <span>{dossierDetail?.requirements?.[selectedType]?.title || "Seleccione un documento"}</span>
                                            </div>
                                            <Badge variant="outline" className="text-[10px] bg-background">Obligatorio</Badge>
                                        </div>
                                        <FilePreview
                                            path={dossierDetail?.requirements?.[selectedType]?.latest?.path}
                                            name={dossierDetail?.requirements?.[selectedType]?.title || "Documento adjunto"}
                                            previewEnabled={previewEnabled}
                                        />
                                    </div>

                                    {/* COLUMNA 2: PANEL DE CONTROL */}
                                    <div className="w-full lg:w-64 xl:w-72 shrink-0 flex flex-col gap-6 h-full overflow-hidden not-italic text-foreground">

                                        {/* Arriba: Lista de Requisitos (Componente Reutilizable) */}

                                        <RequirementsList
                                            requirements={dossierDetail?.requirements || []}
                                            selectedType={selectedType}
                                            onSelectType={setSelectedType}
                                            previewEnabled={previewEnabled}
                                            onTogglePreview={() => setPreviewEnabled(!previewEnabled)}
                                        />
                                        <TabsDossier
                                            requirement={dossierDetail?.requirements?.[selectedType]}
                                            onSaveValidation={handleSaveValidation}
                                            isSaving={isSavingValidation}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                                <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mb-4 border border-dashed border-muted-foreground/30">
                                    <User className="size-8 text-muted-foreground/30" />
                                </div>
                                <p className="text-sm font-medium">Selecciona un archivo para validar su cumplimiento</p>
                            </div>
                        )}
                    </main>

                </div>
            </div>
        </AppLayout>
    );
}


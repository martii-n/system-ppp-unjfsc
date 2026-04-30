import AppLayout from "@/layouts/app-layout";
import { Head, router, usePage } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import axios from 'axios';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    User, ChevronRight, FileText,
    CheckCircle2,
    AlertCircle,
    Building2,
    Calendar,
    Briefcase,
    MessageSquare,
    Eye,
    EyeOff,
    Info,
    ArrowRight,
    Clock,
    History,
    XCircle,
    X
} from "lucide-react";
import Heading from "@/components/heading";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { AcademicFilter, AcademicFilterValues } from "@/components/academic/academic-filter";
import AcademicSearch from "@/components/academic/academic-search";
import AcademicPagination from "@/components/academic/academic-pagination";
import { useConfigTable } from "@/hooks/use-config-table";

import internship from "@/routes/academic/internship";
import PlacementValidation from "./placement";
import InternshipValidation from "./internship";

interface Props {
    assignments: any;
    faculties?: any[];
    title: string;
}

export default function InternshipValidationIndex({ assignments = [], faculties = [], title }: Props) {
    const { role } = usePage().props as any;
    const isAdmin = [1, 2].includes(Number(role));

    const { url } = usePage();
    const params = new URLSearchParams(url.split('?')[1]);

    const itemFromUrl = params.get('a');
    const [selectedId, setSelectedId] = useState<number | null>(
        itemFromUrl ? Number(itemFromUrl) : null
    );

    const {
        data: localAssignments,
        displayData: displayAssignments,
        allLocalFiltered,
        isSearching,
        search,
        setSearch,
        activeFilters,
        filterClearKey,
        handleFilter,
        handleBackendSearch,
        localPage,
        setLocalPage,
        localTotalPages,
        handlePageChange,
        setData: setAssignments,
        fetchData
    } = useConfigTable({
        endpoint: '/api/internship/validation/filter',
        initialData: assignments,
        isAdmin,
        pageSize: 15,
        extraParams: {},
        onLocalSearch: (a: any, term: string) => {
            return (a.user?.person?.names || "").toLowerCase().includes(term) ||
                (a.user?.person?.surnames || "").toLowerCase().includes(term) ||
                (a.user?.email || "").toLowerCase().includes(term);
        }
    });

    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [detailData, setDetailData] = useState<any>(null);

    // Context UI
    const [activeContext, setActiveContext] = useState<'data' | 'document'>('data');
    const [selectedReqIndex, setSelectedReqIndex] = useState(0);
    const [previewEnabled, setPreviewEnabled] = useState(true);

    const isArray = Array.isArray(localAssignments);
    const selectedAssignment = isArray
        ? (localAssignments as any[]).find((item: any) => item.id === selectedId)
        : (localAssignments?.data || []).find((item: any) => item.id === selectedId);

    // --- ACCIONES DE SELECCIÓN ---
    const handleSelect = (id: number) => {
        const url = new URL(window.location.href);
        url.searchParams.set('a', id.toString());
        window.history.pushState({}, '', url.toString());
        setSelectedId(id);
    };

    const handleCloseSelected = () => {
        if (itemFromUrl) {
            router.get(window.location.pathname, {}, { preserveState: true, replace: true });
        } else {
            const url = new URL(window.location.href);
            url.searchParams.delete('a');
            window.history.pushState({}, '', url.toString());
        }
        setSelectedId(null);
        setDetailData(null);
    };

    const loadDetail = (step?: number) => {
        if (!selectedId) return;
        setIsLoadingDetail(true);
        const url = step
            ? `/api/internship/validation/${selectedId}?step=${step}`
            : `/api/internship/validation/${selectedId}`;
        axios.get(url)
            .then(response => setDetailData(response.data))
            .catch(error => {
                console.error(error);
                toast.error("Error al cargar detalles");
            })
            .finally(() => setIsLoadingDetail(false));
    };

    useEffect(() => {
        if (selectedId) {
            loadDetail();
            setActiveContext('data');
        }
    }, [selectedId]);

    const breadcrumbs = [
        { title: "Dashboard", href: "/dashboard" },
        { title: title, href: "#" }
    ];

    const currentRequirement = detailData?.requirements?.[selectedReqIndex];

    const hasInternship = !!detailData?.assignment?.internship;

    const onStatusUpdateSuccess = () => {
        loadDetail();
        if (isAdmin) {
            const params = search.trim() ? { search: search.trim() } : activeFilters || {};
            fetchData('/api/internship/validation/filter', params);
        } else {
            fetchData('/api/internship/validation/filter');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Validación de Prácticas" />

            <div className="flex flex-col flex-1 min-h-screen p-4 md:p-6 lg:p-8 gap-6">

                <div className="flex items-end justify-between">
                    <Heading
                        variant="small"
                        title={title}
                        description="Gestione y valide las solicitudes de prácticas y su seguimiento."
                    />
                </div>

                <div className="flex-1 flex gap-6 overflow-hidden relative pr-1 pb-1">

                    {/* PANEL IZQUIERDO: Listado de Estudiantes */}
                    <aside className={`
                        flex flex-col transition-all duration-300 ease-in-out shrink-0
                        ${selectedId ? 'w-[350px] lg:w-[380px]' : 'w-full'}
                    `}>
                        {/* Filtro + Buscador */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                            {isAdmin && (
                                <AcademicFilter
                                    faculties={faculties}
                                    onFilter={handleFilter}
                                    isLoading={isSearching}
                                    clearKey={filterClearKey}
                                />
                            )}
                            <AcademicSearch
                                isAdmin={isAdmin}
                                search={search}
                                setSearch={setSearch}
                                onSearch={handleBackendSearch}
                                isLoading={isSearching}
                            />
                        </div>

                        <div className="rounded-md border bg-card mt-6 overflow-hidden relative">
                            {isSearching && (
                                <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[1px] rounded-md flex items-center justify-center">
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        Cargando...
                                    </div>
                                </div>
                            )}
                            <Table className="table-fixed w-full">
                                <colgroup>
                                    <col className="w-[40%]" />
                                    {!selectedId && <col className="w-[25%]" />}
                                    {!selectedId && <col className="w-[10%]" />}
                                    <col className="w-[15%]" />
                                    <col className="w-[10%]" />
                                </colgroup>
                                <TableHeader>
                                    <TableRow className="bg-muted/30">
                                        <TableHead className="font-bold">Estudiante</TableHead>
                                        {!selectedId && (
                                            <>
                                                <TableHead className="font-bold">Facultad / Escuela</TableHead>
                                                <TableHead className="font-bold">Sección</TableHead>
                                            </>
                                        )}
                                        <TableHead className="text-center font-bold">Estado</TableHead>
                                        <TableHead className="text-right"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="transition-opacity duration-200">
                                    {displayAssignments.length > 0 ? (
                                        displayAssignments.map((item: any) => (
                                            <TableRow
                                                key={item.id}
                                                onClick={() => handleSelect(item.id)}
                                                className={`cursor-pointer transition-colors group ${selectedId === item.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                                                            <User className="size-4 text-muted-foreground" />
                                                        </div>
                                                        <div className="flex flex-col overflow-hidden">
                                                            <span className="font-bold truncate text-xs uppercase text-foreground/80 tracking-tight max-w-[200px]">
                                                                {item.user?.person?.surnames} {item.user?.person?.names}
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

                                                {!selectedId && (
                                                    <>
                                                        <TableCell className="text-muted-foreground text-[11px]">
                                                            <div className="flex flex-col">
                                                                <span>{item.section?.school?.faculty?.name || "N/A"}</span>
                                                                <span className="font-bold text-xs">{item.section?.school?.name || "N/A"}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-bold">
                                                            {item.section?.name || "N/A"}
                                                        </TableCell>
                                                    </>
                                                )}



                                                <TableCell className="text-center">
                                                    {!item.placement ? (
                                                        <Badge variant="outline" className="text-[9px] uppercase bg-slate-200 text-slate-600 tracking-tighter h-5 px-1.5 font-extrabold border-none dark:bg-slate-800 dark:text-slate-400">
                                                            NO INICIADO
                                                        </Badge>
                                                    ) : item.placement?.approval_status === 1 ? (
                                                        <Badge variant="outline" className="text-[9px] uppercase bg-green-500 text-white tracking-tighter h-5 px-1.5 font-extrabold border-none">
                                                            PROCESO
                                                        </Badge>
                                                    ) : item.placement?.approval_status === 3 ? (
                                                        <Badge variant="outline" className="text-[9px] uppercase bg-red-500 text-white tracking-tighter h-5 px-1.5 font-extrabold border-none">
                                                            OBSERVADO
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-[9px] uppercase bg-amber-500 text-white tracking-tighter h-5 px-1.5 font-extrabold border-none">
                                                            FORMALIZ.
                                                        </Badge>
                                                    )}
                                                </TableCell>

                                                <TableCell className="text-right">
                                                    <ChevronRight className={`size-4 text-muted-foreground transition-transform ${selectedId === item.id ? 'rotate-180 text-primary' : ''}`} />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={selectedId ? 3 : 5} className="h-24 text-center text-muted-foreground italic">
                                                {!search && !activeFilters
                                                    ? "Usa el filtro o buscador para cargar estudiantes."
                                                    : "No se encontraron estudiantes registrados"}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            <AcademicPagination
                                isAdmin={isAdmin}
                                isLoading={isSearching}
                                links={(localAssignments as any)?.links}
                                total={(localAssignments as any)?.total}
                                showing={(localAssignments as any)?.data?.length}
                                onPageChange={handlePageChange}
                                currentPage={localPage}
                                totalPages={localTotalPages}
                                localShowing={displayAssignments.length}
                                localTotal={allLocalFiltered.length}
                                onLocalPageChange={setLocalPage}
                            />
                        </div>
                    </aside>

                    {/* PANEL DERECHO: Gestión de Validación */}
                    <main className={`
                        flex-1 flex flex-col transition-all duration-500 ease-in-out min-w-0
                        ${selectedId ? 'translate-x-0 opacity-100' : 'translate-x-[50px] opacity-0 pointer-events-none'}
                    `}>
                        {selectedAssignment ? (
                            <div className="flex-1 flex flex-col overflow-hidden bg-card border rounded-md border-muted/60">
                                {/* Header del detalle */}
                                <div className="p-4 border-b bg-muted/20 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                            <User className="size-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <h2 className="font-bold text-base leading-none uppercase tracking-tight">
                                                {selectedAssignment?.user?.person?.surnames}, {selectedAssignment?.user?.person?.names}
                                            </h2>
                                            <span className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                                                <Building2 className="size-3" /> {selectedAssignment?.section?.school?.name} • Ciclo 2024-II
                                            </span>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={handleCloseSelected}>
                                        <X className="size-4" />
                                    </Button>
                                </div>

                                {!detailData?.placement ? (
                                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                                        <div className="size-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200">
                                            <Building2 className="size-10" />
                                        </div>
                                        <div className="max-w-xs space-y-2">
                                            <h3 className="font-bold text-slate-900 text-lg">Sin proceso iniciado</h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                Este estudiante aún no ha registrado su intención de prácticas ni ha iniciado la formalización de su puesto.
                                            </p>
                                        </div>
                                        <Badge variant="secondary" className="px-4 py-1 text-[10px] uppercase font-bold tracking-widest bg-slate-200 text-slate-600 border-none">
                                            Estado: No Iniciado
                                        </Badge>
                                    </div>
                                ) : hasInternship ? (
                                    <InternshipValidation
                                        detailData={detailData}
                                        loadDetail={loadDetail}
                                        previewEnabled={previewEnabled}
                                        setPreviewEnabled={setPreviewEnabled}
                                        selectedReqIndex={selectedReqIndex}
                                        setSelectedReqIndex={setSelectedReqIndex}
                                        ValidationForm={(props: any) => (
                                            <ValidationForm
                                                {...props}
                                                onSuccess={onStatusUpdateSuccess}
                                            />
                                        )}
                                    />
                                ) : (
                                    <>
                                        <div className="flex gap-2 min-w-0 p-4 pb-2">
                                            <Badge className="text-xs bg-blue-500 text-white">
                                                Proceso de formalización de prácticas
                                            </Badge>
                                            <div className="flex items-end gap-2 ml-4">
                                                <h3 className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground pb-0.5">Puesto / Cargo:</h3>
                                                <p className="font-bold text-sm truncate">{detailData?.placement?.position || 'N/A'}</p>
                                            </div>
                                            <div className="flex items-end gap-1 ml-4 border-l pl-4 border-muted-foreground/30">
                                                <p className="text-[10px] text-muted-foreground uppercase font-medium pb-0.5">
                                                    {detailData?.placement?.internship_type} • {detailData?.placement?.origin_type}
                                                </p>
                                            </div>
                                        </div>
                                        <PlacementValidation
                                            detailData={detailData}
                                            loadDetail={loadDetail}
                                            previewEnabled={previewEnabled}
                                            setPreviewEnabled={setPreviewEnabled}
                                            currentRequirement={currentRequirement}
                                            selectedReqIndex={selectedReqIndex}
                                            setSelectedReqIndex={setSelectedReqIndex}
                                            activeContext={activeContext}
                                            setActiveContext={setActiveContext}
                                            ValidationForm={(props: any) => (
                                                <ValidationForm
                                                    {...props}
                                                    onSuccess={onStatusUpdateSuccess}
                                                />
                                            )}
                                        />
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/5 border border-dashed rounded-md">
                                <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mb-4 border border-dashed border-muted-foreground/30">
                                    <User className="size-8 text-muted-foreground/30" />
                                </div>
                                <p className="text-sm font-medium">Seleccione un estudiante para validar su proceso de prácticas</p>
                            </div>
                        )}
                    </main>

                </div>
            </div>
        </AppLayout>
    );
}

export function ValidationForm({ type, requirement, status, onSuccess, placementId }: {
    type: 'data' | 'document',
    requirement?: any,
    status?: number,
    onSuccess: () => void,
    placementId: number
}) {
    const [valStatus, setValStatus] = useState<number | null>(null);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentStatus = type === 'data' ? status : requirement?.status;

    const handleSubmit = () => {
        if (!valStatus) return;

        const isData = type === 'data';
        const url = isData
            ? internship.placements.status.url(placementId)
            : internship.documents.status.url(requirement.latest.id);

        const payload = isData
            ? { approval_status: valStatus, observation: comment }
            : { approval_status: valStatus, comment: comment };

        router.patch(url, payload, {
            onBefore: () => setIsSubmitting(true),
            onFinish: () => setIsSubmitting(false),
            onSuccess: () => {
                setValStatus(null);
                setComment("");
                onSuccess(); // Recarga el detalle local (axios get)
            },
            onError: () => {
                // Errores de validación no están en flash — se manejan aquí si es necesario
            }
        });
    };

    if (currentStatus === 1 && !valStatus) {
        return (
            <div className="space-y-4 animate-in fade-in">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-3">
                    <CheckCircle2 className="size-4 text-green-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-green-900 leading-none">Elemento Aprobado</p>
                        <p className="text-[10px] text-green-700 mt-1">Este componente ha sido validado correctamente.</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" className="w-full text-[10px] h-7" onClick={() => setValStatus(3)}>
                    Cambiar dictamen
                </Button>
            </div>
        );
    }

    if (currentStatus === 3 && !valStatus) {
        return (
            <div className="space-y-4 animate-in fade-in">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3">
                    <XCircle className="size-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-red-900 leading-none">Elemento Observado</p>
                        <p className="text-[10px] text-red-700 mt-1">Este componente ha sido observado.</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" className="w-full text-[10px] h-7" onClick={() => setValStatus(1)}>
                    Cambiar dictamen
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-5 animate-in slide-in-from-right-2 duration-300">
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={() => setValStatus(1)}
                    className={`flex items-center justify-center gap-2 p-2 rounded-lg border-2 transition-all ${valStatus === 1 ? 'border-green-500 bg-green-50 text-green-700' : 'border-muted'}`}
                >
                    <CheckCircle2 className="size-3.5" />
                    <span className="text-[10px] font-bold uppercase">Aprobar</span>
                </button>
                <button
                    onClick={() => setValStatus(3)}
                    className={`flex items-center justify-center gap-2 p-2 rounded-lg border-2 transition-all ${valStatus === 3 ? 'border-red-500 bg-red-50 text-red-700' : 'border-muted'}`}
                >
                    <AlertCircle className="size-3.5" />
                    <span className="text-[10px] font-bold uppercase">Observar</span>
                </button>
            </div>

            <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Comentario</Label>
                <div className="relative">
                    <MessageSquare className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground/40" />
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full pl-9 p-2.5 text-xs rounded-lg border border-input bg-muted/5 focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px] resize-none"
                        placeholder="Escribe el motivo del dictamen..."
                    />
                </div>
            </div>

            <Button
                onClick={handleSubmit}
                disabled={!valStatus || (valStatus === 3 && !comment) || isSubmitting}
                className={`w-full h-9 text-[11px] font-bold transition-all shadow-sm ${valStatus === 1 ? 'bg-green-600 hover:bg-green-700' : valStatus === 3 ? 'bg-red-600 hover:bg-red-700' : ''}`}
            >
                {isSubmitting ? <Clock className="size-3 animate-spin mr-2" /> : <ArrowRight className="size-3 mr-2" />}
                REGISTRAR DICTAMEN
            </Button>
        </div>
    );
}
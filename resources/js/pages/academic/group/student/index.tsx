import AppLayout from "@/layouts/app-layout";
import { Head, usePage } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    X, Users, ChevronRight
} from "lucide-react";
import Heading from "@/components/heading";
import StudentManagementTabs from "./partials/student-management-tabs";
import { AcademicFilter, AcademicFilterValues } from "@/components/academic/academic-filter";
import AcademicSearch from "@/components/academic/academic-search";
import AcademicPagination from "@/components/academic/academic-pagination";
import { useConfigTable } from "@/hooks/use-config-table";

interface Props {
    groups: any[];
    students: any[];
    faculties?: any[];
}

export default function StudentGroupIndex({ groups = [], students = [], faculties = [] }: Props) {
    const { role } = usePage().props as any;
    const isAdmin = [1, 2].includes(Number(role));

    const [selectedId, setSelectedId] = useState<number | null>(null);
    const {
        data: localGroups,
        displayData,
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
    } = useConfigTable({
        endpoint: '/api/groups/internship/filter',
        initialData: groups,
        isAdmin,
        pageSize: 15,
        onLocalSearch: (a, term) => {
            return a.name.toLowerCase().includes(term) ||
                a.section?.school?.name?.toLowerCase().includes(term) ||
                (a.module?.name ?? '').toLowerCase().includes(term);
        },
    });

    const selectedItem = displayData.find((item) =>
        item.id === selectedId
    );

    const breadcrumbs = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Grupos por Estudiante", href: "#" }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Grupos por Estudiante" />

            <div className="flex flex-col flex-1 min-h-screen p-4 md:p-6 lg:p-8 gap-6">
                <div className="flex items-end justify-between">
                    <Heading
                        variant="small"
                        title="Gestión de Grupos Estudiante"
                        description="Administre la asignación, movimiento y retiro de estudiantes por grupo."
                    />
                </div>

                <div className="flex-1 flex gap-6 overflow-hidden relative pr-1 pb-1">
                    {/* PANEL IZQUIERDO: Listado de Grupos */}
                    <aside className={`
                        flex flex-col transition-all duration-300 ease-in-out shrink-0
                        ${selectedId ? 'w-[350px] lg:w-[400px]' : 'w-full'}
                    `}>
                        {/* Filtro + Buscador */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                            {isAdmin && (
                                <AcademicFilter
                                    key={filterClearKey}
                                    faculties={faculties}
                                    onFilter={handleFilter}
                                    isLoading={isSearching}
                                    initialValues={activeFilters as any}
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
                                    <col className="w-[20%]" />
                                    {!selectedId && <col className="w-[10%]" />}
                                    {!selectedId && <col className="w-[20%]" />}
                                    {!selectedId && <col className="w-[20%]" />}
                                    {!selectedId && <col className="w-[10%]" />}
                                    <col className="w-[5%]" />
                                </colgroup>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Grupo / Info</TableHead>
                                        {!selectedId && (
                                            <>
                                                <TableHead>Módulo</TableHead>
                                                <TableHead>Facultad</TableHead>
                                                <TableHead>Escuela</TableHead>
                                                <TableHead>Sección</TableHead>
                                            </>
                                        )}
                                        <TableHead className="text-center pr-4">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {displayData.length > 0 ? (
                                        displayData.map((group: any) => (
                                            <TableRow
                                                key={group.id}
                                                onClick={() => setSelectedId(group.id)}
                                                className={`cursor-pointer transition-colors group ${selectedId === group.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                                            <Users className="size-4 text-indigo-500" />
                                                        </div>
                                                        <div className="flex flex-col overflow-hidden">
                                                            <span className="font-bold truncate text-sm">
                                                                {group.name}
                                                            </span>
                                                            {selectedId ? (
                                                                <span className="text-[10px] text-muted-foreground truncate">
                                                                    {group.section.school.name} - {group.section.name}
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] text-muted-foreground truncate italic">
                                                                    {group.supervisor?.user?.person ? `${group.supervisor.user.person.surnames} ${group.supervisor.user.person.names}` : 'Sin supervisor'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {!selectedId && (
                                                    <>
                                                        <TableCell>
                                                            <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-bold uppercase tracking-tight">
                                                                {group.module?.name ?? 'Módulo 1'}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground text-xs">
                                                            {group.section.school.faculty.name}
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground text-xs">
                                                            {group.section.school.name}
                                                        </TableCell>
                                                        <TableCell className="font-bold text-xs">
                                                            {group.section.name}
                                                        </TableCell>
                                                    </>
                                                )}

                                                <TableCell className="text-right pr-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {!selectedId && (
                                                            <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">
                                                                Administrar
                                                            </span>
                                                        )}
                                                        <ChevronRight className={`size-4 text-muted-foreground transition-transform ${selectedId === group.id ? 'rotate-180 text-primary' : ''}`} />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={selectedId ? 2 : 6} className="h-24 text-center text-muted-foreground italic">
                                                {isAdmin && displayData.length === 0 && !search && !activeFilters
                                                    ? "Usa el filtro o buscador para cargar grupos."
                                                    : "No se encontraron resultados"}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            <AcademicPagination
                                isAdmin={isAdmin}
                                isLoading={isSearching}
                                links={(localGroups as any)?.links}
                                total={(localGroups as any)?.total}
                                showing={(localGroups as any)?.data?.length}
                                onPageChange={handlePageChange}
                                currentPage={localPage}
                                totalPages={localTotalPages}
                                localShowing={displayData.length}
                                localTotal={allLocalFiltered.length}
                                onLocalPageChange={setLocalPage}
                            />
                        </div>
                    </aside>

                    {/* PANEL DERECHO: Gestión de Estudiantes */}
                    <main className={`
                        flex-1 flex flex-col transition-all duration-500 ease-in-out min-w-0
                        ${selectedId ? 'translate-x-0 opacity-100' : 'translate-x-[50px] opacity-0 pointer-events-none'}
                    `}>
                        {selectedItem ? (
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2 overflow-hidden mr-4">
                                        <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <Users className="size-5 text-primary" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <h2 className="text-sm font-bold truncate leading-tight tracking-tight">
                                                {selectedItem?.name}
                                            </h2>
                                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                                                <span>{selectedItem?.section.school.name}</span>
                                                <ChevronRight className="size-3" />
                                                <span className="text-primary font-bold">{selectedItem?.section.name}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-muted" onClick={() => setSelectedId(null)}>
                                        <X className="size-4" />
                                    </Button>
                                </div>

                                <div className="flex-1 overflow-hidden">
                                    <StudentManagementTabs
                                        group={selectedItem}
                                        allGroups={(localGroups as any)?.data || localGroups}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl bg-muted/20">
                                <div className="size-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4 border border-dashed border-muted-foreground/30 ring-8 ring-muted/20">
                                    <Users className="size-8 text-muted-foreground/30" />
                                </div>
                                <h3 className="text-sm font-bold text-foreground">Gestión de Alumnos</h3>
                                <p className="text-xs text-muted-foreground mt-1 max-w-[250px] text-center">
                                    Selecciona un grupo del listado para administrar sus alumnos, moverlos o retirarlos.
                                </p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </AppLayout>
    );
}
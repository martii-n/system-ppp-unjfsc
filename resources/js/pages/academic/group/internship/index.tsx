import AppLayout from "@/layouts/app-layout";
import { Head, usePage } from "@inertiajs/react";
import { type BreadcrumbItem } from "@/types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Plus, Users, Pencil, Trash2 } from "lucide-react";
import Heading from "@/components/heading";

import CreateGroupModal from "./partials/create-group-modal";
import DeleteGroupModal from "./partials/delete-group-modal";
import EditGroupModal from "./partials/edit-group-modal";

import { AcademicFilter } from "@/components/academic/academic-filter";
import AcademicSearch from "@/components/academic/academic-search";
import AcademicPagination from "@/components/academic/academic-pagination";

import { useInternshipGroup, InternshipGroup } from "../hooks/use-internship-group";

interface Props {
    groups: any;
    faculties: any[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Grupos", href: "#" },
    { title: "Por Práctica", href: "#" },
];

export default function InternshipGroupsIndex({ groups = [], faculties }: Props) {
    const { role } = usePage().props as any;
    const isAdmin = [1, 2].includes(Number(role));

    // --- USAMOS EL NUEVO HOOK ESPECÍFICO ---
    const { tableManager, modals, actions } = useInternshipGroup({
        initialData: groups,
        isAdmin,
    });

    const {
        displayData,
        isSearching,
        search,
        setSearch,
        filterClearKey,
        handleFilter,
        handleBackendSearch,
        localPage,
        setLocalPage,
        localTotalPages,
        handlePageChange,
        allLocalFiltered,
        data: backendData,
    } = tableManager;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Grupos por Práctica" />

            <div className="flex flex-col gap-4 p-4 lg:p-6">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <Heading
                        variant="small"
                        title="Grupos por Práctica"
                        description="Gestión de grupos de prácticas pre-profesionales por sección académica."
                    />
                    <Button onClick={modals.create.open}>
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Grupo
                    </Button>
                </div>

                {/* Filtros y Buscador */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-20">
                    {isAdmin && (
                        <AcademicFilter
                            key={filterClearKey}
                            faculties={faculties}
                            onFilter={handleFilter}
                            isLoading={isSearching}
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

                <div className="rounded-md border overflow-hidden relative">
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
                            <col className="w-[3%]" />
                            <col className="w-[18%]" />
                            <col className="w-[10%]" />
                            <col className="w-[7%]" />
                            <col className="w-[20%]" />
                            <col className="w-[20%]" />
                            <col className="w-[17%]" />
                            <col className="w-[5%]" />
                        </colgroup>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Facultad / Escuela</TableHead>
                                <TableHead>Módulo</TableHead>
                                <TableHead>Sección</TableHead>
                                <TableHead>Docente Titular</TableHead>
                                <TableHead>Supervisor</TableHead>
                                <TableHead>Nombre del Grupo</TableHead>
                                <TableHead className="text-right pr-6">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {displayData.length > 0 ? (
                                displayData.map((group, index) => (
                                    <TableRow key={group.id} className="group hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm truncate" title={group.section.school.faculty.name}>
                                                    {group.section.school.faculty.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground truncate">
                                                    {group.section.school.name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-bold uppercase tracking-tight">
                                                {group.module?.name ?? 'Módulo 1'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">{group.section.name}</span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm">
                                                    {group.teacher?.user?.person?.surnames} {group.teacher?.user?.person?.names}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground truncate max-w-[150px]" title={group.teacher?.user?.email}>
                                                    {group.teacher?.user?.email}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm">
                                                    {group.supervisor?.user?.person?.surnames} {group.supervisor?.user?.person?.names}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground truncate max-w-[150px]" title={group.supervisor?.user?.email}>
                                                    {group.supervisor?.user?.email}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                                                    <Users className="h-4 w-4" />
                                                </div>
                                                <span className="font-semibold uppercase text-xs truncate">
                                                    {group.name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[160px]">
                                                    <DropdownMenuLabel>Gestión</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="cursor-pointer"
                                                        onClick={() => modals.edit.open(group as InternshipGroup)}
                                                    >
                                                        <Pencil className="mr-2 h-4 w-4 text-blue-500" />
                                                        Editar Grupo
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="cursor-pointer text-destructive focus:text-destructive"
                                                        onClick={() => modals.delete.open(group as InternshipGroup)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground italic">
                                        No hay grupos registrados o no coinciden con la búsqueda.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <AcademicPagination
                    isAdmin={isAdmin}
                    isLoading={isSearching}
                    links={(backendData as any)?.links}
                    total={(backendData as any)?.total}
                    showing={(backendData as any)?.data?.length}
                    onPageChange={handlePageChange}
                    currentPage={localPage}
                    totalPages={localTotalPages}
                    localShowing={displayData.length}
                    localTotal={allLocalFiltered.length}
                    onLocalPageChange={setLocalPage}
                />
            </div>

            {/* Modales utilizando el estado del Hook */}
            <CreateGroupModal
                open={modals.create.isOpen}
                onOpenChange={modals.create.setOpen}
                faculties={faculties}
                onSuccess={actions.refreshData}
            />

            <DeleteGroupModal
                open={modals.delete.isOpen}
                onOpenChange={modals.delete.setOpen}
                group={modals.selectedGroup}
                onSuccess={actions.refreshData}
            />

            <EditGroupModal
                open={modals.edit.isOpen}
                onOpenChange={modals.edit.setOpen}
                group={modals.selectedGroup}
                onSuccess={actions.refreshData}
            />
        </AppLayout>
    );
}
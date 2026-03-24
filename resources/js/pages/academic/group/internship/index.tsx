import AppLayout from "@/layouts/app-layout";
import { Head, Link, router } from "@inertiajs/react";
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
import { useState } from "react";
import CreateGroupModal from "./partials/create-group-modal";
import DeleteGroupModal from "./partials/delete-group-modal";
import EditGroupModal from "./partials/edit-group-modal";

interface Person {
    names: string;
    surnames: string;
}

interface User {
    email: string;
    person: Person;
}

interface Assignment {
    id: number;
    user: User;
}

interface InternshipGroup {
    id: number;
    name: string;
    module?: {
        id: number;
        name: string;
    } | null;
    teacher: Assignment;
    supervisor: Assignment;
    section: {
        id: number;
        name: string;
        school: {
            name: string;
            faculty: {
                name: string;
            };
        };
    };
    students_count?: number;
}

interface Props {
    groups: InternshipGroup[];
    faculties: any[];
}

export default function InternshipGroupsIndex({ groups, faculties }: Props) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<InternshipGroup | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: "Grupos",
            href: "#",
        },
        {
            title: "Por Práctica",
            href: "#",
        },
    ];

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
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Grupo
                    </Button>
                </div>

                <div className="rounded-md border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">#</TableHead>
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
                            {groups.length > 0 ? (
                                groups.map((group, index) => {
                                    const section = group.section;
                                    const school = section.school;
                                    const faculty = school.faculty;

                                    return (
                                        <TableRow key={group.id} className="group hover:bg-muted/30 transition-colors">
                                            <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{faculty.name}</span>
                                                    <span className="text-xs text-muted-foreground">{school.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-bold uppercase tracking-tight">
                                                    {group.module?.name ?? 'Módulo 1'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium">{section.name}</span>
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
                                                    <span className="font-semibold uppercase text-xs">
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
                                                            onClick={() => {
                                                                setSelectedGroup(group);
                                                                setIsEditModalOpen(true);
                                                            }}
                                                        >
                                                            <Pencil className="mr-2 h-4 w-4 text-blue-500" />
                                                            Editar Grupo
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="cursor-pointer text-destructive focus:text-destructive"
                                                            onClick={() => {
                                                                setSelectedGroup(group);
                                                                setIsDeleteModalOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Eliminar
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="h-24 text-center text-muted-foreground italic"
                                    >
                                        No hay grupos registrados para el periodo actual.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <CreateGroupModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                faculties={faculties}
            />

            <DeleteGroupModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                group={selectedGroup}
            />

            <EditGroupModal
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                group={selectedGroup}
            />
        </AppLayout>
    );
}
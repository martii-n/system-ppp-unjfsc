import AppLayout from "@/layouts/app-layout";
import { Head, Link, usePage } from "@inertiajs/react";
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
import { MoreHorizontal, UserCog, Settings2, Clock, Book, FilePen } from "lucide-react";
import Heading from "@/components/heading";
import ManageAssignmentModal from "./partials/manage-assignment-modal";
import PendingRequestModal from "./partials/pending-request-modal";
import { useState } from "react";

interface Assignment {
    id: number;
    role_id: number;
    access_status: number;
    review_status: number;
    user: {
        email: string;
        authenticable: {
            names: string;
            surnames: string;
        };
    };
    role: {
        name: string;
    };
    section?: {
        name: string;
        school?: {
            name: string;
            faculty: {
                name: string;
            };
        };
        faculty?: {
            name: string;
        };
    };
}

interface Props {
    assignments: Assignment[];
    roleId: number;
    title: string;
}

export default function UserManagementIndex({ assignments, roleId, title }: Props) {
    const { role } = usePage().props as any;
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: "Usuarios",
            href: "#",
        },
        {
            title: title,
            href: "#",
        },
    ];

    const isSubadmin = roleId === 2;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <div className="flex flex-col gap-4 p-4 lg:p-6">
                <div className="flex items-center justify-between">
                    <Heading
                        variant="small"
                        title={title}
                        description={`Gestión de usuarios con rol de ${title.toLowerCase()} registrados en el semestre actual.`}
                    />
                </div>

                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">#</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Apellidos y Nombres</TableHead>
                                <TableHead>Facultad</TableHead>
                                {!isSubadmin && (
                                    <>
                                        <TableHead>Escuela</TableHead>
                                        <TableHead>Sección</TableHead>
                                    </>
                                )}
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assignments.length > 0 ? (
                                assignments.map((assignment, index) => {
                                    const person = assignment.user.authenticable;
                                    const section = assignment.section;

                                    const isReview = assignment.review_status === 1;

                                    // Determinar facultad, escuela y sección según el tipo de registro
                                    const facultyName = section?.school?.faculty?.name || section?.faculty?.name || "N/A";
                                    const schoolName = section?.school?.name || "N/A";
                                    const sectionName = section?.name || "N/A";

                                    return (
                                        <TableRow key={assignment.id}>
                                            <TableCell className="font-medium">{index + 1}</TableCell>
                                            <TableCell>{assignment.user.email}</TableCell>
                                            <TableCell className="capitalize">
                                                {person.surnames} {person.names}
                                            </TableCell>
                                            <TableCell>{facultyName}</TableCell>
                                            {!isSubadmin && (
                                                <>
                                                    <TableCell>{schoolName}</TableCell>
                                                    <TableCell>{sectionName}</TableCell>
                                                </>
                                            )}
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Abrir menú</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-[160px]">
                                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem asChild>
                                                            <Link href="#" className="flex items-center cursor-pointer">
                                                                <UserCog className="mr-2 h-4 w-4 text-blue-500" />
                                                                Editar Perfil
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {!isReview && (
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setSelectedAssignment(assignment);
                                                                    setIsManageModalOpen(true);
                                                                }}
                                                                className="flex items-center cursor-pointer"
                                                            >
                                                                <Settings2 className="mr-2 h-4 w-4 text-orange-500" />
                                                                Gestionar Asig.
                                                            </DropdownMenuItem>
                                                        )}
                                                        {isReview && (
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setSelectedAssignment(assignment);
                                                                    setIsPendingModalOpen(true);
                                                                }}
                                                                className="flex items-center cursor-pointer"
                                                            >
                                                                <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                                                                Solicitud Pendiente
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={isSubadmin ? 5 : 7}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        No hay usuarios registrados con este rol.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <ManageAssignmentModal
                assignment={selectedAssignment}
                open={isManageModalOpen}
                onOpenChange={setIsManageModalOpen}
            />
            <PendingRequestModal
                assignment={selectedAssignment}
                open={isPendingModalOpen}
                onOpenChange={setIsPendingModalOpen}
            />
        </AppLayout>
    );
}

import Heading from "@/components/heading";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import { Info, Search, User, ChevronRight, X, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AcademicFilter, type AcademicFilterValues } from "@/components/academic/academic-filter";
import { GroupSelector, type GroupOption } from "@/components/academic/group-selector";
import { ModuleSelector } from "@/components/academic/module-selector";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import StudentEvaluationPanel from "./components/StudentEvaluationPanel";

interface Faculty {
    id: number;
    name: string;
    schools: {
        id: number;
        name: string;
        sections: { id: number; name: string }[];
    }[];
}

interface Supervision {
    id: number;
    module_id: number;
    approval_status: number;
}

interface StudentAssignment {
    id: number;
    user: {
        email: string;
        person: { names: string; surnames: string };
    };
    supervision: Supervision | null;
}

interface Props {
    faculties: Faculty[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Supervisión de prácticas', href: '/supervision/submission' },
];

const statusConfig: Record<number, { label: string; className: string }> = {
    0: { label: 'Sin iniciar', className: 'bg-muted/60 text-muted-foreground border-transparent' },
    1: { label: 'Aprobado', className: 'bg-green-500/10 text-green-700 border-green-200' },
    2: { label: 'Pendiente', className: 'bg-amber-500/10 text-amber-700 border-amber-200' },
    3: { label: 'Observado', className: 'bg-red-500/10 text-red-700 border-red-200' },
};

export default function SubmissionIndex({ faculties }: Props) {
    const [availableGroups, setAvailableGroups] = useState<GroupOption[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<GroupOption | null>(null);
    const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
    const [students, setStudents] = useState<StudentAssignment[]>([]);

    const [isFilteringGroups, setIsFilteringGroups] = useState(false);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<StudentAssignment | null>(null);
    const [search, setSearch] = useState("");

    // Step 1: Apply academic filter → load groups
    const handleFilter = async (values: AcademicFilterValues) => {
        if (!values.faculty_id) {
            setAvailableGroups([]);
            setSelectedGroup(null);
            setSelectedModuleId(null);
            setStudents([]);
            return;
        }

        setIsFilteringGroups(true);
        setSelectedGroup(null);
        setSelectedModuleId(null);
        setStudents([]);
        setSelectedStudent(null);

        try {
            const params: Record<string, string> = { faculty_id: values.faculty_id };
            if (values.school_id) params.school_id = values.school_id;
            if (values.section_id) params.section_id = values.section_id;

            const res = await axios.get('/supervision/api/groups', { params });
            setAvailableGroups(res.data.groups ?? []);
        } catch {
            toast.error("No se pudieron cargar los grupos.");
            setAvailableGroups([]);
        } finally {
            setIsFilteringGroups(false);
        }
    };

    // Step 2: Select group → auto-select its current module and load students
    const handleGroupSelect = async (group: GroupOption | null) => {
        setSelectedGroup(group);
        setStudents([]);
        setSelectedStudent(null);

        if (!group) {
            setSelectedModuleId(null);
            return;
        }

        const moduleId = group.module_id;
        setSelectedModuleId(moduleId);
        await loadStudents(group.id, moduleId);
    };

    // Step 3: Select module → reload students with supervision status for that module
    const handleModuleSelect = async (moduleId: number) => {
        setSelectedModuleId(moduleId);
        setSelectedStudent(null);
        if (selectedGroup) {
            await loadStudents(selectedGroup.id, moduleId);
        }
    };

    const loadStudents = async (groupId: number, moduleId: number) => {
        setIsLoadingStudents(true);
        try {
            const res = await axios.get(
                `/supervision/api/groups/${groupId}/students`,
                { params: { module_id: moduleId } }
            );
            setStudents(res.data.students ?? []);
        } catch {
            toast.error("No se pudieron cargar los estudiantes.");
            setStudents([]);
        } finally {
            setIsLoadingStudents(false);
        }
    };

    const filteredStudents = students.filter(s => {
        const name = `${s.user?.person?.surnames ?? ''} ${s.user?.person?.names ?? ''}`.toLowerCase();
        const email = (s.user?.email ?? '').toLowerCase();
        const term = search.toLowerCase();
        return name.includes(term) || email.includes(term);
    });

    const handleSelectStudent = (student: StudentAssignment) => {
        // supervision must exist so we have an ID for the annexes API
        if (!student.supervision) {
            toast.warning("Este estudiante aún no tiene una supervisión creada para este módulo.");
            return;
        }
        setSelectedStudent(student);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Evaluación" />
            <div className="flex flex-col flex-1 min-h-screen p-4 md:p-6 lg:p-8 gap-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <Heading
                        variant="small"
                        title="Evaluación de Supervisión"
                        description="Evaluación de supervisiones de práctica."
                    />
                    <div className="flex items-center gap-2 p-2 px-3 rounded-xl bg-indigo-500/60 border border-indigo-500">
                        <ShieldCheck className="size-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Módulo de Supervisión</span>
                    </div>
                </div>

                {/* Split-view container */}
                <div className="flex-1 flex gap-6 overflow-hidden relative pr-1 pb-1">

                    {/* LEFT PANEL */}
                    <aside className={`flex flex-col gap-4 transition-all duration-300 ease-in-out shrink-0 ${selectedStudent ? 'w-[340px] lg:w-[380px]' : 'w-full'}`}>

                        {/* Toolbar */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <AcademicFilter
                                faculties={faculties}
                                onFilter={handleFilter}
                                isLoading={isFilteringGroups}
                            />
                            <GroupSelector
                                groups={availableGroups}
                                selectedGroup={selectedGroup}
                                onSelect={handleGroupSelect}
                                isLoading={isFilteringGroups}
                                disabled={availableGroups.length === 0 && !isFilteringGroups}
                            />
                            {selectedGroup && (
                                <ModuleSelector
                                    groupModuleId={selectedGroup.module_id}
                                    selectedModuleId={selectedModuleId}
                                    onSelect={handleModuleSelect}
                                />
                            )}
                            <div className="flex-1 relative min-w-[130px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar estudiante..."
                                    className="pl-9 h-9"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    disabled={!selectedGroup || !selectedModuleId}
                                />
                            </div>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="size-4 text-muted-foreground cursor-help shrink-0" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">Filtro → Grupo → Módulo → Estudiante</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>

                        {/* Student Table */}
                        <div className="rounded-md border bg-card overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Estudiante</TableHead>
                                        {!selectedStudent && (
                                            <>
                                                <TableHead className="hidden md:table-cell text-xs">Escuela</TableHead>
                                                <TableHead className="hidden lg:table-cell text-xs">Sección</TableHead>
                                            </>
                                        )}
                                        <TableHead className="text-center">Estado</TableHead>
                                        <TableHead className="w-6" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!selectedGroup || !selectedModuleId ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-36 text-center">
                                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                    <User className="size-8 opacity-20" />
                                                    <p className="text-sm font-medium">
                                                        {!selectedGroup ? "Selecciona un grupo para continuar" : "Selecciona un módulo"}
                                                    </p>
                                                    <p className="text-xs opacity-60">Usa los selectores de arriba</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : isLoadingStudents ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground italic text-sm">
                                                Cargando estudiantes...
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredStudents.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground italic text-sm">
                                                {students.length === 0 ? 'Sin estudiantes en este grupo.' : 'Sin coincidencias.'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredStudents.map((student) => {
                                            const status = student.supervision?.approval_status ?? 0;
                                            const cfg = statusConfig[status] ?? statusConfig[0];
                                            const isSelected = selectedStudent?.id === student.id;
                                            return (
                                                <TableRow
                                                    key={student.id}
                                                    onClick={() => handleSelectStudent(student)}
                                                    className={`cursor-pointer transition-colors group/row ${isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-muted/30'}`}
                                                >
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                                                                <User className="size-3.5 text-muted-foreground" />
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="font-bold text-xs truncate uppercase">
                                                                    {student.user?.person?.surnames}, {student.user?.person?.names}
                                                                </span>
                                                                {!selectedStudent && (
                                                                    <span className="text-[10px] text-muted-foreground truncate">
                                                                        {student.user?.email}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    {!selectedStudent && (
                                                        <>
                                                            <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                                                                {selectedGroup.section.school.name}
                                                            </TableCell>
                                                            <TableCell className="hidden lg:table-cell text-xs font-bold">
                                                                {selectedGroup.section.name}
                                                            </TableCell>
                                                        </>
                                                    )}
                                                    <TableCell className="text-center">
                                                        <Badge variant="outline" className={`text-[9px] font-bold h-5 px-1.5 ${cfg.className}`}>
                                                            {cfg.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <ChevronRight className={`size-4 text-muted-foreground transition-all ${isSelected ? 'rotate-180 text-primary' : 'opacity-0 group-hover/row:opacity-100'}`} />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </aside>

                    {/* RIGHT PANEL — Evaluation */}
                    <main className={`flex-1 flex flex-col gap-4 transition-all duration-500 ease-in-out min-w-0 overflow-hidden ${selectedStudent ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0 pointer-events-none'}`}>
                        {selectedStudent && selectedStudent.supervision && (
                            <>
                                {/* Right panel header */}
                                <div className="flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <User className="size-4 text-primary" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <p className="text-sm font-bold truncate uppercase">
                                                {selectedStudent.user?.person?.surnames}, {selectedStudent.user?.person?.names}
                                            </p>
                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground tracking-wider">
                                                <span>{selectedGroup?.section.school.name}</span>
                                                <ChevronRight className="size-3" />
                                                <span className="font-bold text-primary">{selectedGroup?.section.name}</span>
                                                <ChevronRight className="size-3" />
                                                <span className="font-bold">Módulo {selectedModuleId}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 shrink-0"
                                        onClick={() => setSelectedStudent(null)}
                                    >
                                        <X className="size-4" />
                                    </Button>
                                </div>

                                {/* Panel body */}
                                <StudentEvaluationPanel
                                    supervisionId={selectedStudent.supervision.id}
                                />
                            </>
                        )}
                    </main>

                </div>
            </div>
        </AppLayout>
    );
}
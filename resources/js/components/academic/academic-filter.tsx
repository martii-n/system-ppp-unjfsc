import { useState } from "react";
import { Filter, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Section {
    id: number;
    name: string;
}

interface School {
    id: number;
    name: string;
    sections: Section[];
}

interface Faculty {
    id: number;
    name: string;
    schools: School[];
}

export interface AcademicFilterValues {
    faculty_id: string;
    school_id: string;
    section_id: string;
}

interface AcademicFilterProps {
    faculties: Faculty[];
    onFilter: (values: AcademicFilterValues) => void;
    isLoading?: boolean;
}

export function AcademicFilter({ faculties, onFilter, isLoading = false }: AcademicFilterProps) {
    const [open, setOpen] = useState(false);
    const [facultyId, setFacultyId] = useState("");
    const [schoolId, setSchoolId] = useState("");
    const [sectionId, setSectionId] = useState("");

    const [applied, setApplied] = useState<AcademicFilterValues | null>(null);

    const selectedFaculty = faculties.find(f => f.id.toString() === facultyId);
    const selectedSchool = selectedFaculty?.schools.find(s => s.id.toString() === schoolId);

    const handleFilter = () => {
        const values: AcademicFilterValues = { faculty_id: facultyId, school_id: schoolId, section_id: sectionId };
        setApplied(values);
        onFilter(values);
        setOpen(false);
    };

    const handleClear = () => {
        setFacultyId("");
        setSchoolId("");
        setSectionId("");
        const empty: AcademicFilterValues = { faculty_id: "", school_id: "", section_id: "" };
        setApplied(null);
        onFilter(empty);
        setOpen(false);
    };

    const hasFilter = applied && (applied.faculty_id || applied.school_id || applied.section_id);

    const appliedLabel = () => {
        if (!applied) return null;
        const fac = faculties.find(f => f.id.toString() === applied.faculty_id);
        const sch = fac?.schools.find(s => s.id.toString() === applied.school_id);
        const sec = sch?.sections.find(s => s.id.toString() === applied.section_id);
        return sec?.name ?? sch?.name ?? fac?.name ?? null;
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={hasFilter ? "default" : "outline"}
                    size="sm"
                    className={`gap-2 transition-all ${hasFilter ? "pr-2" : ""}`}
                >
                    <Filter className="size-3.5 shrink-0" />
                    <span className="text-xs font-semibold">
                        {hasFilter ? appliedLabel() ?? "Filtrado" : "Filtro académico"}
                    </span>
                    {hasFilter ? (
                        <Badge
                            variant="secondary"
                            className="ml-1 h-4 w-4 p-0 flex items-center justify-center rounded-full text-[9px] bg-white/20 text-inherit cursor-pointer hover:bg-white/30"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                        >
                            <X className="size-2.5" />
                        </Badge>
                    ) : (
                        <ChevronDown className="size-3.5 text-muted-foreground" />
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="start"
                className="w-80 p-4 space-y-4"
                onCloseAutoFocus={(e) => e.preventDefault()}
            >
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Filtro académico</p>
                        <p className="text-[10px] text-muted-foreground/70 mt-0.5">Selecciona hasta nivel sección</p>
                    </div>
                    {(facultyId || schoolId || sectionId) && (
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] text-muted-foreground" onClick={handleClear}>
                            Limpiar
                        </Button>
                    )}
                </div>

                {/* Selects */}
                <div className="space-y-3">
                    {/* Facultad */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Facultad</label>
                        <Select
                            value={facultyId}
                            onValueChange={(v) => {
                                setFacultyId(v);
                                setSchoolId("");
                                setSectionId("");
                            }}
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Seleccionar facultad..." />
                            </SelectTrigger>
                            <SelectContent>
                                {faculties.map(f => (
                                    <SelectItem key={f.id} value={f.id.toString()} className="text-xs">
                                        {f.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Escuela */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Escuela</label>
                        <Select
                            value={schoolId}
                            disabled={!facultyId}
                            onValueChange={(v) => {
                                setSchoolId(v);
                                setSectionId("");
                            }}
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder={!facultyId ? "Primero selecciona facultad" : "Seleccionar escuela..."} />
                            </SelectTrigger>
                            <SelectContent>
                                {selectedFaculty?.schools.map(s => (
                                    <SelectItem key={s.id} value={s.id.toString()} className="text-xs">
                                        {s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Sección */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sección</label>
                        <Select
                            value={sectionId}
                            disabled={!schoolId}
                            onValueChange={setSectionId}
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder={!schoolId ? "Primero selecciona escuela" : "Seleccionar sección..."} />
                            </SelectTrigger>
                            <SelectContent>
                                {selectedSchool?.sections.map(sec => (
                                    <SelectItem key={sec.id} value={sec.id.toString()} className="text-xs">
                                        {sec.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1 border-t">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs h-8"
                        onClick={() => setOpen(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        size="sm"
                        className="flex-1 text-xs h-8 font-bold"
                        onClick={handleFilter}
                        disabled={!facultyId || isLoading}
                    >
                        {isLoading ? "Filtrando..." : "Aplicar filtro"}
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

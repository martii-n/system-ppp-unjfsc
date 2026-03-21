import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { useFormContext, useWatch } from "react-hook-form";

export function AcademicSelectorRHF({
    roleId,
    faculties,
    schools,
    sections,
}: any) {

    const { control, setValue } = useFormContext();

    const isSubadmin = roleId === "2";

    const facultyId = useWatch({ control, name: "faculty_id" });
    const schoolId = useWatch({ control, name: "school_id" });

    const facultyIdNum =
        facultyId && facultyId !== "" ? Number(facultyId) : null;

    const schoolIdNum =
        schoolId && schoolId !== "" ? Number(schoolId) : null;

    const filteredSchools = facultyIdNum
        ? schools.filter((s: any) => s.faculty_id === facultyIdNum)
        : [];

    const filteredSections = schoolIdNum
        ? sections.filter((s: any) => s.school_id === schoolIdNum)
        : [];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

            {/* Facultad */}
            <FormField
                control={control}
                name="faculty_id"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Facultad</FormLabel>
                        <Select
                            onValueChange={(v) => {
                                field.onChange(v);
                                setValue("school_id", "");
                                setValue("section_id", "");
                            }}
                            value={field.value}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {faculties.map((f: any) => (
                                    <SelectItem key={f.id} value={f.id.toString()}>
                                        {f.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {!isSubadmin && (
                <FormField
                    control={control}
                    name="school_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Escuela</FormLabel>
                            <Select
                                onValueChange={(v) => {
                                    field.onChange(v);
                                    setValue("section_id", "");
                                }}
                                value={field.value}
                                disabled={!facultyId}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {filteredSchools.map((s: any) => (
                                        <SelectItem key={s.id} value={s.id.toString()}>
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            {!isSubadmin && (
                <FormField
                    control={control}
                    name="section_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Sección</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={!schoolId}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {filteredSections.map((s: any) => (
                                        <SelectItem key={s.id} value={s.id.toString()}>
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

        </div>
    );
}
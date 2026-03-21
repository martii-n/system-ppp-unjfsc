import { z } from "zod";
import { academicSchema } from "@/pages/academic/user/register/components/AcademicSelector/academic.schema";

export const personInitSchema = z.object({
    role_id: z.string().min(1, "El rol es obligatorio"),
    email: z.email("Email inválido"),
})
    .extend(academicSchema.shape)
    .superRefine((data, ctx) => {

        const isSubadmin = data.role_id === "2"; // 👈 ajusta tu ID real

        if (!isSubadmin) {
            if (!data.school_id) {
                ctx.addIssue({
                    path: ["school_id"],
                    code: "custom",
                    message: "Seleccione una escuela",
                });
            }
            if (!data.section_id) {
                ctx.addIssue({
                    path: ["section_id"],
                    code: "custom",
                    message: "Seleccione una sección",
                });
            }
        }
    });

export type PersonInitValues = z.infer<typeof personInitSchema>;
import Heading from "@/components/heading";
import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Placement } from "./placement";
import { InternshipWorkflow } from "./internship";
import { BreadcrumbItem } from "@/types";

export default function InternshipSubmission({
    assignment,
    requirements,
    workflow_steps = [],
    current_step = 1,
    step_requirements = [],
}: {
    assignment: any;
    requirements: any[];
    workflow_steps: any[];
    current_step: number;
    step_requirements: any[];
}) {
    const hasPlacement = !!assignment?.placement;

    // El estudiante solo pasa a la Etapa 2 si la data Y todos los archivos están aprobados
    const isApproved = hasPlacement &&
        assignment?.placement?.approval_status === 1 &&
        (requirements.length > 0 && requirements.every(r => r.status === 1));

    const internship = assignment?.internship;

    const [selection, setSelection] = useState({
        type: assignment?.placement?.internship_type || '',
        origin: assignment?.placement?.origin_type || ''
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Prácticas Pre-Profesionales', href: '/internship' },
    ];

    if (!hasPlacement) {
        breadcrumbs.push({ title: 'Formalización de Prácticas', href: '/internship' });
    }

    // Mapeo de etiquetas para breadcrumbs
    const labels: Record<string, string> = {
        desarrollo: 'Desarrollo',
        convalidacion: 'Convalidación',
        direct: 'Directo',
        application: 'Postulación'
    };

    if (selection.type) {
        breadcrumbs.push({ title: labels[selection.type] || selection.type, href: '#' });
    }
    if (selection.origin) {
        breadcrumbs.push({ title: labels[selection.origin] || selection.origin, href: '#' });
    }

    // Si ya tiene internship aprovado por completo o activo, entrar al workflow
    if (hasPlacement && isApproved) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Prácticas" />
                <div className="flex h-full flex-1 flex-col gap-8 p-8">
                    <div className="flex items-center justify-between">
                        <Heading
                            variant="small"
                            title="Seguimiento de Prácticas"
                            description="Registro de documentos y evaluaciones conforme avancen sus prácticas."
                        />
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                            Convenio con: {assignment.placement.company?.name}
                        </Badge>
                    </div>

                    {/* Aqui el componente de etapas de Internship (Work-in-progress) */}
                    <InternshipWorkflow
                        assignment={assignment}
                        internship={internship}
                        workflowSteps={workflow_steps}
                        currentStep={current_step}
                        stepRequirements={step_requirements}
                    />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Prácticas" />
            <div className="flex h-full flex-1 flex-col gap-8 p-8">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <Heading
                        variant="small"
                        title="Prácticas Pre-Profesionales"
                        description="Gestión integral de su proceso de prácticas."
                    />
                </div>

                {!isApproved && (
                    <Placement
                        currentPlacement={assignment?.placement}
                        initialRequirements={requirements}
                        breadcrumbs={breadcrumbs}
                        onTypeChange={(val: string) => setSelection(prev => ({
                            ...prev,
                            type: val,
                            origin: val === 'convalidacion' ? '' : prev.origin
                        }))}
                        onOriginChange={(val: string) => setSelection(prev => ({ ...prev, origin: val }))}
                    />
                )}
            </div>
        </AppLayout>
    );
}
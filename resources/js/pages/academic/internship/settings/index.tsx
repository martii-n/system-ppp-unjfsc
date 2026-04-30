import AppLayout from "@/layouts/app-layout";
import { Head, router, usePage } from "@inertiajs/react";
import { useEffect } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { toast } from "sonner";

import { useWorkflow } from "./useWorkflow";
import { buildDragEndHandler, RestrictToVerticalAxis } from "./useDragSort";
import { BuilderCard } from "./components/BuilderCard";
import { EvaluationCard } from "./components/EvaluationCard";
import { StepperPreview } from "./components/StepperPreview";
import { JsonPreview } from "./components/JsonPreview";
import { AcademicFilter, AcademicFilterValues } from "@/components/academic/academic-filter";
import { Button } from "@/components/ui/button";
import { Plus, Save, GitMerge } from "lucide-react";
import Heading from "@/components/heading";
import internship from "@/routes/academic/internship";

// ─── Plantilla por defecto para secciones sin configuración ──────────────────
const createDefaultWorkflow = () => [
    {
        id: crypto.randomUUID(),
        step: 1,
        name: "Planeamiento",
        is_evaluation: false,
        required_docs: { desarrollo: [], convalidacion: [] },
    },
    {
        id: crypto.randomUUID(),
        step: 2,
        name: "Supervisión Intermedia",
        is_evaluation: false,
        required_docs: { desarrollo: [], convalidacion: [] },
    },
    {
        id: crypto.randomUUID(),
        step: 3,
        name: "Evaluación Final",
        is_evaluation: true,
        required_docs: { desarrollo: [], convalidacion: [] },
    },
];

// ─── Página ───────────────────────────────────────────────────────────────────
export default function InternshipSettingsIndex({
    faculties,
    setting,
    currentSectionId,
    availableDocuments = [],
}: any) {
    const { role } = usePage().props as any;
    const {
        workflow,
        initializeWorkflow,
        addStage,
        updateStageName,
        deleteStage,
        addRequirement,
        removeRequirement,
        reorderStage,
        reorderRequirement,
    } = useWorkflow([]);

    // Hidrata desde el backend cada vez que cambia la sección seleccionada
    useEffect(() => {
        if (!currentSectionId) {
            initializeWorkflow([]);
            return;
        }
        initializeWorkflow(
            setting?.workflow_schema?.length > 0
                ? setting.workflow_schema
                : createDefaultWorkflow()
        );
    }, [setting, currentSectionId]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleFilter = (values: AcademicFilterValues) => {
        router.get(
            window.location.pathname,
            values.section_id ? { section_id: values.section_id } : {}
        );
    };

    const handleSave = () => {
        if (!currentSectionId) return;
        router.put(
            internship.settings.update().url,
            { section_id: currentSectionId, workflow_schema: workflow as any },
            { onError: (errors) => toast.error(String(Object.values(errors)[0])) }
        );
    };

    // Handler DnD: delegado completamente a useDragSort (sin detalle de lib aquí)
    const handleDragEnd = buildDragEndHandler({
        onReorderStage: reorderStage,
        onReorderRequirement: reorderRequirement,
    });

    // Separar etapas normales de la etapa de evaluación final
    const regularStages = workflow.filter((s: any) => !s.is_evaluation);
    const evaluationStage = workflow.find((s: any) => s.is_evaluation);

    // ── Render ────────────────────────────────────────────────────────────────
    const breadcrumbs = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Configuración de Prácticas", href: "#" },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración de Prácticas" />

            <div className="flex flex-col flex-1 min-h-screen p-4 md:p-6 lg:p-8 gap-6">

                <Heading
                    variant="small"
                    title="Configuración de Flujo"
                    description="Define las etapas y requisitos documentales dinámicamente por sección."
                />

                {/* Filtro de sección + botones de acción */}
                <div className="flex justify-between sm:flex-row gap-3 items-center">
                    {role !== 3 && (
                        <AcademicFilter faculties={faculties || []} onFilter={handleFilter} />
                    )}
                    {currentSectionId && (
                        <div className={`flex gap-2 ${role === 3 ? 'ml-auto' : ''}`}>
                            <Button onClick={addStage} variant="secondary" className="gap-2 shrink-0">
                                <Plus className="w-4 h-4" /> Nueva Etapa
                            </Button>
                            <Button onClick={handleSave} className="gap-2 shrink-0">
                                <Save className="w-4 h-4" /> Guardar
                            </Button>
                        </div>
                    )}
                </div>

                {/* Contenido principal */}
                {!currentSectionId ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 bg-slate-50 border border-slate-100 rounded-lg">
                        <GitMerge className="w-12 h-12 text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-700">Ninguna sección seleccionada</h3>
                        <p className="max-w-md text-sm mt-2">
                            Usa el filtro para elegir la Facultad, Escuela y Sección.
                            Al hacerlo, se cargará su configuración de prácticas.
                        </p>
                    </div>
                ) : (
                    <DragDropProvider modifiers={[RestrictToVerticalAxis]} onDragEnd={handleDragEnd}>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                            {/* Panel Builder (izquierda) */}
                            <div className="lg:col-span-7 space-y-4">
                                {/* Etapas normales — arrastables */}
                                {regularStages.map((stage: any) => (
                                    <BuilderCard
                                        key={stage.id}
                                        stage={stage}
                                        onUpdateName={updateStageName}
                                        onDelete={deleteStage}
                                        onAddRequirement={addRequirement}
                                        onRemoveRequirement={removeRequirement}
                                        availableDocuments={availableDocuments}
                                    />
                                ))}
                                {/* Etapa de evaluación — fija, fuera del DnD scope */}
                                {evaluationStage && (
                                    <EvaluationCard stage={evaluationStage} />
                                )}
                            </div>

                            {/* Panel Preview (derecha) */}
                            <div className="lg:col-span-5">
                                <div className="sticky top-8 space-y-6">
                                    <StepperPreview workflow={workflow} />
                                    <JsonPreview workflow={workflow} />
                                </div>
                            </div>

                        </div>
                    </DragDropProvider>
                )}
            </div>
        </AppLayout>
    );
}
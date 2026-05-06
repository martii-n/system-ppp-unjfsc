import { Head } from '@inertiajs/react';
import { Info } from 'lucide-react';
import { useState } from 'react';
import { Stepper } from '@/components/general/stepper';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
// Hook
import { useInternshipSubmission } from './hooks/use-internship-submission';
// Components
import { SubmissionPanel } from '../../../../components/academic/submission-panel';
import { DocumentViewerPanel } from './parts/DocumentViewerPanel';
import { EvaluationView } from './parts/EvaluationView';
import { RequirementListPanel } from './parts/RequirementListPanel';

interface InternshipIndexProps {
    data: {
        assignment: any;
        internship: any;
        steps: any[];
        currentStep: number;
        requirements: any[];
    };
}

export default function InternshipIndex({ data }: InternshipIndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Prácticas Pre-Profesionales', href: '/internship' },
    ];

    const [previewEnabled, setPreviewEnabled] = useState(false);

    const {
        viewStep,
        selectedReqIndex,
        setSelectedReqIndex,
        activeTab,
        setActiveTab,
        isEditing,
        setIsEditing,
        tempFile,
        previewUrl,
        uploading,
        currentRequirement,
        requirements,
        handleStepClick,
        onFileUpload,
        removeTempFile,
        submitDocument,
        isViewingPastStep,
    } = useInternshipSubmission({
        initialData: data,
        internshipId: data.internship?.id,
    });

    const isEvalStage =
        data.steps.find((s: any) => s.id === viewStep)?.is_evaluation ?? false;

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
                    <Badge
                        variant="outline"
                        className="border-green-200 bg-green-100 text-green-700"
                    >
                        Convenio con:{' '}
                        {data.assignment?.placement?.company?.name || '---'}
                    </Badge>
                </div>

                <div className="flex flex-col gap-6">
                    <Stepper
                        currentStep={data.currentStep}
                        steps={data.steps}
                        onStepClick={handleStepClick}
                    />

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className="border-primary/20 bg-primary/5 font-bold text-primary"
                            >
                                {data.steps.find((s: any) => s.id === viewStep)
                                    ?.label || `Etapa ${viewStep}`}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                                Etapa {viewStep} de {data.steps.length}
                            </span>
                            {isViewingPastStep && (
                                <Badge
                                    variant="outline"
                                    className="ml-2 animate-pulse border-amber-200 bg-amber-50 text-amber-700"
                                >
                                    Modo Visualización
                                </Badge>
                            )}
                        </div>
                        {!isEvalStage && (
                            <span className="text-sm font-medium text-muted-foreground">
                                {
                                    requirements.filter(
                                        (r: any) => r.status === 1,
                                    ).length
                                }{' '}
                                / {requirements.length} Aprobados
                            </span>
                        )}
                    </div>

                    {isEvalStage ? (
                        <EvaluationView internship={data.internship} />
                    ) : requirements.length > 0 ? (
                        <div className="flex flex-col items-start gap-6 lg:flex-row">
                            <RequirementListPanel
                                requirements={requirements}
                                selectedType={selectedReqIndex}
                                onSelectType={setSelectedReqIndex}
                                previewEnabled={previewEnabled}
                                onTogglePreview={() =>
                                    setPreviewEnabled(!previewEnabled)
                                }
                            />

                            <DocumentViewerPanel
                                currentRequirement={currentRequirement}
                                tempFile={tempFile}
                                previewUrl={previewUrl}
                                uploading={uploading}
                                canUpload={
                                    !isViewingPastStep &&
                                    (!currentRequirement?.latest ||
                                        isEditing) &&
                                    !tempFile
                                }
                                onUpload={onFileUpload}
                                previewEnabled={previewEnabled}
                            />

                            <SubmissionPanel
                                currentRequirement={currentRequirement}
                                tempFile={tempFile}
                                isEditing={isEditing}
                                onSetEditing={setIsEditing}
                                onRemoveTemp={removeTempFile}
                                uploading={uploading}
                                onSubmit={submitDocument}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-12 text-muted-foreground">
                            <Info className="size-8 opacity-30" />
                            <p className="text-sm">
                                No hay documentos configurados para esta etapa.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

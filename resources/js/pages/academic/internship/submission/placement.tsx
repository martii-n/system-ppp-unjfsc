import { Stepper } from "@/components/general/stepper";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Type } from "./stteps-placement/type";
import { Details } from "./stteps-placement/details";
import { Files } from "./stteps-placement/files";
import { Badge } from "@/components/ui/badge";
import { router, useForm as useInertiaForm } from "@inertiajs/react";
import { toast } from "sonner";
import internship from "@/routes/academic/internship";
import { BreadcrumbItem } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stepDetailsSchema } from "./stteps-placement/detail.schema";
import { Form } from "@/components/ui/form";

const steps = [
    { id: 1, label: 'Tipo' },
    { id: 2, label: 'Detalles' },
    { id: 3, label: 'Archivos' },
];

export function Placement({
    currentPlacement,
    initialRequirements = [],
    breadcrumbs,
    onTypeChange,
    onOriginChange
}: {
    currentPlacement?: any,
    initialRequirements?: any[],
    breadcrumbs: BreadcrumbItem[],
    onTypeChange: (val: string) => void,
    onOriginChange: (val: string) => void
}) {
    const [step, setStep] = useState(currentPlacement ? 2 : 1);
    const [submitting, setSubmitting] = useState(false);

    // Inertia form for final submission
    const inertiaForm = useInertiaForm({
        internship_type: currentPlacement?.internship_type || 'desarrollo',
        origin: currentPlacement?.origin_type || '',
        company: {
            id: currentPlacement?.company?.id || null,
            ruc: currentPlacement?.company?.ruc || '',
            name: currentPlacement?.company?.name || '',
            address: currentPlacement?.company?.address || '',
            phone: currentPlacement?.company?.phone || '',
            email: currentPlacement?.company?.email || ''
        },
        placement: {
            staff_id: currentPlacement?.staff?.id || null,
            staff_name: currentPlacement?.boss_name || '',
            staff_position: currentPlacement?.boss_position || '',
            staff_phone: currentPlacement?.boss_phone || '',
            staff_email: currentPlacement?.boss_email || '',
            area_id: currentPlacement?.area?.id || null,
            area_name: currentPlacement?.area?.name || '',
            position: currentPlacement?.position || '',
            description: currentPlacement?.description || '',
            start_date: currentPlacement?.start_date || '',
            end_date: currentPlacement?.end_date || ''
        },
        files: {
            fut: null as File | null,
            carta_presentacion: null as File | null,
            carta_aceptacion: null as File | null,
        }
    });

    const { data, setData, errors: inertiaErrors, clearErrors } = inertiaForm;

    // React Hook Form for validation in the wizard
    const form = useForm({
        resolver: zodResolver(stepDetailsSchema),
        defaultValues: {
            company: data.company,
            placement: data.placement
        },
        mode: "onChange"
    });

    // Sync Type and Origin to breadcrumbs on mount
    useEffect(() => {
        onTypeChange(data.internship_type);
        if (data.origin) onOriginChange(data.origin);
    }, []);

    const handleNext = async () => {
        if (step === 1) {
            // Validación temporal manual para el paso 1 hasta que tenga su propio schema
            if (data.internship_type === 'desarrollo' && !data.origin) {
                toast.error("Debe seleccionar un origen para las prácticas.");
                return;
            }
            setStep(step + 1);
        } else if (step === 2) {
            // Validar campos de Detalles usando Shadcn Form / Zod
            const isValid = await form.trigger();
            if (!isValid) {
                toast.error("Por favor, complete correctamente todos los campos obligatorios.");
                return;
            }
            // Sincronizar datos validados al form de Inertia
            const detailsData = form.getValues();
            setData(prev => ({
                ...prev,
                company: { ...prev.company, ...detailsData.company },
                placement: { ...prev.placement, ...detailsData.placement }
            }));
            setStep(step + 1);
        } else {
            setStep(step + 1);
        }
    };

    const handleSubmit = () => {
        clearErrors();

        const formData = new FormData();
        formData.append('internship_type', data.internship_type);
        formData.append('origin', data.origin);

        // company
        Object.entries(data.company).forEach(([k, v]) => {
            if (v !== null) formData.append(`company[${k}]`, String(v));
        });

        // placement
        Object.entries(data.placement).forEach(([k, v]) => {
            if (v) formData.append(`placement[${k}]`, v);
        });

        // files
        if (data.files.fut) formData.append('files[fut]', data.files.fut);
        if (data.files.carta_presentacion) formData.append('files[carta_presentacion]', data.files.carta_presentacion);
        if (data.files.carta_aceptacion) formData.append('files[carta_aceptacion]', data.files.carta_aceptacion);

        const url = internship.placements.store.url();
        router.post(url, formData, {
            onBefore: () => setSubmitting(true),
            onFinish: () => setSubmitting(false),
            onSuccess: () => {
                // Toast gestionado por ExceptionHandler (flash del backend)
            },
            onError: (errs: any) => {
                console.error('[Placement] Errores de validación:', errs);
                setStep(2); // Volver al paso de detalles para corrección
            }
        });
    };

    return (
        <Form {...form}>
            <div className="flex flex-col gap-4">
                <Stepper currentStep={step} steps={steps} />
                <div className="flex-1 border border-input rounded-lg p-4">
                    <Badge className="text-xs bg-blue-500 text-white mb-4">
                        Proceso de formalización de prácticas
                    </Badge>

                    {step === 1 && (
                        <Type
                            type={data.internship_type}
                            setType={(val) => {
                                setData(d => ({ ...d, internship_type: val, origin: val === 'convalidacion' ? '' : d.origin }));
                                onTypeChange(val);
                            }}
                            origin={data.origin}
                            setOrigin={(val) => {
                                setData('origin', val);
                                onOriginChange(val);
                            }}
                            disabled={!!currentPlacement}
                        />
                    )}

                    {step === 2 && (
                        <Details
                            data={data}
                            setData={setData}
                            errors={inertiaErrors}
                            currentPlacement={currentPlacement}
                            form={form} // Pasar el form para consistencia si se desea
                        />
                    )}

                    {step === 3 && (
                        <Files
                            data={data}
                            setData={setData}
                            currentPlacement={currentPlacement}
                            initialRequirements={initialRequirements}
                        />
                    )}
                </div>

                <div className="flex justify-between gap-2 mt-4">
                    <Button
                        variant="outline"
                        onClick={() => setStep(step - 1)}
                        disabled={step === 1 || submitting}
                    >
                        Anterior
                    </Button>

                    {(!currentPlacement || step < steps.length) && (
                        <Button
                            variant="default"
                            onClick={() => {
                                if (step === steps.length) {
                                    handleSubmit();
                                } else {
                                    handleNext();
                                }
                            }}
                            disabled={submitting}
                        >
                            {submitting
                                ? 'Enviando...'
                                : (step === steps.length && !currentPlacement) ? 'Finalizar Registro' : 'Siguiente'}
                        </Button>
                    )}
                </div>
            </div>
        </Form>
    );
}

function Review({ data, errors }: { data: any, errors: any }) {
    return (
        <div className="p-8 space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-bold">Resumen de Formalización</h2>
            <p className="text-muted-foreground">Por favor revise la información antes de enviar.</p>

            {Object.keys(errors).length > 0 && (
                <div className="border border-red-300 bg-red-50 rounded-lg p-4 text-sm text-red-700 space-y-1">
                    <p className="font-semibold mb-2">⚠ Se encontraron errores en el formulario:</p>
                    {Object.entries(errors).map(([field, msg]) => (
                        <p key={field}><strong>{field}:</strong> {String(msg)}</p>
                    ))}
                </div>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm mt-4 border rounded-lg p-4 bg-muted/20">
                <div><strong>Tipo:</strong> <span className="capitalize">{data.internship_type}</span></div>
                {data.origin && <div><strong>Origen:</strong> <span className="capitalize">{data.origin}</span></div>}
                <div className="col-span-2 border-t pt-3 mt-1">
                    <strong>Empresa:</strong> {data.company.name || '—'} {data.company.ruc && `(RUC: ${data.company.ruc})`}
                </div>
                <div><strong>Jefe Inmediato:</strong> {data.placement.staff_name || '—'}</div>
                <div><strong>Cargo Practicante:</strong> {data.placement.position || '—'}</div>
                <div><strong>Área:</strong> {data.placement.area_name || '—'}</div>
                <div><strong>Inicio:</strong> {data.placement.start_date || '—'}</div>
            </div>

            <div className="mt-4 border-t pt-4">
                <h3 className="font-semibold mb-3 text-sm">Archivos adjuntos:</h3>
                <ul className="space-y-2 text-sm">
                    <li className={`flex items-center gap-2 ${data.files.fut ? 'text-green-600' : 'text-amber-500'}`}>
                        <span>{data.files.fut ? '✓' : '✗'}</span>
                        <span>FUT {data.files.fut ? `— ${data.files.fut.name}` : '(no adjuntado)'}</span>
                    </li>
                    <li className={`flex items-center gap-2 ${data.files.carta_presentacion ? 'text-green-600' : 'text-muted-foreground'}`}>
                        <span>{data.files.carta_presentacion ? '✓' : '–'}</span>
                        <span>Carta de Presentación {data.files.carta_presentacion ? `— ${data.files.carta_presentacion.name}` : '(no adjuntada)'}</span>
                    </li>
                    <li className={`flex items-center gap-2 ${data.files.carta_aceptacion ? 'text-green-600' : 'text-muted-foreground'}`}>
                        <span>{data.files.carta_aceptacion ? '✓' : '–'}</span>
                        <span>Carta de Aceptación {data.files.carta_aceptacion ? `— ${data.files.carta_aceptacion.name}` : '(no adjuntada)'}</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
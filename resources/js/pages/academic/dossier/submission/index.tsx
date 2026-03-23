import React, { useEffect, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import Heading from '@/components/heading';
import {
    FileText,
    UploadCloud,
    Maximize2,
    RotateCcw,
    Trash2,
    Clock,
    ArrowRight,
    ShieldCheck,
    FileCheck,
    Eye,
    History,
    FileUp,
    AlertCircle,
    CheckCircle2,
    Download,
    FileDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import DocumentViewer from './components/DocumentViewer';
import FileDetailsContent from './components/FileDetailsContent';
import FileHistory from './components/FileHistory';

import dossiers from '@/routes/dossiers';
import { toast } from 'sonner';
import RequirementsList from '@/components/dossier/requirements-list';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Documentación',
        href: dossiers.submission.toString(),
    },
];

export default function MyDossier({ assignment, requirements, dossier }: any) {
    const [selectedType, setSelectedType] = useState(0);
    const [previewEnabled, setPreviewEnabled] = useState(false);
    const [activeTab, setActiveTab] = useState('estado');
    const [isEditing, setIsEditing] = useState(false);
    const [tempFile, setTempFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const getIcon = (code: string) => {
        const icons: Record<string, any> = {
            horario: Clock,
            carga_lectiva: FileText,
            resolucion: ShieldCheck,
            ficha: FileCheck,
            record: FileText,
        }
        return icons[code] || FileText;
    }

    const currentFile = requirements[selectedType];

    console.log(currentFile.latest?.path);

    const { data, setData, post, processing, transform } = useForm({
        file: null as File | null,
        code: '',
        target_id: dossier,
    });
    // FUNCIÓN: Maneja la previsualización local antes de subir
    const onUpload = (file: File) => {
        setTempFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    // Limpiar estados cuando cambiamos de archivo a la izquierda
    useEffect(() => {
        setIsEditing(false);
        setTempFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    }, [selectedType]);

    // Lógica para decidir si mostrar UploadZone o Preview
    const canUpload = (!currentFile?.latest && !tempFile) || isEditing;

    //const requirements = getRequirements(assignment?.role_id);
    //const currentFile = requirements[selectedType];

    /*const handleSubmit = () => {
        const payload = {
            file: tempFile,
            code: currentFile.code,
            target_id: dossier,
        }
        post(dossiers.document.store.url, payload);
    }*/

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!tempFile) {
            toast.error('Por favor, selecciona un archivo antes de enviar.');
            return;
        }

        // Aseguramos que el código y el target_id estén actualizados en el payload
        transform((data) => ({
            ...data,
            code: currentFile.code,
            file: tempFile
        }));

        post(dossiers.document.store().url, {
            onSuccess: () => {
                setTempFile(null);
                setPreviewUrl(null);
                setIsEditing(false);
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0] as string;
                toast.error(firstError || 'Error al procesar la solicitud');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Documentación" />

            {/* Fondo gris de toda la app (Lienzo infinito) */}
            <div className="flex flex-col flex-1 min-h-screen p-4 md:p-6 lg:p-8 gap-6">

                {/* Header Superior Libre */}
                <div className="flex items-end justify-between">
                    <Heading
                        variant="small"
                        title="Validación de Documentos"
                        description="Gestione y valide los archivos requeridos para su expediente."
                    />
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-sm font-medium">
                            {requirements.filter((r: any) => r.status === 1).length} / {requirements.length} Listos
                        </span>
                        <p className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors mt-0.5">Ver detalles</p>
                    </div>
                </div>

                {/* Contenedor Principal (Flex Row) */}
                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    {/* 1. PANEL IZQUIERDO (Navegación Vertical) */}
                    <div className="w-full lg:w-64 xl:w-72 flex flex-col gap-6 shrink-0">
                        {/* Tarjeta de Requisitos usando componentes base Shadcn (Card) */}
                        <RequirementsList
                            requirements={requirements || []}
                            selectedType={selectedType}
                            onSelectType={setSelectedType}
                            previewEnabled={previewEnabled}
                            onTogglePreview={() => setPreviewEnabled(!previewEnabled)}
                        />

                        {/* Plantilla Disponible Card */}
                        {currentFile?.hasTemplate && (
                            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                                <div className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                                    <h3 className="font-semibold tracking-tight text-sm">Plantilla Disponible</h3>
                                    <FileDown className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="p-4 pt-0">
                                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                                        Descarga el formato oficial, complétalo y súbelo.
                                    </p>
                                    <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 w-full shadow-sm">
                                        <Download className="mr-2 h-3.5 w-3.5" />
                                        Descargar formato
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Alerta de Ayuda estilo Shadcn Alert */}
                        <div className="relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground bg-background text-foreground">
                            <AlertCircle className="h-4 w-4" />
                            <h5 className="mb-1 font-medium leading-none tracking-tight">¿Necesitas ayuda?</h5>
                            <div className="text-sm [&_p]:leading-relaxed text-muted-foreground">
                                Asegúrate de subir archivos PDF menores a 10MB.
                            </div>
                        </div>
                    </div>

                    {/* 2. PANEL CENTRAL (Visor del Documento) */}
                    <div className="flex-1 w-full rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col min-h-[600px] overflow-hidden relative">

                        {/* Loader opcional de Inertia mientras sube */}
                        {processing && (
                            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-2">
                                    <Spinner className="animate-spin text-primary" />
                                    <span className="text-xs font-medium">Subiendo documento...</span>
                                </div>
                            </div>
                        )}

                        {/* Header del Card (Dinamizado y Compacto) */}
                        <div className="flex flex-row items-center justify-between h-[68px] px-6 border-b bg-white/50 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                {/* Ícono más pequeño y sutil */}
                                <div className={`flex h-8 w-8 items-center justify-center rounded-md border ${tempFile || currentFile?.latest ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'
                                    }`}>
                                    <FileText className={`size-4 ${tempFile || currentFile?.latest ? 'text-primary' : 'text-muted-foreground'}`} />
                                </div>

                                <div className="flex flex-col">
                                    <h3 className="text-sm font-semibold leading-none tracking-tight">
                                        {currentFile?.title}
                                    </h3>
                                    <p className="text-[11px] text-muted-foreground mt-1">
                                        {tempFile ? 'Archivo listo para subir' : currentFile?.latest ? 'Cargado correctamente' : 'Subida pendiente'}
                                    </p>
                                </div>
                            </div>

                            {/* Acciones reducidas a botones compactos */}
                            <div className="flex items-center gap-2">
                                {(tempFile || currentFile?.latest) && (
                                    <Button variant="ghost" size="sm" className="h-8 text-xs px-2.5">
                                        <Maximize2 className="size-3.5 mr-2 text-muted-foreground" />
                                        Expandir
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* CONTENIDO PRINCIPAL: Orquestador */}
                        <DocumentViewer
                            currentFile={{
                                ...currentFile,
                                latest: tempFile ? { ...tempFile, path: previewUrl, name: tempFile.name } : currentFile?.latest
                            }}
                            canUpload={canUpload}
                            onUpload={onUpload}
                            previewEnabled={previewEnabled}
                        />

                    </div>


                    {/* 3. PANEL DERECHO (Detalles y Acciones) */}
                    <div className="w-full xl:w-80 lg:w-72 flex flex-col gap-6 shrink-0">

                        {/* Shadcn Tabs Card */}
                        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                            <div className="h-[68px] flex items-center px-4 border-b">
                                {/* Componente TabsList imitado */}
                                <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-full">
                                    <button
                                        onClick={() => setActiveTab('estado')}
                                        className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-1/2 ${activeTab === 'estado' ? 'bg-background text-foreground shadow-sm' : 'hover:text-foreground'
                                            }`}
                                    >
                                        Detalles
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('historial')}
                                        className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-1/2 ${activeTab === 'historial' ? 'bg-background text-foreground shadow-sm' : 'hover:text-foreground'
                                            }`}
                                    >
                                        Historial
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 space-y-6">
                                {activeTab === 'estado' ? (
                                    <>
                                        <FileDetailsContent
                                            currentFile={currentFile}
                                            tempFile={tempFile}
                                            isEditing={isEditing}
                                            onSetEditing={setIsEditing}
                                            onRemoveTemp={setTempFile}
                                        />
                                    </>
                                ) : (
                                    <FileHistory history={currentFile?.history} />
                                )}
                            </div>
                        </div>
                        {(tempFile || isEditing) && (
                            <div className="flex flex-col gap-3 p-4 border-t">
                                <Button
                                    onClick={() => handleSubmit()}
                                    disabled={processing || !tempFile}
                                    className="w-full h-10 shadow-lg"
                                >
                                    {processing ? (
                                        <>
                                            <Spinner className="mr-2 size-4 animate-spin" />
                                            Subiendo archivo...
                                        </>
                                    ) : (
                                        <>
                                            Enviar para Revisión
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                                <p className="text-[11px] text-center text-muted-foreground leading-relaxed px-4">
                                    Al confirmar, tu expediente será encolado para evaluación académica.
                                </p>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Mi Dossier',
        href: '/dossier',
    },
];

export default function MyDossier({ assignment, dossier }: any) {
    const [selectedType, setSelectedType] = useState(0);
    const [previewEnabled, setPreviewEnabled] = useState(true);
    const [activeTab, setActiveTab] = useState('estado');

    const getRequirements = (roleId?: number) => {
        const base = [
            { id: 1, title: 'Ficha de Matrícula', code: 'ficha', icon: FileCheck, optional: false, status: 'pending', hasTemplate: true },
            { id: 2, title: 'Récord Académico', code: 'record', icon: FileText, optional: false, status: 'uploaded' },
        ];

        switch (roleId) {
            case 3: // Teacher
                return [
                    { id: 1, title: 'Horario de Clases', code: 'horario', icon: Clock, optional: false, status: 'pending' },
                    { id: 2, title: 'Carga Lectiva', code: 'carga_lectiva', icon: FileText, optional: false, status: 'pending', hasTemplate: true },
                ];
            case 4: // Supervisor
                return [
                    { id: 1, title: 'Horario', code: 'horario', icon: Clock, optional: false, status: 'pending' },
                    { id: 2, title: 'Carga Lectiva', code: 'carga_lectiva', icon: FileText, optional: false, status: 'pending', hasTemplate: true },
                    { id: 3, title: 'Resolución de Designación', code: 'resolucion_designacion', icon: ShieldCheck, optional: false, status: 'pending' },
                ];
            default:
                return [...base, { id: 3, title: 'Certificado Médico', code: 'medico', icon: ShieldCheck, optional: true, status: 'pending' }];
        }
    };

    const requirements = getRequirements(assignment?.role_id);
    const currentFile = requirements[selectedType];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mi Dossier" />

            {/* Fondo gris de toda la app (Lienzo infinito) */}
            <div className="flex flex-col flex-1 min-h-screen p-4 md:p-6 lg:p-8 gap-6 bg-muted/30">

                {/* Header Superior Libre */}
                <div className="flex items-end justify-between">
                    <Heading
                        variant="small"
                        title="Validación de Documentos"
                        description="Gestione y valide los archivos requeridos para su expediente."
                    />
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-sm font-medium">1 / {requirements.length} Listos</span>
                        <p className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors mt-0.5">Ver detalles</p>
                    </div>
                </div>

                {/* Contenedor Principal (Flex Row) */}
                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    {/* 1. PANEL IZQUIERDO (Navegación Vertical) */}
                    <div className="w-full lg:w-64 xl:w-72 flex flex-col gap-6 shrink-0">
                        {/* Tarjeta de Requisitos usando componentes base Shadcn (Card) */}
                        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                            <div className="flex flex-col space-y-1.5 p-6">
                                <h3 className="font-semibold leading-none tracking-tight">Requisitos</h3>
                                <p className="text-sm text-muted-foreground">Seleccione un tipo de documento</p>
                            </div>
                            <div className="p-6 pt-0 space-y-1">
                                {requirements.map((req, idx) => {
                                    const isActive = selectedType === idx;
                                    return (
                                        <button
                                            key={req.id}
                                            onClick={() => setSelectedType(idx)}
                                            className={`inline-flex items-center justify-between whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-4 py-2 w-full ${isActive
                                                ? 'bg-muted hover:bg-muted text-foreground'
                                                : 'hover:bg-muted/50 hover:text-accent-foreground text-muted-foreground'
                                                }`}
                                        >
                                            <div className="flex items-center">
                                                <req.icon className={`mr-2 h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
                                                <span>{req.title}</span>
                                            </div>
                                            {req.status === 'uploaded' && (
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            )}
                                            {req.optional && req.status !== 'uploaded' && (
                                                <span className="inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold transition-colors bg-secondary text-secondary-foreground uppercase">
                                                    Op
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="p-4 border-t flex items-center justify-between bg-muted/50">
                                <label htmlFor="preview-mode" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                    Previsualización
                                </label>
                                <button
                                    id="preview-mode"
                                    onClick={() => setPreviewEnabled(!previewEnabled)}
                                    className={`peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${previewEnabled ? 'bg-primary' : 'bg-input'
                                        }`}
                                >
                                    <span
                                        className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${previewEnabled ? 'translate-x-4' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>

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
                    <div className="flex-1 w-full rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col min-h-[600px] overflow-hidden">
                        {/* Header del Card (Shadcn CardHeader) */}
                        <div className="flex flex-row items-center justify-between p-6 border-b">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-muted/50">
                                    <FileText className="h-4 w-4 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-semibold leading-none tracking-tight">{currentFile?.title}.pdf</h3>
                                    <p className="text-sm text-muted-foreground">Documento requerido • Visor nativo</p>
                                </div>
                            </div>
                            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
                                <Maximize2 className="h-4 w-4 mr-2" />
                                Expandir
                            </button>
                        </div>

                        {/* Contenido (CardContent) */}
                        <div className="flex-1 p-6 flex items-center justify-center bg-muted/20">
                            {previewEnabled ? (
                                <div className="w-full max-w-2xl bg-background border rounded-lg shadow-sm flex flex-col p-8 md:p-12 gap-6 aspect-[1/1.41] relative">
                                    <div className="space-y-3">
                                        <div className="h-6 rounded-md bg-muted w-3/4" />
                                        <div className="h-3 rounded-md bg-muted/60 w-1/3" />
                                    </div>
                                    <div className="flex-1 mt-6 space-y-4">
                                        <div className="h-3 rounded-md bg-muted/40 w-full" />
                                        <div className="h-3 rounded-md bg-muted/40 w-full" />
                                        <div className="h-3 rounded-md bg-muted/40 w-11/12" />
                                        <div className="h-3 rounded-md bg-muted/40 w-[85%]" />
                                    </div>
                                    <div className="mt-8 pt-6 border-t flex items-end justify-between">
                                        <div className="h-20 w-20 border-2 border-dashed border-border rounded-md flex items-center justify-center text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                                            Sello
                                        </div>
                                        <div className="space-y-2 flex flex-col items-end">
                                            <div className="h-6 rounded-md bg-muted w-24" />
                                            <div className="h-2 rounded-md bg-muted/60 w-16" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full max-w-md">
                                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/60 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <UploadCloud className="h-8 w-8 text-muted-foreground mb-3" />
                                            <p className="mb-1 text-sm font-medium">Haz clic para buscar o arrastra un archivo</p>
                                            <p className="text-xs text-muted-foreground">PDF hasta 10MB</p>
                                        </div>
                                        <input type="file" className="hidden" accept=".pdf" />
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. PANEL DERECHO (Detalles y Acciones) */}
                    <div className="w-full xl:w-80 lg:w-72 flex flex-col gap-6 shrink-0">

                        {/* Shadcn Tabs Card */}
                        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                            <div className="p-4 border-b">
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
                                        {/* Status Info Block */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-semibold">Archivo Cargado</h4>
                                                <span className="inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                                    Procesando
                                                </span>
                                            </div>

                                            <div className="rounded-md border p-3 flex items-start gap-3 bg-muted/40">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-background">
                                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <div className="space-y-1 overflow-hidden">
                                                    <p className="text-sm font-medium leading-none truncate">mi_ficha_oficial_2024.pdf</p>
                                                    <p className="text-xs text-muted-foreground">1.2 MB</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Secondary Actions */}
                                        <div className="flex gap-2">
                                            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 flex-1">
                                                <RotateCcw className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                                                Cambiar
                                            </button>
                                            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent text-destructive hover:text-destructive h-8 px-3 flex-1">
                                                <Trash2 className="mr-2 h-3.5 w-3.5 text-destructive" />
                                                Eliminar
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-4">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="flex gap-3">
                                                <div className="mt-0.5 relative flex flex-col items-center">
                                                    <div className="h-2 w-2 rounded-full bg-destructive" />
                                                    <div className="w-px h-full bg-border" />
                                                </div>
                                                <div className="pb-4">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-semibold text-destructive">Rechazado</span>
                                                        <span className="text-xs text-muted-foreground">Hace 2 días</span>
                                                    </div>
                                                    <p className="text-sm font-medium">archivo_v{i}.pdf</p>
                                                    <p className="text-sm text-muted-foreground mt-1 bg-muted p-2 rounded-md">
                                                        La firma inferior no es legible.
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contenedor Principal de Acción Total */}
                        <div className="flex flex-col gap-3">
                            <Button>
                                Enviar para Revisión
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <p className="text-[11px] text-center text-muted-foreground">
                                Al confirmar, tu expediente será encolado para evaluación académica.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

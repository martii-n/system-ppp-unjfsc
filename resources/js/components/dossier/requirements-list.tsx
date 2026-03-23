import { AlertCircle, CheckCircle2, Clock, FileText, ShieldCheck, FileCheck, Circle } from "lucide-react";

export interface RequirementItem {
    code: string;
    title: string;
    status: number;
    latest?: any;
    [key: string]: any;
}

export interface RequirementsListProps {
    requirements: RequirementItem[];
    selectedType: number;
    onSelectType: (index: number) => void;
    previewEnabled: boolean;
    onTogglePreview: () => void;
}

export const getIcon = (code: string) => {
    const icons: Record<string, any> = {
        horario: Clock,
        carga_lectiva: FileText,
        resolucion: ShieldCheck,
        ficha: FileCheck,
        record: FileText,
    }
    return icons[code] || FileText;
}

export default function RequirementsList({
    requirements,
    selectedType,
    onSelectType,
    previewEnabled,
    onTogglePreview
}: RequirementsListProps) {
    if (!requirements || requirements.length === 0) return (
        <div className="rounded-xl border bg-card shadow-sm flex items-center justify-center text-muted-foreground text-sm italic">
            Cargando requisitos...
        </div>
    );

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6 shrink-0">
                <h3 className="font-semibold leading-none tracking-tight">Requisitos</h3>
                <p className="text-sm text-muted-foreground">Seleccione un tipo de documento</p>
            </div>
            <div className="p-6 pt-0 space-y-1">
                {requirements.map((req, idx) => {
                    const isActive = selectedType === idx;
                    const Icon = getIcon(req.code);
                    return (
                        <button
                            key={req.code}
                            onClick={() => onSelectType(idx)}
                            className={`inline-flex items-center justify-between whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-4 py-2 w-full ${isActive
                                ? 'bg-muted hover:bg-muted text-foreground'
                                : 'hover:bg-muted/50 hover:text-accent-foreground text-muted-foreground'
                                }`}
                        >
                            <div className="flex items-center">
                                <Icon className={`mr-2 h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span className="truncate max-w-[150px]">{req.title}</span>
                            </div>
                            {req.status === 1 && (
                                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                            )}
                            {req.status === 3 && req.latest && (
                                <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                            )}
                            {req.status === 2 && (
                                <AlertCircle className="size-4 text-amber-500 shrink-0" />
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
                    onClick={onTogglePreview}
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
    );
}

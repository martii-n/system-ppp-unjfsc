import { CheckCircle2, GraduationCap, Laptop, UserCheck } from "lucide-react";

const TYPE_OPTIONS = [
    { value: 'development', label: 'Desarrollo', icon: Laptop, desc: 'Pasantía en empresa' },
    { value: 'validation', label: 'Convalidación', icon: CheckCircle2, desc: 'Experiencia laboral previa' },
];

const ORIGIN_OPTIONS = [
    { value: 'direct', label: 'Directo', icon: UserCheck, desc: 'Convenio propio' },
    { value: 'application', label: 'Postulación', icon: GraduationCap, desc: 'Convocatoria universitaria' },
];

export const TYPE_LABELS: Record<string, string> = {
    development: 'Desarrollo',
    validation: 'Convalidación',
    direct: 'Directo',
    application: 'Postulación',
};


// ── ASIDE: TypeSelector Vertical ───────────────────────────────────────────
export function TypeSelector({ type, setType, origin, setOrigin, disabled }: {
    type: string;
    setType: (v: string) => void;
    origin: string;
    setOrigin: (v: string) => void;
    disabled: boolean;
}) {
    return (
        <div className="flex flex-col gap-2 rounded-xl border bg-card text-card-foreground">
            <div className="px-4 py-3 border-b">
                <h3 className="font-semibold text-sm leading-none">Tipo de Pasantía</h3>
                <p className="text-xs text-muted-foreground mt-1">Selecciona un tipo de pasantía</p>
            </div>
            {TYPE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = type === opt.value;
                return (
                    <button
                        key={opt.value}
                        onClick={() => {
                            setType(opt.value);
                            if (opt.value === 'validation') setOrigin('direct');
                        }}
                        className={`mx-3 flex items-center gap-3 p-3 rounded-lg border text-left transition-all
                            ${isSelected
                                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30'
                            }`}
                    >
                        <div className={`p-1.5 rounded-md shrink-0 transition-colors ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                            <Icon className="size-4" />
                        </div>
                        <div>
                            <p className="text-xs font-bold">{opt.label}</p>
                            <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                        </div>
                    </button>
                );
            })}

            {/* Origen (solo Desarrollo) */}
            {type === 'development' && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                    <div className="px-4 pt-3 pb-1">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                            Origen de Vacante
                        </p>
                    </div>
                    {ORIGIN_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = origin === opt.value;
                        return (
                            <button
                                key={opt.value}
                                onClick={() => setOrigin(opt.value)}
                                className={`mx-3 mb-2 w-[calc(100%-24px)] flex items-center gap-3 p-3 rounded-lg border text-left transition-all
                                    ${isSelected
                                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                        : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30'
                                    }`}
                            >
                                <div className={`p-1.5 rounded-md shrink-0 transition-colors ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                    <Icon className="size-3.5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold">{opt.label}</p>
                                    <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
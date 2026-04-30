import { Laptop, CheckCircle2, UserCheck, GraduationCap } from "lucide-react"; // Usamos Lucide para ser fieles a Shadcn
import Heading from "@/components/heading"; // Tu componente base

export function Type({
    type,
    setType,
    origin,
    setOrigin,
    disabled = false,
}: {
    type: string,
    setType: (type: string) => void,
    origin: string,
    setOrigin: (origin: string) => void,
    disabled?: boolean,
}) {

    return (
        <div className={`max-w-3xl mx-auto space-y-12 py-8 animate-in fade-in duration-500 ${disabled ? 'opacity-70 pointer-events-none' : ''}`}>

            {/* Bloque 1: Tipo de Práctica */}
            <section className="space-y-6">
                <div className="text-center">
                    <span className="text-base font-semibold">Iniciar prácticas</span>
                    <p className="text-sm text-muted-foreground">{disabled
                        ? "Tipo de práctica establecido. Contacte al administrador para cambios."
                        : "Seleccione el tipo de práctica a realizar para comenzar su flujo."
                    }</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Opción Desarrollo */}
                    <button
                        onClick={() => setType('desarrollo')}
                        className={`group relative flex flex-col items-start p-6 rounded-lg border transition-all text-left
                            ${type === 'desarrollo'
                                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                : 'border-border bg-card hover:border-primary/50'}`}
                    >
                        <div className={`mb-4 rounded-md p-2 ${type === 'desarrollo' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:text-primary'}`}>
                            <Laptop className="h-6 w-6" />
                        </div>
                        <h3 className="font-semibold text-base text-foreground">Desarrollo</h3>
                        <p className="text-sm text-muted-foreground mt-1">Iniciar un nuevo proceso de pasantía en una empresa.</p>
                    </button>

                    {/* Opción Convalidación */}
                    <button
                        onClick={() => setType('convalidacion')}
                        className={`group relative flex flex-col items-start p-6 rounded-lg border transition-all text-left
                            ${type === 'convalidacion'
                                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                : 'border-border bg-card hover:border-primary/50'}`}
                    >
                        <div className={`mb-4 rounded-md p-2 ${type === 'convalidacion' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:text-primary'}`}>
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <h3 className="font-semibold text-base text-foreground">Convalidación</h3>
                        <p className="text-sm text-muted-foreground mt-1">Validar experiencia laboral previa como horas de práctica.</p>
                    </button>
                </div>
            </section>

            {/* Bloque 2: Origen (Solo si es desarrollo) */}
            {type === 'desarrollo' && (
                <section className="space-y-6 pt-6 border-t animate-in slide-in-from-top-4 duration-500">
                    <div className="text-center">
                        {/* Aquí usamos el variant 'small' de tu Heading para mantener jerarquía */}
                        <Heading
                            variant="small"
                            title="¿Cómo obtuvo la vacante?"
                            description="Indique el origen de su proceso de selección actual."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        <button
                            onClick={() => setOrigin('direct')}
                            className={`flex items-center gap-4 p-4 rounded-lg border transition-all text-left
                                ${origin === 'direct' ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-muted/50'}`}
                        >
                            <div className={`p-2 rounded-full ${origin === 'direct' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                <UserCheck className="h-4 w-4" />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium">Directo</h4>
                                <p className="text-xs text-muted-foreground">Convenio previo con la empresa.</p>
                            </div>
                        </button>

                        <button
                            onClick={() => setOrigin('application')}
                            className={`flex items-center gap-4 p-4 rounded-lg border transition-all text-left
                                ${origin === 'application' ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-muted/50'}`}
                        >
                            <div className={`p-2 rounded-full ${origin === 'application' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                <GraduationCap className="h-4 w-4" />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium">Postulación</h4>
                                <p className="text-xs text-muted-foreground">Convocatoria oficial universitaria.</p>
                            </div>
                        </button>
                    </div>
                </section>
            )}
        </div>
    );
}
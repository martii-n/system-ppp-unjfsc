import { useForm } from '@inertiajs/react';
import { CheckCircle2, AlertCircle, Clock, ArrowRight, MessageSquare, Info, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import supervision from "@/routes/academic/supervision";

interface ValidationFormProps {
    annex: any;
    onSuccess: () => void;
}

export default function ValidationForm({
    annex,
    onSuccess,
}: ValidationFormProps) {
    const { data, setData, patch, processing, reset } = useForm({
        approval_status: null as number | null,
        observation_type: 3, // Default to File (3)
        comment: "",
    });

    const latest = annex.latest;
    const currentStatus = annex.status;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!annex.evaluation_id) return;

        patch(supervision.update.url({ evaluation: annex.evaluation_id }), {
            onSuccess: () => {
                onSuccess();
                reset();
            }
        });
    };

    if (!latest) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <div className="size-11 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Info className="size-5 text-muted-foreground/30" />
                </div>
                <h4 className="text-sm font-semibold mb-1">Sin archivo cargado</h4>
                <p className="text-xs text-muted-foreground max-w-[200px]">
                    El supervisor aún no ha subido este anexo para su revisión.
                </p>
            </div>
        );
    }

    if (currentStatus >= 3) {
        return (
            <div className="space-y-4">
                <FileInfoCard file={latest} grade={annex.grade} />
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 shadow-sm border-l-4 border-l-red-400">
                    <AlertCircle className="size-5 text-red-600 shrink-0" />
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold text-red-900 leading-none">Observado</h4>
                        <p className="text-[11px] text-red-700 leading-relaxed font-medium">Este documento ya ha sido observado.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (currentStatus === 1 && (data.approval_status === null || data.approval_status === 1)) {
        return (
            <div className="space-y-4">
                <FileInfoCard file={latest} grade={annex.grade} />
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3 shadow-sm border-l-4 border-l-green-400">
                    <CheckCircle2 className="size-5 text-green-600 shrink-0" />
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold text-green-900 leading-none">Aprobado</h4>
                        <p className="text-[11px] text-green-700 leading-relaxed font-medium">Este documento ya ha sido validado correctamente.</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setData({ ...data, approval_status: 3, observation_type: 3 })}>
                    Cambiar dictamen a Observado
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Dictamen Selection */}
            <div className="space-y-3">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 flex gap-3 shadow-sm border-l-amber-400">
                    <Info className="size-5 text-amber-600 shrink-0" />
                    <div className="space-y-1">
                        <p className="text-[11px] text-amber-700 leading-relaxed font-medium">{annex.latest?.comment}</p>
                    </div>
                </div>
                <FileInfoCard file={latest} grade={annex.grade} />
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Dictamen de Evaluación</Label>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => setData('approval_status', 1)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${data.approval_status === 1 ? 'border-green-500 bg-green-50 text-green-700 shadow-sm' : 'border-muted bg-background hover:border-muted-foreground/20 text-muted-foreground'
                            }`}
                    >
                        <CheckCircle2 className={`size-5 mb-1.5 ${data.approval_status === 1 ? 'text-green-600' : 'text-muted-foreground/40'}`} />
                        <span className="text-xs font-bold uppercase tracking-tight">Aprobar</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setData({ ...data, approval_status: 3, observation_type: 3 })}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${(data.approval_status ?? 0) >= 3 ? 'border-red-500 bg-red-50 text-red-700 shadow-sm' : 'border-muted bg-background hover:border-muted-foreground/20 text-muted-foreground'
                            }`}
                    >
                        <AlertCircle className={`size-5 mb-1.5 ${(data.approval_status ?? 0) >= 3 ? 'text-red-600' : 'text-muted-foreground/40'}`} />
                        <span className="text-xs font-bold uppercase tracking-tight">Observar</span>
                    </button>
                </div>
            </div>

            {/* Observation Types */}
            {(data.approval_status ?? 0) >= 3 && (
                <div className="space-y-3 p-4 rounded-xl bg-red-50/50 border border-red-100 animate-in zoom-in-95 duration-200">
                    <Label className="text-[10px] font-bold text-red-900 uppercase tracking-widest">¿Qué requiere corrección?</Label>
                    <RadioGroup
                        value={String(data.observation_type)}
                        onValueChange={(v) => {
                            const val = Number(v);
                            setData({ ...data, observation_type: val, approval_status: val });
                        }}
                        className="space-y-2"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="5" id="r1" className="text-red-600 border-red-300" />
                            <Label htmlFor="r1" className="text-xs font-bold text-red-800 cursor-pointer">Solo Archivo / Anexo</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="4" id="r2" className="text-red-600 border-red-300" />
                            <Label htmlFor="r2" className="text-xs font-bold text-red-800 cursor-pointer">Solo Calificación / Nota</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="3" id="r3" className="text-red-600 border-red-300" />
                            <Label htmlFor="r3" className="text-xs font-bold text-red-800 cursor-pointer">Ambos (Archivo y Nota)</Label>
                        </div>
                    </RadioGroup>
                </div>
            )}

            {/* Comment Area */}
            <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Comentarios / Observaciones</Label>
                <div className="relative group/textarea">
                    <MessageSquare className="absolute left-3 top-3 size-4 text-muted-foreground/40 group-focus-within/textarea:text-primary transition-colors" />
                    <textarea
                        value={data.comment}
                        onChange={(e) => setData('comment', e.target.value)}
                        rows={5}
                        className="w-full pl-10 p-3.5 text-sm rounded-xl border border-input bg-background/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary resize-none transition-all shadow-sm"
                        placeholder="Explica los motivos del dictamen..."
                        required={data.approval_status === 3}
                    />
                </div>
            </div>

            <Button
                type="submit"
                size="sm"
                className={`w-full transition-all ${data.approval_status === 1 ? 'bg-green-600 hover:bg-green-700 shadow-green-500/10' : (data.approval_status ?? 0) >= 3 ? 'bg-red-600 hover:bg-red-700 shadow-red-500/10' : ''
                    }`}
                disabled={!data.approval_status || ((data.approval_status ?? 0) >= 3 && !data.comment.trim()) || processing}
            >
                {processing ? (
                    <span className="flex items-center gap-2">
                        <Clock className="size-4 animate-spin" /> Procesando...
                    </span>
                ) : (
                    <span className="flex items-center gap-1.5">
                        Registrar Dictamen <ArrowRight className="size-4" />
                    </span>
                )}
            </Button>
        </form>
    );
}

function FileInfoCard({ file, grade }: { file: any; grade?: number }) {
    return (
        <div className="rounded-xl border p-3.5 flex items-center gap-4 bg-muted/20 border-muted-foreground/10 group hover:border-muted-foreground/20 transition-colors">
            <div className="size-10 flex items-center justify-center rounded-lg border bg-background shrink-0 shadow-sm">
                <FileText className="size-5 text-muted-foreground/60" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[11px] font-bold truncate uppercase tracking-tight">{file?.name ?? "Archivo adjunto"}</span>
                {grade != null && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Calificación:</span>
                        <span className="text-xs font-extrabold text-foreground">{grade} / 20</span>
                    </div>
                )}
            </div>
        </div>
    );
}
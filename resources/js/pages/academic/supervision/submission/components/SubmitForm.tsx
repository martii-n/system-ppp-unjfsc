import { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { FileText, Trash2, RotateCcw, Info, Clock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import supervision from "@/routes/academic/supervision";

interface AnnexRequirement {
    code: string;
    title: string;
    status: number;
    latest: any;
    grade?: number;
    supervision_id: number;
}

interface SubmitFormProps {
    annex: AnnexRequirement;
    tempFile: File | null;
    isEditing: boolean;
    onSetEditing: (v: boolean) => void;
    onRemoveTemp: () => void;
    onSuccess: (message: string) => void;
}

export default function SubmitForm({
    annex,
    tempFile,
    isEditing,
    onSetEditing,
    onRemoveTemp,
    onSuccess,
}: SubmitFormProps) {
    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        grade: annex.grade != null ? String(annex.grade) : "",
        comment: "",
        file: null as File | null,
        code: annex.code,
    });

    // Sync external tempFile selection and annex changes
    useEffect(() => {
        setData({
            ...data,
            grade: annex.grade != null ? String(annex.grade) : "",
            comment: "",
            file: tempFile,
            code: annex.code,
        });
        clearErrors();
    }, [annex.code, annex.grade, tempFile]);

    const canSubmit = data.grade !== "" &&
        !isNaN(Number(data.grade)) &&
        Number(data.grade) >= 0 &&
        Number(data.grade) <= 20 &&
        (!!data.file || annex.status === 4);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(supervision.store.url(annex.supervision_id), {
            forceFormData: true,
            onSuccess: (page: any) => {
                onSuccess(page.props.flash?.message ?? "Anexo enviado correctamente.");
                reset();
            },
        });
    };

    // ─── Render Conditionals ─────────────────────────────────────────────────

    // Caso 1: Sin archivo y no hay selección local
    if (!annex.latest && !tempFile) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4 animate-in fade-in zoom-in duration-300">
                <div className="size-11 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Info className="size-5 text-muted-foreground/30" />
                </div>
                <h4 className="text-sm font-semibold mb-1">Sin archivo cargado</h4>
                <p className="text-xs text-muted-foreground max-w-[200px]">
                    Selecciona o arrastra el PDF en el visor central para comenzar.
                </p>
            </div>
        );
    }

    // Case 2: Pendiente (bloqueado, ya subido)
    if (annex.status === 2 && !isEditing && !tempFile) {
        return (
            <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                    <Clock className="size-5 text-amber-600 shrink-0" />
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold text-amber-900 leading-none">En espera de revisión</h4>
                        <p className="text-[11px] text-amber-700/80 leading-relaxed">El archivo ya fue enviado y está pendiente de validación.</p>
                    </div>
                </div>
                <FileInfoCard file={annex.latest} grade={annex.grade} />
            </div>
        );
    }

    // Case 1: Aprobado
    if (annex.status === 1 && !isEditing && !tempFile) {
        return (
            <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
                    <CheckCircle2 className="size-5 text-green-600 shrink-0" />
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold text-green-900 leading-none">Aprobado</h4>
                        <p className="text-[11px] text-green-700 leading-relaxed">Este anexo ha sido validado correctamente.</p>
                    </div>
                </div>
                <FileInfoCard file={annex.latest} grade={annex.grade} />
            </div>
        );
    }

    // Case 3: Observado
    if (annex.status >= 3 && !isEditing && !tempFile) {
        return (
            <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="size-4 text-red-600 shrink-0" />
                        <h4 className="text-xs font-bold text-red-900 uppercase tracking-widest">Observado</h4>
                    </div>
                    {annex.latest?.justification && (
                        <p className="text-[11px] text-red-700 italic leading-relaxed">"{annex.latest.justification}"</p>
                    )}
                    <span className="text-[11px] text-red-700 italic leading-relaxed font-bold">
                        Corrección: {annex.status === 3 ? "AMBOS" : annex.status === 4 ? "CALIFICACIÓN" : "ARCHIVO"}
                    </span>
                </div>
                <FileInfoCard file={annex.latest} grade={annex.grade} />
                <Button variant="outline" size="sm" className="w-full text-xs font-bold border-red-100 hover:bg-red-50 hover:text-red-600" onClick={() => onSetEditing(true)}>
                    <RotateCcw className="size-3.5 mr-2" /> Corregir y Re-subir
                </Button>
            </div>
        );
    }

    // Form: file selected or editing
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Badge de archivo: Mostrar sea el nuevo seleccionado O el previo si es status 4 */}
            {(data.file || (annex.status === 4 && isEditing)) && (
                <div className={`rounded-lg border p-3 flex items-center gap-3 ${data.file ? 'bg-blue-50/50 border-blue-100' : 'bg-green-50/50 border-green-100'}`}>
                    <div className="size-9 flex items-center justify-center rounded-md border bg-white shadow-sm shrink-0">
                        <FileText className={`size-4 ${data.file ? 'text-blue-500' : 'text-green-500'}`} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs font-bold truncate">
                            {data.file ? data.file.name : (annex.latest?.name ?? 'Archivo previo aprobado')}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                            {data.file
                                ? `${(data.file.size / 1024 / 1024).toFixed(2)} MB`
                                : 'Reutilizando documento validado anteriormente'}
                        </span>
                    </div>
                    {data.file && (
                        <button type="button" onClick={() => onRemoveTemp()} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="size-4" />
                        </button>
                    )}
                </div>
            )}
            {errors.file && <p className="text-[10px] text-destructive font-bold">{errors.file}</p>}

            {/* Grade input */}
            <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest block">
                    Nota (0 – 20) {annex.status === 5 && <span className="text-red-500">(Bloqueado)</span>}
                </label>
                <input
                    type="number"
                    min={0}
                    max={20}
                    step={0.5}
                    value={data.grade}
                    onChange={(e) => setData("grade", e.target.value)}
                    className="w-full h-9 px-3 text-sm rounded-md border border-input bg-transparent shadow-sm placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-shadow"
                    placeholder="Ej: 16.5"
                    readOnly={annex.status === 5}
                />
                {errors.grade && <p className="text-[10px] text-destructive font-bold">{errors.grade}</p>}
            </div>

            {/* Comment */}
            <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest block">
                    Comentario (Opcional)
                </label>
                <textarea
                    value={data.comment}
                    onChange={(e) => setData("comment", e.target.value)}
                    rows={3}
                    className="w-full p-3 text-sm rounded-md border border-input bg-transparent shadow-sm placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none transition-shadow"
                    placeholder="Observaciones o comentarios sobre este anexo..."
                />
                {errors.comment && <p className="text-[10px] text-destructive font-bold">{errors.comment}</p>}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                {(isEditing || annex.status !== 0) && (
                    <Button variant="outline" size="sm" className="flex-1 text-xs" type="button" onClick={() => { onSetEditing(false); onRemoveTemp(); clearErrors(); }}>
                        Cancelar
                    </Button>
                )}
                <Button
                    type="submit"
                    size="sm"
                    className="flex-1 text-xs font-bold"
                    disabled={!canSubmit || processing}
                >
                    {processing ? "Enviando..." : <>Enviar Anexo <ArrowRight className="size-3.5 ml-1.5" /></>}
                </Button>
            </div>
        </form>
    );
}

// ─── Sub-Component for consistency ──────────────────────────────────────────

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

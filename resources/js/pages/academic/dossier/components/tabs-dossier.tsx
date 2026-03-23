import { useState, useEffect } from "react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { HistoryIcon, FileText, MessageSquare, CheckCircle2, AlertCircle } from "lucide-react";

interface TabsDossierProps {
    requirement: any;
    onSaveValidation: (status: number, message: string) => void;
    isSaving?: boolean;
}

export function TabsDossier({ requirement, onSaveValidation, isSaving = false }: TabsDossierProps) {
    const [status, setStatus] = useState<number>(1);
    const [message, setMessage] = useState<string>('');

    // Extraemos la información del historial proporcionada en getDossierData
    const history = requirement?.history || [];

    // Limpiamos los inputs cuando cambiamos a otro requisito (código distinto)
    useEffect(() => {
        setStatus(1); // Default check
        setMessage('');
    }, [requirement?.code]);

    const handleSave = () => {
        onSaveValidation(status, message);
    };

    // Determinamos qué mostrar en la pestaña de Dictamen según el estado
    const renderDictamenContent = () => {
        const latest = requirement?.latest;
        const statusReq = requirement?.status;

        // Caso 0: Sin archivo
        if (!latest) {
            return (
                <div className="flex flex-col items-center justify-center py-12 text-center rounded-md border p-4">
                    <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4 border border-dashed border-muted-foreground/30">
                        <FileText className="size-6 text-muted-foreground/30" />
                    </div>
                    <h4 className="text-sm font-semibold mb-1">Pendiente de envío</h4>
                    <p className="text-xs text-muted-foreground max-w-[200px]">
                        El docente aún no ha cargado este documento para su revisión.
                    </p>
                </div>
            );
        }

        // Caso 1: Aprobado
        if (statusReq === 1) {
            return (
                <div className="space-y-4 rounded-md border p-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3 shadow-sm">
                        <CheckCircle2 className="size-5 text-green-600 shrink-0" />
                        <div className="space-y-1 text-left">
                            <h4 className="text-sm font-bold text-green-900 leading-none uppercase tracking-tighter">Validación Aprobada</h4>
                            <p className="text-[11px] text-green-700 leading-relaxed font-medium">
                                Este documento ha sido validado correctamente y cumple con los requisitos formativos.
                            </p>
                        </div>
                    </div>
                    <FileInfoDisplay file={latest} />
                </div>
            );
        }

        // Caso 3: Observado (Ya fue evaluado negativamente anteriormente)
        if (statusReq === 3) {
            return (
                <div className="space-y-4 p-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 shadow-sm">
                        <AlertCircle className="size-5 text-red-600 shrink-0" />
                        <div className="space-y-1 text-left">
                            <h4 className="text-sm font-bold text-red-900 leading-none uppercase tracking-tighter">Documento Observado</h4>
                            <p className="text-[11px] text-red-700 leading-relaxed font-medium">
                                Se han notificado observaciones al docente. En espera de una nueva versión corregida.
                            </p>
                        </div>
                    </div>
                    {latest.comment && (
                        <div className="p-3 bg-muted/40 rounded-md border border-dashed border-muted-foreground/20 text-left">
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Motivo de observación:</label>
                            <p className="text-xs text-slate-600 italic leading-relaxed">"{latest.comment}"</p>
                        </div>
                    )}
                    <FileInfoDisplay file={latest} />
                </div>
            );
        }

        // Caso 2: Enviado/Pendiente (Habilitamos Formulario)
        return (
            <div className="flex flex-col gap-4">
                <div className="border rounded-md p-4 overflow-y-auto flex-1 space-y-6">
                    <div className="space-y-3">
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest text-left block">Dictamen de Evaluación</label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className={`flex items-center gap-2 p-3 rounded-md border cursor-pointer transition-colors bg-white ${status === 1 ? 'border-green-500 bg-green-50/50 ring-1 ring-green-500/20 shadow-sm' : 'hover:bg-slate-50 opacity-70 hover:opacity-100'}`}>
                                <input type="radio" name="status" className="accent-green-600 size-3.5" checked={status === 1} onChange={() => setStatus(1)} />
                                <span className={`text-xs font-semibold ${status === 1 ? 'text-green-700' : 'text-slate-600'}`}>Aprobar</span>
                            </label>
                            <label className={`flex items-center gap-2 p-3 rounded-md border cursor-pointer transition-colors bg-white ${status === 3 ? 'border-destructive bg-red-50/50 ring-1 ring-red-500/20 shadow-sm' : 'hover:bg-slate-50 opacity-70 hover:opacity-100'}`}>
                                <input type="radio" name="status" className="accent-destructive size-3.5" checked={status === 3} onChange={() => setStatus(3)} />
                                <span className={`text-xs font-semibold ${status === 3 ? 'text-destructive' : 'text-slate-600'}`}>Observar</span>
                            </label>
                        </div>
                    </div>
                    <div className="space-y-3 relative">
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest text-left block">
                            Mensaje / Observación
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full min-h-20 p-3 text-sm rounded-md border border-input bg-transparent shadow-sm placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none transition-shadow"
                            placeholder={status === 3 ? "Detalla exactamente las correcciones solicitadas..." : "Puedes añadir un comentario (Opcional)..."}
                        ></textarea>
                    </div>
                </div>
                <Button
                    className={`w-full text-xs font-bold shadow-sm tracking-tight ${status === 3 ? 'bg-destructive hover:bg-destructive/90 text-white' : 'bg-green-600 hover:bg-green-600/90 text-white'}`}
                    disabled={isSaving}
                    onClick={handleSave}
                >
                    {isSaving ? "Guardando..." : "Guardar Evaluación"}
                </Button>
            </div>
        );
    };

    return (
        <Tabs defaultValue="details" className="w-full flex flex-col">
            <TabsList className="w-full border rounded-md">
                <TabsTrigger
                    value="details"
                    className="data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-3 font-semibold text-xs transition-none"
                >
                    Dictamen
                </TabsTrigger>
                <TabsTrigger
                    value="history"
                    className="data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-3 font-semibold text-xs transition-none"
                >
                    Historial {history.length > 0 && `(${history.length})`}
                </TabsTrigger>
            </TabsList>

            {/* CONTENIDO 1: DICTAMEN (DINÁMICO) */}
            <TabsContent value="details" className="mt-0 flex-1 flex flex-col overflow-hidden outline-none data-[state=inactive]:hidden">
                {renderDictamenContent()}
            </TabsContent>

            {/* CONTENIDO 2: HISTORIAL (TIMELINE VISUAL) */}
            <TabsContent value="history" className="mt-0 flex-1 overflow-y-auto p-5 outline-none data-[state=inactive]:hidden">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                        <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
                            <HistoryIcon className="size-6 text-muted-foreground/50" />
                        </div>
                        <h4 className="text-sm font-semibold mb-1">Sin historial de cambios</h4>
                        <p className="text-xs text-muted-foreground max-w-[200px]">
                            Las versiones anteriores aparecerán aquí.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:h-full before:w-px before:bg-linear-to-b before:from-border before:via-border before:to-transparent">
                        {history.map((record: any, index: number) => {
                            const statusColor = record.approval_status === 1 ? 'bg-green-500' : record.approval_status === 3 ? 'bg-destructive' : 'bg-amber-500';
                            const statusLabel = record.approval_status === 1 ? 'Aprobado' : record.approval_status === 3 ? 'Observado' : 'Subido';
                            const statusText = record.approval_status === 1 ? 'text-green-600' : record.approval_status === 3 ? 'text-destructive' : 'text-amber-600';

                            return (
                                <div key={record.id} className="relative pl-8 group">
                                    <div className={`absolute left-0 mt-1.5 size-5 rounded-full border-4 border-background shadow-sm transition-transform group-hover:scale-110 ${statusColor}`} />

                                    <div className="flex flex-col gap-2">
                                        <div className="flex flex-col leading-tight">
                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${statusText}`}>
                                                {statusLabel}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                                                {record.created_at ? format(new Date(record.created_at), "d 'de' MMMM, p", { locale: es }) : 'Fecha desconocida'}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30 border border-transparent hover:border-border transition-colors group/file">
                                            <FileText className="size-3.5 text-muted-foreground/60 shrink-0" />
                                            <span className="text-xs font-medium truncate flex-1">{record.name || "Documento adjunto"}</span>
                                        </div>

                                        {record.comment && (
                                            <div className="flex gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100 relative mt-1">
                                                <MessageSquare className="size-3 text-slate-400 shrink-0 mt-0.5" />
                                                <p className="text-[11px] text-slate-600 leading-relaxed italic">
                                                    {record.comment}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </TabsContent>
        </Tabs>
    );
}

// Sub-componente para mostrar info del archivo sin acciones (Similar al de submission)
function FileInfoDisplay({ file }: any) {
    return (
        <div className="rounded-lg border p-3 flex items-center gap-3 bg-muted/20">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-background">
                <FileText className="h-5 w-5 text-muted-foreground/60" />
            </div>
            <div className="space-y-0.5 overflow-hidden text-left">
                <p className="text-xs font-bold truncate leading-none uppercase tracking-tighter">{file?.name || "Archivo Adjunto"}</p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest italic pt-1">Documento cargado</p>
            </div>
        </div>
    );
}
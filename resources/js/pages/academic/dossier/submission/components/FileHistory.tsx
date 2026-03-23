import React from 'react';
import { FileText, MessageSquare, History as HistoryIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function FileHistory({ history }: { history: any[] }) {

    if (!history || history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <HistoryIcon className="size-6 text-muted-foreground/50" />
                </div>
                <h4 className="text-sm font-semibold mb-1">Sin historial de cambios</h4>
                <p className="text-xs text-muted-foreground max-w-[200px]">
                    Las versiones anteriores aparecerán aquí una vez que realices actualizaciones.
                </p>
            </div>
        );
    }
    /*
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
    */

    return (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:h-full before:w-px before:bg-gradient-to-b before:from-border before:via-border before:to-transparent">
            {history.map((record, index) => {
                const isFirst = index === 0;
                const statusColor = record.approval_status === 1 ? 'bg-green-500' : record.approval_status === 3 ? 'bg-destructive' : 'bg-amber-500';
                const statusLabel = record.approval_status === 1 ? 'Aprobado' : record.approval_status === 3 ? 'Observado' : 'Pendiente';
                const statusText = record.approval_status === 1 ? 'text-green-600' : record.approval_status === 3 ? 'text-destructive' : 'text-amber-600';

                return (
                    <div key={record.id} className="relative pl-8 group">
                        {/* Nodo del Timeline */}
                        <div className={`absolute left-0 mt-1.5 size-5 rounded-full border-4 border-background shadow-sm transition-transform group-hover:scale-110 ${statusColor}`} />

                        <div className="flex flex-col gap-2">
                            {/* Header del registro */}
                            <div className="flex flex-col leading-tight">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${statusText}`}>
                                    {statusLabel}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                                    {record.created_at ? format(new Date(record.created_at), "d 'de' MMMM, p", { locale: es }) : 'Fecha desconocida'}
                                </span>
                            </div>

                            {/* Detalle del archivo de esa versión */}
                            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30 border border-transparent hover:border-border transition-colors group/file">
                                <FileText className="size-3.5 text-muted-foreground/60" />
                                <span className="text-xs font-medium truncate flex-1">{record.name}</span>
                            </div>

                            {/* Comentario del revisor si existe */}
                            {record.comment && (
                                <div className="flex gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 relative">
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
    );
}

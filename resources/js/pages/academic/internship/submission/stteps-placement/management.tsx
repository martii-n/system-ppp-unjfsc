import { Button } from "@/components/ui/button";
import { Building2, User, X } from "lucide-react";

export function PlacementManagement() {
    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-card border rounded-md border-muted/60">
            {/* Header del detalle */}
            <div className="p-4 border-b bg-muted/20 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <User className="size-5" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="font-bold text-base leading-none uppercase tracking-tight">
                            Nicasio Marcelo, Martin Ronaldo
                        </h2>
                        <span className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                            <Building2 className="size-3" /> Ingeniería de Sistemas • Ciclo 2024-II
                        </span>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => { }}>
                    <X className="size-4" />
                </Button>
            </div>
        </div>
    );
}
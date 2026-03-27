import { useState } from "react";
import { Users, X, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface GroupModule {
    id: number;
    name: string;
}

export interface GroupOption {
    id: number;
    name: string;
    module_id: number;
    module: GroupModule | null;
    section: {
        id: number;
        name: string;
        school: { name: string; faculty: { name: string } };
    };
    supervisor: {
        user: { person: { names: string; surnames: string } };
    };
    teacher: {
        user: { person: { names: string; surnames: string } };
    };
}

interface GroupSelectorProps {
    groups: GroupOption[];
    selectedGroup: GroupOption | null;
    onSelect: (group: GroupOption | null) => void;
    isLoading?: boolean;
    disabled?: boolean;
}

export function GroupSelector({ groups, selectedGroup, onSelect, isLoading = false, disabled = false }: GroupSelectorProps) {
    const [open, setOpen] = useState(false);

    const handleSelect = (group: GroupOption) => {
        onSelect(group);
        setOpen(false);
    };

    const handleClear = () => {
        onSelect(null);
        setOpen(false);
    };

    const appliedLabel = selectedGroup
        ? `${selectedGroup.section.school.name} · ${selectedGroup.section.name} · ${selectedGroup.name}`
        : null;

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={selectedGroup ? "default" : "outline"}
                    size="sm"
                    className={`gap-2 max-w-[280px] transition-all ${selectedGroup ? "pr-2" : ""}`}
                    disabled={disabled || isLoading}
                >
                    {isLoading ? (
                        <Loader2 className="size-3.5 animate-spin shrink-0" />
                    ) : (
                        <Users className="size-3.5 shrink-0" />
                    )}
                    <span className="text-xs font-semibold truncate">
                        {isLoading ? "Cargando grupos..." : (appliedLabel ?? "Seleccionar grupo")}
                    </span>
                    {selectedGroup ? (
                        <Badge
                            variant="secondary"
                            className="ml-1 h-4 w-4 p-0 flex items-center justify-center rounded-full text-[9px] bg-white/20 text-inherit cursor-pointer hover:bg-white/30 shrink-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                        >
                            <X className="size-2.5" />
                        </Badge>
                    ) : (
                        <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="start"
                className="w-96 p-3"
                onCloseAutoFocus={(e) => e.preventDefault()}
            >
                {/* Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Seleccionar grupo</p>
                        <p className="text-[10px] text-muted-foreground/70 mt-0.5">{groups.length} grupo{groups.length !== 1 ? 's' : ''} disponible{groups.length !== 1 ? 's' : ''}</p>
                    </div>
                    {selectedGroup && (
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] text-muted-foreground" onClick={handleClear}>
                            Limpiar
                        </Button>
                    )}
                </div>

                {/* Group List */}
                <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                    {groups.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                            <Users className="size-6 opacity-30 mb-2" />
                            <p className="text-xs">No hay grupos disponibles</p>
                        </div>
                    ) : (
                        groups.map((group) => {
                            const isSelected = selectedGroup?.id === group.id;
                            return (
                                <button
                                    key={group.id}
                                    onClick={() => handleSelect(group)}
                                    className={`w-full text-left rounded-md px-3 py-2.5 transition-colors flex items-center gap-3 group/item ${
                                        isSelected
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted/60'
                                    }`}
                                >
                                    <div className={`size-7 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                                        isSelected ? 'bg-white/20' : 'bg-muted group-hover/item:bg-muted-foreground/10'
                                    }`}>
                                        <Users className={`size-3.5 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span className={`text-xs font-bold truncate leading-tight ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                                            {group.name}
                                        </span>
                                        <span className={`text-[10px] truncate leading-tight mt-0.5 ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                            {group.section.school.name} · {group.section.name}
                                        </span>
                                    </div>
                                    <div className="shrink-0">
                                        <Badge
                                            variant="outline"
                                            className={`text-[9px] font-bold border-none px-1.5 py-0 h-4 ${
                                                isSelected
                                                    ? 'bg-white/20 text-primary-foreground'
                                                    : 'bg-blue-500/10 text-blue-600'
                                            }`}
                                        >
                                            {group.module?.name ?? `Mód. ${group.module_id}`}
                                        </Badge>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

import { router, usePage } from '@inertiajs/react';
import { Calendar, Check, ChevronDown } from 'lucide-react';

import { Breadcrumbs } from '@/components/breadcrumbs';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

const ROLE_COLORS: Record<string, string> = {
    ADMINISTRATIVO: 'bg-blue-600',
    'Docente Titular': 'bg-purple-600',
    Estudiante: 'bg-zinc-700',
    'Docente Supervisor': 'bg-indigo-600',
    DEFAULT: 'bg-slate-500',
};

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth } = usePage().props as any;
    const academic = auth?.academic;

    // Solo mostramos selectores si hay contexto académico
    if (!academic) {
        return (
            <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-6 md:px-4">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </header>
        );
    }

    const assignments = (academic.assignments || []).map((asig: any) => ({
        ...asig,
        color:
            ROLE_COLORS[asig.role as keyof typeof ROLE_COLORS] ||
            ROLE_COLORS.DEFAULT,
    }));

    const selectedSemester = (academic.semesters || []).find(
        (s: any) => s.id === academic.selected_semester_id,
    ) || (academic.semesters || [])[0];

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex items-center gap-4">
                <SemesterSelector
                    semesters={academic.semesters}
                    currentId={selectedSemester?.id}
                />
                <AvatarStack
                    assignments={assignments}
                    onSelect={(id: number) => {
                        router.patch(
                            `/assignments/${id}/select`,
                            {},
                            { preserveState: false },
                        );
                    }}
                />
            </div>
        </header>
    );
}

const SemesterSelector = ({
    semesters = [],
    currentId,
}: {
    semesters: any[];
    currentId?: number;
}) => {
    const active = semesters.find((s) => s.id === currentId);

    const onSelect = (id: number) => {
        router.patch(`/semesters/${id}/select`, {}, { preserveState: false });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="group flex h-10 cursor-pointer items-center gap-3 rounded-md border px-3 transition-colors hover:bg-zinc-800/50 data-[state=open]:bg-zinc-800">
                    <Calendar className="h-4 w-4 shrink-0 text-green-500" />
                    <div className="flex flex-col justify-center">
                        <span className="text-[10px] leading-none font-bold tracking-tight text-zinc-500 uppercase text-left">
                            Semester
                        </span>
                        <span className="text-xs font-semibold">
                            {active?.code || 'N/A'}
                        </span>
                    </div>
                    <ChevronDown className="ml-1 h-3.5 w-3.5 text-zinc-500 transition-transform group-data-[state=open]:rotate-180" />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-48 rounded-lg"
                align="end"
                side="bottom"
                sideOffset={8}
            >
                <DropdownMenuLabel className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
                    Select Semester
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    {semesters.map((s) => (
                        <DropdownMenuItem
                            key={s.id}
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => onSelect(s.id)}
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className={
                                        s.id === currentId ? 'font-bold' : ''
                                    }
                                >
                                    {s.code}
                                </span>
                                {s.status === 1 ? (
                                    <span className="text-[9px] uppercase font-bold bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded-sm">
                                        Activo
                                    </span>
                                ) : (
                                    <span className="text-[9px] uppercase font-bold bg-zinc-500/10 text-zinc-500 px-1.5 py-0.5 rounded-sm">
                                        Finalizado
                                    </span>
                                )}
                            </div>
                            {s.id === currentId && (
                                <Check className="h-4 w-4 text-green-500" />
                            )}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

type Assignment = {
    id: number;
    role: string;
    initials: string;
    context: string;
    color: string;
    selected: boolean;
};

// Componente AvatarStack ajustado
const AvatarStack = ({
    assignments,
    onSelect,
}: {
    assignments: Assignment[];
    onSelect: (id: number) => void;
}) => {
    const limit = 2;
    const displayed = assignments.slice(0, limit);
    const remaining = assignments.length - limit;
    const selectedAssignment = assignments.find((a) => a.selected);

    if (assignments.length === 0) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="group flex h-10 cursor-pointer items-center gap-3 rounded-md border px-3 transition-all hover:bg-zinc-800/50 data-[state=open]:bg-zinc-800">
                    <div className="flex flex-col items-start justify-center">
                        <span className="text-[10px] leading-none font-bold tracking-tight text-zinc-500 uppercase">
                            Assignment
                        </span>
                        <span className="max-w-30 truncate text-xs font-semibold uppercase">
                            {selectedAssignment?.role}
                        </span>
                    </div>

                    <div className="flex -space-x-2">
                        {displayed.map((asig: Assignment) => (
                            <div
                                key={asig.id}
                                className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white uppercase ${asig.color}`}
                            >
                                {asig.initials}
                            </div>
                        ))}
                        {remaining > 0 && (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-zinc-950 bg-zinc-800 text-[10px] font-bold text-zinc-400">
                                +{remaining}
                            </div>
                        )}
                    </div>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-64 rounded-xl p-2"
                align="end"
                side="bottom"
                sideOffset={8}
            >
                <DropdownMenuLabel className="px-2 py-1.5 text-xs font-bold tracking-wider text-zinc-500 uppercase">
                    My Assignments
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuGroup className="mt-1 flex flex-col gap-1">
                    {assignments.map((asig: Assignment) => (
                        <DropdownMenuItem
                            key={asig.id}
                            className={`flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors ${asig.selected
                                ? 'bg-zinc-500/50'
                                : 'text-zinc-400 hover:bg-zinc-800/30'
                                }`}
                            onClick={() => onSelect(asig.id)}
                        >
                            <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-[10px] font-bold text-white uppercase shadow-sm ${asig.color}`}
                            >
                                {asig.initials}
                            </div>
                            <div className="flex min-w-0 flex-col">
                                <span
                                    className={`truncate text-sm font-semibold`}
                                >
                                    {asig.role}
                                </span>
                                <span className="truncate text-[10px] text-zinc-500">
                                    {asig.context}
                                </span>
                            </div>
                            {asig.selected && (
                                <div className="ml-auto">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                </div>
                            )}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

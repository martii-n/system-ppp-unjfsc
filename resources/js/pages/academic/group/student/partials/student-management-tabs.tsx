import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    UserPlus,
    ArrowRightLeft,
    UserMinus,
    Loader2,
    Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StudentSelectorTable } from "../../components/student-selector-table";
import { useStudentManagement } from "../../hooks/use-student-management";
interface StudentManagementTabsProps {
    group: any;
    allGroups: any[];
}

export default function StudentManagementTabs({ group, allGroups }: StudentManagementTabsProps) {
    // --- USAMOS EL NUEVO HOOK ---
    const {
        loading,
        isSubmitting,
        availableStudents,
        groupStudents,
        selectedStudents,
        setSelectedStudents,
        targetGroupId,
        setTargetGroupId,
        currentTab,
        setCurrentTab,
        otherGroups,
        actions
    } = useStudentManagement({ group, allGroups });

    return (
        <Tabs
            value={currentTab}
            onValueChange={setCurrentTab}
            className="w-full flex flex-col h-full bg-card rounded-xl border border-border shadow-sm overflow-hidden min-h-[500px]"
        >
            <TabsList className="grid grid-cols-3 w-full p-1 bg-muted/50 rounded-none border-b border-border h-12 shrink-0">
                <TabsTrigger value="add" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-none border-none h-full transition-all">
                    <UserPlus className="size-4" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Añadir</span>
                </TabsTrigger>
                <TabsTrigger value="move" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-none border-none h-full transition-all">
                    <ArrowRightLeft className="size-4" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Mover</span>
                </TabsTrigger>
                <TabsTrigger value="detach" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-none border-none h-full transition-all">
                    <UserMinus className="size-4" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Quitar</span>
                </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto p-6 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                {/* AÑADIR ESTUDIANTES */}
                <TabsContent value="add" className="mt-0 outline-none space-y-6 animate-in fade-in duration-300">
                    <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 flex gap-3 items-start">
                        <Info className="size-4 text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                            Selecciona a los estudiantes registrados en <strong>{group.section.name}</strong> que aún no han sido asignados.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Estudiantes Disponibles</h4>
                            {selectedStudents.length > 0 && (
                                <Badge className="bg-primary hover:bg-primary font-bold">{selectedStudents.length} Seleccionados</Badge>
                            )}
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="size-6 animate-spin text-primary" />
                            </div>
                        ) : (
                            <StudentSelectorTable
                                students={availableStudents}
                                selectedIds={selectedStudents}
                                onSelectionChange={setSelectedStudents}
                                colorScheme="primary"
                                compact={true}
                                emptyMessage="No hay estudiantes disponibles"
                            />
                        )}
                    </div>
                    <div className="flex items-center justify-center">
                        <Button
                            onClick={actions.handleAdd}
                            className=""
                            disabled={selectedStudents.length === 0 || isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="size-4 animate-spin mr-2" /> : <UserPlus className="size-4 mr-2" />}
                            Asignar Selección {selectedStudents.length > 0 ? `(${selectedStudents.length})` : ''}
                        </Button>
                    </div>
                </TabsContent>

                {/* MOVER ESTUDIANTES */}
                <TabsContent value="move" className="mt-0 outline-none space-y-6 animate-in slide-in-from-right duration-300">
                    <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-3 flex gap-3 items-start">
                        <ArrowRightLeft className="size-4 text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                            Transfiere estudiantes del grupo actual hacia otro grupo activo en la misma sección.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Grupo de Destino</h4>
                            <Select value={targetGroupId} onValueChange={setTargetGroupId}>
                                <SelectTrigger className="w-full h-10 rounded-lg">
                                    <SelectValue placeholder="Seleccionar grupo de destino..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {otherGroups.length > 0 ? (
                                        otherGroups.map(g => (
                                            <SelectItem key={g.id} value={g.id.toString()} className="text-xs font-medium">
                                                {g.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-4 text-[10px] text-muted-foreground italic text-center uppercase tracking-widest">No hay otros grupos</div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Estudiantes en {group.name}</h4>
                                {selectedStudents.length > 0 && (
                                    <Badge className="bg-amber-500 hover:bg-amber-500 font-bold">{selectedStudents.length} Para Mover</Badge>
                                )}
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="size-6 animate-spin text-amber-500" />
                                </div>
                            ) : (
                                <StudentSelectorTable
                                    students={groupStudents}
                                    selectedIds={selectedStudents}
                                    onSelectionChange={setSelectedStudents}
                                    colorScheme="amber"
                                    maxHeight="250px"
                                    compact={true}
                                    emptyMessage="Grupo sin estudiantes"
                                />
                            )}
                        </div>
                    </div>
                    <div className="flex items-center justify-center">
                        <Button
                            onClick={actions.handleMove}
                            className="bg-amber-500 hover:bg-amber-600"
                            disabled={selectedStudents.length === 0 || !targetGroupId || isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="size-4 animate-spin mr-2" /> : <ArrowRightLeft className="size-4 mr-2" />}
                            Mover Selección {selectedStudents.length > 0 ? `(${selectedStudents.length})` : ''}
                        </Button>
                    </div>
                </TabsContent>

                {/* QUITAR ESTUDIANTES */}
                <TabsContent value="detach" className="mt-0 outline-none space-y-6 animate-in slide-in-from-right duration-300">
                    <div className="bg-red-50/50 border border-red-100 rounded-lg p-3 flex gap-3 items-start">
                        <UserMinus className="size-4 text-red-500 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-red-700 leading-relaxed font-medium">
                            Retira a los estudiantes seleccionados del grupo actual. Quedarán sin grupo.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Listado de Estudiantes</h4>
                            {selectedStudents.length > 0 && (
                                <Badge className="bg-red-500 hover:bg-red-500 font-bold">{selectedStudents.length} Seleccionados</Badge>
                            )}
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="size-6 animate-spin text-red-500" />
                            </div>
                        ) : (
                            <StudentSelectorTable
                                students={groupStudents}
                                selectedIds={selectedStudents}
                                onSelectionChange={setSelectedStudents}
                                colorScheme="red"
                                compact={true}
                                emptyMessage="No hay estudiantes"
                            />
                        )}
                    </div>

                    <div className="flex items-center justify-center">
                        <Button
                            onClick={actions.handleDetach}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={selectedStudents.length === 0 || isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="size-4 animate-spin mr-2" /> : <UserMinus className="size-4 mr-2" />}
                            Retirar Selección {selectedStudents.length > 0 ? `(${selectedStudents.length})` : ''}
                        </Button>
                    </div>
                </TabsContent>
            </div>
        </Tabs>
    );
}
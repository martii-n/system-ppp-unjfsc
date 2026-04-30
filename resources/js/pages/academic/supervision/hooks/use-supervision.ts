import { GroupOption } from "@/components/academic/group-selector";
import { TableData, useConfigTable } from "@/hooks/use-config-table";
import supervision from "@/routes/academic/supervision";
import { StudentSupervision } from "@/types";
import { router, usePage } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

interface Props {
    initialData: any;
    groups: GroupOption[];
    isAdmin: boolean;
}

interface CodeSearchResponse {
    students: {
        data: StudentSupervision[];
        links: any[];
        total: number;
    };
}

export function useSupervision({ initialData, groups, isAdmin }: Props) {
    const { url } = usePage();
    const params = new URLSearchParams(url.split('?')[1]);

    // --- 1. Estados de Selección y Deep Linking ---
    const itemFromUrl = params.get('a');
    const moduleFromUrl = params.get('m');

    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [selectedModuleId, setSelectedModuleId] = useState<number | null>(
        moduleFromUrl ? Number(moduleFromUrl) : null
    );

    const [availableGroups, setAvailableGroups] = useState<GroupOption[]>(groups);
    const [selectedGroup, setSelectedGroup] = useState<GroupOption | null>(null);
    const hasAutoSelected = useRef(false);

    // --- 2. Estados de Anexos (Detalle) ---
    const [annexes, setAnnexes] = useState<any[]>([]);
    const [isAnnexesLoading, setIsAnnexesLoading] = useState(false);
    const [selectedAnnexIdx, setSelectedAnnexIdx] = useState(0);

    const currentAnnex = annexes[selectedAnnexIdx] || null;

    // --- 3. Estados de Búsqueda y Filtros ---
    const [isSearchingByCode, setIsSearchingByCode] = useState(false);
    const [codeSearch, setCodeSearch] = useState('');
    const [isFilteringGroups, setIsFilteringGroups] = useState(false);

    // --- 3. Motor de la Tabla (useConfigTable) ---
    const tableManager = useConfigTable<StudentSupervision>({
        endpoint: selectedGroup && selectedModuleId
            ? `/supervision/api/groups/${selectedGroup.id}/students/filter`
            : '',
        initialData: initialData as unknown as TableData<StudentSupervision>,
        isAdmin,
        pageSize: 10,
        extraParams: { module_id: selectedModuleId },
        onLocalSearch: (a, term) => {
            const fullName = `${a.user?.person?.surnames || ''} ${a.user?.person?.names || ''}`.toLowerCase();
            const email = (a.user?.email || '').toLowerCase();
            return fullName.includes(term) || email.includes(term);
        },
    });

    const { fetchData, setData: setAssignments, displayData, setSearch, handleFilter: handleAcademicFilter } = tableManager;

    // --- 4. Lógica de Selección de Item ---
    const selectedItem = displayData.find((item) =>
        item.id === selectedId &&
        (item.search_module === selectedModuleId || !item.search_module)
    );

    // Autoselección si viene de URL (Notificaciones)
    useEffect(() => {
        if (itemFromUrl && displayData.length > 0 && !hasAutoSelected.current) {
            setSelectedId(displayData[0].id);
            hasAutoSelected.current = true;
        }
    }, [displayData, itemFromUrl]);

    useEffect(() => {
        if (selectedId) {
            setIsAnnexesLoading(true);
            axios.get(supervision.api.annexes.url(selectedId))
                .then(res => setAnnexes(res.data.annexes ?? []))
                .catch(() => toast.error('No se pudieron cargar los anexos.'))
                .finally(() => setIsAnnexesLoading(false));
        } else {
            setAnnexes([]);
        }
    }, [selectedId]);

    // Sincronizar grupos iniciales
    useEffect(() => {
        setAvailableGroups(groups);
    }, [groups]);

    // Recargar tabla cuando cambia Grupo o Módulo
    useEffect(() => {
        if (selectedGroup && selectedModuleId) {
            fetchData(
                `/supervision/api/groups/${selectedGroup.id}/students/filter`,
                { module_id: selectedModuleId }
            );
        }
    }, [selectedGroup, selectedModuleId]);

    // --- 5. Handlers (Acciones) ---

    // Filtrado Académico (Facultad -> Escuela -> Sección)
    const handleFilter = async (values: Record<string, unknown>) => {
        handleAcademicFilter(values);

        if (!values.faculty_id) {
            setAvailableGroups([]);
            setSelectedGroup(null);
            setSelectedModuleId(null);
            setAssignments({ data: [] });
            return;
        }

        setIsFilteringGroups(true);
        setSelectedGroup(null);
        setSelectedModuleId(null);
        setAssignments({ data: [] });
        setSelectedId(null);

        try {
            const res = await axios.get(supervision.api.groups.url(), { params: values });
            setAvailableGroups(res.data.groups ?? []);
        } catch {
            toast.error('No se pudieron cargar los grupos.');
            setAvailableGroups([]);
        } finally {
            setIsFilteringGroups(false);
        }
    };

    // Selección de Grupo
    const handleGroupSelect = (group: GroupOption | null) => {
        setSelectedGroup(group);
        setSelectedId(null);
        setAssignments({ data: [] });

        // Si veníamos de un link profundo, limpiamos la URL para evitar conflictos
        if (itemFromUrl && moduleFromUrl) {
            const url = new URL(window.location.href);
            url.searchParams.delete('a');
            url.searchParams.delete('m');
            window.history.pushState({}, '', url.toString());
        }

        if (!group) {
            setSelectedModuleId(null);
            return;
        }

        setSelectedModuleId(group.module_id);
    };

    // Búsqueda Global por Código (Admin)
    const handleCodeSearch = async () => {
        if (!codeSearch.trim()) return;

        setAvailableGroups([]);
        setSelectedGroup(null);
        setSelectedModuleId(null);

        setIsSearchingByCode(true);
        try {
            const res = await axios.get<CodeSearchResponse>(
                supervision.api.students_search.url(),
                { params: { code: codeSearch.trim() } }
            );
            setAssignments(res.data.students);
            setSelectedId(null);
        } catch {
            toast.error('No se encontró al estudiante.');
            setAssignments({ data: [] });
        } finally {
            setIsSearchingByCode(false);
        }
    };

    // Selección de Estudiante
    const handleSelect = (id: number, moduleOverride?: number) => {
        setSelectedId(id);
        if (moduleOverride) setSelectedModuleId(moduleOverride);
    };

    // Cerrar Panel de Detalle
    const handleCloseSelected = () => {
        if (itemFromUrl && moduleFromUrl) {
            router.get(window.location.pathname, {}, { preserveState: true, replace: true });
        } else {
            const url = new URL(window.location.href);
            url.searchParams.delete('a');
            url.searchParams.delete('m');
            window.history.pushState({}, '', url.toString());
        }
        setSelectedId(null);
    };

    const handleModuleSelect = (moduleId: number) => {
        setSelectedModuleId(moduleId);
        setSelectedId(null);
    };

    return {
        tableManager,
        state: {
            selectedId,
            selectedItem,
            selectedGroup,
            selectedModuleId,
            availableGroups,
            annexes,
            currentAnnex,
            selectedAnnexIdx,
            isAnnexesLoading,
            isSearchingByCode,
            codeSearch,
            isFilteringGroups
        },
        actions: {
            handleSelect,
            handleCloseSelected,
            handleGroupSelect,
            handleFilter,
            handleCodeSearch,
            setCodeSearch,
            handleModuleSelect,
            setSelectedAnnexIdx
        }
    };
}

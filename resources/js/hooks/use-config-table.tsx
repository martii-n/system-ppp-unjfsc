import axios from 'axios';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface PaginatedResponse<T> {
    data?: T[];
    students?: T[];
    assignments?: T[];
    current_page?: number;
    last_page?: number;
    total?: number;
    [key: string]: unknown;
}

export type TableData<T> = T[] | PaginatedResponse<T>;

interface UseConfigTableOptions<T> {
    endpoint: string;
    initialData: TableData<T>;
    isAdmin: boolean;
    pageSize?: number;
    extraParams?: Record<string, unknown>;
    onLocalSearch: (item: T, term: string) => boolean;
}

export function useConfigTable<T>({
    endpoint,
    initialData,
    isAdmin,
    pageSize = 5,
    extraParams = {},
    onLocalSearch,
}: UseConfigTableOptions<T>) {
    const [data, setData] = useState<TableData<T>>(initialData);
    const [isSearching, setIsSearching] = useState(false);
    const [search, setSearch] = useState('');
    const [activeFilters, setActiveFilters] = useState<Record<
        string,
        unknown
    > | null>(null);
    const [filterClearKey, setFilterClearKey] = useState(0);
    const [localPage, setLocalPage] = useState(1);

    const isLocalPagination = Array.isArray(data);

    // --- Sincronización con Props (Deep Linking & Inertia updates) ---
    useEffect(() => {
        // En Inertia, al hacer form.patch(), las props vuelven a llegar.
        // Si es admin y ya tiene datos de API, no debemos sobreescribirlos con initialData vacío.
        if (!isAdmin) {
            setData(initialData);
            // No resetear localPage aquí para que Inertia no rompa la paginación local al guardar.
        }
    }, [initialData, isAdmin]);

    const fetchData = async (
        url: string = endpoint,
        params: Record<string, unknown> = {},
    ) => {
        try {
            setIsSearching(true);
            const mergedParams = { ...extraParams, ...params };
            const res = await axios.get(url, { params: mergedParams });

            // Mapeo inteligente de la respuesta
            const responseData = res.data as PaginatedResponse<T>;
            const result =
                responseData.groups ||
                responseData.assignments ||
                responseData.students ||
                responseData.data ||
                responseData;
            setData(result as TableData<T>);
        } catch {
            toast.error('Error al obtener los datos. Waaaa Owuu');
        } finally {
            setIsSearching(false);
        }
    };

    const handleFilter = (values: Record<string, unknown>) => {
        const isEmpty = Object.values(values).every((v) => !v);
        if (isEmpty) {
            // Si es admin y está vacío, mandamos objeto con data vacía para cumplir el tipo
            setData(isAdmin ? { data: [] } : initialData);
            setActiveFilters(null);
            return;
        }
        setActiveFilters(values);
        setSearch('');
        fetchData(endpoint, values);
    };

    const handleBackendSearch = () => {
        if (!search.trim()) {
            setData(isAdmin ? { data: [] } : initialData);
            setActiveFilters(null);
            setFilterClearKey((k) => k + 1);
            return;
        }
        setFilterClearKey((k) => k + 1);
        setActiveFilters(null);
        fetchData(endpoint, { search: search.trim() });
    };

    const handlePageChange = (url: string | null) => {
        if (!url) return;
        const params = (
            search.trim() ? { search: search.trim() } : activeFilters || {}
        ) as Record<string, unknown>;
        fetchData(url, params);
    };

    // --- Computación de Datos ---
    const allLocalFiltered = isLocalPagination
        ? (data as T[]).filter((item: T) => {
            if (!search.trim()) return true;
            return onLocalSearch(item, search.toLowerCase());
        })
        : [];

    const localTotalPages = isLocalPagination
        ? Math.ceil(allLocalFiltered.length / pageSize)
        : 1;

    const displayData: T[] = isLocalPagination
        ? allLocalFiltered.slice(
            (localPage - 1) * pageSize,
            localPage * pageSize,
        )
        : (data as PaginatedResponse<T>)?.data || [];

    return {
        data,
        displayData,
        allLocalFiltered,
        isSearching,
        search,
        setSearch,
        activeFilters,
        filterClearKey,
        setFilterClearKey,
        localPage,
        setLocalPage,
        localTotalPages,
        handleFilter,
        handleBackendSearch,
        handlePageChange,
        setData,
        fetchData,
    };
}

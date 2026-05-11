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
    const getInitialParams = () => {
        const params = new URLSearchParams(window.location.search);
        const search = params.get('search') || '';
        const page = parseInt(params.get('page') || '1', 10);
        
        // Capturar filtros académicos comunes
        const filters: Record<string, any> = {};
        ['faculty_id', 'school_id', 'section_id'].forEach(key => {
            const val = params.get(key);
            if (val) filters[key] = val;
        });

        return { search, page, filters: Object.keys(filters).length > 0 ? filters : null };
    };

    const initialParams = getInitialParams();

    const [data, setData] = useState<TableData<T>>(initialData);
    const [isSearching, setIsSearching] = useState(false);
    const [search, setSearch] = useState(initialParams.search);
    const [activeFilters, setActiveFilters] = useState<Record<
        string,
        unknown
    > | null>(initialParams.filters);
    const [filterClearKey, setFilterClearKey] = useState(0);
    const [localPage, setLocalPage] = useState(initialParams.page);

    const isLocalPagination = Array.isArray(data);

    // --- Carga Inicial para Admins (Deep Linking) ---
    useEffect(() => {
        if (isAdmin) {
            // Si hay algo en la URL que no sea lo por defecto, cargamos data
            const hasParams = initialParams.search || initialParams.page > 1 || initialParams.filters;
            if (hasParams) {
                fetchData(endpoint, {
                    page: initialParams.page,
                    search: initialParams.search,
                    ...initialParams.filters
                });
            }
        }
    }, []);

    // --- Sincronización con URL (Deep Linking) ---
    useEffect(() => {
        const url = new URL(window.location.href);
        const academicKeys = ['faculty_id', 'school_id', 'section_id'];
        
        if (search.trim()) {
            url.searchParams.set('search', search);
            // Si hay búsqueda, limpiamos agresivamente los filtros de la URL
            academicKeys.forEach(key => url.searchParams.delete(key));
        } else {
            url.searchParams.delete('search');
        }

        if (localPage > 1) url.searchParams.set('page', localPage.toString());
        else url.searchParams.delete('page');

        if (activeFilters && !search.trim()) {
            academicKeys.forEach(key => {
                const val = activeFilters[key];
                if (val) url.searchParams.set(key, val.toString());
                else url.searchParams.delete(key);
            });
        } else if (!activeFilters) {
            academicKeys.forEach(key => url.searchParams.delete(key));
        }

        window.history.replaceState({}, '', url.toString());
    }, [search, localPage, activeFilters]);

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
            toast.error('Error al obtener los datos.');
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
        setLocalPage(1);
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
        setLocalPage(1);
        fetchData(endpoint, { search: search.trim() });
    };

    const handlePageChange = (url: string | null) => {
        if (!url) return;
        
        // Extraer página de la URL para sincronizar el estado local (Deep Linking)
        const urlObj = new URL(url, window.location.origin);
        const page = urlObj.searchParams.get('page');
        if (page) setLocalPage(parseInt(page, 10));

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

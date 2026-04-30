import axios from "axios";
import { useConfigTable } from "@/hooks/use-config-table";
import dossiers from "@/routes/academic/dossiers";
import { usePage, router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
    initialData: any;
    target_role_id: number;
    isAdmin: boolean;
}

export function useDossierValidation(
    { initialData, target_role_id, isAdmin }: Props
) {
    const { url } = usePage();
    const params = new URLSearchParams(url.split('?')[1]);
    const itemFromUrl = params.get('a');
    const [selectedId, setSelectedId] = useState<number | null>(itemFromUrl ? Number(itemFromUrl) : null);

    const tableManager = useConfigTable({
        endpoint: '/api/dossiers/filter',
        initialData,
        isAdmin,
        pageSize: 10,
        extraParams: {
            target_role_id,
        },
        onLocalSearch: (item: any, term: string) => {
            const fullName = `${item.user?.person?.surnames} ${item.user?.person?.names}`.toLowerCase();
            const email = (item.user?.email || '').toLowerCase();
            return fullName.includes(term) || email.includes(term);
        },
    });

    const selectedItem = tableManager.displayData.find((item) =>
        item.id === selectedId
    );

    const [itemDetail, setItemDetail] = useState<any>(null);
    const [previewEnabled, setPreviewEnabled] = useState(false);
    const [isSavingValidation, setIsSavingValidation] = useState(false);
    const [selectedType, setSelectedType] = useState(0);

    useEffect(() => {
        if (selectedId) {
            axios.get(dossiers.api.validations.url(selectedId))
                .then(res => setItemDetail(res.data))
                .catch(err => console.log(err));
        }
    }, [selectedId]);

    const handleSelect = (id: number) => {
        /*const url = new URL(window.location.href);
        url.searchParams.set('a', id.toString());
        window.history.pushState({}, '', url.toString());*/
        setSelectedId(id);
    };

    const handleCloseSelected = () => {
        const url = new URL(window.location.href);
        url.searchParams.delete('a');
        window.history.pushState({}, '', url.toString());
        setSelectedId(null);
    };



    const handleSaveValidation = (status: number, message: string) => {
        const currentReq = itemDetail?.requirements?.[selectedType];
        if (!currentReq?.latest) {
            toast.error('No hay documento adjunto para evaluar.');
            return;
        }

        const payload = {
            approval_status: status,
            comment: message,
        };

        setIsSavingValidation(true);
        const patchUrl = dossiers.document.status.url(currentReq.latest.id);

        router.patch(patchUrl, payload, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                // Refrescar el panel de detalles para visualizar nuevo badge/estado
                axios.get(dossiers.api.validations.url(selectedId!))
                    .then((res) => setItemDetail(res.data));

                // Refrescar tabla si es Admin para recuperar últimos estados
                if (isAdmin) {
                    const currentPath = (tableManager.data as any)?.path || '/api/dossiers/filter';
                    const params = {
                        target_role_id,
                        search: tableManager.search.trim(),
                        page: tableManager.localPage,
                        ...(tableManager.activeFilters || {})
                    };
                    tableManager.fetchData(currentPath, params);
                }
            },
            onError: (errors: any) => {
                console.log(errors);
                toast.error('Ocurrió un error al guardar la validación.');
            },
            onFinish: () => {
                setIsSavingValidation(false);
            }
        });
    };

    return {
        tableManager,
        state: {
            selectedId,
            selectedItem,
            itemDetail,
            previewEnabled,
            isSavingValidation,
            selectedType
        },
        actions: {
            handleSelect,
            handleCloseSelected,
            handleSaveValidation,
            setPreviewEnabled,
            setSelectedType,
        }
    };
}
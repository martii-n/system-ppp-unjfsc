import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Validación de Dossiers',
        href: '/academic/dossier-validation',
    },
    {
        title: 'Detalles del Dossier',
        href: '#',
    },
];

export default function DossierValidationDetails({ dossier }: any) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detalles del Dossier" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                    <h2 className="mb-4 text-2xl font-bold">Detalles del Expediente Académico</h2>
                    <p className="mb-6 text-muted-foreground">
                        Revisión de documentos para el usuario: <span className="font-semibold">{dossier.assignment?.user?.name}</span>
                    </p>
                    <div className="text-sm text-center py-10 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed">
                       Próximamente: Lista de documentos del dossier para validación individual.
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

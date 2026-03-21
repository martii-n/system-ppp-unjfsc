import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Validación de Dossiers',
        href: '/academic/dossier-validation',
    },
];

export default function DossierValidationIndex({ dossiers }: any) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Validación de Dossiers" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                    <h2 className="mb-4 text-2xl font-bold">Expedientes Pendientes</h2>
                    <p className="mb-6 text-muted-foreground">
                        Gestiona y revisa las validaciones académicas de estudiantes y docentes.
                    </p>
                    <div className="grid gap-4">
                        {dossiers.map((dossier: any) => (
                            <div key={dossier.id} className="p-4 rounded-lg border bg-card flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold">{dossier.assignment?.user?.name}</h3>
                                    <p className="text-sm text-muted-foreground">{dossier.assignment?.role?.name}</p>
                                </div>
                                <a 
                                    href={`/academic/dossier-validation/${dossier.id}`} 
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
                                >
                                    Ver Detalles
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

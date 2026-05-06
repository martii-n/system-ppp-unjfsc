import { Head, usePage } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import AdminContent from '@/pages/academic/dashboard/admin-content';
import StudentContent from '@/pages/academic/dashboard/student-content';
import SupervisorContent from '@/pages/academic/dashboard/supervisor-content';
import TeacherContent from '@/pages/academic/dashboard/teacher-content';
import SuperAdminContent from '@/pages/admin/dashboard-content';
import { CompanyContent } from '@/pages/company/dashboard-content';

import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard({
    auth,
    role,
}: {
    auth: any;
    role?: number;
}) {
    const { auth: user } = usePage().props as any;
    const userType = auth.user.type;

    if (userType === 'Administrador') {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Panel de Administración" />
                <SuperAdminContent />
            </AppLayout>
        );
    }

    if (userType === 'Empresa') {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard Empresa" />
                <CompanyContent />
            </AppLayout>
        );
    }

    if (userType === 'Académico') {
        const AcademicView =
            {
                1: AdminContent,
                2: AdminContent, // Sub Admin también ve panel admin
                3: TeacherContent,
                4: SupervisorContent,
                5: StudentContent,
            }[role || 0] ||
            (() => (
                <div className="flex h-100 items-center justify-center p-4">
                    <p className="text-center text-muted-foreground">
                        No tienes un rol académico activo asignado.
                        <br />
                        Por favor, selecciona una asignación válida en el menú
                        superior.
                    </p>
                </div>
            ));

        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard Académico" />
                <AcademicView />
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
                <div className="relative min-h-screen flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}

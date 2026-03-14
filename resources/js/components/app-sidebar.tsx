import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid } from 'lucide-react';

import { NavDossier } from '@/components/nav-dossier';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
    ADMIN_NAV,
    ACADEMIC_NAV,
    COMPANY_NAV,
    FOOTER_NAV,
    RESOURCE_BY_TYPE,
} from '@/config/navigation';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/marti-nm/system-ppp-unjfsc',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth, role } = usePage().props as any;

    const userType = auth?.user?.type || 'DEFAULT';
    const userTypeId = auth?.user?.type_id || 0;

    // Usamos directamente las constantes importadas en el objeto
    const menuSelection: Record<string, any[]> = {
        Administrativo: ADMIN_NAV,
        Académico: ACADEMIC_NAV,
        Empresa: COMPANY_NAV,
    };

    const mainNavItems = menuSelection[userType] || [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
    ];

    const filterItems = (items: NavItem[], userRole: number) => {
        return items
            .filter((item) => !item.roles || item.roles.includes(userRole))
            .map((item) => {
                if (item.items) {
                    return {
                        ...item,
                        items: filterItems(item.items, userRole),
                    };
                }
                return item;
            })
            .filter((item) => !item.items || item.items.length > 0);
    };

    // 1. Tomamos los footers estáticos base
    const dynamicFooterNav = footerNavItems.filter((item) => {
        if (!item.roles) return true;
        return item.roles.includes(role);
    });

    // 2. Extraemos el objeto de recurso según el ID del usuario
    // Usamos 'keyof typeof' para que TypeScript no arroje error
    const injectedResource =
        RESOURCE_BY_TYPE[userTypeId as keyof typeof RESOURCE_BY_TYPE];

    // 3. Si existe, lo añadimos como el primer elemento, seguido de los estáticos
    /*const filteredFooterNav = injectedResource
        ? [injectedResource, ...dynamicFooterNav]
        : dynamicFooterNav;*/

    const filteredFooterNav = FOOTER_NAV.filter((item) => {
        if (!item.userTypes) return true;
        return item.userTypes.includes(userTypeId);
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavDossier items={filterItems(mainNavItems, role)} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={filteredFooterNav} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

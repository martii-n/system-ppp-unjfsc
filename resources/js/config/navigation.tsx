import {
    Archive,
    BadgeCheck,
    BookMarked,
    BookOpen,
    Boxes,
    Briefcase,
    Folder,
    LayoutDashboard,
    UserRoundCog,
} from 'lucide-react';
import { dashboard } from '@/routes';
import { index as semestersIndex } from '@/routes/semesters';

export const ACADEMIC_NAV = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutDashboard,
    },
    {
        title: 'Validaciones',
        href: '#',
        icon: BadgeCheck,
        roles: [1, 2, 3],
        items: [
            {
                title: 'Mi validación',
                href: '#',
                roles: [3, 4],
            },
            {
                title: 'Docente Titular',
                href: '#',
                roles: [1, 2],
            },
            {
                title: 'Docente Supervisor',
                href: '#',
                roles: [1, 2, 3],
            },
            {
                title: 'Estudiante',
                href: '#',
                roles: [1, 2, 3],
            },
        ],
    },
    {
        title: 'Grupos',
        href: '#',
        icon: Boxes,
        roles: [1, 2, 3, 4],
        items: [
            {
                title: 'Por Práctica',
                href: '#',
                roles: [1, 2, 3],
            },
            {
                title: 'Por Estudiante',
                href: '#',
                roles: [1, 2, 3, 4],
            },
        ],
    },
    {
        title: 'Seguimiento',
        href: '#',
        icon: BookMarked,
        roles: [1, 2, 3],
        items: [
            {
                title: 'Est. Prácticas',
                href: '#',
                roles: [1, 2, 3],
            },
            {
                title: 'Eval. Prácticas',
                href: '#',
                roles: [1, 2, 3],
            },
            {
                title: 'Rev. Prácticas',
                href: '#',
                roles: [1, 2, 3],
            },
        ],
    },
    {
        title: 'Usuarios',
        href: '#',
        icon: UserRoundCog,
        roles: [1, 2, 3],
        items: [
            {
                title: 'Nuevo Usuario',
                href: '#',
                roles: [1, 2, 3],
            },
        ],
    },
    {
        title: 'Academico',
        href: '#',
        icon: Folder,
        roles: [1, 2],
        items: [
            {
                title: 'Semestres',
                href: semestersIndex().url,
                roles: [1, 2, 3],
            },
            {
                title: 'Facultades',
                href: '#',
                roles: [1, 2, 4],
            },
            {
                title: 'Escuelas',
                href: '#',
                roles: [1, 2],
            },
            {
                title: 'Secciones',
                href: '#',
                roles: [1, 2],
            },
        ],
    },
];

export const COMPANY_NAV = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutDashboard,
    },
    {
        title: 'Mis vacantes',
        href: '#',
        icon: Briefcase,
    },
];

export const ADMIN_NAV = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutDashboard,
    },
    {
        title: 'Usuarios',
        href: '#',
        icon: Briefcase,
    },
];

export const FOOTER_NAV = [
    {
        title: 'Recursos Administrativos',
        href: '#',
        icon: Archive,
        userTypes: [1],
    },
    {
        title: 'Recursos Académicos',
        href: '#',
        icon: Archive,
        userTypes: [2],
    },
    {
        title: 'Recursos Empresariales',
        href: '#',
        icon: Archive,
        userTypes: [3],
    },
    {
        title: 'Repository',
        href: 'https://github.com/marti-nm/system-ppp-unjfsc',
        icon: Folder,
        userTypes: [1],
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
        userTypes: [1],
    },
];

export const RESOURCE_BY_TYPE = {
    1: {
        title: 'Recursos Admin',
        href: '#',
        icon: Archive,
    },
    2: {
        title: 'Recursos Académico',
        href: '#',
        icon: Archive,
    },
    3: {
        title: 'Recursos Empresa',
        href: '#',
        icon: Archive,
    },
};

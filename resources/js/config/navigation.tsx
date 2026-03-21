import {
    Archive,
    BadgeCheck,
    BookMarked,
    BookOpen,
    Boxes,
    Briefcase,
    Folder,
    LayoutDashboard,
    UserPlus2,
    UserRoundCog,
} from 'lucide-react';
import { dashboard } from '@/routes';
import { index as semestersIndex } from '@/routes/semesters';
import { index as facultiesIndex } from '@/routes/faculties';
import { index as schoolsIndex } from '@/routes/schools';
import { index as sectionsIndex } from '@/routes/sections';
import { index as registerIndex } from '@/routes/register';
import { index as subadminsIndex } from '@/routes/subadmins';
import { index as teachersIndex } from '@/routes/teachers';
import { index as supervisorsIndex } from '@/routes/supervisors';
import { index as studentsIndex } from '@/routes/students';
import { submission as dossierSubmissionIndex } from '@/routes/dossiers';
import { validation as dossierValidationIndex } from '@/routes/dossiers';

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
                href: dossierSubmissionIndex().url,
                roles: [3, 4, 5],
            },
            {
                title: 'Docente Titular',
                href: dossierValidationIndex().url,
                roles: [1, 2],
            },
            {
                title: 'Docente Supervisor',
                href: '/academic/dossier-validation',
                roles: [1, 2, 3],
            },
            {
                title: 'Estudiante',
                href: '/academic/dossier-validation',
                roles: [1, 2, 3],
            },
        ],
    },
    {
        title: 'Mi validación',
        href: dossierSubmissionIndex().url,
        icon: BadgeCheck,
        roles: [4, 5],
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
                href: registerIndex().url,
                icon: UserPlus2,
                roles: [1, 2, 3],
            },
            {
                title: 'L. de Subadmins',
                href: subadminsIndex().url,
                roles: [1],
            },
            {
                title: 'L. de Docentes Titulares',
                href: teachersIndex().url,
                roles: [1, 2, 3],
            },
            {
                title: 'L. de Docentes Supervisores',
                href: supervisorsIndex().url,
                roles: [1, 2, 3],
            },
            {
                title: 'L. de Estudiantes',
                href: studentsIndex().url,
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
                href: facultiesIndex().url,
                roles: [1, 2, 4],
            },
            {
                title: 'Escuelas',
                href: schoolsIndex().url,
                roles: [1, 2],
            },
            {
                title: 'Secciones',
                href: sectionsIndex().url,
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

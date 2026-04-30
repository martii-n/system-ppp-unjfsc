export interface PersonFlowProps {
    roles: any[];
    faculties: any[];
    schools: any[];
    sections: any[];
    mode: 'individual' | 'masivo';
    initialFilters?: any;
    onBack: () => void;
}

export interface PersonInitialState {
    role_id: string;
    faculty_id: string;
    school_id: string;
    section_id: string;

    email: string;
    user_exists: boolean;
    user_id: number | null;

    person_exists: boolean;
    person_id: number | null;
    dni: string;
    names: string;
    surnames: string;
    gender: string;

    rows: any[];
    report: any;
}
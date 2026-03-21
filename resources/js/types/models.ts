export interface Semester {
    id: number;
    code: string;
    cycle: string;
    status: number;
}

export interface Section {
    id: number;
    name: string;
    faculty_id: number;
    school_id: number;
    semester_id: number;
    status: number;
    school?: School;
    faculty?: Faculty;
}

export interface School {
    id: number;
    name: string;
    faculty_id: number;
    status: number;
    faculty?: Faculty;
    sections?: Section[];
}

export interface Faculty {
    id: number;
    name: string;
    status: number;
}
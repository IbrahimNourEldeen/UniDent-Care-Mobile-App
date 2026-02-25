export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    statusCode: number;
    warnings: string[];
    error: {
        type: string;
        errors: string[];
    };
    links: string;
}

export type UserBase = {
    userId: string;
    fullName: string;
    email: string;
    createAt: string;
};

export type StudentUser = UserBase & {
    university: string;
    universityId: string;
    level: number;
    totalRequests: number;
    approvedRequests: number;
    totalSessions: number;
};

export type DoctorUser = UserBase & {
    name: string;
    specialty: string;
    universityId: string;
    totalStudents: number;
    pendingRequests: number;
    approvedRequests: number;
};

export type PatientUser = UserBase & {
    phone: string;
    age: number;
    totalCases: number;
    activeCases: number;
};

export type User = StudentUser | DoctorUser | PatientUser;

export interface AuthData<TUser = User> {
    token: string;
    roles: string[];
    user: TUser;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export type LoginResponse = ApiResponse<AuthData>;
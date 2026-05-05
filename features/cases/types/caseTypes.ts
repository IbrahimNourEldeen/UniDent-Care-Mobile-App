import { ApiResponse } from "../../../types/types";


export interface CaseCardProps {
    caseItem: CaseItem;
}

export interface CaseItem {
    id: string;
    patientId: string;
    patientName: string;
    patientAge: number;
    caseType: CaseType | null;
    status: string;
    createAt: string;
    totalSessions: number;
    pendingRequests: number;
    imageUrls: string[];
}

export interface CaseType {
    publicId: string;
    name: string;
    description: string;
}

export interface MetaData {
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    items: CaseItem[];
    totalCount: number;
    totalPages: number;
}


export type Cases = CaseCardProps["caseItem"][];

export interface AvailableCasesResponse extends ApiResponse<MetaData> { }



export interface CaseRequestBody {
    patientCasePublicId: string;
    studentPublicId: string;
    doctorPublicId: string;
    description: string;
}

export interface CaseRequestData {
    id: string;
    patientCaseId: string;
    patientName: string;
    caseName: string;
    studentId: string;
    studentName: string;
    university: string;
    level: number;
    doctorId: string;
    doctorName: string;
    description: string;
    status: string;
    createAt: string;
}

export type CaseRequestResponse = ApiResponse<CaseRequestData>;

export interface CaseTypeResponse extends ApiResponse<{
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    items: CaseType[];
}> { }

/* ─── Student: My Cases & My Requests ─────────────────────────────────────── */

export interface ToothData {
    number: number;
    status: string;
    treatmentType?: string;
    notes?: string;
}

export interface DiagnosisDto {
    id: string;
    diagnosisStage?: string;
    stage?: number;
    caseType: string;
    caseTypeId?: string;
    notes: string;
    teethNumbers: number[];
    teeth?: ToothData[];
}

export interface UserFlags {
    isOwner: boolean;
    role: string;
    isAssignedDoctor: boolean;
    isAssignedStudent: boolean;
    isAssignedToMe: boolean;
    hasRequest: boolean;
    requestId: string;
    requestStatus: string;
}

export interface StudentCaseItem {
    id: string;
    patientId: string;
    patientName: string;
    patientAge: number;
    phone?: string;
    city?: string;
    nationalId?: string;
    gender?: string | null;
    title?: string;
    status: string;
    caseType?: CaseType | null;
    caseTypeId?: string;
    processStatus: string;
    isPublic: boolean;
    universityId: string;
    universityName: string;
    progressStep?: number;
    createAt: string;
    totalSessions: number;
    hasEvaluatedSession: boolean;
    pendingRequests: number;
    assignedStudentId: string;
    assignedDoctorId: string;
    diagnosisdto: DiagnosisDto | null;
    diagnoses?: DiagnosisDto[];
    imageUrls: string[];
    createdById: string;
    createdByRole: string;
    userFlags: UserFlags;
    description?: string;
    completedAt?: string;
    availableActions: string[];
}

export interface StudentRequestItem {
    id: string;
    patientCasePublicId: string;
    patientName: string;
    caseName: string;
    studentPublicId: string;
    studentName: string;
    university: string;
    level: number;
    doctorId: string;
    doctorName: string;
    description: string;
    status: string;
    createAt: string;
}

export interface StudentMyCasesQueryParams {
    caseType?: string;
    page?: number;
    pageSize?: number;
}

export interface StudentMyRequestsQueryParams {
    status?: string;
    page?: number;
    pageSize?: number;
}

export interface StudentMyCasesMetaData {
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    items: StudentCaseItem[];
}

export interface StudentMyRequestsMetaData {
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    items: StudentRequestItem[];
}

export type MyStudentCasesResponse = ApiResponse<StudentMyCasesMetaData>;
export type MyStudentRequestsResponse = ApiResponse<StudentMyRequestsMetaData>;

/* ─── Sessions ─────────────────────────────────────────────────────────────── */

export interface SessionDto {
    id: string;
    caseId: string;
    treatmentType: string | null;
    patientId: string;
    patientName: string | null;
    studentId: string;
    studentName: string | null;
    scheduledAt: string;
    endAt: string;
    status: string | null; // e.g. "Scheduled", "Completed", "Cancelled"
    location: string | null;
    totalNotes: number;
    totalMedia: number;
    createAt: string;
}

export interface CreateSessionPayload {
    studentId: string;
    patientCaseId: string;
    sessionDate: string; // ISO date-time
    location?: string;
}

export interface SessionPagedResult {
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    items: SessionDto[];
}

export type SessionsResponse = ApiResponse<SessionPagedResult>;
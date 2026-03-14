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

export interface CaseDetailResponse extends ApiResponse<CaseItem> { }

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
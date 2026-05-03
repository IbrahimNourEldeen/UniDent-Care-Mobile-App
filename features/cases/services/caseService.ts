import { ApiResponse } from "@/types/types";
import api from "@/utils/api";
import {
    CaseDetailResponse,
    CreateSessionPayload,
    MyStudentCasesResponse,
    MyStudentRequestsResponse,
    SessionsResponse,
    StudentMyCasesQueryParams,
    StudentMyRequestsQueryParams,
} from "../types/caseTypes";


export const createCase = (data: {
    PatientId: string;
    Title: string;
    Description: string;
    CaseTypeId: string;
    IsPublic?: boolean;
    UniversityId?: string;
    Images?: File[];
}) => {
    const formData = new FormData();
    formData.append("PatientId", data.PatientId);
    formData.append("Title", data.Title);
    formData.append("Description", data.Description);
    formData.append("CaseTypeId", data.CaseTypeId);
    
    if (data.IsPublic !== undefined) {
        formData.append("IsPublic", String(data.IsPublic));
    }
    if (data.UniversityId) {
        formData.append("UniversityId", data.UniversityId);
    }

    if (data.Images && data.Images.length > 0) {
        data.Images.forEach((image) => {
            formData.append("Images", image as any);
        });
    }

    return api.post("/Cases", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const createCaseAI = (data: {
    PatientId: string;
    Title: string;
    Description: string;
    CaseTypeId: string;
    Images?: any[];
}) => {
    const formData = new FormData();
    formData.append("PatientId", data.PatientId);
    formData.append("Title", data.Title);
    formData.append("Description", data.Description);
    formData.append("CaseTypeId", data.CaseTypeId);
    
    if (data.Images && data.Images.length > 0) {
        data.Images.forEach((image) => {
            formData.append("Images", image as any);
        });
    }

    return api.post("/Cases/ai/create", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            "X-AI-API-KEY": "this_key_for_ai_created_by_omargamal",
        },
    });
};

export const createDiagnosisAI = (data: {
    patientCaseId: string;
    caseTypeId: string;
    note: string;
}) => {
    return api.post("/Diagnoses/ai/create", data, {
        headers: {
            "X-AI-API-KEY": "this_key_for_ai_created_by_omargamal",
        },
    });
};

export async function getStudentMyCases(
    params: StudentMyCasesQueryParams = {},
): Promise<MyStudentCasesResponse> {
    const res = await api.get("/Students/my-cases", { params });
    return res.data;
}

export async function getStudentMyRequests(
    params: StudentMyRequestsQueryParams = {},
): Promise<MyStudentRequestsResponse> {
    const res = await api.get("/Students/my-requests", { params });
    return res.data;
}

export async function cancelCaseRequest(requestId: string, studentId: string): Promise<ApiResponse<boolean>> {
    const res = await api.delete(`/CaseRequests/${requestId}/${studentId}`);
    return res.data;
}

export async function getCaseById(caseId: string): Promise<CaseDetailResponse> {
    const res = await api.get(`/Cases/${caseId}`);
    return res.data;
}

export async function updateCaseStatus(
    caseId: string,
    status: string,
): Promise<ApiResponse<boolean>> {
    const res = await api.put(`/Cases/${caseId}/status`, { status });
    return res.data;
}

export async function getCaseStatuses(): Promise<{ name: string; value: number }[]> {
    // Note: this endpoint is at the root, not under /api
    const res = await api.get("../case-status");
    return res.data;
}

// ─── Sessions ────────────────────────────────────────────────────────────────

export async function getSessionsByCase(
    caseId: string,
    params: { page?: number; pageSize?: number } = {},
): Promise<SessionsResponse> {
    const res = await api.get(`/Sessions/case/${caseId}`, { params });
    return res.data;
}

export async function getSessionsByStudent(
    studentId: string,
    params: { page?: number; pageSize?: number } = {},
): Promise<SessionsResponse> {
    const res = await api.get(`/Sessions/student/${studentId}`, { params });
    return res.data;
}


export async function getUpcomingSessions(
    studentId: string,
    params: { page?: number; pageSize?: number } = {},
): Promise<SessionsResponse> {
    const res = await api.get('/Sessions/schedule/upcoming', { params: { studentId, ...params } });
    return res.data;
}

export async function createSession(
    data: CreateSessionPayload,
): Promise<ApiResponse<string>> {
    const res = await api.post("/Sessions", data);
    return res.data;
}

export async function deleteSession(
    sessionId: string,
): Promise<ApiResponse<boolean>> {
    const res = await api.delete(`/Sessions/${sessionId}`);
    return res.data;
}

import { ApiResponse } from "@/types/types";
import api from "@/utils/api";
import {

    CreateSessionPayload,
    MyStudentCasesResponse,
    MyStudentRequestsResponse,
    SessionsResponse,
    StudentMyCasesQueryParams,
    StudentMyRequestsQueryParams,
} from "../types/caseTypes";


export const createCase = (data: {
    NationalId: string;
    Description: string;
    IsPublic?: boolean;
    UniversityId?: string;
    Images?: any[];
    InitialDiagnosis?: {
        Stage: number;
        CaseTypeId: string;
        Notes?: string;
        TeethNumbers?: number[];
    };
    CreatedById: string;
    CreatedByRole: string;
}) => {
    const formData = new FormData();
    formData.append("NationalId", data.NationalId);
    formData.append("Description", data.Description);
    formData.append("CreatedById", data.CreatedById);
    formData.append("CreatedByRole", data.CreatedByRole);
    
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

    if (data.InitialDiagnosis) {
        formData.append("InitialDiagnosis.Stage", String(data.InitialDiagnosis.Stage));
        formData.append("InitialDiagnosis.CaseTypeId", data.InitialDiagnosis.CaseTypeId);
        if (data.InitialDiagnosis.Notes) {
            formData.append("InitialDiagnosis.Notes", data.InitialDiagnosis.Notes);
        }
        if (data.InitialDiagnosis.TeethNumbers && data.InitialDiagnosis.TeethNumbers.length > 0) {
            data.InitialDiagnosis.TeethNumbers.forEach((num, idx) => {
                formData.append(`InitialDiagnosis.TeethNumbers[${idx}]`, String(num));
            });
        }
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
    IsPublic?: boolean;
    UniversityId?: string;
    CreatedById: string;
    CreatedByRole: string;
    Images?: any[];
}) => {
    const formData = new FormData();
    formData.append("PatientId", data.PatientId);
    formData.append("Title", data.Title);
    formData.append("Description", data.Description);
    formData.append("CaseTypeId", data.CaseTypeId);
    formData.append("CreatedById", data.CreatedById);
    formData.append("CreatedByRole", data.CreatedByRole);

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

    return api.post("/Cases/ai/create", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            "X-AI-API-KEY": "this_key_for_ai_created_by_omargamal",
        },
    });
};

export const createDiagnosisAI = (data: {
    patientCaseId: string;
    stage: number;
    caseTypeId: string;
    notes?: string;
    createdById?: string;
    role?: string;
    teethNumbers?: number[];
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

// ─── Session Status ───────────────────────────────────────────────────────────

export async function updateSessionStatus(
    sessionId: string,
    body: { sessionId: string; status: string },
): Promise<ApiResponse<boolean>> {
    const res = await api.put(`/Sessions/${sessionId}/status`, body);
    return res.data;
}

// ─── Session Evaluation ───────────────────────────────────────────────────────

export async function evaluateSession(
    sessionId: string,
    body: { grade: number; note: string; isFinalSession: boolean },
): Promise<ApiResponse<boolean>> {
    const res = await api.put(`/Sessions/${sessionId}/evaluate`, body);
    return res.data;
}

// ─── Session Notes ────────────────────────────────────────────────────────────

export async function getSessionNotes(
    sessionId: string,
): Promise<ApiResponse<any[]>> {
    const res = await api.get(`/Sessions/${sessionId}/notes`);
    return res.data;
}

export async function addSessionNote(
    sessionId: string,
    body: { sessionId: string; note: string },
): Promise<ApiResponse<any>> {
    const res = await api.post(`/Sessions/${sessionId}/notes`, body);
    return res.data;
}

export async function addNoteMedia(
    sessionId: string,
    noteId: string,
    file: any,
): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file as any);
    const res = await api.post(`/Sessions/${sessionId}/notes/${noteId}/media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
}

// ─── Timeline (sessions with evaluation data) ─────────────────────────────────

export async function getSessionTimeline(
    caseId: string,
    params: { pageNumber?: number; pageSize?: number } = {},
): Promise<any> {
    const res = await api.get(`/Sessions/case/${caseId}`, {
        params: { pageNumber: params.pageNumber ?? 1, pageSize: params.pageSize ?? 100 },
    });
    return res.data;
}


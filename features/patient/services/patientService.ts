import api from "@/utils/api";
import { ApiResponse } from "@/types/types";

// Patient Case Service
export const getPatientCases = async (patientId: string, params: { page?: number; pageSize?: number } = {}) => {
    const res = await api.get(`/Cases/patient/${patientId}`, { params });
    return res.data;
};

// Patient Sessions Service
export const getPatientSessions = async (patientId: string, params: { page?: number; pageSize?: number } = {}) => {
    const res = await api.get(`/Sessions/patient/${patientId}`, { params });
    return res.data;
};

// Patient Upcoming Sessions
export const getPatientUpcomingSessions = async (patientId: string) => {
    try {
        const res = await api.get(`/Sessions/schedule/upcoming`, { params: { patientId } });
        return res.data;
    } catch (error: any) {
        // Fallback if the endpoint does not exist yet
        console.warn("Upcoming schedule endpoint might not exist, falling back to all sessions filter.");
        const res = await api.get(`/Sessions/patient/${patientId}`, { params: { page: 1, pageSize: 100 } });
        const allSessions = res.data?.data?.items || res.data?.data || [];
        const upcoming = allSessions.filter((s: any) => s.status === "Scheduled" || s.status === 0);
        return { success: true, data: upcoming };
    }
};

// Patient Case Diagnoses
export const getCaseDiagnoses = async (caseId: string) => {
    const res = await api.get(`/Diagnoses/case/${caseId}`);
    return res.data;
};

// User Details (for names in timeline)
export const getStudentDetails = async (id: string) => {
    const res = await api.get(`/Students/${id}`);
    return res.data;
};

export const getDoctorDetails = async (id: string) => {
    const res = await api.get(`/Doctors/${id}`);
    return res.data;
};
export const updatePatientProfile = async (patientId: string, data: any) => {
    const res = await api.put(`/Patients/${patientId}`, data);
    return res.data;
};

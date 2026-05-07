import axios from "axios";
import api from "../../../utils/api";
import { PatientSignupValues } from "../schemas/patientSignupSchema";
import { DoctorSignupValues } from "../schemas/doctorSignupSchema";
import { StudentSignupValues } from "../schemas/studentSignupSchema";
import { ApiResponse, LoginRequest, LoginResponse, UniversityMembersResponse, UniversityLookupResponse, City } from "@/types/types";

export const authService = {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>(`/Auth/login`, credentials);
        return response.data;
    },
    logout: async (): Promise<void> => {
        await api.post("/Auth/logout");
    },
    forgotPassword: async (email: string): Promise<ApiResponse<string>> => {
        const response = await api.post<ApiResponse<string>>("/Auth/forgot-password", { email });
        return response.data;
    },
    resetPassword: async (data: any): Promise<ApiResponse<string>> => {
        const response = await api.post<ApiResponse<string>>("/Auth/reset-password", data);
        return response.data;
    },
    registerPatient: async (data: PatientSignupValues): Promise<ApiResponse<any>> => {
        const response = await api.post<ApiResponse<any>>(`/Patients`, data);
        return response.data;
    },
    registerDoctor: async (data: DoctorSignupValues): Promise<ApiResponse<any>> => {
        const response = await api.post<ApiResponse<any>>("/Doctors", data);
        return response.data;
    },
    registerStudent: async (data: StudentSignupValues): Promise<ApiResponse<any>> => {
        const response = await api.post<ApiResponse<any>>("/Students", data);
        return response.data;
    },
    getUniversityMembers: async (params?: { name?: string; role?: string }): Promise<UniversityMembersResponse> => {
        const response = await api.get<UniversityMembersResponse>("/UniversityMembers", { params });
        return response.data;
    },
    getUniversitiesLookup: async (): Promise<UniversityLookupResponse> => {
        const response = await api.get<UniversityLookupResponse>("/Universities/lookup");
        return response.data;
    },
    getCitiesLookup: async (): Promise<City[]> => {
        const response = await axios.get("https://raw.githubusercontent.com/Tech-Labs/egypt-governorates-and-cities-db/master/cities.json");
        return response.data[2].data;
    },
};

export const getProfileByRole = async (role: string, publicId: string) => {
    switch (role) {
        case "Student": {
            const res = await api.get(`/Students/${publicId}`);
            return res.data.data;
        }
        case "Doctor":
        case "ClinicalDoctor": {
            const res = await api.get(`/Doctors/${publicId}`);
            return res.data.data;
        }
        case "Patient": {
            const res = await api.get(`/Patients/${publicId}`);
            return res.data.data;
        }
        default:
            throw new Error("Unknown role");
    }
};
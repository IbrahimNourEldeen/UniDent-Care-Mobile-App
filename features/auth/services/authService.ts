import api from "../../../utils/api";
import { PatientSignupValues } from "../schemas/patientSignupSchema";
import { DoctorSignupValues } from "../schemas/doctorSignupSchema";
import { StudentSignupValues } from "../schemas/studentSignupSchema";
import { ApiResponse, LoginRequest, LoginResponse } from "@/types/types";

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
};

export const getProfileByRole = async (role: string, publicId: string) => {
    const endpoint = role === "Student" ? "Students" : role === "Doctor" ? "Doctors" : "Patients";
    const res = await api.get(`/${endpoint}/${publicId}`);
    return res.data.data;
};
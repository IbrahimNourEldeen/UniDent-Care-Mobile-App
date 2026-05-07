import api from "@/utils/api";
import { CaseTypeResponse } from "../types/caseTypes";

export async function getCaseTypes(page: number = 1, pageSize: number = 100, search?: string): Promise<CaseTypeResponse> {
    try {
        const response = await api.get('/CaseTypes', {
            params: { page, pageSize, search }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to fetch case types");
    }
}
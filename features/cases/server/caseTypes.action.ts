import axios, { AxiosRequestConfig } from "axios";
import { CaseTypeResponse } from "../types/caseTypes";

export async function getCaseTypes(page: number = 1, pageSize: number = 100, search?: string): Promise<CaseTypeResponse> {
    try {
        const options: AxiosRequestConfig = {
            url: `https://dental-hup1.runasp.net/api/CaseTypes`,
            method: "GET",
            params: { page, pageSize, search },
        };
        const response = await axios.request(options);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to fetch case types");
    }
}
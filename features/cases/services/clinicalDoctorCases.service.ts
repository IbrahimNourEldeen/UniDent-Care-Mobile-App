import api from '@/utils/api';

export const fetchCasesForClinicalDoctor = async (queryParams?: {
    page?: number;
    pageSize?: number;
    caseType?: string;
    status?: string;
    search?: string;
}) => {
    try {
        const response = await api.get('/Cases', {
            params: queryParams,
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching cases for ClinicalDoctor:', error);
        throw error;
    }
};

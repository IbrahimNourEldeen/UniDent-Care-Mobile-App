import { useQuery } from '@tanstack/react-query';
import { patientKeys } from './patientQueryKeys';
import { getPatientCases } from '../services/patientService';

export function usePatientCasesQuery(patientId: string) {
    const { data: cases = [], isLoading, isError, refetch } = useQuery({
        queryKey: patientKeys.allCases(patientId),
        queryFn: async () => {
            const res = await getPatientCases(patientId, { page: 1, pageSize: 100 });
            const items = res?.data?.items || res?.data || [];
            // Sort by newest first
            return items.sort((a: any, b: any) => new Date(b.createAt).getTime() - new Date(a.createAt).getTime());
        },
        enabled: !!patientId,
    });

    return {
        cases,
        isLoading,
        isError,
        refetch
    };
}

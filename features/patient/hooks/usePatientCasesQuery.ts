import { useQuery } from '@tanstack/react-query';
import { patientKeys } from './patientQueryKeys';
import { getPatientCases, getCaseDiagnoses } from '../services/patientService';

export function usePatientCasesQuery(patientId: string) {
    const { data: cases = [], isLoading, isError, refetch } = useQuery({
        queryKey: patientKeys.allCases(patientId),
        queryFn: async () => {
            const res = await getPatientCases(patientId, { page: 1, pageSize: 100 });
            let items = res?.data?.items || res?.data || [];
            
            // Fetch diagnoses for each case to get the caseTypeName (matching web behavior)
            const casesWithDiagnoses = await Promise.all(items.map(async (c: any) => {
                try {
                    const dxRes = await getCaseDiagnoses(c.id);
                    // Handle paginated or direct array response within the 'data' field
                    const dxData = dxRes?.data?.items || dxRes?.data || [];
                    const diagnoses = Array.isArray(dxData) ? dxData : (dxData?.items || dxData || []);
                    return { ...c, diagnosisdto: Array.isArray(diagnoses) ? diagnoses : [diagnoses] };
                } catch {
                    return c;
                }
            }));

            // Sort by newest first
            return casesWithDiagnoses.sort((a: any, b: any) => new Date(b.createAt).getTime() - new Date(a.createAt).getTime());
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

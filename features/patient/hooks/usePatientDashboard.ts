import { useQuery } from '@tanstack/react-query';
import { patientKeys } from './patientQueryKeys';
import { 
    getPatientCases, 
    getPatientSessions, 
    getPatientUpcomingSessions, 
    getCaseDiagnoses,
    getStudentDetails,
    getDoctorDetails
} from '../services/patientService';
import { generatePatientDashboardData, DashboardData } from '../../dashboard/services/patientDashboardAnalytics';

export function usePatientDashboard(patientId: string) {
    // 1. Fetch Cases
    const casesQuery = useQuery({
        queryKey: patientKeys.allCases(patientId),
        queryFn: async () => {
            const res = await getPatientCases(patientId, { page: 1, pageSize: 50 });
            const items = res?.data?.items || res?.data || [];
            return items;
        },
        enabled: !!patientId,
    });

    // 2. Fetch Sessions
    const sessionsQuery = useQuery({
        queryKey: patientKeys.allSessions(patientId),
        queryFn: async () => {
            const res = await getPatientSessions(patientId, { page: 1, pageSize: 100 });
            return res?.data?.items || res?.data || [];
        },
        enabled: !!patientId,
    });

    // 3. Fetch Upcoming Sessions
    const upcomingSessionsQuery = useQuery({
        queryKey: patientKeys.upcomingSessions(patientId),
        queryFn: async () => {
            const res = await getPatientUpcomingSessions(patientId);
            return res?.data?.items || res?.data || [];
        },
        enabled: !!patientId,
    });

    // 4. Fetch Diagnoses (Looping over cases)
    const diagnosesQuery = useQuery({
        queryKey: patientKeys.diagnoses(patientId),
        queryFn: async () => {
            const cases = casesQuery.data || [];
            if (cases.length === 0) return [];

            const diagnosesPromises = cases.map((c: any) => getCaseDiagnoses(c.id).catch(() => null));
            const dxResponses = await Promise.all(diagnosesPromises);
            
            let allDiagnoses: any[] = [];
            dxResponses.forEach(res => {
                if (res?.data) {
                    const dxData = Array.isArray(res.data) ? res.data : res.data?.items || [];
                    allDiagnoses = [...allDiagnoses, ...dxData];
                }
            });
            return allDiagnoses;
        },
        enabled: !!patientId && !!casesQuery.data,
    });

    // 5. Fetch User Names (Students/Doctors assigned to cases)
    const userNamesQuery = useQuery({
        queryKey: ['patient', patientId, 'userNames'],
        queryFn: async () => {
            const cases = casesQuery.data || [];
            const studentIds = [...new Set(cases.map((c: any) => c.assignedStudentId).filter((id: any) => !!id))];
            const doctorIds = [...new Set(cases.map((c: any) => c.assignedDoctorId).filter((id: any) => !!id))];
            
            const userNamesMap: Record<string, string> = {};
            
            await Promise.all([
                ...studentIds.map(async (id: any) => {
                    try {
                        const res = await getStudentDetails(id);
                        const name = res?.data?.fullName || res?.fullName;
                        if (name) userNamesMap[id] = name;
                    } catch {}
                }),
                ...doctorIds.map(async (id: any) => {
                    try {
                        const res = await getDoctorDetails(id);
                        const name = res?.data?.fullName || res?.fullName;
                        if (name) userNamesMap[id] = name;
                    } catch {}
                })
            ]);
            return userNamesMap;
        },
        enabled: !!patientId && !!casesQuery.data,
    });

    const isLoading = casesQuery.isLoading || 
                      sessionsQuery.isLoading || 
                      upcomingSessionsQuery.isLoading || 
                      (!!casesQuery.data && (diagnosesQuery.isLoading || userNamesQuery.isLoading));
    
    const isError = casesQuery.isError || sessionsQuery.isError || upcomingSessionsQuery.isError || diagnosesQuery.isError;

    // Transform data once all queries are done
    const dashboardData: DashboardData | null = (!isLoading && casesQuery.data && sessionsQuery.data && upcomingSessionsQuery.data)
        ? generatePatientDashboardData(
            casesQuery.data,
            sessionsQuery.data,
            upcomingSessionsQuery.data,
            diagnosesQuery.data || [],
            userNamesQuery.data || {}
        )
        : null;

    const refetchAll = async () => {
        await Promise.all([
            casesQuery.refetch(),
            sessionsQuery.refetch(),
            upcomingSessionsQuery.refetch(),
            diagnosesQuery.refetch(),
            userNamesQuery.refetch()
        ]);
    };

    return {
        dashboardData,
        cases: casesQuery.data || [],
        sessions: sessionsQuery.data || [],
        upcomingSessions: upcomingSessionsQuery.data || [],
        isLoading,
        isError,
        refetchAll
    };
}

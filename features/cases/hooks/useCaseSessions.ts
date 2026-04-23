import { RootState } from '@/store/store';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSession, deleteSession, getSessionsByCase } from '../services/caseService';
import { SessionDto } from '../types/caseTypes';
import { showToast } from '@/store/slices/uiSlice';


export function useCaseSessions(caseId: string, patientCaseId: string) {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);

    const studentId = user?.publicId ?? '';

    const [sessions, setSessions] = useState<SessionDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const fetchSessions = useCallback(async () => {
        if (!caseId) return;
        setIsLoading(true);
        try {
            console.log('[DEBUG] Fetching sessions for case:', caseId);
            const res = await getSessionsByCase(caseId, { pageSize: 50 });
            if (res.success && res.data) {
                console.log('[DEBUG] Sessions fetched:', res.data.items?.length ?? 0);
                setSessions(res.data.items ?? []);
            }

        } catch (err: any) {
            console.error('Failed to fetch sessions', err);
        } finally {
            setIsLoading(false);
        }
    }, [caseId]);

    useEffect(() => { fetchSessions(); }, [fetchSessions]);

    const addSession = useCallback(async (sessionDate: string, location?: string): Promise<boolean> => {
        if (!studentId || !patientCaseId) {
            dispatch(showToast({ message: 'Missing required data to create session.', type: 'error' }));
            return false;
        }

        setIsSubmitting(true);
        try {
            console.log('[DEBUG] addSession payload:', { studentId, patientCaseId, sessionDate, location });
            const res = await createSession({ studentId, patientCaseId, sessionDate, location });
            console.log('[DEBUG] addSession response:', res); // Use direct log to see if it's empty or object

            // Since we are in the try block, the axios status is 2xx.
            // If res is empty string, it might be a 204 No Content. 
            // If it's an object, we check res.success.
            const isSuccess = (res as any) === "" || (res && ((res as any).success === true || (res as any).data));


            if (isSuccess) {
                dispatch(showToast({ message: 'Session scheduled successfully', type: 'success' }));
                await fetchSessions();
                return true;
            }
            
            const errorMsg = res?.message || 'The server rejected this session. Please check the timing.';
            dispatch(showToast({ message: errorMsg, type: 'error' }));
            return false;
        } catch (err: any) {
            console.error('[DEBUG] addSession exception. Status:', err.response?.status);
            console.error('[DEBUG] addSession exception. Data:', JSON.stringify(err.response?.data, null, 2));
            const msg = err.response?.data?.message || err.response?.data?.error?.errors?.[0] || err.message || 'An unexpected error occurred.';
            dispatch(showToast({ message: msg, type: 'error' }));
            return false;
        } finally {

            setIsSubmitting(false);
        }

    }, [studentId, patientCaseId, fetchSessions]);

    const removeSession = useCallback(async (sessionId: string): Promise<void> => {
        setIsDeleting(sessionId);
        try {
            const res = await deleteSession(sessionId);
            if (res.success || (res as any).statusCode === 200) {
                setSessions(prev => prev.filter(s => s.id !== sessionId));
                dispatch(showToast({ message: 'Session removed successfully', type: 'success' }));
            } else {
                dispatch(showToast({ message: res.message || 'Failed to delete session.', type: 'error' }));
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || 'An unexpected error occurred.';
            dispatch(showToast({ message: msg, type: 'error' }));
        } finally {
            setIsDeleting(null);
        }

    }, []);

    // Computed stats
    const completedCount = sessions.filter(s => s.status?.toLowerCase() === 'completed').length;
    const scheduledCount = sessions.filter(s => s.status?.toLowerCase() === 'scheduled').length;
    const totalCount = sessions.length;
    const progressRate = totalCount > 0 ? completedCount / totalCount : 0;

    return {
        sessions,
        isLoading,
        isSubmitting,
        isDeleting,
        completedCount,
        scheduledCount,
        totalCount,
        progressRate,
        refetch: fetchSessions,
        addSession,
        removeSession,
    };
}

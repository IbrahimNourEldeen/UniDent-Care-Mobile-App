import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { createSession, deleteSession, getSessionsByCase } from '../services/caseService';
import { showToast } from '@/store/slices/uiSlice';
import { caseKeys } from './caseQueryKeys';

export function useCaseSessions(caseId: string, patientCaseId: string) {
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const user = useSelector((state: RootState) => state.auth.user);
    const studentId = user?.publicId ?? '';

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const { data: sessions = [], isLoading, refetch } = useQuery({
        queryKey: caseKeys.sessions(caseId),
        queryFn: async () => {
            const res = await getSessionsByCase(caseId, { pageSize: 50 });
            if (res.success && res.data) return res.data.items ?? [];
            return [];
        },
        enabled: !!caseId,
    });

    // Computed stats
    const completedCount = sessions.filter(s => s.status?.toLowerCase() === 'done').length;
    const scheduledCount = sessions.filter(s => s.status?.toLowerCase() === 'scheduled').length;
    const totalCount = sessions.length;
    const progressRate = totalCount > 0 ? completedCount / totalCount : 0;

    const addSession = async (sessionDate: string, location?: string): Promise<boolean> => {
        if (!studentId || !patientCaseId) {
            dispatch(showToast({ message: 'Missing required data to create session.', type: 'error' }));
            return false;
        }
        setIsSubmitting(true);
        try {
            const res = await createSession({ studentId, patientCaseId, sessionDate, location });
            const isSuccess = (res as any) === '' || (res && ((res as any).success === true || (res as any).data));

            if (isSuccess) {
                dispatch(showToast({ message: 'Session scheduled successfully', type: 'success' }));
                // Invalidate all related queries so every screen updates automatically
                await queryClient.invalidateQueries({ queryKey: caseKeys.sessions(caseId) });
                await queryClient.invalidateQueries({ queryKey: caseKeys.detail(caseId) });
                await queryClient.invalidateQueries({ queryKey: caseKeys.studentStats(studentId) });
                return true;
            }

            const errorMsg = res?.message || 'The server rejected this session.';
            dispatch(showToast({ message: errorMsg, type: 'error' }));
            return false;
        } catch (err: any) {
            const msg = err.response?.data?.message || err.response?.data?.error?.errors?.[0] || err.message || 'An unexpected error occurred.';
            dispatch(showToast({ message: msg, type: 'error' }));
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeSession = async (sessionId: string): Promise<void> => {
        setIsDeleting(sessionId);
        try {
            const res = await deleteSession(sessionId);
            if (res.success || (res as any).statusCode === 200) {
                dispatch(showToast({ message: 'Session removed successfully', type: 'success' }));
                // Optimistically update cache before re-fetching
                queryClient.setQueryData<any[]>(caseKeys.sessions(caseId), (old = []) =>
                    old.filter(s => s.id !== sessionId)
                );
                // Invalidate all related queries
                await queryClient.invalidateQueries({ queryKey: caseKeys.sessions(caseId) });
                await queryClient.invalidateQueries({ queryKey: caseKeys.detail(caseId) });
                await queryClient.invalidateQueries({ queryKey: caseKeys.studentStats(studentId) });
                await queryClient.invalidateQueries({ queryKey: caseKeys.session(sessionId) });
            } else {
                dispatch(showToast({ message: res.message || 'Failed to delete session.', type: 'error' }));
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || 'An unexpected error occurred.';
            dispatch(showToast({ message: msg, type: 'error' }));
        } finally {
            setIsDeleting(null);
        }
    };

    return {
        sessions,
        isLoading,
        isSubmitting,
        isDeleting,
        completedCount,
        scheduledCount,
        totalCount,
        progressRate,
        refetch,
        addSession,
        removeSession,
    };
}

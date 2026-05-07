import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { showToast } from '@/store/slices/uiSlice';
import { evaluateSession } from '../services/caseService';
import { TimelineSessionItem } from '../types/caseTypes';

/**
 * Hook for submitting/updating a session evaluation.
 * Mirrors the web project's useSessionEvaluation.ts.
 */
export function useSessionEvaluation(
    session: TimelineSessionItem,
    existing: boolean,
    onSuccess: () => void,
) {
    const dispatch = useDispatch();
    const [grade, setGrade] = useState<number>(session.grade ?? 15);
    const [note, setNote] = useState<string>(session.doctorNote ?? '');
    const [isFinal, setIsFinal] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (grade < 0 || grade > 20) {
            dispatch(showToast({ message: 'Grade must be between 0 and 20', type: 'error' }));
            return;
        }
        setLoading(true);
        try {
            const res = await evaluateSession(session.id, {
                grade,
                note,
                isFinalSession: isFinal,
            });
            if (res.success) {
                dispatch(
                    showToast({
                        message: existing ? 'Evaluation updated!' : 'Session evaluated!',
                        type: 'success',
                    }),
                );
                onSuccess();
            } else {
                dispatch(showToast({ message: res.message || 'Failed to submit', type: 'error' }));
            }
        } catch (e: any) {
            dispatch(showToast({ message: e.message || 'Something went wrong', type: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    return {
        grade,
        setGrade,
        note,
        setNote,
        isFinal,
        setIsFinal,
        loading,
        handleSubmit,
    };
}

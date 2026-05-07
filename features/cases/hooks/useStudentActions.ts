import { useState } from "react";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { SessionDto } from "../types/caseTypes";
import { useCaseSessions } from "./useCaseSessions";
import { showToast } from "@/store/slices/uiSlice";

export function useStudentActions(caseId: string, patientCaseId: string) {
    const router = useRouter();
    const dispatch = useDispatch();

    const { 
        sessions, 
        isLoading: sessionLoading, 
        isSubmitting: isAddingSession, 
        isDeleting: isRemovingSession, 
        addSession, 
        removeSession, 
        refetch 
    } = useCaseSessions(caseId, patientCaseId);

    // Find the first scheduled session (future or same-day)
    const scheduledSession = sessions.find(
        (s: SessionDto) => s.status?.toLowerCase() === 'scheduled'
    ) || null;

    // Find the first in-progress session
    const inProgressSession = sessions.find(
        (s: SessionDto) => s.status?.toLowerCase() === 'inprogress'
    ) || null;

    const [showSessionForm, setShowSessionForm] = useState(false);
    
    // ── Start Now modal state ──
    const [showStartNowModal, setShowStartNowModal] = useState(false);
    const [startNowLoading, setStartNowLoading] = useState(false);

    // ── Cancel Session modal state ──
    const [showCancelSessionModal, setShowCancelSessionModal] = useState(false);
    const [cancelSessionLoading, setCancelSessionLoading] = useState(false);

    const handleCreateSession = async (bookingData: { date: string; startTime: string; endTime: string; location: string }): Promise<boolean> => {
        // Combine date + startTime into a proper ISO datetime (matching web implementation)
        const bookingDateTime = new Date(bookingData.date);
        const [hours, minutes, seconds] = bookingData.startTime.split(':').map(Number);
        bookingDateTime.setHours(hours, minutes, seconds || 0);

        // Adjust for timezone offset (same as web)
        const offset = bookingDateTime.getTimezoneOffset() * 60000;
        const localISOTime = new Date(bookingDateTime.getTime() - offset).toISOString();

        const success = await addSession(localISOTime, bookingData.location);
        if (success) {
            setShowSessionForm(false);
        }
        return success;
    };

    /**
     * Navigate directly to the active session screen (Start Now).
     * Used from SessionBookingDialog or the In-Progress card.
     */
    const handleStartNow = async () => {
        const target = scheduledSession || inProgressSession;
        if (!target) {
            dispatch(showToast({ message: "No active session found.", type: "error" }));
            return;
        }
        setStartNowLoading(true);
        try {
            setShowStartNowModal(false);
            router.push(`/(screens)/student/my-cases/${caseId}/start-session/${target.id}` as any);
        } catch {
            dispatch(showToast({ message: "Failed to navigate to session.", type: "error" }));
        } finally {
            setStartNowLoading(false);
        }
    };

    /** Navigate directly to an in-progress session (from "End Session" card in case details). */
    const handleGoToActiveSession = () => {
        if (!inProgressSession) return;
        router.push(`/(screens)/student/my-cases/${caseId}/start-session/${inProgressSession.id}` as any);
    };

    const handleCancelSession = async () => {
        if (!scheduledSession) return;
        setCancelSessionLoading(true);
        try {
            await removeSession(scheduledSession.id);
            setShowCancelSessionModal(false);
        } finally {
            setCancelSessionLoading(false);
        }
    };

    return {
        showSessionForm, setShowSessionForm,
        sessionLoading,
        
        handleCreateSession,
        isAddingSession,

        // ── Sessions ──
        scheduledSession,
        inProgressSession,

        // ── Start Now ──
        showStartNowModal, setShowStartNowModal,
        startNowLoading,
        handleStartNow,

        // ── Go to active session (from End Session card) ──
        handleGoToActiveSession,

        // ── Cancel session ──
        showCancelSessionModal, setShowCancelSessionModal,
        cancelSessionLoading: cancelSessionLoading || !!isRemovingSession,
        handleCancelSession,

        // Refetch sessions
        refetchSessions: refetch
    };
}

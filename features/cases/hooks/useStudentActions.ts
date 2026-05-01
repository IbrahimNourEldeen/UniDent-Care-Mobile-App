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

    // Find the first scheduled session
    const scheduledSession = sessions.find((s: SessionDto) => s.status?.toLowerCase() === 'scheduled') || null;

    const [showSessionForm, setShowSessionForm] = useState(false);
    
    // ── Start Now modal state ──
    const [showStartNowModal, setShowStartNowModal] = useState(false);
    const [startNowLoading, setStartNowLoading] = useState(false);

    // ── Cancel Session modal state ──
    const [showCancelSessionModal, setShowCancelSessionModal] = useState(false);
    const [cancelSessionLoading, setCancelSessionLoading] = useState(false);

    const handleCreateSession = async (sessionDate: string, location?: string) => {
        const success = await addSession(sessionDate, location);
        if (success) {
            setShowSessionForm(false);
        }
    };

    const handleStartNow = async () => {
        if (!scheduledSession) return;
        setStartNowLoading(true);
        try {
            setShowStartNowModal(false);
            router.push(`/(screens)/student/my-cases/${caseId}/start-session/${scheduledSession.id}` as any);
        } catch (error) {
            dispatch(showToast({ message: "Failed to navigate to start session.", type: "error" }));
        } finally {
            setStartNowLoading(false);
        }
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

        // ── Scheduled session ──
        scheduledSession,
        showStartNowModal, setShowStartNowModal,
        startNowLoading,
        handleStartNow,

        // ── Cancel session ──
        showCancelSessionModal, setShowCancelSessionModal,
        cancelSessionLoading: cancelSessionLoading || !!isRemovingSession,
        handleCancelSession,

        // Refetch sessions
        refetchSessions: refetch
    };
}

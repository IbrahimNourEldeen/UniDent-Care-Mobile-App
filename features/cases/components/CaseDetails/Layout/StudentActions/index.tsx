import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useCase } from '@/features/cases/context/CaseContext';
import { useStudentActions } from '@/features/cases/hooks/useStudentActions';
import SendRequestSection from './SendRequestSection';
import PendingRequestSection from './PendingRequestSection';
import ScheduleSessionSection from './ScheduleSessionSection';
import { showToast } from '@/store/slices/uiSlice';
import api from '@/utils/api';

interface StudentActionsProps {
    patient: any;
    onRefetch: () => void;
}

export default function StudentActions({ patient, onRefetch }: StudentActionsProps) {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const studentId = (user as any)?.publicId ?? '';
    const { refetchSessions } = useCase();

    // Derive flags from patient.userFlags (same as web)
    const userFlags = patient?.userFlags ?? {};
    const isAssignedToMe = userFlags?.isAssignedStudent ?? userFlags?.isAssignedToMe ?? false;
    const hasRequest = userFlags?.hasRequest ?? false;
    const requestStatus = userFlags?.requestStatus ?? '';
    const requestId = userFlags?.requestId ?? '';

    // Send request loading state
    const [sendRequestLoading, setSendRequestLoading] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);

    const {
        showSessionForm, setShowSessionForm,
        sessionLoading,
        handleCreateSession,
        isAddingSession,
        scheduledSession,
        showStartNowModal, setShowStartNowModal,
        startNowLoading, handleStartNow,
        showCancelSessionModal, setShowCancelSessionModal,
        cancelSessionLoading,
        handleCancelSession,
        refetchSessions: refetchSessionsHook,
    } = useStudentActions(patient?.id ?? '', patient?.id ?? '');

    const handleSendRequest = async () => {
        if (!studentId || !patient?.id) return;
        setSendRequestLoading(true);
        try {
            await api.post('/CaseRequests', {
                studentId,
                patientCaseId: patient.id,
                description: '',
            });
            dispatch(showToast({ message: 'Request sent successfully', type: 'success' }));
            onRefetch();
        } catch (err: any) {
            dispatch(showToast({ message: err?.response?.data?.message || 'Failed to send request', type: 'error' }));
        } finally {
            setSendRequestLoading(false);
        }
    };

    const handleCancelRequest = async () => {
        if (!requestId) return;
        setCancelLoading(true);
        try {
            await api.delete(`/CaseRequests/${requestId}`);
            dispatch(showToast({ message: 'Request cancelled successfully', type: 'success' }));
            onRefetch();
        } catch (err: any) {
            dispatch(showToast({ message: err?.response?.data?.message || 'Failed to cancel request', type: 'error' }));
        } finally {
            setCancelLoading(false);
        }
    };

    return (
        <View className="space-y-4">
            {!isAssignedToMe && (
                <>
                    {!hasRequest && (
                        <SendRequestSection onSendRequest={handleSendRequest} />
                    )}
                    {hasRequest && (
                        <PendingRequestSection
                            requestStatus={requestStatus}
                            cancelLoading={cancelLoading}
                            onCancel={handleCancelRequest}
                        />
                    )}
                </>
            )}

            {isAssignedToMe && (
                <ScheduleSessionSection
                    showForm={showSessionForm}
                    sessionLoading={sessionLoading || isAddingSession}
                    onToggleForm={setShowSessionForm}
                    onSubmit={handleCreateSession}
                    scheduledSession={scheduledSession}
                    showStartNowModal={showStartNowModal}
                    onToggleStartNowModal={setShowStartNowModal}
                    onStartNow={handleStartNow}
                    startNowLoading={startNowLoading}
                    showCancelSessionModal={showCancelSessionModal}
                    onToggleCancelSessionModal={setShowCancelSessionModal}
                    onCancelSession={handleCancelSession}
                    cancelSessionLoading={cancelSessionLoading}
                />
            )}
        </View>
    );
}

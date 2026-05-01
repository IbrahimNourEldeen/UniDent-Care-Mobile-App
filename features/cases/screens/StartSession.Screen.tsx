import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { useDispatch } from 'react-redux';
import { showToast } from '@/store/slices/uiSlice';

import { useCaseDetails } from '../hooks/useCaseDetails';
import { useSessionDetails } from '../hooks/useSessionDetails';

import ActionModal from '@/components/common/ActionModal';
import SessionTopBar from '../components/StartSession/SessionTopBar';
import PatientSummaryCard from '../components/StartSession/PatientSummaryCard';
import SessionWorkspace from '../components/StartSession/SessionWorkspace';
import DentalImageGallery from '../components/CaseDetails/Clinical/DentalImageGallery';

interface StartSessionScreenProps {
    caseId: string;
    sessionId: string;
}

export default function StartSessionScreen({ caseId, sessionId }: StartSessionScreenProps) {
    const router = useRouter();
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();

    const { patient, isLoading: caseLoading } = useCaseDetails(caseId);
    const { 
        session, 
        notes, 
        isLoading: sessionLoading, 
        updateStatus,
        addNote,
        isAddingNote
    } = useSessionDetails(sessionId);

    const [showEndModal, setShowEndModal] = useState(false);
    const [endSessionLoading, setEndSessionLoading] = useState(false);

    const isLoading = caseLoading || sessionLoading;

    const bgClass = isDark ? 'bg-[#020617]' : 'bg-slate-50';

    if (isLoading) {
        return (
            <View className={`flex-1 ${bgClass} justify-center items-center`} style={{ paddingTop: insets.top }}>
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text className={`mt-4 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Loading Workspace...
                </Text>
            </View>
        );
    }

    if (!patient || !session) {
        return (
            <View className={`flex-1 ${bgClass} justify-center items-center`} style={{ paddingTop: insets.top }}>
                <Text className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    Session or Case not found.
                </Text>
            </View>
        );
    }

    const handleEndSession = async () => {
        setEndSessionLoading(true);
        try {
            await updateStatus('Done');
            setShowEndModal(false);
            dispatch(showToast({ message: "Session completed successfully", type: "success" }));
            router.replace(`/(screens)/case-detail/${caseId}` as any);
        } catch (error) {
            dispatch(showToast({ message: "Failed to end session", type: "error" }));
        } finally {
            setEndSessionLoading(false);
        }
    };

    return (
        <View className={`flex-1 ${bgClass}`}>
            <View style={{ paddingTop: insets.top }} className="flex-1">
                <ScrollView 
                    className="flex-1" 
                    showsVerticalScrollIndicator={false} 
                    contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
                >
                    <View className="px-5 space-y-6">
                        {/* ═══ Top Bar ═══ */}
                        <SessionTopBar
                            patientName={patient.patientName || ""}
                            sessionId={sessionId}
                            caseId={caseId}
                            onEndSession={() => setShowEndModal(true)}
                            endSessionLoading={endSessionLoading}
                            sessionStatus={session.status || undefined}
                            isDark={isDark}
                        />

                        {/* ═══ Patient Summary ═══ */}
                        <PatientSummaryCard patient={patient} isDark={isDark} />

                        {/* ═══ Image Gallery ═══ */}
                        {patient.imageUrls && patient.imageUrls.length > 0 && (
                            <View className="-mx-5">
                                <DentalImageGallery images={patient.imageUrls} isDark={isDark} />
                            </View>
                        )}

                        {/* ═══ Session Workspace ═══ */}
                        <SessionWorkspace
                            session={session}
                            notes={notes}
                            onAddNote={addNote}
                            noteLoading={isAddingNote}
                            isDark={isDark}
                        />
                    </View>
                </ScrollView>
            </View>

            {/* End Session Confirmation Modal */}
            <ActionModal
                isOpen={showEndModal}
                onClose={() => setShowEndModal(false)}
                onAction={handleEndSession}
                title="End Session"
                message="Are you sure you want to end this session? Make sure you have saved all your clinical notes before proceeding."
                actionText="End Session"
                cancelText="Continue Session"
                isLoading={endSessionLoading}
                variant="danger"
                isDark={isDark}
            />
        </View>
    );
}

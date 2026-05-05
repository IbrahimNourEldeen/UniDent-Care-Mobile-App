import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { useDispatch } from 'react-redux';
import { showToast } from '@/store/slices/uiSlice';

// import { useCaseDetails } from '../hooks/useCaseDetails';
import { useSessionDetails } from '../hooks/useSessionDetails';

import ActionModal from '@/components/common/ActionModal';
import SessionTopBar from '../components/StartSession/SessionTopBar';
import SessionWorkspace from '../components/StartSession/SessionWorkspace';
// import DentalImageGallery from '../components/CaseDetails/Clinical/DentalImageGallery';

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

    // const { patient, isLoading: caseLoading } = useCaseDetails(caseId);
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

    const isLoading = sessionLoading;

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

    if (!session) {
        return (
            <View className={`flex-1 ${bgClass} justify-center items-center`} style={{ paddingTop: insets.top }}>
                <Text className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    Session not found.
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
            router.replace('/(tabs)/student-dashboard' as any); // Redirect to dashboard instead of case-detail
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
                            patientName={session.patientName || ""}
                            sessionId={sessionId}
                            caseId={caseId}
                            onEndSession={() => setShowEndModal(true)}
                            endSessionLoading={endSessionLoading}
                            sessionStatus={session.status || undefined}
                            isDark={isDark}
                        />

                        {/* ═══ Patient Summary ═══ */}
                        <View className={`rounded-[32px] p-6 border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                            <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {session.patientName}
                            </Text>
                            <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {session.treatmentType || "Clinical Session"}
                            </Text>
                        </View>


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

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Stethoscope, User, XCircle, AlertTriangle } from 'lucide-react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { useSessionDetails } from '@/features/cases/hooks/useSessionDetails';
import SessionTopBar from '@/features/cases/components/StartSession/SessionTopBar';
import SessionWorkspace from '@/features/cases/components/StartSession/SessionWorkspace';
import PatientSummaryCard from '@/features/cases/components/StartSession/PatientSummaryCard';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useDispatch } from 'react-redux';
import { showToast } from '@/store/slices/uiSlice';
import { updateSessionStatus } from '@/features/cases/services/caseService';

export default function SessionDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';
    const dispatch = useDispatch();

    const { session, notes, isLoading, isError, refetchAll, addNote, isAddingNote } =
        useSessionDetails(id as string);

    const userRole = useSelector((state: RootState) => state.auth.role);
    const isPatient = userRole?.toLowerCase() === 'patient';

    const [showEndModal, setShowEndModal] = useState(false);
    const [endSessionLoading, setEndSessionLoading] = useState(false);

    const bgColor = isDark ? '#020617' : '#f8fafc';
    const cardBg = isDark ? '#0f172a' : '#fff';
    const textColor = isDark ? '#f1f5f9' : '#0f172a';
    const subColor = isDark ? '#94a3b8' : '#64748b';
    const borderColor = isDark ? '#1e293b' : '#e2e8f0';

    // ── Auto-update Scheduled → InProgress ────────────────────────────────────
    useEffect(() => {
        if (!session) return;
        const status = session.status?.toLowerCase();
        if (status === 'scheduled') {
            updateSessionStatus(id as string, {
                sessionId: id as string,
                status: 'InProgress',
            })
                .then(() => refetchAll?.())
                .catch(() => {
                    // silently ignore — user can still work
                });
        }
    }, [session?.id, id, refetchAll]);

    // ── End Session Handler ──────────────────────────────────────────────────
    const handleEndSession = async () => {
        if (!notes || notes.length === 0) {
            dispatch(
                showToast({
                    message: 'You must add at least one clinical note before ending the session.',
                    type: 'error',
                }),
            );
            setShowEndModal(false);
            return;
        }
        setEndSessionLoading(true);
        try {
            const res = await updateSessionStatus(id as string, {
                sessionId: id as string,
                status: 'Done',
            });
            
            if (res.success) {
                dispatch(showToast({ message: 'Session completed successfully', type: 'success' }));
                setShowEndModal(false);
                refetchAll?.();
                // Navigate to case details page
                const caseId = session?.caseId;
                if (caseId) {
                    router.push(`/case-details/${caseId}` as any);
                } else {
                    router.push('/(tabs)/student-dashboard' as any);
                }
            } else {
                dispatch(showToast({ message: res.message || 'Failed to end session', type: 'error' }));
            }
        } catch (err: any) {
            dispatch(showToast({ message: err.response?.data?.message || err.message || 'Failed to end session', type: 'error' }));
        } finally {
            setEndSessionLoading(false);
        }
    };

    // ── Loading ──────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#4f46e5" />
            </View>
        );
    }

    // ── Error ────────────────────────────────────────────────────────────────
    if (isError || !session) {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: bgColor,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 24,
                    paddingTop: insets.top,
                }}
            >
                <XCircle size={56} color={isDark ? '#f87171' : '#ef4444'} />
                <Text style={{ fontSize: 20, fontWeight: '900', marginTop: 20, textAlign: 'center', color: textColor }}>
                    Session Not Found
                </Text>
                <Text style={{ fontSize: 14, marginTop: 8, textAlign: 'center', color: subColor }}>
                    The session details could not be loaded.
                </Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{
                        marginTop: 32,
                        backgroundColor: '#4f46e5',
                        paddingHorizontal: 32,
                        paddingVertical: 14,
                        borderRadius: 16,
                    }}
                >
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // ── Main ─────────────────────────────────────────────────────────────────
    return (
        <View style={{ flex: 1, backgroundColor: bgColor }}>
            <View style={{ paddingTop: insets.top, flex: 1 }}>
                <ScrollView
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120, paddingTop: 20 }}
                >
                    {/* Top Bar */}
                    <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
                        <SessionTopBar
                            patientName={session.patientName || 'Unknown Patient'}
                            sessionId={session.id}
                            caseId={session.caseId}
                            sessionStatus={session.status || undefined}
                            onEndSession={isPatient ? undefined : () => setShowEndModal(true)}
                            endSessionLoading={endSessionLoading}
                            isDark={isDark}
                        />
                    </View>

                    {/* Patient Summary Card */}
                    {!isPatient && (session as any).patientName && (
                        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
                            <PatientSummaryCard patient={session as any} isDark={isDark} />
                        </View>
                    )}

                    {/* Session Workspace */}
                    <View style={{ paddingHorizontal: 20 }}>
                        <SessionWorkspace
                            session={session}
                            notes={notes}
                            onAddNote={isPatient ? undefined : addNote}
                            noteLoading={isAddingNote}
                            isDark={isDark}
                        />
                    </View>

                    {/* Participants */}
                    <View style={{ paddingHorizontal: 20, marginTop: 32 }}>
                        <Text style={{ fontWeight: '900', fontSize: 17, marginBottom: 16, color: textColor }}>
                            Participants
                        </Text>

                        {/* Patient */}
                        <View
                            style={{
                                padding: 16,
                                borderRadius: 24,
                                marginBottom: 12,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 16,
                                backgroundColor: cardBg,
                                borderWidth: 1,
                                borderColor,
                            }}
                        >
                            <View
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 16,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: isDark ? 'rgba(79,70,229,0.2)' : '#eef2ff',
                                }}
                            >
                                <User size={20} color={isDark ? '#818cf8' : '#4f46e5'} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        fontSize: 11,
                                        fontWeight: '700',
                                        textTransform: 'uppercase',
                                        letterSpacing: 0.5,
                                        marginBottom: 4,
                                        color: isDark ? '#818cf8' : '#4f46e5',
                                    }}
                                >
                                    Patient
                                </Text>
                                <Text style={{ fontSize: 15, fontWeight: '900', color: textColor }}>
                                    {session.patientName || 'Unknown Patient'}
                                </Text>
                            </View>
                        </View>

                        {/* Student */}
                        <View
                            style={{
                                padding: 16,
                                borderRadius: 24,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 16,
                                backgroundColor: cardBg,
                                borderWidth: 1,
                                borderColor,
                            }}
                        >
                            <View
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 16,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: isDark ? 'rgba(13,148,136,0.2)' : '#f0fdfa',
                                }}
                            >
                                <Stethoscope size={20} color={isDark ? '#2dd4bf' : '#0d9488'} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        fontSize: 11,
                                        fontWeight: '700',
                                        textTransform: 'uppercase',
                                        letterSpacing: 0.5,
                                        marginBottom: 4,
                                        color: isDark ? '#2dd4bf' : '#0d9488',
                                    }}
                                >
                                    Student
                                </Text>
                                <Text style={{ fontSize: 15, fontWeight: '900', color: textColor }}>
                                    {session.studentName || 'Unknown Student'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>

            {/* ── End Session Confirmation Modal ── */}
            <Modal
                visible={showEndModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowEndModal(false)}
            >
                <Pressable
                    onPress={() => setShowEndModal(false)}
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: 24,
                    }}
                >
                    <Pressable
                        onPress={(e) => e.stopPropagation()}
                        style={{
                            width: '100%',
                            backgroundColor: isDark ? '#0f172a' : '#fff',
                            borderRadius: 24,
                            padding: 24,
                            borderWidth: 1,
                            borderColor: isDark ? '#1e293b' : '#f1f5f9',
                        }}
                    >
                        {/* Icon */}
                        <View
                            style={{
                                width: 56,
                                height: 56,
                                borderRadius: 20,
                                backgroundColor: isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 16,
                            }}
                        >
                            <AlertTriangle size={28} color="#ef4444" />
                        </View>

                        <Text style={{ fontSize: 18, fontWeight: '900', color: textColor, marginBottom: 8 }}>
                            End Session
                        </Text>
                        <Text style={{ fontSize: 14, color: subColor, lineHeight: 22, marginBottom: 24 }}>
                            {!notes || notes.length === 0
                                ? 'Warning: You haven\'t added any notes yet. Clinical notes are mandatory before ending a session.'
                                : 'Are you sure you want to end this session? Make sure you have saved all your clinical notes before proceeding.'}
                        </Text>

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity
                                onPress={() => setShowEndModal(false)}
                                style={{
                                    flex: 1,
                                    paddingVertical: 14,
                                    borderRadius: 14,
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    borderColor,
                                    backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                                }}
                            >
                                <Text style={{ fontWeight: '700', color: subColor, fontSize: 14 }}>
                                    Continue Session
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleEndSession}
                                disabled={endSessionLoading}
                                style={{
                                    flex: 1,
                                    paddingVertical: 14,
                                    borderRadius: 14,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: endSessionLoading ? '#ef4444aa' : '#ef4444',
                                    flexDirection: 'row',
                                    gap: 8,
                                }}
                            >
                                {endSessionLoading && <ActivityIndicator size="small" color="#fff" />}
                                <Text style={{ fontWeight: '700', color: '#fff', fontSize: 14 }}>
                                    {endSessionLoading ? 'Ending…' : 'End Session'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}

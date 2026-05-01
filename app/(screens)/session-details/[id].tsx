import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Clock, Calendar, User, Stethoscope, FileText, CheckCircle2, Timer, XCircle, MapPin } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { useSessionDetails } from '@/features/cases/hooks/useSessionDetails';
import SessionTopBar from '@/features/cases/components/StartSession/SessionTopBar';
import SessionWorkspace from '@/features/cases/components/StartSession/SessionWorkspace';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export default function SessionDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';

    const { session, notes, isLoading, isError, refetchAll, updateStatus, isUpdatingStatus, addNote, isAddingNote } = useSessionDetails(id as string);

    const userRole = useSelector((state: RootState) => state.auth.role);
    const isPatient = userRole?.toLowerCase() === 'patient';

    const bgClass = isDark ? 'bg-[#020617]' : 'bg-slate-50';
    const textClass = isDark ? 'text-white' : 'text-slate-900';
    const subTextClass = isDark ? 'text-slate-400' : 'text-slate-500';

    if (isLoading) {
        return (
            <View className={`flex-1 ${bgClass} justify-center items-center`}>
                <ActivityIndicator size="large" color="#4f46e5" />
            </View>
        );
    }

    if (isError || !session) {
        return (
            <View className={`flex-1 ${bgClass} justify-center items-center px-6`} style={{ paddingTop: insets.top }}>
                <XCircle size={56} color={isDark ? '#f87171' : '#ef4444'} />
                <Text className={`text-xl font-black mt-5 text-center ${textClass}`}>Session Not Found</Text>
                <Text className={`text-sm mt-2 text-center ${subTextClass}`}>The session details could not be loaded.</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-8 bg-indigo-600 px-8 py-3.5 rounded-2xl shadow-lg shadow-indigo-500/30">
                    <Text className="text-white font-bold text-sm">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className={`flex-1 ${bgClass}`}>
            <View style={{ paddingTop: insets.top }} className="flex-1">
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}>
                    <View className="px-5 mb-6">
                        <SessionTopBar
                            patientName={session.patientName || 'Unknown Patient'}
                            sessionId={session.id}
                            caseId={session.caseId}
                            sessionStatus={session.status || undefined}
                            onEndSession={isPatient ? undefined : () => updateStatus('Done')}
                            endSessionLoading={isUpdatingStatus}
                            isDark={isDark}
                        />
                    </View>

                    <View className="px-5">
                        <SessionWorkspace
                            session={session}
                            notes={notes}
                            onAddNote={isPatient ? undefined : addNote}
                            noteLoading={isAddingNote}
                            isDark={isDark}
                        />
                    </View>

                    {/* Participants Section */}
                    <View className="px-5 mt-8">
                        <Text className={`font-black text-lg tracking-tight mb-4 ${textClass}`}>Participants</Text>
                        
                        <View className={`p-4 rounded-3xl mb-3 flex-row items-center gap-4 ${isDark ? 'bg-slate-900' : 'bg-white shadow-sm'}`}>
                            <View className={`w-12 h-12 rounded-2xl items-center justify-center ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-50'}`}>
                                <User size={20} color={isDark ? '#818cf8' : '#4f46e5'} />
                            </View>
                            <View className="flex-1">
                                <Text className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Patient</Text>
                                <Text className={`text-base font-black ${textClass}`}>{session.patientName || 'Unknown Patient'}</Text>
                            </View>
                        </View>

                        <View className={`p-4 rounded-3xl flex-row items-center gap-4 ${isDark ? 'bg-slate-900' : 'bg-white shadow-sm'}`}>
                            <View className={`w-12 h-12 rounded-2xl items-center justify-center ${isDark ? 'bg-teal-500/20' : 'bg-teal-50'}`}>
                                <Stethoscope size={20} color={isDark ? '#2dd4bf' : '#0d9488'} />
                            </View>
                            <View className="flex-1">
                                <Text className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>Student</Text>
                                <Text className={`text-base font-black ${textClass}`}>{session.studentName || 'Unknown Student'}</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

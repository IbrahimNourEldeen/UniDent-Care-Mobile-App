import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
    Image, Modal, Pressable, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    ArrowLeft, Calendar, User, Stethoscope, Clock, CheckCircle2,
    AlertCircle, RefreshCw, Layers, Activity, FileText, Plus,
    Trash2, MapPin, CircleCheck, Timer, XCircle,
} from 'lucide-react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { useTranslation } from 'react-i18next';
import { useCaseDetails } from '@/features/cases/hooks/useCaseDetails';
import { useCaseSessions } from '@/features/cases/hooks/useCaseSessions';
import { AddSessionModal } from '../components/CaseDetails/AddSessionModal';
import { DeleteConfirmationModal } from '../components/CaseDetails/DeleteConfirmationModal';
import WebOdontogram from '../components/CaseDetails/WebOdontogram';


import { SessionDto } from '../types/caseTypes';

function getSessionStatusConfig(status: string | null, isDark: boolean) {
    const s = status?.toLowerCase();
    if (s === 'completed') return {
        Icon: CircleCheck, dot: '#34d399',
        text: isDark ? '#6ee7b7' : '#059669',
        bg: isDark ? 'bg-emerald-900/30' : 'bg-emerald-50',
        label: 'Completed',
    };
    if (s === 'cancelled') return {
        Icon: XCircle, dot: '#f87171',
        text: isDark ? '#fca5a5' : '#dc2626',
        bg: isDark ? 'bg-red-900/30' : 'bg-red-50',
        label: 'Cancelled',
    };
    return {
        Icon: Timer, dot: '#f59e0b',
        text: isDark ? '#fbbf24' : '#d97706',
        bg: isDark ? 'bg-amber-900/30' : 'bg-amber-50',
        label: 'Scheduled',
    };
}

function ProgressRing({ rate, isDark }: { rate: number; isDark: boolean }) {
    const pct = Math.round(rate * 100);
    return (
        <View className={`rounded-[28px] p-5 mb-6 border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <View className="flex-row items-center justify-between">
                <View>
                    <Text className={`text-xs font-black uppercase tracking-widest mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Session Progress
                    </Text>
                    <Text className={`text-4xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {pct}<Text className="text-xl">%</Text>
                    </Text>
                    <Text className={`text-xs mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Completed</Text>
                </View>
                {/* Visual bar */}
                <View className="flex-1 ml-6">
                    <View className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        <View
                            style={{ width: `${pct}%` }}
                            className="h-full bg-indigo-600 rounded-full"
                        />
                    </View>
                    <View className="flex-row justify-between mt-3">
                        <View className="items-center">
                            <View className="w-2 h-2 rounded-full bg-emerald-500 mb-1" />
                            <Text className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Done</Text>
                        </View>
                        <View className="items-center">
                            <View className="w-2 h-2 rounded-full bg-amber-400 mb-1" />
                            <Text className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Upcoming</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

function SessionCard({
    session, isDark, isDeleting, canDelete, onDelete,
}: {
    session: SessionDto;
    isDark: boolean;
    isDeleting: boolean;
    canDelete: boolean;
    onDeleteRequest: (id: string) => void;
}) {

    const sc = getSessionStatusConfig(session.status, isDark);
    const { Icon } = sc;
    const date = new Date(session.scheduledAt);
    const dateStr = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const handleDelete = () => {
        onDeleteRequest(session.id);
    };


    return (
        <View className={`mb-3 p-4 rounded-[24px] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <View className="flex-row justify-between items-start">
                <View className="flex-row items-center gap-3 flex-1 min-w-0">
                    <View className={`w-10 h-10 rounded-2xl items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-indigo-50'}`}>
                        <Icon size={18} color={sc.text} />
                    </View>
                    <View className="flex-1 min-w-0">
                        <Text className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{dateStr}</Text>
                        <Text className={`text-xs font-bold mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{timeStr}</Text>
                    </View>
                </View>
                <View className="flex-row items-center gap-2">
                    <View className={`px-2.5 py-1 rounded-full flex-row items-center gap-1 ${sc.bg}`}>
                        <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: sc.dot }} />
                        <Text style={{ color: sc.text }} className="text-[9px] font-black uppercase tracking-widest">
                            {sc.label}
                        </Text>
                    </View>
                    {canDelete && !isDeleting && (
                        <TouchableOpacity
                            onPress={handleDelete}
                            className={`w-8 h-8 rounded-xl items-center justify-center ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}
                        >
                            <Trash2 size={14} color="#ef4444" />
                        </TouchableOpacity>
                    )}
                    {canDelete && isDeleting && (
                        <View className="w-8 h-8 items-center justify-center">
                            <ActivityIndicator size="small" color="#ef4444" />
                        </View>
                    )}
                </View>
            </View>
            {/* Location if available — not returned by the current API but future‑proof */}
            {(session as any).location ? (
                <View className={`flex-row items-center gap-2 mt-3 pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <MapPin size={12} color={isDark ? '#64748b' : '#94a3b8'} />
                    <Text className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{(session as any).location}</Text>
                </View>
            ) : null}
        </View>
    );
}

export default function CaseDetailsScreen({ caseId }: { caseId: string }) {
    const router = useRouter();
    const { theme } = useThemeLanguage();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const isDark = theme === 'dark';

    const { patient, isLoading, refetch } = useCaseDetails(caseId);
    const {
        sessions, isLoading: sessionsLoading, isSubmitting, isDeleting,
        completedCount, scheduledCount, totalCount, progressRate,
        addSession, removeSession, refetch: refetchSessions,
    } = useCaseSessions(caseId, patient?.id ?? caseId);

    const isInProgress = patient?.status?.toLowerCase() === 'in-progress' || patient?.status?.toLowerCase() === 'inprogress';
    const [activeTab, setActiveTab] = useState<'info' | 'teeth' | 'sessions'>(isInProgress ? 'sessions' : 'info');

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showAddSession, setShowAddSession] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

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

    if (!patient) {
        return (
            <View className={`flex-1 ${bgClass} justify-center items-center px-6`} style={{ paddingTop: insets.top }}>
                <AlertCircle size={56} color={isDark ? '#f87171' : '#ef4444'} />
                <Text className={`text-xl font-black mt-5 text-center ${textClass}`}>Case Not Found</Text>
                <Text className={`text-sm mt-2 text-center ${subTextClass}`}>The case you are looking for does not exist or was removed.</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-8 bg-indigo-600 px-8 py-3.5 rounded-2xl shadow-lg shadow-indigo-500/30">
                    <Text className="text-white font-bold text-sm">Return to Dashboard</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const { status, patientName, patientAge, createAt, totalSessions, imageUrls, diagnosisdto } = patient;
    const isAvailable = status?.toLowerCase() === 'available' || status?.toLowerCase() === 'unassigned';

    const initName = patientName.substring(0, 2).toUpperCase();

    const renderImages = () => {
        if (!imageUrls || imageUrls.length === 0) {
            return (
                <View className={`rounded-3xl p-8 items-center justify-center border border-dashed ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-300 bg-white/50'} mb-8`}>
                    <Layers size={36} color={isDark ? '#475569' : '#cbd5e1'} />
                    <Text className={`mt-4 font-bold ${textClass}`}>No Images</Text>
                    <Text className={`mt-1 text-xs text-center ${subTextClass}`}>There are no clinical images attached to this case yet.</Text>
                </View>
            );
        }
        return (
            <View className="mb-8">
                <View className="flex-row items-center justify-between mb-4">
                    <Text className={`font-black text-lg tracking-tight ${textClass}`}>Clinical Images</Text>
                    <View className={`px-2.5 py-1 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                        <Text className={`text-[10px] font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{imageUrls.length} Files</Text>
                    </View>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                    {imageUrls.map((url, i) => (
                        <TouchableOpacity key={i} onPress={() => setSelectedImage(url)} activeOpacity={0.8}>
                            <View className={`w-36 h-36 rounded-3xl overflow-hidden border-2 ${isDark ? 'border-slate-800' : 'border-white'} shadow-sm bg-slate-200 dark:bg-slate-800`}>
                                <Image source={{ uri: url }} className="w-full h-full" resizeMode="cover" />
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    };

    const renderSessionsTab = () => (
        <View>
            {/* Stats Row */}
            <View className="flex-row gap-3 mb-5">
                {[
                    { label: 'Total', value: totalCount, color: '#4f46e5' },
                    { label: 'Done', value: completedCount, color: '#10b981' },
                    { label: 'Upcoming', value: scheduledCount, color: '#f59e0b' },
                ].map(stat => (
                    <View key={stat.label} className={`flex-1 rounded-2xl p-3 items-center border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <Text style={{ color: stat.color }} className="text-2xl font-black">{stat.value}</Text>
                        <Text className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{stat.label}</Text>
                    </View>
                ))}
            </View>

            {/* Progress bar */}
            {totalCount > 0 && <ProgressRing rate={progressRate} isDark={isDark} />}

            {/* Session list header + add button */}
            <View className="flex-row justify-between items-center mb-4">
                <Text className={`font-black text-base ${textClass}`}>All Sessions</Text>
                <View className="flex-row items-center gap-2">
                    {sessionsLoading && <ActivityIndicator size="small" color="#4f46e5" />}
                    {isInProgress && (
                        <TouchableOpacity
                            onPress={() => setShowAddSession(true)}
                            className="flex-row items-center gap-1.5 bg-indigo-600 px-3.5 py-2 rounded-2xl"
                        >
                            <Plus size={14} color="white" />
                            <Text className="text-white text-xs font-black">Add</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Session cards */}
            {!sessionsLoading && sessions.length === 0 && (
                <View className={`p-8 rounded-[28px] items-center border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <View className={`w-14 h-14 rounded-full items-center justify-center mb-4 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                        <Clock size={22} color={isDark ? '#475569' : '#94a3b8'} />
                    </View>
                    <Text className={`font-bold text-sm ${textClass} mb-1`}>No Sessions Yet</Text>
                    <Text className={`text-xs text-center ${subTextClass}`}>
                        {isInProgress ? 'Tap "Add" to schedule the first session.' : 'Sessions will appear here once the case is active.'}
                    </Text>
                </View>
            )}
            {sessions.map(session => {
                const isScheduled = session.status?.toLowerCase() === 'scheduled';
                return (
                    <SessionCard
                        key={session.id}
                        session={session}
                        isDark={isDark}
                        canDelete={isInProgress && isScheduled}
                        isDeleting={isDeleting === session.id}
                        onDeleteRequest={(id) => setSessionToDelete(id)}
                    />

                );
            })}
        </View>
    );

    return (
        <View className={`flex-1 ${bgClass}`}>
            {/* Hero */}
            <View className="bg-indigo-600 dark:bg-indigo-900 absolute top-0 left-0 right-0" style={{ height: 260 + insets.top, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }} />

            <View style={{ paddingTop: insets.top }} className="flex-1">
                {/* Top Nav */}
                <View className="px-5 py-3 flex-row items-center justify-between z-10">
                    <TouchableOpacity onPress={() => router.back()} className="w-11 h-11 rounded-2xl items-center justify-center bg-white/20 dark:bg-black/20">
                        <ArrowLeft size={20} color="#ffffff" />
                    </TouchableOpacity>
                    <Text className="text-base font-bold text-white tracking-wide">Case Overview</Text>
                    <TouchableOpacity onPress={() => { refetch(); refetchSessions(); }} className="w-11 h-11 rounded-2xl items-center justify-center bg-white/20 dark:bg-black/20">
                        <RefreshCw size={18} color="#ffffff" />
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                    {/* Patient Card */}
                    <View className="px-5 mt-4 z-20">
                        <View className={`rounded-[32px] p-6 shadow-xl ${isDark ? 'bg-slate-900 shadow-black/50' : 'bg-white shadow-indigo-900/10'}`} style={{ elevation: 15 }}>
                            <View className="flex-row justify-between items-start mb-5">
                                <View className={`w-16 h-16 rounded-2xl items-center justify-center shadow-sm ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-50'}`}>
                                    <Text className={`text-2xl font-black ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{initName}</Text>
                                </View>
                                <View className={`px-3 py-1.5 rounded-full flex-row items-center gap-1.5 ${isAvailable ? (isDark ? 'bg-emerald-900/40' : 'bg-emerald-50') : (isDark ? 'bg-blue-900/40' : 'bg-blue-50')}`}>
                                    <CheckCircle2 size={12} color={isAvailable ? (isDark ? '#34d399' : '#16a34a') : (isDark ? '#60a5fa' : '#2563eb')} />
                                    <Text className={`text-[10px] font-black uppercase tracking-widest ${isAvailable ? (isDark ? 'text-emerald-400' : 'text-emerald-700') : (isDark ? 'text-blue-400' : 'text-blue-700')}`}>
                                        {status || 'Unassigned'}
                                    </Text>
                                </View>
                            </View>

                            <Text className={`text-2xl font-black tracking-tight mb-1 pl-1 ${textClass}`}>{patientName}</Text>
                            <Text className={`text-sm font-medium pl-1 mb-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                {diagnosisdto?.caseType || 'General Dentistry'}
                            </Text>

                            <View className={`flex-row flex-wrap gap-3 p-4 rounded-2xl ${isDark ? 'bg-slate-950/50' : 'bg-slate-50'}`}>
                                <View className="w-[47%] flex-row items-center gap-2.5">
                                    <View className={`w-8 h-8 rounded-full items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-white shadow-sm'}`}>
                                        <User size={13} color={isDark ? '#94a3b8' : '#64748b'} />
                                    </View>
                                    <View>
                                        <Text className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Age</Text>
                                        <Text className={`text-xs font-bold ${textClass}`}>{patientAge} yrs</Text>
                                    </View>
                                </View>
                                <View className="w-[47%] flex-row items-center gap-2.5">
                                    <View className={`w-8 h-8 rounded-full items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-white shadow-sm'}`}>
                                        <Clock size={13} color={isDark ? '#94a3b8' : '#64748b'} />
                                    </View>
                                    <View>
                                        <Text className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sessions</Text>
                                        <Text className={`text-xs font-bold ${textClass}`}>{totalSessions}</Text>
                                    </View>
                                </View>
                                <View className="w-full mt-2 flex-row items-center gap-2.5">
                                    <View className={`w-8 h-8 rounded-full items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-white shadow-sm'}`}>
                                        <Calendar size={13} color={isDark ? '#94a3b8' : '#64748b'} />
                                    </View>
                                    <View>
                                        <Text className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Registered On</Text>
                                        <Text className={`text-xs font-bold ${textClass}`}>{new Date(createAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Tabs */}
                    <View className="px-5 mt-8 mb-6 z-10">
                        <View className={`flex-row p-1.5 rounded-2xl ${isDark ? 'bg-slate-900' : 'bg-slate-200/60'}`}>
                            {[
                                { id: 'info', label: 'Details', icon: FileText },
                                { id: 'teeth', label: 'Chart', icon: Activity },
                                { id: 'sessions', label: 'Sessions', icon: Clock },
                            ].map((tab) => {
                                const active = activeTab === tab.id;
                                const Icon = tab.icon;
                                return (
                                    <TouchableOpacity
                                        key={tab.id}
                                        onPress={() => setActiveTab(tab.id as any)}
                                        className={`flex-1 py-3 flex-row items-center justify-center gap-1.5 rounded-xl ${active ? (isDark ? 'bg-indigo-600 shadow-md shadow-indigo-500/20' : 'bg-white shadow-sm') : 'bg-transparent'}`}
                                    >
                                        <Icon size={14} color={active ? (isDark ? '#ffffff' : '#4f46e5') : (isDark ? '#64748b' : '#64748b')} />
                                        <Text className={`text-[11px] font-bold uppercase tracking-wider ${active ? (isDark ? 'text-white' : 'text-indigo-600') : (isDark ? 'text-slate-400' : 'text-slate-500')}`}>
                                            {tab.label}
                                        </Text>
                                        {tab.id === 'sessions' && totalCount > 0 && (
                                            <View className={`px-1.5 py-0.5 rounded-md ${active ? 'bg-white/20' : (isDark ? 'bg-slate-800' : 'bg-slate-300')}`}>
                                                <Text className={`text-[9px] font-bold ${active ? 'text-white' : (isDark ? 'text-slate-400' : 'text-slate-600')}`}>{totalCount}</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Tab content */}
                    <View className="px-5">
                        {activeTab === 'info' && (
                            <View className="space-y-8">
                                <View>
                                    <Text className={`font-black text-lg tracking-tight mb-4 pl-1 ${textClass}`}>Clinical Notes</Text>
                                    <View className={`p-6 rounded-[28px] border ${isDark ? 'border-slate-800 bg-slate-900/80' : 'border-indigo-50 bg-indigo-50/30'}`}>
                                        <Text className={`leading-6 text-[13px] font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                            {diagnosisdto?.notes || 'No description or clinical notes provided for this case.'}
                                        </Text>
                                    </View>
                                </View>
                                {renderImages()}
                            </View>
                        )}

                        {activeTab === 'teeth' && (
                            <View>
                                <WebOdontogram
                                    initialTeeth={diagnosisdto?.teeth || (diagnosisdto?.teethNumbers || []).map(n => ({ number: n, status: 'needs-treatment' }))}
                                    readonly={status === 'Available' || status === 'Unassigned'}
                                    status={status}
                                />
                            </View>
                        )}

                        {activeTab === 'sessions' && renderSessionsTab()}
                    </View>
                </ScrollView>
            </View>

            {/* Image viewer */}
            <Modal visible={!!selectedImage} transparent animationType="fade" onRequestClose={() => setSelectedImage(null)}>
                <Pressable className="flex-1 bg-black/95 justify-center items-center" onPress={() => setSelectedImage(null)}>
                    {selectedImage && <Image source={{ uri: selectedImage }} className="w-full h-4/5" resizeMode="contain" />}
                    <View className="absolute bottom-10 py-3 px-6 bg-white/10 rounded-full border border-white/20">
                        <Text className="text-white text-xs font-bold tracking-widest uppercase">Tap anywhere to close</Text>
                    </View>
                </Pressable>
            </Modal>

            {/* Add Session Modal */}
            <AddSessionModal
                isOpen={showAddSession}
                onClose={() => setShowAddSession(false)}
                onSubmit={async (sessionDate, location) => {
                    const ok = await addSession(sessionDate, location);
                    if (ok) setShowAddSession(false);
                    return ok;
                }}
                isLoading={isSubmitting}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={!!sessionToDelete}
                onClose={() => setSessionToDelete(null)}
                onConfirm={async () => {
                    if (sessionToDelete) {
                        await removeSession(sessionToDelete);
                        setSessionToDelete(null);
                    }
                }}
                title="Delete Session"
                message="Are you sure you want to remove this session? This will free up the time slot."
                confirmLabel="Remove Session"
                isLoading={!!isDeleting}
            />
        </View>

    );
}

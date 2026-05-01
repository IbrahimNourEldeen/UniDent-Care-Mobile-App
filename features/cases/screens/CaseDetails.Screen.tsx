import { useCaseDetails } from '@/features/cases/hooks/useCaseDetails';
import { useCaseSessions } from '@/features/cases/hooks/useCaseSessions';
import { useStudentActions } from '@/features/cases/hooks/useStudentActions';
import { showToast } from '@/store/slices/uiSlice';
import { RootState } from '@/store/store';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { useRouter } from 'expo-router';
import {
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    CircleCheck,
    Clock,
    MapPin,
    Plus,
    Timer,
    Trash2,
    XCircle
} from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Modal, Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { AddSessionModal } from '../components/CaseDetails/AddSessionModal';
import { DeleteConfirmationModal } from '../components/CaseDetails/DeleteConfirmationModal';
import { SessionDto } from '../types/caseTypes';

// Import new modular components
import DentalImageGallery from '../components/CaseDetails/Clinical/DentalImageGallery';
import CaseDetailsSkeleton from '../components/CaseDetails/Layout/CaseDetailsSkeleton';
import CaseDetailsTopBar from '../components/CaseDetails/Layout/CaseDetailsTopBar';
import CaseInfoPanel from '../components/CaseDetails/Layout/CaseInfoPanel';
import ScheduleSessionSection from '../components/CaseDetails/Layout/StudentActions/ScheduleSessionSection';
import CaseDetailTabs from '../components/CaseDetails/Tabs/CaseDetailTabs';

// ─── Case Status Config ────────────────────────────────────────────────────────

const getCaseStatuses = (t: any) => [
    { value: 'Pending',     label: t('status_pending'),      color: '#f59e0b', bg: '#fef3c7', bgDark: '#451a03' },
    { value: 'InProgress',  label: t('status_in_progress'),  color: '#3b82f6', bg: '#dbeafe', bgDark: '#1e3a5f' },
    { value: 'Completed',   label: t('status_completed'),    color: '#10b981', bg: '#d1fae5', bgDark: '#064e3b' },
    { value: 'Cancelled',   label: t('status_cancelled'),    color: '#ef4444', bg: '#fee2e2', bgDark: '#450a0a' },
    { value: 'UnderReview', label: t('status_underreview'), color: '#8b5cf6', bg: '#ede9fe', bgDark: '#2e1065' },
    { value: 'Rejected',    label: t('status_rejected'),     color: '#f43f5e', bg: '#ffe4e6', bgDark: '#4c0519' },
];

function getSessionStatusConfig(status: string | null, isDark: boolean, t: any) {
    const s = status?.toLowerCase();
    if (s === 'done') return {
        Icon: CircleCheck, dot: '#34d399',
        text: isDark ? '#6ee7b7' : '#059669',
        bg: isDark ? 'bg-emerald-900/30' : 'bg-emerald-50',
        label: t('status_done'),
    };
    if (s === 'cancelled') return {
        Icon: XCircle, dot: '#f87171',
        text: isDark ? '#fca5a5' : '#dc2626',
        bg: isDark ? 'bg-red-900/30' : 'bg-red-50',
        label: t('status_cancelled'),
    };
    return {
        Icon: Timer, dot: '#f59e0b',
        text: isDark ? '#fbbf24' : '#d97706',
        bg: isDark ? 'bg-amber-900/30' : 'bg-amber-50',
        label: t('status_scheduled'),
    };
}

function ProgressRing({ rate, isDark, t, isRtl }: { rate: number; isDark: boolean; t: any; isRtl: boolean }) {
    const pct = Math.round(rate * 100);
    return (
        <View className={`rounded-[28px] p-5 mb-6 border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <View className={`flex-row items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                <View className={isRtl ? 'items-end' : 'items-start'}>
                    <Text className={`text-xs font-black uppercase tracking-widest mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {t('session_progress')}
                    </Text>
                    <Text className={`text-4xl pt-3 font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {pct}<Text className="text-xl ">%</Text>
                    </Text>
                    <Text className={`text-xs mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('completed')}</Text>
                </View>
                {/* Visual bar */}
                <View className={`flex-1 ${isRtl ? 'mr-6' : 'ml-6'}`}>
                    <View className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        <View
                            style={{ width: `${pct}%`, position: 'absolute', [isRtl ? 'right' : 'left']: 0 }}
                            className="h-full bg-indigo-600 rounded-full"
                        />
                    </View>
                    <View className={`flex-row justify-between mt-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <View className="items-center">
                            <View className="w-2 h-2 rounded-full bg-emerald-500 mb-1" />
                            <Text className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('done')}</Text>
                        </View>
                        <View className="items-center">
                            <View className="w-2 h-2 rounded-full bg-amber-400 mb-1" />
                            <Text className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('upcoming')}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

function SessionCard({
    session, isDark, isDeleting, canDelete, onDeleteRequest, onPress, t, language
}: {
    session: SessionDto;
    isDark: boolean;
    isDeleting: boolean;
    canDelete: boolean;
    onDeleteRequest: (id: string) => void;
    onPress?: () => void;
    t: any;
    language: string;
}) {

    const sc = getSessionStatusConfig(session.status, isDark, t);
    const { Icon } = sc;
    const isRtl = language === 'ar';
    const locale = isRtl ? 'ar-EG' : 'en-GB';
    const date = new Date(session.scheduledAt);
    const dateStr = date.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' });
    const timeStr = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

    const handleDelete = () => {
        onDeleteRequest(session.id);
    };

    return (
        <TouchableOpacity 
            activeOpacity={0.7}
            onPress={onPress}
            className={`mb-3 p-4 rounded-[24px] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}
        >
            <View className={`flex-row justify-between items-start ${isRtl ? 'flex-row-reverse' : ''}`}>
                <View className={`flex-row items-center gap-3 flex-1 min-w-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <View className={`w-10 h-10 rounded-2xl items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-indigo-50'}`}>
                        <Icon size={18} color={sc.text} />
                    </View>
                    <View className={`flex-1 min-w-0 ${isRtl ? 'items-end' : 'items-start'}`}>
                        <Text className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{dateStr}</Text>
                        <Text className={`text-xs font-bold mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{timeStr}</Text>
                    </View>
                </View>
                <View className={`flex-row items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <View className={`px-2.5 py-1 rounded-full flex-row items-center gap-1 ${sc.bg} ${isRtl ? 'flex-row-reverse' : ''}`}>
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
        </TouchableOpacity>
    );
}

export default function CaseDetailsScreen({ caseId }: { caseId: string }) {
    const { language, theme } = useThemeLanguage();
    const { t } = useTranslation();
    const isRtl = language === 'ar';
    const isDark = theme === 'dark';
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const userRole = useSelector((state: RootState) => state.auth.role);
    const isDoctor = userRole === 'Doctor';

    const { patient, isLoading, refetch, statuses, updateStatus, isUpdatingStatus } = useCaseDetails(caseId);
    
    // Status UI Config
    const statusConfig: Record<string, { color: string, bg: string, bgDark: string }> = {
        'Pending':     { color: '#f59e0b', bg: '#fef3c7', bgDark: '#451a03' },
        'InProgress':  { color: '#3b82f6', bg: '#dbeafe', bgDark: '#1e3a5f' },
        'Completed':   { color: '#10b981', bg: '#d1fae5', bgDark: '#064e3b' },
        'Cancelled':   { color: '#ef4444', bg: '#fee2e2', bgDark: '#450a0a' },
        'UnderReview': { color: '#8b5cf6', bg: '#ede9fe', bgDark: '#2e1065' },
        'Rejected':    { color: '#f43f5e', bg: '#ffe4e6', bgDark: '#4c0519' },
    };

    const CASE_STATUSES = (statuses && statuses.length > 0) 
        ? statuses.map(s => ({
            value: s.name,
            label: t(`status_${s.name.toLowerCase().replace(/\s/g, '')}`),
            ...(statusConfig[s.name] || { color: '#64748b', bg: '#f1f5f9', bgDark: '#1e293b' })
          }))
        : getCaseStatuses(t);

    const {
        sessions, isLoading: sessionsLoading, isSubmitting, isDeleting,
        completedCount, scheduledCount, totalCount, progressRate,
        addSession, removeSession, refetch: refetchSessions,
    } = useCaseSessions(caseId, patient?.id ?? caseId);

    const studentActions = useStudentActions(caseId, patient?.id ?? caseId);
    const isStudent = userRole === 'Student';
    const isPatient = userRole?.toLowerCase() === 'patient';
    const canEditSessions = !isPatient;

    const isInProgress = patient?.status?.toLowerCase() === 'in-progress' || patient?.status?.toLowerCase() === 'inprogress';

    const [showAddSession, setShowAddSession] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
    const [showStatusModal, setShowStatusModal] = useState(false);

    const bgClass = isDark ? 'bg-[#020617]' : 'bg-slate-50';
    const textClass = isDark ? 'text-white' : 'text-slate-900';
    const subTextClass = isDark ? 'text-slate-400' : 'text-slate-500';



    if (isLoading) {
        return (
            <View className={`flex-1 ${bgClass} p-5`} style={{ paddingTop: insets.top }}>
                <CaseDetailsSkeleton />
            </View>
        );
    }

    if (!patient) {
        return (
            <View className={`flex-1 ${bgClass} justify-center items-center px-6`} style={{ paddingTop: insets.top }}>
                <AlertCircle size={56} color={isDark ? '#f87171' : '#ef4444'} />
                <Text className={`text-xl font-black mt-5 text-center ${textClass}`}>{t('case_not_found')}</Text>
                <Text className={`text-sm mt-2 text-center ${subTextClass}`}>{t('case_not_found_desc')}</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-8 bg-indigo-600 px-8 py-3.5 rounded-2xl shadow-lg shadow-indigo-500/30">
                    <Text className="text-white font-bold text-sm">{t('return_to_dashboard')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const { status, patientName, patientAge, createAt, totalSessions, imageUrls, diagnosisdto } = patient;
    const isAvailable = status?.toLowerCase() === 'available' || status?.toLowerCase() === 'unassigned';



    const renderSessionsTab = () => (
        <View>
            {/* Stats Row */}
            <View className={`flex-row gap-3 mb-5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                {[
                    { label: t('total'), value: totalCount, color: '#4f46e5' },
                    { label: t('done'), value: completedCount, color: '#10b981' },
                    { label: t('upcoming'), value: scheduledCount, color: '#f59e0b' },
                ].map(stat => (
                    <View key={stat.label} className={`flex-1 rounded-2xl p-3 items-center border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <Text style={{ color: stat.color }} className="text-2xl font-black">{stat.value}</Text>
                        <Text className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{stat.label}</Text>
                    </View>
                ))}
            </View>

            {/* Progress bar */}
            {totalCount > 0 && <ProgressRing rate={progressRate} isDark={isDark} t={t} isRtl={isRtl} />}

            {/* Session list header + add button */}
            <View className={`flex-row justify-between items-center mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <Text className={`font-black text-base ${textClass}`}>{t('all_sessions')}</Text>
                <View className={`flex-row items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    {sessionsLoading && <ActivityIndicator size="small" color="#4f46e5" />}
                    {canEditSessions && isInProgress && (
                        <TouchableOpacity
                            onPress={() => setShowAddSession(true)}
                            className={`flex-row items-center gap-1.5 bg-indigo-600 px-3.5 py-2 rounded-2xl ${isRtl ? 'flex-row-reverse' : ''}`}
                        >
                            <Plus size={14} color="white" />
                            <Text className="text-white text-xs font-black">{t('add')}</Text>
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
                    <Text className={`font-bold text-sm ${textClass} mb-1`}>{t('no_sessions_yet')}</Text>
                    <Text className={`text-xs text-center ${subTextClass}`}>
                        {isInProgress ? t('add_session_prompt') : t('sessions_will_appear_later')}
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
                        canDelete={canEditSessions && isInProgress && isScheduled}
                        isDeleting={isDeleting === session.id}
                        onDeleteRequest={(id) => setSessionToDelete(id)}
                        onPress={() => router.push(`/(screens)/session-details/${session.id}` as any)}
                        t={t}
                        language={language}
                    />

                );
            })}
        </View>
    );

    return (
        <View className={`flex-1 ${bgClass}`}>
            <View style={{ paddingTop: insets.top }} className="flex-1">
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}>
                    <View className="px-5">
                        <CaseDetailsTopBar 
                            currentStatus={status || 'Pending'} 
                            patientName={patientName || ''} 
                            onStatusPress={() => setShowStatusModal(true)}
                        />
                    </View>

                    <DentalImageGallery images={imageUrls || []} isDark={isDark} />

                    <View className={`mx-5 mb-6 rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'} overflow-hidden`}>
                        <CaseInfoPanel 
                            role={userRole} 
                            patient={patient} 
                            onRefetch={() => { refetch(); refetchSessions(); }} 
                        />
                    </View>

                    {isStudent && isInProgress && (
                        <View className="px-5 mb-6">
                            <Text className={`font-black text-lg mb-2 ${textClass}`}>Student Actions</Text>
                            <ScheduleSessionSection 
                                showForm={studentActions.showSessionForm}
                                onToggleForm={studentActions.setShowSessionForm}
                                onSubmit={studentActions.handleCreateSession}
                                sessionLoading={studentActions.sessionLoading || studentActions.isAddingSession}
                                scheduledSession={studentActions.scheduledSession}

                                showStartNowModal={studentActions.showStartNowModal}
                                onToggleStartNowModal={studentActions.setShowStartNowModal}
                                onStartNow={studentActions.handleStartNow}
                                startNowLoading={studentActions.startNowLoading}

                                showCancelSessionModal={studentActions.showCancelSessionModal}
                                onToggleCancelSessionModal={studentActions.setShowCancelSessionModal}
                                onCancelSession={studentActions.handleCancelSession}
                                cancelSessionLoading={studentActions.cancelSessionLoading}

                                isDark={isDark}
                            />
                        </View>
                    )}

                    <View className="px-5">
                        <CaseDetailTabs 
                            patient={patient} 
                            isDark={isDark} 
                            totalSessionsCount={totalCount}
                            sessionsContent={renderSessionsTab()}
                        />
                    </View>
                </ScrollView>
            </View>

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
                title={t('delete_session')}
                message={t('delete_session_confirm')}
                confirmLabel={t('remove_session')}
                isLoading={!!isDeleting}
            />

            {/* ── Case Status Modal ─────────────────────────────────────────── */}
            <Modal
                visible={showStatusModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowStatusModal(false)}
            >
                <Pressable
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onPress={() => setShowStatusModal(false)}
                >
                    <Pressable style={{ marginTop: 'auto' }} onPress={e => e.stopPropagation()}>
                        <View className={`rounded-t-[32px] px-5 pt-4 pb-10 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                            {/* Handle */}
                            <View className="items-center mb-5">
                                <View className={`w-10 h-1 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                            </View>

                             <Text className={`text-lg font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'} ${isRtl ? 'text-right' : 'text-left'}`}>
                                {t('change_case_status')}
                            </Text>
                            <Text className={`text-xs mb-5 ${isDark ? 'text-slate-400' : 'text-slate-500'} ${isRtl ? 'text-right' : 'text-left'}`}>
                                {t('current_status')}: <Text className="font-bold">{t(`status_${(status ?? 'unknown').toLowerCase().replace(/\s/g, '')}`)}</Text>
                            </Text>

                            {CASE_STATUSES
                                .filter(s => ['InProgress', 'Cancelled', 'Completed'].includes(s.value))
                                .sort((a, b) => {
                                    const order = ['InProgress', 'Cancelled', 'Completed'];
                                    return order.indexOf(a.value) - order.indexOf(b.value);
                                })
                                .map((s) => {
                                const isActive = (status ?? '').toLowerCase() === s.value.toLowerCase();
                                return (
                                    <TouchableOpacity
                                        key={s.value}
                                        disabled={isActive || isUpdatingStatus}
                                        onPress={async () => {
                                            console.log(`[UI] Status clicked: ${s.value}`);
                                            try {
                                                const res = await updateStatus(s.value);
                                                setShowStatusModal(false);
                                                dispatch(showToast({ 
                                                    message: res?.message || t('status_updated_successfully'), 
                                                    type: 'success' 
                                                }));
                                            } catch (err: any) {
                                                const errorMsg = err?.message || t('status_update_failed');
                                                dispatch(showToast({ message: errorMsg, type: 'error' }));
                                            }
                                        }}
                                        className={`flex-row items-center justify-between p-4 rounded-2xl mb-2.5 border ${isRtl ? 'flex-row-reverse' : ''} ${
                                            isActive
                                                ? (isDark ? 'border-indigo-500 bg-indigo-900/30' : 'border-indigo-400 bg-indigo-50')
                                                : (isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-100 bg-slate-50')
                                        }`}
                                    >
                                        <View className={`flex-row items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                            <View
                                                style={{ backgroundColor: isDark ? s.bgDark : s.bg }}
                                                className="w-8 h-8 rounded-xl items-center justify-center"
                                            >
                                                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: s.color }} />
                                            </View>
                                            <Text className={`font-bold text-sm ${
                                                isActive
                                                    ? (isDark ? 'text-indigo-300' : 'text-indigo-700')
                                                    : (isDark ? 'text-white' : 'text-slate-800')
                                            }`}>
                                                {t(`status_${s.value.toLowerCase().replace(/\s/g, '')}`)}
                                            </Text>
                                        </View>
                                        {isActive ? (
                                            <CheckCircle2 size={16} color={isDark ? '#818cf8' : '#4f46e5'} />
                                        ) : (
                                            <ChevronRight size={16} color={isDark ? '#475569' : '#cbd5e1'} style={{ transform: [{ rotate: isRtl ? '180deg' : '0deg' }] }} />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}

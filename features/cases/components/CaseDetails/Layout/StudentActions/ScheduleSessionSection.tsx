import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CalendarPlus, Play, CalendarClock, Trash2 } from 'lucide-react-native';
import ActionModal from '@/components/common/ActionModal';
import SessionBookingDialog from './Booking';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

interface Props {
    showForm: boolean;
    onToggleForm: (show: boolean) => void;
    onSubmit: (data: any) => Promise<void>;
    sessionLoading: boolean;
    locale?: "en" | "ar";
    scheduledSession?: any | null;
    showStartNowModal?: boolean;
    onToggleStartNowModal?: (show: boolean) => void;
    onStartNow?: () => void;
    startNowLoading?: boolean;
    showCancelSessionModal?: boolean;
    onToggleCancelSessionModal?: (show: boolean) => void;
    onCancelSession?: () => void;
    cancelSessionLoading?: boolean;
}

export default function ScheduleSessionSection({
    showForm,
    onToggleForm,
    onSubmit,
    sessionLoading,
    locale = "en",
    scheduledSession,
    showStartNowModal = false,
    onToggleStartNowModal,
    onStartNow,
    startNowLoading = false,
    showCancelSessionModal = false,
    onToggleCancelSessionModal,
    onCancelSession,
    cancelSessionLoading = false,
}: Props) {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';
    const hasScheduledSession = !!scheduledSession;

    const status = scheduledSession?.status?.toString().toLowerCase();
    const isExpired = status === "expired" || status === "3" || (() => {
        if (!scheduledSession) return false;
        const sd = new Date(scheduledSession.scheduledAt);
        sd.setHours(0, 0, 0, 0);
        const td = new Date();
        td.setHours(0, 0, 0, 0);
        return sd.getTime() < td.getTime();
    })();

    const formatSessionTime = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <View className="space-y-3">
            {hasScheduledSession && !isExpired ? (
                <View className={`rounded-2xl p-4 border space-y-3 ${isDark ? 'bg-blue-900/10 border-blue-800/50' : 'bg-blue-50 border-blue-200/60'}`}>
                    <View className="flex-row items-center gap-1.5">
                        <CalendarClock size={13} color={isDark ? '#60a5fa' : '#2563eb'} />
                        <Text className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                            {locale === "ar" ? "جلسة محجوزة" : "Upcoming Session"}
                        </Text>
                    </View>

                    <View className="space-y-1">
                        <View className="flex-row items-center gap-2">
                            <CalendarClock size={14} color="#3b82f6" />
                            <Text className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                {formatSessionTime(scheduledSession.scheduledAt)}
                            </Text>
                        </View>
                        {scheduledSession.endAt && (
                            <Text className={`text-xs ml-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {locale === "ar" ? "حتى" : "Ends"}{" "}
                                {new Date(scheduledSession.endAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                            </Text>
                        )}
                    </View>

                    <View className="flex-row items-center gap-2 pt-2">
                        <TouchableOpacity
                            disabled={cancelSessionLoading}
                            onPress={() => onToggleCancelSessionModal?.(true)}
                            activeOpacity={0.7}
                            className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border py-2.5 ${isDark ? 'bg-rose-900/10 border-rose-800/60' : 'bg-rose-50 border-rose-200'}`}
                        >
                            <Trash2 size={13} color={isDark ? '#fb7185' : '#e11d48'} />
                            <Text className={`text-xs font-semibold ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
                                {locale === "ar" ? "إلغاء الجلسة" : "Cancel Session"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            disabled={startNowLoading}
                            onPress={() => onToggleStartNowModal?.(true)}
                            activeOpacity={0.8}
                            className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-xl shadow-sm py-2.5 ${isDark ? 'bg-indigo-600' : 'bg-indigo-600'}`}
                        >
                            {startNowLoading ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <Play size={13} color="#ffffff" />
                            )}
                            <Text className="text-xs font-bold text-white">
                                {locale === "ar" ? "ابدأ الآن" : "Start Now"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : hasScheduledSession && isExpired ? (
                <View className={`rounded-2xl p-4 border space-y-3 ${isDark ? 'bg-rose-900/10 border-rose-800/50' : 'bg-rose-50 border-rose-200/60'}`}>
                    <View className="flex-row items-center gap-1.5">
                        <CalendarClock size={13} color={isDark ? '#fb7185' : '#e11d48'} />
                        <Text className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
                            {locale === "ar" ? "جلسة منتهية الصلاحية" : "Session Expired"}
                        </Text>
                    </View>

                    <View className="flex-row items-center gap-2">
                        <CalendarClock size={14} color="#f43f5e" />
                        <Text className={`text-sm font-medium line-through opacity-70 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                            {formatSessionTime(scheduledSession.scheduledAt)}
                        </Text>
                    </View>

                    <View className="flex-row items-center gap-2 pt-2">
                        <TouchableOpacity
                            disabled={sessionLoading}
                            onPress={() => onToggleForm(true)}
                            activeOpacity={0.7}
                            className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border py-2.5 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                        >
                            <CalendarPlus size={13} color={isDark ? '#cbd5e1' : '#475569'} />
                            <Text className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                {locale === "ar" ? "جدولة جديدة" : "Reschedule"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            disabled={startNowLoading}
                            onPress={() => onToggleStartNowModal?.(true)}
                            activeOpacity={0.8}
                            className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-xl shadow-sm py-2.5 ${isDark ? 'bg-indigo-600' : 'bg-indigo-600'}`}
                        >
                            {startNowLoading ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <Play size={13} color="#ffffff" />
                            )}
                            <Text className="text-xs font-bold text-white">
                                {locale === "ar" ? "ابدأ الآن" : "Start Now"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <TouchableOpacity
                    disabled={sessionLoading}
                    onPress={() => onToggleForm(true)}
                    activeOpacity={0.8}
                    className={`flex-row items-center justify-center gap-2 py-3.5 rounded-xl shadow-sm ${isDark ? 'bg-indigo-600' : 'bg-indigo-600'}`}
                >
                    <CalendarPlus size={15} color="#ffffff" />
                    <Text className="text-sm font-bold text-white">
                        {locale === "ar" ? "حجز جلسة جديدة" : "Schedule New Session"}
                    </Text>
                </TouchableOpacity>
            )}

            <SessionBookingDialog
                open={showForm}
                onOpenChange={onToggleForm}
                onSubmit={onSubmit}
                isLoading={sessionLoading}
                locale={locale}
            />

            <ActionModal
                isOpen={showStartNowModal}
                onClose={() => onToggleStartNowModal?.(false)}
                onAction={() => {
                    onStartNow?.();
                    onToggleStartNowModal?.(false);
                }}
                title={locale === "ar" ? "بدء الجلسة" : "Start Session"}
                message={
                    locale === "ar"
                        ? "هل أنت متأكد أنك تريد بدء هذه الجلسة الآن؟ سيتم تغيير حالة الجلسة إلى 'قيد التنفيذ'."
                        : "Are you sure you want to start this session now? The session status will be changed to 'In Progress'."
                }
                actionText={locale === "ar" ? "ابدأ الآن" : "Start Now"}
                cancelText={locale === "ar" ? "إلغاء" : "Cancel"}
                isLoading={startNowLoading}
                variant="primary"
            />

            <ActionModal
                isOpen={showCancelSessionModal}
                onClose={() => onToggleCancelSessionModal?.(false)}
                onAction={() => {
                    onCancelSession?.();
                    onToggleCancelSessionModal?.(false);
                }}
                title={locale === "ar" ? "إلغاء الجلسة" : "Cancel Session"}
                message={
                    locale === "ar"
                        ? "هل أنت متأكد أنك تريد إلغاء هذه الجلسة؟ لا يمكن التراجع عن هذا الإجراء."
                        : "Are you sure you want to cancel this session? This action cannot be undone."
                }
                actionText={locale === "ar" ? "نعم، إلغاء الجلسة" : "Yes, Cancel Session"}
                cancelText={locale === "ar" ? "تراجع" : "Go Back"}
                isLoading={cancelSessionLoading}
                variant="danger"
            />
        </View>
    );
}

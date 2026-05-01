import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CalendarPlus, Play, CalendarClock, Trash2 } from 'lucide-react-native';
import ActionModal from '@/components/common/ActionModal';
import { AddSessionModal } from '../../AddSessionModal';
import { SessionDto } from '../../../../types/caseTypes';

interface ScheduleSessionSectionProps {
    showForm: boolean;
    onToggleForm: (show: boolean) => void;
    onSubmit: (sessionDate: string, location?: string) => Promise<void>;
    sessionLoading: boolean;
    scheduledSession?: SessionDto | null;
    
    // Start Now
    showStartNowModal: boolean;
    onToggleStartNowModal: (show: boolean) => void;
    onStartNow: () => void;
    startNowLoading: boolean;
    
    // Cancel Session
    showCancelSessionModal: boolean;
    onToggleCancelSessionModal: (show: boolean) => void;
    onCancelSession: () => void;
    cancelSessionLoading: boolean;

    isDark?: boolean;
}

export default function ScheduleSessionSection({
    showForm,
    onToggleForm,
    onSubmit,
    sessionLoading,
    scheduledSession,

    showStartNowModal,
    onToggleStartNowModal,
    onStartNow,
    startNowLoading,

    showCancelSessionModal,
    onToggleCancelSessionModal,
    onCancelSession,
    cancelSessionLoading,

    isDark = false,
}: ScheduleSessionSectionProps) {
    const hasScheduledSession = !!scheduledSession;

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
        <View className="mt-4">
            {hasScheduledSession ? (
                <View className={`rounded-2xl border p-4 space-y-3 ${
                    isDark ? 'border-blue-800/50 bg-blue-900/10' : 'border-blue-200/60 bg-blue-50/70'
                }`}>
                    {/* Session badge */}
                    <View className="flex-row items-center gap-1.5 mb-2">
                        <CalendarClock size={13} color={isDark ? '#60a5fa' : '#2563eb'} />
                        <Text className={`text-xs font-semibold uppercase tracking-wide ${
                            isDark ? 'text-blue-400' : 'text-blue-600'
                        }`}>
                            Upcoming Session
                        </Text>
                    </View>

                    {/* Session time */}
                    <View className="space-y-1 mb-3">
                        <View className="flex-row items-center gap-2">
                            <CalendarClock size={14} color="#3b82f6" />
                            <Text className={`text-sm font-medium ${
                                isDark ? 'text-slate-200' : 'text-slate-700'
                            }`}>
                                {formatSessionTime(scheduledSession.scheduledAt)}
                            </Text>
                        </View>
                    </View>

                    {/* Action buttons */}
                    <View className="flex-row items-center gap-2 pt-1 mt-2">
                        <TouchableOpacity
                            disabled={cancelSessionLoading}
                            onPress={() => onToggleCancelSessionModal(true)}
                            className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border py-2.5 px-3 ${
                                isDark ? 'border-rose-800/60 bg-rose-900/10' : 'border-rose-200 bg-rose-50'
                            } ${cancelSessionLoading ? 'opacity-50' : ''}`}
                        >
                            <Trash2 size={13} color={isDark ? '#fb7185' : '#e11d48'} />
                            <Text className={`text-xs font-semibold ${
                                isDark ? 'text-rose-400' : 'text-rose-600'
                            }`}>
                                Cancel Session
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            disabled={startNowLoading}
                            onPress={() => onToggleStartNowModal(true)}
                            className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 bg-indigo-600 shadow-md shadow-indigo-500/30 ${
                                startNowLoading ? 'opacity-50' : ''
                            }`}
                        >
                            <Play size={13} color="#ffffff" />
                            <Text className="text-xs font-semibold text-white">
                                Start Now
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <TouchableOpacity
                    disabled={sessionLoading}
                    onPress={() => onToggleForm(true)}
                    className={`w-full py-3 rounded-2xl flex-row items-center justify-center gap-2 bg-indigo-600 shadow-lg shadow-indigo-500/30 ${
                        sessionLoading ? 'opacity-50' : ''
                    }`}
                >
                    <CalendarPlus size={16} color="#ffffff" />
                    <Text className="text-sm font-bold text-white tracking-wide">
                        Schedule New Session
                    </Text>
                </TouchableOpacity>
            )}

            {/* Add Session Modal */}
            <AddSessionModal
                isOpen={showForm}
                onClose={() => onToggleForm(false)}
                onSubmit={async (date, location) => {
                    await onSubmit(date, location);
                    return true;
                }}
                isLoading={sessionLoading}
            />

            {/* Start Now confirmation */}
            <ActionModal
                isOpen={showStartNowModal}
                onClose={() => onToggleStartNowModal(false)}
                onAction={onStartNow}
                title="Start Session"
                message="Are you sure you want to start this session now? The session status will be changed to 'In Progress'."
                actionText="Start Now"
                cancelText="Cancel"
                isLoading={startNowLoading}
                variant="primary"
                isDark={isDark}
            />

            {/* Cancel session confirmation */}
            <ActionModal
                isOpen={showCancelSessionModal}
                onClose={() => onToggleCancelSessionModal(false)}
                onAction={onCancelSession}
                title="Cancel Session"
                message="Are you sure you want to cancel this session? This action cannot be undone."
                actionText="Yes, Cancel Session"
                cancelText="Go Back"
                isLoading={cancelSessionLoading}
                variant="danger"
                isDark={isDark}
            />
        </View>
    );
}

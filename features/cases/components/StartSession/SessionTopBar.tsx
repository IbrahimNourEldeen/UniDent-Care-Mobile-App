import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ArrowLeft, Clock, Square } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface SessionTopBarProps {
    patientName: string;
    sessionId: string;
    caseId?: string;
    onEndSession?: () => void;
    endSessionLoading?: boolean;
    sessionStatus?: string;
    isDark?: boolean;
}

function formatElapsed(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const parts: string[] = [];
    if (h > 0) parts.push(`${h}h`);
    parts.push(`${String(m).padStart(2, "0")}m`);
    parts.push(`${String(s).padStart(2, "0")}s`);
    return parts.join(" ");
}

export default function SessionTopBar({
    patientName,
    sessionId,
    caseId,
    onEndSession,
    endSessionLoading = false,
    sessionStatus,
    isDark = false,
}: SessionTopBarProps) {
    const router = useRouter();
    const [elapsed, setElapsed] = useState(0);

    const isDone = sessionStatus?.toLowerCase() === "done";
    const isCancelled = sessionStatus?.toLowerCase() === "cancelled";
    const hideTimerAndButton = isDone || isCancelled;

    useEffect(() => {
        if (hideTimerAndButton) return;
        const interval = setInterval(() => setElapsed((p) => p + 1), 1000);
        return () => clearInterval(interval);
    }, [hideTimerAndButton]);

    return (
        <View className="gap-4 mb-4">
            {/* Row 1: Back button + Title */}
            <View className="flex-row items-center gap-3">
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center"
                >
                    <ArrowLeft size={17} color="#475569" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">
                        Session — {patientName}
                    </Text>
                    <Text className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {isDone ? "Session completed" : isCancelled ? "Session cancelled" : "Active clinical session"}
                    </Text>
                </View>
            </View>

            {/* Row 2: Timer + Status Badge + End Session Button */}
            <View className="flex-row items-center gap-3 flex-wrap">
                {/* Live Timer */}
                {!hideTimerAndButton && (
                    <View className="flex-row items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 shadow-sm">
                        <Clock size={14} color="#6366f1" />
                        <Text className="text-sm font-semibold text-slate-700 dark:text-slate-200 tracking-wide">
                            {formatElapsed(elapsed)}
                        </Text>
                    </View>
                )}

                {/* Status Badge */}
                {isDone ? (
                    <View className="flex-row items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/40 shadow-sm">
                        <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <Text className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wide uppercase">
                            Completed
                        </Text>
                    </View>
                ) : isCancelled ? (
                    <View className="flex-row items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800/40 shadow-sm">
                        <View className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        <Text className="text-[10px] font-bold text-red-600 dark:text-red-400 tracking-wide uppercase">
                            Cancelled
                        </Text>
                    </View>
                ) : (
                    <View className="flex-row items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/40 shadow-sm">
                        <View className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <Text className="text-[10px] font-bold text-amber-600 dark:text-amber-400 tracking-wide uppercase">
                            In Progress
                        </Text>
                    </View>
                )}

                {/* End Session Button */}
                {!hideTimerAndButton && onEndSession && (
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={onEndSession}
                        disabled={endSessionLoading}
                        className={`flex-row items-center justify-center gap-2 px-4 py-2.5 rounded-xl shadow-md ${
                            endSessionLoading ? 'bg-rose-400' : 'bg-rose-500'
                        }`}
                    >
                        {endSessionLoading ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <Square size={14} color="#ffffff" />
                        )}
                        <Text className="text-sm font-semibold text-white">
                            {endSessionLoading ? "Ending..." : "End Session"}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

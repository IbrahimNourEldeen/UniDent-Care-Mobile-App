import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Send, GraduationCap, CheckCheck, X } from 'lucide-react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

interface PendingRequestCardProps {
    requestData: any; // Type it properly later
    approveLoading: boolean;
    rejectLoading: boolean;
    onApprove: () => void;
    onReject: () => void;
}

export default function PendingRequestCard({
    requestData,
    approveLoading,
    rejectLoading,
    onApprove,
    onReject,
}: PendingRequestCardProps) {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';

    return (
        <View className={`rounded-2xl p-4 border space-y-3 ${isDark ? 'bg-amber-900/10 border-amber-800/50' : 'bg-amber-50 border-amber-200/60'}`}>
            {/* Header */}
            <View className="flex-row items-center gap-2">
                <Send size={14} color={isDark ? '#fbbf24' : '#d97706'} />
                <Text className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                    Incoming Request
                </Text>
            </View>

            {/* Student Info Card */}
            <View className={`rounded-xl p-3 border space-y-2 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-sm">
                        <GraduationCap size={18} color="white" />
                    </View>
                    <View className="flex-1">
                        <Text className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`} numberOfLines={1}>
                            {requestData.studentName}
                        </Text>
                        <Text className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {requestData.university} · Level {requestData.level}
                        </Text>
                    </View>
                </View>
                {requestData.description && (
                    <Text className={`text-xs leading-relaxed border-t pt-2 ${isDark ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-100'}`}>
                        "{requestData.description}"
                    </Text>
                )}
                <Text className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Requested {new Date(requestData.createAt || requestData.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </Text>
            </View>

            {/* Approve / Reject Buttons */}
            <View className="flex-row items-center gap-2">
                <TouchableOpacity
                    onPress={onReject}
                    disabled={rejectLoading || approveLoading}
                    activeOpacity={0.7}
                    className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl border ${isDark ? 'border-red-800 bg-transparent' : 'border-red-200 bg-transparent'}`}
                >
                    {rejectLoading ? (
                        <>
                            <ActivityIndicator size="small" color={isDark ? '#f87171' : '#dc2626'} />
                            <Text className={`text-sm font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>Rejecting...</Text>
                        </>
                    ) : (
                        <>
                            <X size={14} color={isDark ? '#f87171' : '#dc2626'} />
                            <Text className={`text-sm font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>Reject</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onApprove}
                    disabled={approveLoading || rejectLoading}
                    activeOpacity={0.8}
                    className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl shadow-sm ${isDark ? 'bg-indigo-600' : 'bg-indigo-600'} ${(approveLoading || rejectLoading) ? 'opacity-50' : ''}`}
                >
                    {approveLoading ? (
                        <>
                            <ActivityIndicator size="small" color="#ffffff" />
                            <Text className="text-sm font-bold text-white">Approving...</Text>
                        </>
                    ) : (
                        <>
                            <CheckCheck size={14} color="#ffffff" />
                            <Text className="text-sm font-bold text-white">Approve</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

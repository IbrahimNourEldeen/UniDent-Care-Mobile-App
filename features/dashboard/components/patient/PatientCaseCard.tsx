import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { Calendar, ChevronRight, ClipboardList, School } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function PatientCaseCard({ item, onPress, index = 0 }: { item: any, onPress?: () => void, index?: number }) {
    const { theme, language } = useThemeLanguage();
    const isDark = theme === "dark";
    const isRtl = language === "ar";
    const { t } = useTranslation();

    const getStatusText = (status: any) => {
        if (status === 0) return t("status_pending");
        if (status === 1) return t("status_in_progress");
        if (status === 2) return t("status_completed");
        if (status === 3) return t("status_cancelled");
        if (status === 4) return t("status_under_review");
        if (status === 5) return t("status_rejected");
        
        if (typeof status === 'string') {
            const s = status.toLowerCase();
            if (s === 'inprogress') return t("status_in_progress");
            if (s === 'underreview') return t("status_under_review");
            if (s === 'pending') return t("status_pending");
            if (s === 'approved') return t("status_approved");
            if (s === 'completed') return t("status_completed");
        }
        return status?.toString() || t("unknown_type");
    };

    const getStatusColors = (status: any) => {
        if (status === undefined || status === null) return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
        
        let text = "";
        if (typeof status === 'number') {
            if (status === 0) text = "pending";
            else if (status === 1) text = "in progress";
            else if (status === 2) text = "completed";
        } else {
            text = status.toLowerCase();
        }

        switch(text) {
            case "approved": 
            case "status_approved":
                return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50";
            case "pending": 
            case "status_pending":
                return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/50";
            case "in progress": 
            case "inprogress":
            case "status_in_progress":
                return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/50";
            case "completed": 
            case "status_completed":
                return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800/50";
            default: return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
        }
    };

    const statusStyle = getStatusColors(item.processStatus || item.status);

    return (
        <Animated.View entering={FadeInUp.delay(index * 100).springify()}>
            <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 mb-4 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none">
                {/* Header */}
                <View className={`flex-row justify-between items-start mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <View className={`flex-1 flex-row items-center ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <View className={`w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl items-center justify-center border border-indigo-100 dark:border-indigo-800/50 ${isRtl ? 'ml-3' : 'mr-3'}`}>
                            <ClipboardList size={22} color={isDark ? "#818cf8" : "#4f46e5"} />
                        </View>
                        <View className={`flex-1 ${isRtl ? 'pl-2 items-end' : 'pr-2'}`}>
                            <Text className={`text-base font-black text-slate-900 dark:text-white ${isRtl ? 'text-right' : ''}`} numberOfLines={1}>
                                {item.diagnosisdto?.caseType || item.diagnosisDto?.caseType || item.caseType?.name || item.title || t("unknown_type")}
                            </Text>
                            <Text className={`text-xs text-slate-500 dark:text-slate-400 mt-0.5 ${isRtl ? 'text-right' : ''}`} numberOfLines={1}>
                                #{item.id ? item.id.slice(-6).toUpperCase() : "..."}
                            </Text>
                        </View>
                    </View>
                    
                    <View className={`px-3 py-1.5 rounded-full border ${statusStyle}`}>
                        <Text className="text-[10px] font-black uppercase tracking-wider">{getStatusText(item.processStatus || item.status)}</Text>
                    </View>
                </View>

                {/* Content Details */}
                <View className={`flex-row items-center gap-x-6 gap-y-2 flex-wrap mb-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <View className={`flex-row items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <School size={14} color={isDark ? "#94a3b8" : "#64748b"} />
                        <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {item.universityName || t("university")}
                        </Text>
                    </View>
                    <View className={`flex-row items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <Calendar size={14} color={isDark ? "#94a3b8" : "#64748b"} />
                        <Text className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            {item.createAt ? new Date(item.createAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US') : "N/A"}
                        </Text>
                    </View>
                </View>

                {/* Footer / Actions */}
                <TouchableOpacity 
                    onPress={onPress}
                    className={`flex-row items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 ${isRtl ? 'flex-row-reverse' : ''}`}
                >
                    <Text className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{t("view_details")}</Text>
                    <View className={`bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-full ${isRtl ? 'rotate-180' : ''}`}>
                        <ChevronRight size={16} color={isDark ? "#818cf8" : "#4f46e5"} />
                    </View>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
}

import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { Calendar, ClipboardList, School, User, Hash } from 'lucide-react-native';
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
        if (status === undefined || status === null) return { bg: "bg-slate-100", text: "text-slate-600", dot: "#64748b" };
        
        let text = "";
        if (typeof status === 'number') {
            if (status === 0) text = "pending";
            else if (status === 1) text = "in progress";
            else if (status === 2) text = "completed";
            else if (status === 4) text = "underreview";
        } else {
            text = status.toLowerCase();
        }

        switch(text) {
            case "approved": 
                return { bg: isDark ? "bg-emerald-500/20" : "bg-emerald-50 border border-emerald-100", text: isDark ? "text-emerald-400" : "text-emerald-700", dot: "#10b981" };
            case "pending": 
                return { bg: isDark ? "bg-amber-500/20" : "bg-amber-50 border border-amber-100", text: isDark ? "text-amber-400" : "text-amber-700", dot: "#f59e0b" };
            case "in progress": 
            case "inprogress":
                return { bg: isDark ? "bg-blue-500/20" : "bg-blue-50 border border-blue-100", text: isDark ? "text-blue-400" : "text-blue-700", dot: "#3b82f6" };
            case "completed": 
                return { bg: isDark ? "bg-purple-500/20" : "bg-purple-50 border border-purple-100", text: isDark ? "text-purple-400" : "text-purple-700", dot: "#a855f7" };
            case "underreview":
            case "under review":
                return { bg: isDark ? "bg-cyan-500/20" : "bg-cyan-50 border border-cyan-100", text: isDark ? "text-cyan-400" : "text-cyan-700", dot: "#06b6d4" };
            default: 
                return { bg: isDark ? "bg-slate-800" : "bg-slate-50 border border-slate-100", text: isDark ? "text-slate-400" : "text-slate-500", dot: "#94a3b8" };
        }
    };

    const statusConfig = getStatusColors(item.processStatus || item.status);
    const diagnosis = item.diagnosisdto || (item.diagnoses && item.diagnoses.length > 0 ? item.diagnoses[0] : null) || item.diagnosisDto;
    // Follow swagger.json naming: caseTypeName or fallback to caseType (string) or caseType.name (object)
    const caseType = diagnosis?.caseTypeName || diagnosis?.caseType || item.caseType?.name || item.title || t("unknown_type");
    const patientName = item.patientFullName || item.patientName || t("patient");
    const initials = patientName.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase();

    return (
        <Animated.View entering={FadeInUp.delay(index * 100).springify()}>
            <TouchableOpacity 
                activeOpacity={0.85}
                onPress={onPress}
                className={`bg-white dark:bg-slate-900 rounded-[32px] p-6 mb-5 border shadow-xl ${isDark ? 'border-slate-800 shadow-black/50' : 'border-slate-100 shadow-indigo-900/5'}`}
            >
                {/* Status Bar */}
                <View className={`flex-row justify-between items-center mb-5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <View className={`px-4 py-1.5 rounded-full flex-row items-center gap-2 ${statusConfig.bg}`}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: statusConfig.dot }} />
                        <Text className={`text-[10px] font-black uppercase tracking-widest ${statusConfig.text}`}>
                            {getStatusText(item.processStatus || item.status)}
                        </Text>
                    </View>
                    <View className={`flex-row items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        {/* ID hidden as requested */}
                    </View>
                </View>

                {/* Main Info: Hero Section */}
                <View className={`flex-row items-center mb-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <View className={`w-14 h-14 rounded-[22px] items-center justify-center ${isDark ? 'bg-indigo-600/20' : 'bg-indigo-50 border border-indigo-100'} ${isRtl ? 'ml-4' : 'mr-4'}`}>
                        <Text className={`text-lg font-black ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{initials}</Text>
                    </View>
                    <View className={`flex-1 ${isRtl ? 'items-end' : 'items-start'}`}>
                        <Text className={`text-lg font-black tracking-tight leading-6 ${isDark ? 'text-white' : 'text-slate-900'}`} numberOfLines={1}>
                            {patientName}
                        </Text>
                        <View className={`flex-row items-center gap-2 mt-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <Text className={`text-xs font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{caseType}</Text>
                            {/* Description/Notes hidden as requested */}
                        </View>
                    </View>
                </View>

                {/* Metadata Grid */}
                <View className={`flex-row items-center p-4 rounded-[24px] ${isDark ? 'bg-slate-800/50' : 'bg-slate-50 border border-slate-100/50'} ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <View className={`flex-1 items-center ${isRtl ? 'border-l' : 'border-r'} border-slate-200/20 dark:border-slate-700`}>
                        <Text className={`text-[9px] font-black uppercase tracking-tight mb-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {isRtl ? "الجامعة" : "University"}
                        </Text>
                        <View className={`flex-row items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <School size={12} color={isDark ? "#818cf8" : "#4f46e5"} />
                            <Text className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`} numberOfLines={1}>
                                {item.universityName || "__"}
                            </Text>
                        </View>
                    </View>
                    <View className="flex-1 items-center">
                        <Text className={`text-[9px] font-black uppercase tracking-tight mb-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {isRtl ? "تاريخ الحالة" : "Case Date"}
                        </Text>
                        <View className={`flex-row items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <Calendar size={12} color={isDark ? "#60a5fa" : "#2563eb"} />
                            <Text className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                {item.createAt ? new Date(item.createAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

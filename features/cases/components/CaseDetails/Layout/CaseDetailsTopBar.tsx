import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { getPatientStatusConfig } from '../../../utils/CaseDetails.utils';

interface CaseDetailsTopBarProps {
    currentStatus: string;
    patientName: string;
}

export default function CaseDetailsTopBar({ currentStatus, patientName }: CaseDetailsTopBarProps) {
    const router = useRouter();
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';
    const cfg = getPatientStatusConfig(currentStatus);

    return (
        <View className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-5 mt-4">
            <View className="flex-row items-center gap-3">
                <TouchableOpacity
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                    className={`w-10 h-10 rounded-xl border shadow-sm items-center justify-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                >
                    <ArrowLeft size={17} color={isDark ? '#94a3b8' : '#475569'} />
                </TouchableOpacity>
                <View>
                    <Text className={`text-lg sm:text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {patientName}'s Case Details
                    </Text>
                    <Text className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Case lifecycle view
                    </Text>
                </View>
            </View>

            {/* Status Badge */}
            <View className={`self-start sm:self-auto flex-row items-center gap-2 px-4 py-2 rounded-xl border shadow-sm ${cfg.bg} ${isDark ? 'border-slate-700' : cfg.border}`}>
                <View className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                <Text className={`text-[11px] font-bold tracking-wide uppercase ${cfg.text}`}>
                    {cfg.label}
                </Text>
            </View>
        </View>
    );
}

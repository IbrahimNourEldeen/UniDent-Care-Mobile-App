import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { getPatientStatusConfig } from '../../../utils/CaseDetails.utils';
import { useTranslation } from 'react-i18next';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

interface CaseDetailsTopBarProps {
    currentStatus: string;
    patientName: string;
    onStatusPress?: () => void;
}

export default function CaseDetailsTopBar({ currentStatus, patientName, onStatusPress }: CaseDetailsTopBarProps) {
    const { language } = useThemeLanguage();
    const isRtl = language === 'ar';
    const { t } = useTranslation();
    const router = useRouter();
    const cfg = getPatientStatusConfig(currentStatus);

    return (
        <View className={`flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4 ${isRtl ? 'sm:flex-row-reverse' : ''}`}>
            <View className={`flex-row items-center justify-between w-full ${isRtl ? 'flex-row-reverse' : ''}`}>
                <View className={`flex-row items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center"
                        accessibilityLabel={t('go_back')}
                    >
                        {isRtl ? <ChevronRight size={17} color="#475569" /> : <ArrowLeft size={17} color="#475569" />}
                    </TouchableOpacity>
                    <View className={isRtl ? 'items-end' : 'items-start'}>
                        <Text className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white tracking-tight">
                            {t('patient_case_details', { name: patientName })}
                        </Text>
                        <Text className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            {t('case_lifecycle_view')}
                        </Text>
                    </View>
                </View>

                {/* Status Badge */}
                <TouchableOpacity 
                    activeOpacity={onStatusPress ? 0.7 : 1}
                    onPress={onStatusPress}
                    className={`flex-row items-center gap-2 px-3 py-1.5 rounded-xl border shadow-sm ${cfg.bg} ${cfg.border} ${isRtl ? 'flex-row-reverse' : ''}`}
                >
                    <View className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
                    <Text className={`text-[10px] font-bold tracking-wide uppercase ${cfg.text}`}>
                        {t(`status_${cfg.label.toLowerCase().replace(/\s/g, '')}`)}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

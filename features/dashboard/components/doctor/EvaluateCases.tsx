import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Stethoscope, Clock, ChevronRight, Activity } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { useRouter } from 'expo-router';
import { PatientCaseDto } from '../../services/doctorDashboardService';

interface EvaluateCasesProps {
  cases: PatientCaseDto[];
  loading: boolean;
  isDark: boolean;
}

export const EvaluateCases: React.FC<EvaluateCasesProps> = ({ cases, loading, isDark }) => {
  const { t } = useTranslation();
  const { language } = useThemeLanguage();
  const isRtl = language === 'ar';
  const router = useRouter();

  if (loading) {
    return (
      <View className="mb-8">
        <Text className={`text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest px-1 mb-4 ${isRtl ? 'text-right' : ''}`}>
          {t('needs_evaluate')}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4 }}>
          {Array.from({ length: 2 }).map((_, i) => (
            <View
              key={i}
              className="w-64 h-32 bg-slate-200/50 dark:bg-slate-900/50 rounded-3xl mr-4 animate-pulse border border-dashed border-slate-200 dark:border-slate-800"
            />
          ))}
        </ScrollView>
      </View>
    );
  }

  if (!cases || cases.length === 0) {
    return null; // Hide the section entirely if there are no cases needing evaluation
  }

  return (
    <View className="mb-8">
      <View className={`flex-row items-center justify-between px-1 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <View className={`flex-row items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <Text className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
            {t('needs_evaluate')}
          </Text>
          <View className="bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-full">
            <Text className="text-[10px] font-black text-purple-600 dark:text-purple-400">
              {cases.length}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 8 }}>
        {cases.map((c) => (
          <TouchableOpacity
            key={c.id}
            activeOpacity={0.8}
            onPress={() => router.push(`/(screens)/case-detail/${c.id}` as any)}
            className={`w-72 bg-white dark:bg-slate-900 rounded-3xl p-5 ${isRtl ? 'ml-4' : 'mr-4'} border border-purple-100 dark:border-purple-900/30 shadow-sm shadow-purple-100 dark:shadow-none`}
          >
            <View className={`flex-row justify-between items-start mb-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <View className={`flex-row items-center gap-2 flex-1 ${isRtl ? 'pl-2' : 'pr-2'} ${isRtl ? 'flex-row-reverse' : ''}`}>
                <View className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/40 items-center justify-center">
                  <Activity size={14} color={isDark ? '#c084fc' : '#9333ea'} />
                </View>
                <View className="flex-1">
                  <Text className={`font-bold text-slate-900 dark:text-white text-sm ${isRtl ? 'text-right' : ''}`} numberOfLines={1}>
                    {c.caseType?.name || c.diagnosisdto?.caseType || t('unknown_type')}
                  </Text>
                </View>
              </View>
              <View className={`flex-row items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full ${isRtl ? 'flex-row-reverse' : ''}`}>
                <Clock size={10} color={isDark ? '#fbbf24' : '#d97706'} />
                <Text className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                  {t('status_under_review')}
                </Text>
              </View>
            </View>

            <View className={`space-y-1.5 mb-4 ${isRtl ? 'items-end' : ''}`}>
              <Text className={`text-xs font-medium text-slate-500 dark:text-slate-400 ${isRtl ? 'text-right' : ''}`} numberOfLines={1}>
                <Text className="font-bold text-slate-700 dark:text-slate-300">{t('patient')}: </Text>{c.patientName}
              </Text>
              <Text className={`text-xs font-medium text-slate-500 dark:text-slate-400 ${isRtl ? 'text-right' : ''}`} numberOfLines={1}>
                <Text className="font-bold text-slate-700 dark:text-slate-300">{t('student')}: </Text>{c.assignedStudentId ? t('assigned') : t('unknown')}
              </Text>
            </View>

            <View className={`flex-row items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <Text className="text-xs font-bold text-purple-600 dark:text-purple-400">
                {t('review_case')}
              </Text>
              <View className={isRtl ? 'rotate-180' : ''}>
                <ChevronRight size={14} color={isDark ? '#c084fc' : '#9333ea'} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

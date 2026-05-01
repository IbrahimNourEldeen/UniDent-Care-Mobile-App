import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { PieChart as PieIcon, Activity } from 'lucide-react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { DashboardCharts as IDashboardCharts } from '../../services/patientDashboardAnalytics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

interface DashboardChartsProps {
  charts: IDashboardCharts;
}

export default function DashboardCharts({ charts }: DashboardChartsProps) {
  const { theme, language } = useThemeLanguage();
  const isDark = theme === "dark";
  const isRtl = language === "ar";
  const { t } = useTranslation();

  const totalCases = charts.casesDistribution.active + charts.casesDistribution.completed || 1;
  const activeCasesPerc = Math.round((charts.casesDistribution.active / totalCases) * 100);

  const totalSessions = charts.sessionsStatus.completed + charts.sessionsStatus.pending || 1;
  const completedSessionsPerc = Math.round((charts.sessionsStatus.completed / totalSessions) * 100);

  const casesData = [
    { value: charts.casesDistribution.active, color: '#6366f1', gradientCenterColor: '#818cf8' },
    { value: charts.casesDistribution.completed, color: isDark ? '#1e293b' : '#f1f5f9' },
  ];

  const sessionsData = [
    { value: charts.sessionsStatus.completed, color: '#10b981', gradientCenterColor: '#34d399' },
    { value: charts.sessionsStatus.pending, color: isDark ? '#1e293b' : '#f1f5f9' },
  ];

  return (
    <View className="space-y-4 mb-6">
      {/* Cases Distribution Card */}
      <Animated.View 
        entering={FadeInDown.delay(100).duration(500)}
        className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm"
      >
        <View className={`flex-row items-center gap-3 mb-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <View className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
            <PieIcon size={20} color="#6366f1" />
          </View>
          <Text className="text-lg font-black text-slate-800 dark:text-white">{t("cases_distribution")}</Text>
        </View>

        <View className={`flex-row items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
          <View className="relative items-center justify-center">
            <PieChart
              data={casesData}
              donut
              showGradient
              sectionAutoFocus
              radius={60}
              innerRadius={45}
              innerCircleColor={isDark ? '#0f172a' : '#ffffff'}
            />
            <View className="absolute items-center justify-center">
              <Text className="text-xl font-black text-slate-800 dark:text-white">{activeCasesPerc}%</Text>
              <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{t("active_label")}</Text>
            </View>
          </View>

          <View className={`flex-1 ${isRtl ? 'mr-8 items-end' : 'ml-8 items-start'} space-y-4`}>
            <View className={`flex-row justify-between items-center w-full ${isRtl ? 'flex-row-reverse' : ''}`}>
              <View className={`flex-row items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <View className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <Text className="text-sm font-bold text-slate-600 dark:text-slate-300">{t("active_label")}</Text>
              </View>
              <Text className="font-black text-slate-800 dark:text-white">{charts.casesDistribution.active}</Text>
            </View>
            <View className={`flex-row justify-between items-center w-full ${isRtl ? 'flex-row-reverse' : ''}`}>
              <View className={`flex-row items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <View className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                <Text className="text-sm font-bold text-slate-600 dark:text-slate-300">{t("completed_label")}</Text>
              </View>
              <Text className="font-black text-slate-800 dark:text-white">{charts.casesDistribution.completed}</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Sessions Status Card */}
      <Animated.View 
        entering={FadeInDown.delay(200).duration(500)}
        className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm"
      >
        <View className={`flex-row items-center gap-3 mb-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <View className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl">
            <Activity size={20} color="#10b981" />
          </View>
          <Text className="text-lg font-black text-slate-800 dark:text-white">{t("sessions_status_title")}</Text>
        </View>

        <View className={`flex-row items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
          <View className="relative items-center justify-center">
            <PieChart
              data={sessionsData}
              donut
              showGradient
              sectionAutoFocus
              radius={60}
              innerRadius={45}
              innerCircleColor={isDark ? '#0f172a' : '#ffffff'}
            />
            <View className="absolute items-center justify-center">
              <Text className="text-xl font-black text-slate-800 dark:text-white">{completedSessionsPerc}%</Text>
              <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{t("done_label")}</Text>
            </View>
          </View>

          <View className={`flex-1 ${isRtl ? 'mr-8 items-end' : 'ml-8 items-start'} space-y-4`}>
            <View className={`flex-row justify-between items-center w-full ${isRtl ? 'flex-row-reverse' : ''}`}>
              <View className={`flex-row items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <View className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <Text className="text-sm font-bold text-slate-600 dark:text-slate-300">{t("completed_label")}</Text>
              </View>
              <Text className="font-black text-slate-800 dark:text-white">{charts.sessionsStatus.completed}</Text>
            </View>
            <View className={`flex-row justify-between items-center w-full ${isRtl ? 'flex-row-reverse' : ''}`}>
              <View className={`flex-row items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <View className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                <Text className="text-sm font-bold text-slate-600 dark:text-slate-300">{t("pending_label")}</Text>
              </View>
              <Text className="font-black text-slate-800 dark:text-white">{charts.sessionsStatus.pending}</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

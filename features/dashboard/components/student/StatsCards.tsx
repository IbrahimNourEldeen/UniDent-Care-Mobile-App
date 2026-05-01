import { useStudentStats } from '@/features/dashboard/hooks/useStudentStats';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import {
    Briefcase,
    Clock,
    Percent
} from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

interface StatItemProps {
  label: string;
  value: string | number;
  IconComp: React.ElementType;
  iconColor: string;
  iconBg: string;
  loading: boolean;
  progress?: number;
  isRtl: boolean;
}

function StatItem({ label, value, IconComp, iconColor, iconBg, loading, progress, isRtl }: StatItemProps) {
  const { theme } = useThemeLanguage();
  const isDark = theme === 'dark';

  if (loading) {
    return (
      <View className={`flex-1 rounded-[22px] p-4 border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm`}>
        <View className="w-10 h-10 rounded-xl mb-3 items-center justify-center bg-slate-100 dark:bg-slate-800">
            <ActivityIndicator size="small" color={isDark ? '#cbd5e1' : '#94a3b8'} />
        </View>
        <View className="h-6 w-16 rounded bg-slate-200 dark:bg-slate-800 mb-2" />
        <View className="h-3 w-24 rounded bg-slate-100 dark:bg-slate-800/60" />
      </View>
    );
  }

  return (
    <View className={`flex-1 rounded-[22px] p-4 border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm ${isRtl ? 'items-end' : 'items-start'}`}>
      <View className="w-10 h-10 rounded-xl items-center justify-center mb-3" style={{ backgroundColor: iconBg }}>
        <IconComp size={20} color={iconColor} />
      </View>
      <Text className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</Text>
      <Text className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`} numberOfLines={1}>
        {label}
      </Text>
      {progress !== undefined && (
        <View className={`h-1.5 w-full rounded-full mt-3 overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <View style={{ width: `${progress}%`, backgroundColor: iconColor }} className="h-full rounded-full" />
        </View>
      )}
    </View>
  );
}

export default function StatsCards() {
  const { stats, loading, requestApprovalRate } = useStudentStats();
  const { theme, language } = useThemeLanguage();
  const isDark = theme === 'dark';
  const isRtl = language === 'ar';

  const statItems = [
    {
      label: isRtl ? "إجمالي الحالات" : "Total Cases",
      value: stats.totalCases,
      IconComp: Briefcase,
      iconColor: isDark ? '#60a5fa' : '#2563eb', // blue-400 : blue-600
      iconBg: isDark ? 'rgba(30,58,138,0.2)' : '#eff6ff', // blue-900/20 : blue-50
    },
    {
      label: isRtl ? "طلبات معلقة" : "Pending Requests",
      value: stats.pendingRequests,
      IconComp: Clock,
      iconColor: isDark ? '#fbbf24' : '#d97706', // amber-400 : amber-600
      iconBg: isDark ? 'rgba(120,53,15,0.2)' : '#fffbeb', // amber-900/20 : amber-50
    },
    {
      label: isRtl ? "معدل القبول" : "Acceptance Rate",
      value: `${requestApprovalRate}%`,
      IconComp: Percent,
      iconColor: isDark ? '#818cf8' : '#4f46e5', // indigo-400 : indigo-600
      iconBg: isDark ? 'rgba(49,46,129,0.2)' : '#e0e7ff', // indigo-900/20 : indigo-100
      progress: requestApprovalRate,
    },
  ];

  return (
    <View className={`flex-row flex-wrap gap-3 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
      {statItems.map((item, index) => (
        <View key={index} className={index === 2 ? "w-full" : "flex-1"} style={{ minWidth: index === 2 ? '100%' : '45%' }}>
          <StatItem loading={loading} isRtl={isRtl} {...item} />
        </View>
      ))}
    </View>
  );
}

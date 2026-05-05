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
      <View className={`flex-1 min-h-[110px] rounded-3xl p-4 border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm shadow-slate-200/50 dark:shadow-none`}>
        <View className="w-10 h-10 rounded-2xl mb-3 items-center justify-center bg-slate-100 dark:bg-slate-800">
            <ActivityIndicator size="small" color={isDark ? '#cbd5e1' : '#94a3b8'} />
        </View>
        <View className="h-6 w-12 rounded bg-slate-200 dark:bg-slate-800 mb-2" />
        <View className="h-3 w-20 rounded bg-slate-100 dark:bg-slate-800/60" />
      </View>
    );
  }

  return (
    <View className={`flex-1 min-h-[110px] rounded-3xl p-4 border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm shadow-slate-200/50 dark:shadow-none ${isRtl ? 'items-end' : 'items-start'}`}>
      <View className="w-10 h-10 rounded-2xl items-center justify-center mb-3" style={{ backgroundColor: iconBg }}>
        <IconComp size={20} color={iconColor} strokeWidth={2.5} />
      </View>
      <Text className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</Text>
      <Text className={`text-[10px] font-black mt-1 uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`} numberOfLines={1}>
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
      iconColor: isDark ? '#60a5fa' : '#2563eb', 
      iconBg: isDark ? 'rgba(30,58,138,0.2)' : '#eff6ff', 
    },
    {
      label: isRtl ? "طلبات معلقة" : "Pending Requests",
      value: stats.pendingRequests,
      IconComp: Clock,
      iconColor: isDark ? '#fbbf24' : '#d97706', 
      iconBg: isDark ? 'rgba(120,53,15,0.2)' : '#fffbeb', 
    },
    {
      label: isRtl ? "معدل القبول" : "Acceptance Rate",
      value: `${requestApprovalRate}%`,
      IconComp: Percent,
      iconColor: isDark ? '#818cf8' : '#4f46e5', 
      iconBg: isDark ? 'rgba(49,46,129,0.2)' : '#e0e7ff', 
      progress: requestApprovalRate,
    },
  ];

  // Logic to split items into rows of 2 for first row, and 1 for subsequent
  const firstRow = statItems.slice(0, 2);
  const remaining = statItems.slice(2);

  return (
    <View className="mb-2">
      {/* First Row: 2 Cards */}
      <View className={`flex-row gap-3 mb-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
        {firstRow.map((item, index) => (
          <StatItem key={index} loading={loading} isRtl={isRtl} {...item} />
        ))}
      </View>
      
      {/* Remaining: Full Width Cards */}
      {remaining.map((item, index) => (
        <View key={index} className="flex-row">
          <StatItem loading={loading} isRtl={isRtl} {...item} />
        </View>
      ))}
    </View>
  );
}

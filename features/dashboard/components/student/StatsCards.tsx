import React from 'react';
import { View } from 'react-native';
import { FileText, Clock, CheckCircle2, Calendar, Briefcase } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StatCard } from '@/components/common/StatCard';
import { useStudentStats } from '@/features/dashboard/hooks/useStudentStats';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

export default function StatsCards() {
  const { t } = useTranslation();
  const { theme } = useThemeLanguage();
  const isDark = theme === "dark";
  
  const { stats, loading, sessionProgress, requestApprovalRate } = useStudentStats();

  // Adding robust fallback since i18n keys might be missing
  const statItems = [
    {
      label: t('totalRequests', 'Total Requests'),
      value: stats.totalRequests,
      icon: FileText,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/40",
      iconColor: isDark ? "#60a5fa" : "#2563eb",
      progress: requestApprovalRate,
    },
    {
      label: t('pendingRequests', 'Pending Requests'),
      value: stats.pendingRequests,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-900/40",
      iconColor: isDark ? "#fbbf24" : "#d97706",
    },
    {
      label: t('approvedRequests', 'Approved Requests'),
      value: stats.approvedRequests,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/40",
      iconColor: isDark ? "#34d399" : "#059669",
    },
    {
      label: t('totalSessions', 'Total Sessions'),
      value: `${stats.completedSessions}/${stats.totalSessions}`,
      icon: Calendar,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/40",
      iconColor: isDark ? "#c084fc" : "#9333ea",
      progress: sessionProgress,
    },
    {
      label: t('totalCases', 'Total Cases'),
      value: stats.totalCases,
      icon: Briefcase,
      color: "text-cyan-600 dark:text-cyan-400",
      bgColor: "bg-cyan-50 dark:bg-cyan-900/40",
      iconColor: isDark ? "#22d3ee" : "#0891b2",
    },
  ];

  return (
    <View className="flex-col pb-4">
      {statItems.map((item, index) => (
        <StatCard
          key={index}
          label={item.label}
          value={item.value}
          icon={item.icon}
          color={item.color}
          bgColor={item.bgColor}
          iconColor={item.iconColor}
          loading={loading}
          progress={item.progress}
        />
      ))}
    </View>
  );
}

import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, History, Info, PlusCircle } from 'lucide-react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { ActivityItem } from '../../hooks/useStudentStats';

interface RecentActivityProps {
  activities: ActivityItem[];
  loading: boolean;
}

export default function RecentActivity({ activities, loading }: RecentActivityProps) {
  const { t } = useTranslation();
  const { theme } = useThemeLanguage();
  const isDark = theme === "dark";

  if (loading) {
    return (
      <View className="mb-6">
        <View className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
        <View className="h-32 bg-slate-100 dark:bg-slate-900 rounded-2xl" />
      </View>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'case_approved':
        return <CheckCircle2 size={16} color={isDark ? "#4ade80" : "#16a34a"} />;
      case 'session_completed':
        return <Info size={16} color={isDark ? "#60a5fa" : "#2563eb"} />;
      case 'new_request':
        return <PlusCircle size={16} color={isDark ? "#fbbf24" : "#d97706"} />;
      default:
        return <Info size={16} color={isDark ? "#cbd5e1" : "#475569"} />;
    }
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diff = now.getTime() - then.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return then.toLocaleDateString();
  };

  return (
    <View className="mb-10">
      <View className="flex-row items-center mb-5 gap-3 px-1">
        <View className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <History size={20} color={isDark ? "#818cf8" : "#4f46e5"} />
        </View>
        <Text className="text-xl font-black text-slate-800 dark:text-white">
          {t('recent_activity')}
        </Text>
      </View>

      <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <View 
              key={activity.id} 
              className={`flex-row items-start mb-5 pb-5 ${index !== activities.length - 1 ? 'border-b border-slate-50 dark:border-slate-800/50' : ''}`}
            >
              <View className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 items-center justify-center mr-4 mt-1">
                {getIcon(activity.type)}
              </View>
              <View className="flex-1">
                <Text className="text-slate-900 dark:text-white font-bold text-sm mb-1 leading-5">
                  {activity.title}
                </Text>
                <Text className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  {getRelativeTime(activity.timestamp)}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text className="text-center text-slate-400 dark:text-slate-500 py-4 italic">
            No recent history
          </Text>
        )}
      </View>
    </View>
  );
}

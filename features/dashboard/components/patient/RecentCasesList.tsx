import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { History, ClipboardList, Activity, ClipboardPen, ChevronRight } from 'lucide-react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { RecentActivityWidget } from '../../services/patientDashboardAnalytics';
import { useTranslation } from 'react-i18next';

interface RecentCasesListProps {
  activities: RecentActivityWidget[];
  loading?: boolean;
}

export default function RecentCasesList({ activities, loading }: RecentCasesListProps) {
  const { theme, language } = useThemeLanguage();
  const isDark = theme === "dark";
  const isRtl = language === "ar";
  const { t } = useTranslation();

  const getIconForType = (type: string) => {
    switch (type) {
      case 'case':
        return <ClipboardList size={18} color="#6366f1" />;
      case 'session':
        return <Activity size={18} color="#10b981" />;
      case 'diagnosis':
        return <ClipboardPen size={18} color="#f59e0b" />;
      default:
        return <ClipboardList size={18} color="#94a3b8" />;
    }
  };

  const getBgForType = (type: string) => {
    switch (type) {
      case 'case':
        return 'bg-indigo-50 dark:bg-indigo-900/30';
      case 'session':
        return 'bg-emerald-50 dark:bg-emerald-900/30';
      case 'diagnosis':
        return 'bg-amber-50 dark:bg-amber-900/30';
      default:
        return 'bg-slate-50 dark:bg-slate-800';
    }
  };

  return (
    <View className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm mb-6">
      <View className={`flex-row items-center justify-between mb-8 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <View className={`flex-row items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <View className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
            <History size={24} color="#6366f1" />
          </View>
          <View className={isRtl ? 'items-end' : ''}>
            <Text className="text-xl font-black text-slate-800 dark:text-white">{t("recent_activity")}</Text>
            <Text className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{t("activity_desc")}</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View className="py-10 items-center">
          <Text className="text-slate-400 dark:text-slate-500 font-medium">{t("loading_activity")}</Text>
        </View>
      ) : activities.length > 0 ? (
        <View className={`${isRtl ? 'mr-4 pr-6 border-r-2' : 'ml-4 pl-6 border-l-2'} border-slate-100 dark:border-slate-800 space-y-8`}>
          {activities.slice(0, 5).map((activity, index) => (
            <Animated.View 
              key={activity.id || index} 
              entering={FadeInUp.delay(index * 100).springify()}
              className="relative"
            >
              {/* Dot Icon */}
              <View 
                className={`absolute ${isRtl ? '-right-[45px]' : '-left-[45px]'} top-0 w-10 h-10 rounded-full ${getBgForType(activity.type)} items-center justify-center border-4 border-white dark:border-slate-900 shadow-sm`}
              >
                {getIconForType(activity.type)}
              </View>

              <View className={`bg-slate-50/50 dark:bg-slate-800/40 p-4 rounded-3xl border border-slate-100 dark:border-slate-700/50 ${isRtl ? 'items-end' : ''}`}>
                <Text className={`font-bold text-slate-800 dark:text-slate-200 text-sm ${isRtl ? 'text-right' : ''}`}>
                  {activity.description}
                </Text>
                <Text className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
                  {new Date(activity.date).toLocaleString(isRtl ? 'ar-EG' : 'en-US', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>
      ) : (
        <View className="items-center py-10">
          <View className="bg-slate-50 dark:bg-slate-800 p-6 rounded-full mb-4">
            <ClipboardList size={40} color={isDark ? "#334155" : "#cbd5e1"} />
          </View>
          <Text className="text-slate-500 dark:text-slate-400 font-bold">{t("no_activity")}</Text>
        </View>
      )}

      {activities.length > 5 && (
        <TouchableOpacity className="mt-6 py-3 items-center bg-slate-50 dark:bg-slate-800 rounded-2xl">
          <Text className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{t("load_more")}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

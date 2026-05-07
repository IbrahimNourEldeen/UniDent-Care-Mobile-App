import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { History, ClipboardList, Activity, ClipboardPen } from 'lucide-react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { RecentActivityWidget } from '../../services/patientDashboardAnalytics';

interface RecentCasesListProps {
  activities: RecentActivityWidget[];
  loading?: boolean;
}

export default function RecentCasesList({ activities, loading }: RecentCasesListProps) {
  const { theme, language } = useThemeLanguage();
  const isDark = theme === "dark";
  const isRtl = language === "ar";
  const [limit, setLimit] = useState(5);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'case':
        return <ClipboardList size={20} color={isDark ? "#818cf8" : "#4f46e5"} />;
      case 'session':
        return <Activity size={20} color={isDark ? "#34d399" : "#10b981"} />;
      case 'diagnosis':
        return <ClipboardPen size={20} color={isDark ? "#fbbf24" : "#f59e0b"} />;
      default:
        return <ClipboardList size={20} color="#94a3b8" />;
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
    <View className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
      {/* Header */}
      <View className={`p-6 border-b border-slate-50 dark:border-slate-800 flex-row items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
        <View className={`flex-row items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <View className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
            <History size={24} color="#6366f1" />
          </View>
          <View className={isRtl ? 'items-end' : ''}>
            <Text className="text-lg font-black text-slate-800 dark:text-white">
              {isRtl ? "سجل النشاطات" : "Recent Activity Timeline"}
            </Text>
            <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
              {isRtl ? "آخر التحديثات على حسابك" : "Latest updates on your account"}
            </Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View className="py-16 items-center">
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : activities.length > 0 ? (
        <View className="p-6">
          <View className={`${isRtl ? 'mr-4 pr-6 border-r-2' : 'ml-4 pl-6 border-l-2'} border-slate-100 dark:border-slate-800 space-y-6`}>
            {activities.slice(0, limit).map((activity, index) => (
              <Animated.View 
                key={activity.id || index} 
                entering={FadeInUp.delay(index * 100).springify()}
                className="relative"
              >
                {/* Timeline Node */}
                <View 
                  className={`absolute ${isRtl ? '-right-[45px]' : '-left-[45px]'} top-0 w-10 h-10 rounded-full ${getBgForType(activity.type)} items-center justify-center border-4 border-white dark:border-slate-900 shadow-sm`}
                >
                  {getIconForType(activity.type)}
                </View>

                <View className={`bg-slate-50/50 dark:bg-slate-800/40 p-5 rounded-3xl border border-slate-100 dark:border-slate-700/50 ${isRtl ? 'items-end' : ''}`}>
                  <Text className={`font-bold text-slate-800 dark:text-slate-200 text-[14px] leading-5 ${isRtl ? 'text-right' : ''}`}>
                    {activity.description}
                  </Text>
                  <Text className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
                    {new Date(activity.date).toLocaleString(isRtl ? 'ar-EG' : 'en-US', {
                      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </Text>
                </View>
              </Animated.View>
            ))}
          </View>
        </View>
      ) : (
        <View className="items-center py-16">
          <View className="bg-slate-50 dark:bg-slate-800 p-6 rounded-full mb-4">
            <ClipboardList size={40} color={isDark ? "#334155" : "#cbd5e1"} />
          </View>
          <Text className="text-slate-500 dark:text-slate-400 font-bold">
            {isRtl ? "لا توجد نشاطات مؤخراً" : "No recent activity found"}
          </Text>
        </View>
      )}

      {activities.length > limit && (
        <TouchableOpacity 
          onPress={() => setLimit(prev => prev + 5)}
          className="py-4 items-center bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-50 dark:border-slate-800"
        >
          <Text className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            {isRtl ? "عرض المزيد" : "Load More"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { CalendarDays, Clock, User, ChevronRight, SearchX } from 'lucide-react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { UpcomingSessionWidget } from '../../services/patientDashboardAnalytics';
import { useTranslation } from 'react-i18next';

interface UpcomingAppointmentsListProps {
  sessions: UpcomingSessionWidget[];
  loading?: boolean;
}

export default function UpcomingAppointmentsList({ sessions, loading }: UpcomingAppointmentsListProps) {
  const { theme, language } = useThemeLanguage();
  const isDark = theme === "dark";
  const isRtl = language === "ar";
  const { t } = useTranslation();

  const formatDate = (dateString: string) => {
    if (!dateString) return { day: "", time: "" };
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { day: "numeric", month: "short", year: "numeric" }),
      time: date.toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US', { hour: "2-digit", minute: "2-digit" }),
    };
  };

  return (
    <View className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm mb-6">
      <View className={`flex-row justify-between items-center mb-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <View className={isRtl ? 'items-end' : 'items-start'}>
          <View className={`flex-row items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <View className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-2xl">
              <CalendarDays size={20} color="#3b82f6" />
            </View>
            <Text className="text-xl font-black text-slate-800 dark:text-white">{t("upcoming_sessions")}</Text>
          </View>
          <Text className={`text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 ${isRtl ? 'mr-1' : 'ml-1'}`}>
            {t("upcoming_desc")}
          </Text>
        </View>
        <TouchableOpacity className="bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-700">
          <Text className="text-xs font-bold text-slate-600 dark:text-slate-300">{t("view_all")}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="py-10 items-center">
          <Text className="text-slate-400 dark:text-slate-500 font-medium">{t("loading_appointments")}</Text>
        </View>
      ) : sessions.length > 0 ? (
        <View className="space-y-4">
          {sessions.slice(0, 3).map((s, index) => {
            const { day, time } = formatDate(s.date);
            return (
              <Animated.View 
                key={s.id || index} 
                entering={FadeInRight.delay(index * 100).springify()}
              >
                <TouchableOpacity className={`flex-row items-center p-4 bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 rounded-3xl relative overflow-hidden ${isRtl ? 'flex-row-reverse' : ''}`}>
                  {/* Accent Line */}
                  <View className={`absolute top-2 bottom-2 w-1 bg-blue-500 rounded-full ${isRtl ? 'right-0' : 'left-0'}`} />
                  
                  <View className={`w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 items-center justify-center ${isRtl ? 'ml-4' : 'mr-4'}`}>
                    <User size={24} color="#3b82f6" />
                  </View>
 
                  <View className={`flex-1 ${isRtl ? 'items-end' : ''}`}>
                    <Text className="font-black text-slate-800 dark:text-white text-sm" numberOfLines={1}>
                      {s.doctorName}
                    </Text>
                    <View className={`flex-row items-center mt-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <Clock size={12} color="#94a3b8" />
                      <Text className={`text-[10px] font-bold text-slate-500 dark:text-slate-400 ${isRtl ? 'mr-1' : 'ml-1'}`}>
                        {day} • {time}
                      </Text>
                    </View>
                  </View>

                  <View className={`items-end gap-2 ${isRtl ? 'items-start' : ''}`}>
                    <View className="px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800/50">
                      <Text className="text-[8px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-tighter">
                        {s.status}
                      </Text>
                    </View>
                    <View className={isRtl ? 'rotate-180' : ''}>
                      <ChevronRight size={16} color={isDark ? "#475569" : "#cbd5e1"} />
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      ) : (
        <View className="items-center py-10">
          <View className="bg-slate-50 dark:bg-slate-800 p-6 rounded-full mb-4">
            <SearchX size={40} color={isDark ? "#334155" : "#cbd5e1"} />
          </View>
          <Text className="text-slate-800 dark:text-slate-200 font-bold text-base">{t("no_sessions")}</Text>
          <Text className="text-slate-400 dark:text-slate-500 text-xs text-center mt-1 px-4">
            {t("no_sessions_desc")}
          </Text>
        </View>
      )}
    </View>
  );
}

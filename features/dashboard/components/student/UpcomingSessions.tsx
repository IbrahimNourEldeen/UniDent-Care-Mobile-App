import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { ChevronRight, Clock } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { UpcomingSession } from '../../hooks/useStudentStats';

interface UpcomingSessionsProps {
  sessions: UpcomingSession[];
  loading: boolean;
}

export default function UpcomingSessions({ sessions, loading }: UpcomingSessionsProps) {
  const { t } = useTranslation();
  const { theme } = useThemeLanguage();
  const isDark = theme === "dark";

  if (loading) {
    return (
      <View className="mb-6">
        <View className="h-6 w-40 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
        <View className="h-24 bg-slate-100 dark:bg-slate-900 rounded-2xl" />
      </View>
    );
  }

  if (sessions.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
      time: date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <View className="mb-8">
      <View className="flex-row justify-between items-center mb-4 px-1">
        <Text className="text-xl font-black text-slate-800 dark:text-white">
          {t('upcoming_sessions')}
        </Text>
        <TouchableOpacity>
          <Text className="text-blue-600 dark:text-indigo-400 font-bold text-sm">
            {t('view_all')}
          </Text>
        </TouchableOpacity>
      </View>

      {sessions.map((session) => {
        const { date, time } = formatDate(session.scheduledAt);
        return (
          <TouchableOpacity 
            key={session.id}
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl mb-3 flex-row items-center border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none"
          >
            <View className="bg-blue-50 dark:bg-blue-900/40 p-3 rounded-xl mr-4 items-center justify-center w-14">
              <Text className="text-blue-600 dark:text-blue-400 font-black text-xs text-center">
                {date.split(' ')[0]}
                {"\n"}
                {date.split(' ')[1]}
              </Text>
            </View>
            
            <View className="flex-1">
              <Text className="text-slate-900 dark:text-white font-bold text-base leading-5">
                {session.treatmentType}
              </Text>
              <View className="flex-row items-center mt-1">
                <Clock size={12} color={isDark ? "#94a3b8" : "#64748b"} />
                <Text className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                  {time} • Patient {session.patientInitials}
                </Text>
              </View>
            </View>
            
            <ChevronRight size={20} color={isDark ? "#334155" : "#cbd5e1"} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

interface WelcomeHeaderProps {
  userName: string;
  role: string;
  initials: string;
  isDark: boolean;
}

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ userName, role, initials, isDark }) => {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center justify-between mb-8">
      <View className="flex-1">
        <Text className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest mb-1.5">
          {t('welcome_back')}
        </Text>
        <Text className="text-2xl font-black text-slate-900 dark:text-white leading-none">
          {role === 'Doctor' ? t('doctor_prefix') : ''}
          {userName}
        </Text>
      </View>
      <LinearGradient
        colors={isDark ? ['#4f46e5', '#1e1b4b'] : ['#6366f1', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="w-14 h-14 rounded-full items-center justify-center border-4 border-white dark:border-slate-900 shadow-xl shadow-indigo-200 dark:shadow-none"
      >
        <Text className="text-white font-black text-base">{initials}</Text>
      </LinearGradient>
    </View>
  );
};

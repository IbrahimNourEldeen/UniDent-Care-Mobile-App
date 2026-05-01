import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Search, Calendar, QrCode, ClipboardPlus } from 'lucide-react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

export default function QuickActions() {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme } = useThemeLanguage();
  const isDark = theme === "dark";

  const actions = [
    {
      label: t('find_cases'),
      icon: Search,
      href: '/(screens)/student/cases-list',
      color: '#2563eb',
      bg: 'bg-blue-50 dark:bg-blue-900/30',
    },
    {
      label: t('my_schedule'),
      icon: Calendar,
      href: '/(screens)/student/my-cases', // Using my-cases as a placeholder for schedule
      color: '#7c3aed',
      bg: 'bg-purple-50 dark:bg-purple-900/30',
    }
  ];

  return (
    <View className="mb-8">
      <Text className="text-xl font-black text-slate-800 dark:text-white mb-4 px-1">
        {t('quick_actions')}
      </Text>
      
      <View className="flex-row flex-wrap justify-between">
        {actions.map((action, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => action.href && router.push(action.href as any)}
            className="w-[48%] bg-white dark:bg-slate-900 p-4 rounded-3xl mb-4 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none flex-row items-center"
          >
            <View className={`p-2 rounded-xl ${action.bg} mr-3`}>
              <action.icon size={20} color={action.color} />
            </View>
            <Text className="text-slate-800 dark:text-slate-200 font-bold text-xs flex-1" numberOfLines={1}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

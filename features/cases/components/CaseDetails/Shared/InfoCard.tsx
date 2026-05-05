import React from 'react';
import { View, Text } from 'react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

interface InfoCardProps {
    icon: any; // Lucide icon
    label: string;
    value: string;
    colorClass: string; // TailWind color class for the icon, e.g. 'text-indigo-500'
}

export default function InfoCard({ icon: Icon, label, value, colorClass }: InfoCardProps) {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';

    return (
        <View className={`flex-row items-center gap-2.5 rounded-xl px-3 py-2.5 border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50/70 border-slate-100/50'}`}>
            <View className={`w-8 h-8 rounded-lg items-center justify-center shadow-sm ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                <Icon size={16} className={colorClass} />
            </View>
            <View className="flex-1">
                <Text className={`text-[10px] font-medium uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {label}
                </Text>
                <Text className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`} numberOfLines={1}>
                    {value}
                </Text>
            </View>
        </View>
    );
}

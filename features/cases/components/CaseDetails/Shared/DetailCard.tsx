import React from 'react';
import { View, Text } from 'react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

interface DetailCardProps {
    label: string;
    value: string;
}

export default function DetailCard({ label, value }: DetailCardProps) {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';

    return (
        <View className={`rounded-xl px-4 py-3 border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50/70 border-slate-100/50'}`}>
            <Text className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {label}
            </Text>
            <Text className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {value}
            </Text>
        </View>
    );
}

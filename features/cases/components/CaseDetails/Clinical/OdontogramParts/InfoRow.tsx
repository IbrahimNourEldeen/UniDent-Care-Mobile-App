import React from 'react';
import { View, Text } from 'react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

interface InfoRowProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}

export default function InfoRow({ icon, label, value }: InfoRowProps) {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';

    return (
        <View className="flex-row items-start gap-2.5">
            <View className="mt-0.5">{icon}</View>
            <View className="flex-1">
                <Text className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {label}
                </Text>
                <Text className={`text-[13px] font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    {value}
                </Text>
            </View>
        </View>
    );
}

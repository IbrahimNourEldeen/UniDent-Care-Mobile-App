import React from 'react';
import { View, Text } from 'react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

interface PersonRowProps {
    icon: React.ReactNode;
    role: string;
    name?: string | null;
    prefix?: string;
    emptyLabel?: string;
}

export default function PersonRow({ icon, role, name, prefix = '', emptyLabel = 'Not assigned' }: PersonRowProps) {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';

    return (
        <View className="flex-row items-center gap-3">
            <View className={`w-8 h-8 rounded-xl items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                {icon}
            </View>
            <View className="flex-1">
                <Text className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {role}
                </Text>
                {name ? (
                    <Text className={`text-[13px] font-semibold mt-0.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                        {prefix ? `${prefix} ${name}` : name}
                    </Text>
                ) : (
                    <Text className={`text-[13px] italic mt-0.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                        {emptyLabel}
                    </Text>
                )}
            </View>
        </View>
    );
}

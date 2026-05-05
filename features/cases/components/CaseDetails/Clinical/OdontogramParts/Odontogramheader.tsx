import React from 'react';
import { View, Text } from 'react-native';
import { Stethoscope, Eye } from 'lucide-react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

interface OdontogramHeaderProps {
    readonly: boolean;
}

export default function OdontogramHeader({ readonly }: OdontogramHeaderProps) {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';

    return (
        <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
                <View className={`w-8 h-8 rounded-xl items-center justify-center ${isDark ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                    <Stethoscope size={15} color={isDark ? '#818cf8' : '#6366f1'} />
                </View>
                <View>
                    <Text className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        Dental Chart
                    </Text>
                    <Text className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        FDI Notation
                    </Text>
                </View>
            </View>

            {readonly && (
                <View className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <Eye size={11} color={isDark ? '#94a3b8' : '#64748b'} />
                    <Text className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        View Only
                    </Text>
                </View>
            )}
        </View>
    );
}

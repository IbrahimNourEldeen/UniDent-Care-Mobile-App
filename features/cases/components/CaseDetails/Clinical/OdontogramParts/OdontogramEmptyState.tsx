import React from 'react';
import { View, Text } from 'react-native';
import { Stethoscope } from 'lucide-react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

export default function OdontogramEmptyState() {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';

    return (
        <View className="items-center justify-center py-16 px-6 gap-4">
            <View className={`w-16 h-16 rounded-2xl items-center justify-center border ${isDark
                ? 'bg-indigo-900/30 border-indigo-800/40'
                : 'bg-indigo-50 border-indigo-100'}`}>
                <Stethoscope size={26} color={isDark ? '#6366f1' : '#818cf8'} />
            </View>
            <View className="items-center max-w-xs">
                <Text className={`text-sm font-bold text-center ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    No Diagnosis Recorded
                </Text>
                <Text className={`text-xs text-center mt-1.5 leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    No dental diagnosis has been submitted for this case yet. The chart will populate once a diagnosis plan is recorded.
                </Text>
            </View>
        </View>
    );
}

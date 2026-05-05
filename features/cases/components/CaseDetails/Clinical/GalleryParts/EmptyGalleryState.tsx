import React from 'react';
import { View, Text } from 'react-native';
import { ImageIcon } from 'lucide-react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

export default function EmptyGalleryState() {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';

    return (
        <View className={`w-full aspect-square rounded-2xl border flex-col items-center justify-center ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
            <View className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                <ImageIcon size={24} color={isDark ? '#475569' : '#cbd5e1'} />
            </View>
            <Text className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                No images uploaded
            </Text>
            <Text className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>
                Images will appear here
            </Text>
        </View>
    );
}

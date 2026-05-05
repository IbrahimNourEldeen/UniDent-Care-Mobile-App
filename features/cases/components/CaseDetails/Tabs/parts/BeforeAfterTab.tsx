import React from 'react';
import { View, Text, Image } from 'react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

interface BeforeAfterTabProps {
    beforeImageUrls?: string[];
    afterImageUrls?: string[];
    defaultImageUrls: string[];
}

export default function BeforeAfterTab({ beforeImageUrls, afterImageUrls, defaultImageUrls }: BeforeAfterTabProps) {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';

    const beforeImage = beforeImageUrls?.[0] || defaultImageUrls?.[0];
    const afterImage = afterImageUrls?.[0] || defaultImageUrls?.[0];

    return (
        <View className="space-y-4">
            <Text className={`text-base font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Before & After
            </Text>
            <View className="flex-col gap-5 sm:flex-row">
                <View className="space-y-2 flex-1">
                    <Text className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        Before
                    </Text>
                    <View className={`relative aspect-[4/3] rounded-2xl overflow-hidden border shadow-sm ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                        {beforeImage ? (
                            <Image source={{ uri: beforeImage }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                            <View className={`w-full h-full items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
                                <Text className="text-slate-400 text-xs">No image</Text>
                            </View>
                        )}
                        <View className="absolute bottom-2 left-2 bg-red-500/90 px-2.5 py-0.5 rounded-lg shadow-sm">
                            <Text className="text-white text-[10px] font-bold">Before</Text>
                        </View>
                    </View>
                </View>
                
                <View className="space-y-2 flex-1">
                    <Text className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        After
                    </Text>
                    <View className={`relative aspect-[4/3] rounded-2xl overflow-hidden border shadow-sm ${isDark ? 'border-emerald-800' : 'border-emerald-200'}`}>
                        {afterImage ? (
                            <Image source={{ uri: afterImage }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                            <View className={`w-full h-full items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
                                <Text className="text-slate-400 text-xs">No image</Text>
                            </View>
                        )}
                        <View className="absolute bottom-2 left-2 bg-emerald-500/90 px-2.5 py-0.5 rounded-lg shadow-sm">
                            <Text className="text-white text-[10px] font-bold">After</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

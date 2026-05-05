import React from 'react';
import { View } from 'react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

export default function CaseDetailsSkeleton() {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';

    const shimmer = isDark ? 'bg-slate-800' : 'bg-slate-100';
    const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';

    return (
        <View className="space-y-6 px-5 mt-4">
            {/* Hero skeleton */}
            <View className={`rounded-3xl border shadow-sm p-5 ${cardBg}`}>
                <View className="flex-row justify-between mb-5">
                    <View className={`h-7 w-24 rounded-full ${shimmer}`} />
                    <View className={`h-7 w-16 rounded-lg ${shimmer}`} />
                </View>
                
                <View className="flex-row items-center gap-4 mb-6">
                    <View className={`w-14 h-14 rounded-[22px] ${shimmer}`} />
                    <View className="flex-1 space-y-2">
                        <View className={`h-6 w-48 rounded-lg ${shimmer}`} />
                        <View className={`h-4 w-28 rounded-md ${shimmer}`} />
                    </View>
                </View>

                <View className={`h-px mb-6 ${isDark ? 'bg-slate-800/80' : 'bg-slate-100'}`} />

                {/* Info grid */}
                <View className="flex-row flex-wrap justify-between gap-y-3 mb-6">
                    {[1, 2, 3, 4].map(i => (
                        <View key={i} className={`w-[48%] h-16 rounded-xl ${shimmer}`} />
                    ))}
                </View>

                <View className={`h-px mb-6 ${isDark ? 'bg-slate-800/80' : 'bg-slate-100'}`} />

                {/* Progress bar mock */}
                <View className={`h-12 rounded-2xl ${shimmer}`} />
            </View>

            {/* Tabs skeleton */}
            <View className={`rounded-3xl border shadow-sm overflow-hidden ${cardBg}`}>
                <View className={`flex-row border-b px-2 py-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    {[1, 2, 3].map(i => (
                        <View key={i} className={`h-10 w-24 rounded-lg mx-1 ${shimmer}`} />
                    ))}
                </View>
                <View className="p-6 space-y-4">
                    <View className={`h-5 w-40 rounded-lg ${shimmer}`} />
                    <View className="space-y-3 mt-4">
                        <View className={`h-4 w-full rounded-md ${shimmer}`} />
                        <View className={`h-4 w-3/4 rounded-md ${shimmer}`} />
                        <View className={`h-4 w-1/2 rounded-md ${shimmer}`} />
                    </View>
                </View>
            </View>
        </View>
    );
}

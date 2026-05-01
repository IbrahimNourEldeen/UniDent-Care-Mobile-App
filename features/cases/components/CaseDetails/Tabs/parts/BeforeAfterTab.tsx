import React from 'react';
import { Image, Text, View } from 'react-native';

interface BeforeAfterTabProps {
    beforeImageUrls?: string[];
    afterImageUrls?: string[];
    defaultImageUrls?: string[];
}

export default function BeforeAfterTab({ beforeImageUrls, afterImageUrls, defaultImageUrls = [] }: BeforeAfterTabProps) {
    const beforeSrc = beforeImageUrls?.[0] || defaultImageUrls[0];
    const afterSrc = afterImageUrls?.[0] || defaultImageUrls[0];

    return (
        <View className="space-y-4">
            <Text className="text-base font-semibold text-slate-800 dark:text-white mb-4">Before & After</Text>
            
            <View className="flex-col sm:flex-row gap-5">
                {/* Before Image */}
                <View className="space-y-2 flex-1">
                    <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Before</Text>
                    <View className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-800">
                        {beforeSrc ? (
                            <Image source={{ uri: beforeSrc }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                            <View className="w-full h-full items-center justify-center">
                                <Text className="text-slate-400 text-xs">No image</Text>
                            </View>
                        )}
                        <View className="absolute bottom-2 left-2 bg-red-500/90 px-2.5 py-0.5 rounded-lg shadow-sm">
                            <Text className="text-white text-[10px] font-bold">Before</Text>
                        </View>
                    </View>
                </View>

                {/* After Image */}
                <View className="space-y-2 flex-1 mt-4 sm:mt-0">
                    <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">After</Text>
                    <View className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-emerald-200 dark:border-emerald-800 shadow-sm bg-slate-100 dark:bg-slate-800">
                        {afterSrc ? (
                            <Image source={{ uri: afterSrc }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                            <View className="w-full h-full items-center justify-center">
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

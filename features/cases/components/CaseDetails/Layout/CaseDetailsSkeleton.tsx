import { View } from "react-native";

export default function CaseDetailsSkeleton() {
    return (
        <View className="space-y-6">
            {/* Hero skeleton */}
            <View className="bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-gray-100/80 dark:border-slate-800 p-5 shadow-sm">
                <View className="flex-col gap-6">
                    {/* Image skeleton */}
                    <View className="space-y-3">
                        <View className="aspect-square rounded-2xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
                        <View className="flex-row gap-2 mt-3">
                            {[1, 2, 3].map(i => (
                                <View key={i} className="w-[68px] h-[68px] rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
                            ))}
                        </View>
                    </View>

                    {/* Info skeleton */}
                    <View className="space-y-5 mt-4">
                        <View className="flex-row justify-between">
                            <View className="h-7 w-24 rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse" />
                            <View className="h-7 w-16 rounded-lg bg-gray-100 dark:bg-slate-800 animate-pulse" />
                        </View>
                        <View className="flex-row items-center gap-3 mt-4">
                            <View className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
                            <View className="flex-1">
                                <View className="h-6 w-48 rounded-lg bg-gray-100 dark:bg-slate-800 animate-pulse" />
                                <View className="h-4 w-28 rounded bg-gray-50 dark:bg-slate-800/50 animate-pulse mt-2" />
                            </View>
                        </View>
                        <View className="h-[1px] bg-gray-100 dark:bg-slate-800 my-4" />
                        <View className="space-y-2">
                            <View className="h-4 w-full rounded bg-gray-50 dark:bg-slate-800/50 animate-pulse" />
                            <View className="h-4 w-4/5 rounded bg-gray-50 dark:bg-slate-800/50 animate-pulse mt-2" />
                        </View>
                        <View className="flex-row flex-wrap gap-3 mt-4">
                            {[1, 2, 3, 4].map(i => (
                                <View key={i} className="h-16 w-[47%] rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100/50 dark:border-slate-700 animate-pulse" />
                            ))}
                        </View>
                        <View className="h-[1px] bg-gray-100 dark:bg-slate-800 my-4" />
                        <View className="h-12 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
                    </View>
                </View>
            </View>

            {/* Tabs skeleton */}
            <View className="bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-gray-100/80 dark:border-slate-800 p-4 shadow-sm mt-6">
                <View className="flex-row border-b border-gray-100/80 dark:border-slate-800 pb-2 mb-4">
                    {[1, 2, 3].map(i => (
                        <View key={i} className="h-10 w-24 rounded-lg bg-gray-50 dark:bg-slate-800 mx-1 animate-pulse" />
                    ))}
                </View>
                <View className="space-y-4">
                    <View className="h-5 w-40 rounded bg-gray-100 dark:bg-slate-800 animate-pulse" />
                    <View className="space-y-2 mt-4">
                        <View className="h-4 w-full rounded bg-gray-50 dark:bg-slate-800/50 animate-pulse" />
                        <View className="h-4 w-3/4 rounded bg-gray-50 dark:bg-slate-800/50 animate-pulse mt-2" />
                        <View className="h-4 w-1/2 rounded bg-gray-50 dark:bg-slate-800/50 animate-pulse mt-2" />
                    </View>
                </View>
            </View>
        </View>
    );
}

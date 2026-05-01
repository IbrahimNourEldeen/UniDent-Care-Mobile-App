import React from 'react';
import { Text, View } from 'react-native';

export default function InfoCard({
    icon: Icon,
    label,
    value,
    colorClass,
}: {
    icon: any;
    label: string;
    value: string;
    colorClass: string;
}) {
    // We map text color classes to actual hex colors for the icon
    const iconColorMap: Record<string, string> = {
        'text-blue-500': '#3b82f6',
        'text-emerald-500': '#10b981',
        'text-rose-500': '#f43f5e',
        'text-indigo-500': '#6366f1',
        'text-violet-500': '#8b5cf6',
        'text-teal-500': '#14b8a6',
        'text-cyan-500': '#06b6d4',
    };
    const iconColor = iconColorMap[colorClass] || '#64748b';

    return (
        <View className="flex-row items-center gap-2.5 bg-slate-50/70 dark:bg-slate-800/50 rounded-xl px-3 py-2.5 border border-slate-100/50 dark:border-slate-700/50">
            <View className={`w-7 h-7 rounded-lg bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center`}>
                <Icon size={16} color={iconColor} />
            </View>
            <View className="flex-1">
                <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">{label}</Text>
                <Text className="text-sm font-semibold text-slate-800 dark:text-slate-200" numberOfLines={1}>{value}</Text>
            </View>
        </View>
    );
}

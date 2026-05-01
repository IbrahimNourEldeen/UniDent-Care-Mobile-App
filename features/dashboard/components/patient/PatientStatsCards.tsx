import React from 'react';
import { View, Text, Dimensions, ActivityIndicator } from 'react-native';
import { Activity, Calendar, CheckCircle2 } from 'lucide-react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { PieChart } from 'react-native-gifted-charts';

const { width } = Dimensions.get('window');

interface StatsCardsProps {
    stats: {
        activeCases: number;
        upcomingSessions: number;
        completedTreatments: number;
    };
    loading?: boolean;
}

export default function PatientStatsCards({ stats, loading }: StatsCardsProps) {
    const { theme } = useThemeLanguage();
    const isDark = theme === "dark";

    const items = [
        { label: "Active", value: stats.activeCases, icon: Activity, color: isDark ? "#60a5fa" : "#2563eb", bg: isDark ? "bg-blue-900/40" : "bg-blue-50" },
        { label: "Upcoming", value: stats.upcomingSessions, icon: Calendar, color: isDark ? "#c084fc" : "#9333ea", bg: isDark ? "bg-purple-900/40" : "bg-purple-50" },
        { label: "Completed", value: stats.completedTreatments, icon: CheckCircle2, color: isDark ? "#4ade80" : "#16a34a", bg: isDark ? "bg-green-900/40" : "bg-green-50" },
    ];

    const pieData = [
        { value: stats.activeCases, color: isDark ? "#60a5fa" : "#2563eb", text: 'Active' },
        { value: stats.upcomingSessions, color: isDark ? "#c084fc" : "#9333ea", text: 'Upcoming' },
        { value: stats.completedTreatments, color: isDark ? "#4ade80" : "#16a34a", text: 'Completed' },
    ].filter(d => d.value > 0);

    return (
        <View className="mb-6">
            <View className="flex-row justify-between mb-4">
                {items.map((item, i) => (
                    <View key={i} className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none items-center`} style={{ width: width * 0.28 }}>
                        <View className={`p-2 rounded-xl ${item.bg} mb-2`}>
                            <item.icon size={20} color={item.color} />
                        </View>
                        <Text className="text-lg font-black text-slate-900 dark:text-white">
                            {loading ? <ActivityIndicator size="small" /> : item.value}
                        </Text>
                        <Text className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{item.label}</Text>
                    </View>
                ))}
            </View>

            {/* Premium Chart Widget */}
            <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none items-center">
                <Text className="text-sm font-bold text-slate-800 dark:text-slate-200 self-start mb-4">Activity Overview</Text>
                {pieData.length > 0 && !loading ? (
                    <PieChart
                        data={pieData}
                        donut
                        showGradient
                        sectionAutoFocus
                        radius={70}
                        innerRadius={50}
                        innerCircleColor={isDark ? '#0f172a' : '#ffffff'}
                        centerLabelComponent={() => (
                            <View className="justify-center items-center">
                                <Text className="text-xl font-black text-slate-800 dark:text-slate-200">{stats.activeCases + stats.completedTreatments}</Text>
                                <Text className="text-[10px] text-slate-500">Total Cases</Text>
                            </View>
                        )}
                    />
                ) : (
                    <View className="h-[140px] justify-center items-center">
                        <Text className="text-slate-400 text-xs">No data available</Text>
                    </View>
                )}
                
                {/* Legend */}
                {pieData.length > 0 && !loading && (
                    <View className="flex-row justify-center mt-4 gap-4">
                        {pieData.map((item, idx) => (
                            <View key={idx} className="flex-row items-center">
                                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color, marginRight: 6 }} />
                                <Text className="text-[10px] text-slate-600 dark:text-slate-400">{item.text}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
}

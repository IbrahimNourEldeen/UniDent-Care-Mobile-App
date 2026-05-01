import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { CalendarDays } from 'lucide-react-native';

export default function PatientCalendarWidget({ sessions }: { sessions: any[] }) {
    const { theme } = useThemeLanguage();
    const isDark = theme === "dark";

    const markedDates = useMemo(() => {
        const marks: any = {};
        sessions.forEach(session => {
            if (session.scheduledAt) {
                const dateString = session.scheduledAt.split('T')[0];
                const isDone = session.status === 'Completed' || session.status === 2 || session.status === 'Done';
                marks[dateString] = {
                    marked: true,
                    dotColor: isDone ? '#10b981' : '#6366f1',
                    selected: false,
                };
            }
        });
        return marks;
    }, [sessions]);

    return (
        <View className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm mb-6">
            <View className="flex-row items-center gap-3 mb-6">
                <View className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
                    <CalendarDays size={20} color="#6366f1" />
                </View>
                <Text className="text-xl font-black text-slate-800 dark:text-white">Schedule</Text>
            </View>
            
            <View className="rounded-3xl overflow-hidden border border-slate-50 dark:border-slate-800">
                <Calendar
                    theme={{
                        backgroundColor: isDark ? '#0f172a' : '#ffffff',
                        calendarBackground: isDark ? '#0f172a' : '#ffffff',
                        textSectionTitleColor: isDark ? '#94a3b8' : '#64748b',
                        selectedDayBackgroundColor: '#6366f1',
                        selectedDayTextColor: '#ffffff',
                        todayTextColor: '#6366f1',
                        dayTextColor: isDark ? '#e2e8f0' : '#1e293b',
                        textDisabledColor: isDark ? '#334155' : '#cbd5e1',
                        dotColor: '#6366f1',
                        selectedDotColor: '#ffffff',
                        arrowColor: '#6366f1',
                        monthTextColor: isDark ? '#f8fafc' : '#0f172a',
                        textMonthFontWeight: '900',
                        textDayFontWeight: '600',
                        textDayHeaderFontWeight: '700',
                        textDayFontSize: 12,
                        textMonthFontSize: 16,
                        textDayHeaderFontSize: 12,
                    }}
                    markedDates={markedDates}
                    enableSwipeMonths={true}
                />
            </View>

            <View className="flex-row justify-center gap-6 mt-6">
                <View className="flex-row items-center gap-2">
                    <View className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Completed</Text>
                </View>
                <View className="flex-row items-center gap-2">
                    <View className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Scheduled</Text>
                </View>
            </View>
        </View>
    );
}

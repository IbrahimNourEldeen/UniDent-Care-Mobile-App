import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CalendarDays } from 'lucide-react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

interface StepDateProps {
    selectedDate: Date | null;
    onDateChange: (date: Date) => void;
    isRTL: boolean;
    dateLabel: string;
}

export function StepDate({ selectedDate, onDateChange, isRTL, dateLabel }: StepDateProps) {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';

    // Inline calendar: show the next 14 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates: Date[] = Array.from({ length: 14 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        return d;
    });

    const dayNames = isRTL
        ? ['أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت']
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const monthNames = isRTL
        ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <View>
            <Text className={`text-[11px] mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {dateLabel}
            </Text>

            {selectedDate && (
                <View className={`flex-row items-center gap-2 mb-4 p-3 rounded-xl border ${isDark ? 'bg-indigo-900/20 border-indigo-800/40' : 'bg-indigo-50 border-indigo-100'}`}>
                    <CalendarDays size={14} color="#6366f1" />
                    <Text className={`text-[13px] font-semibold ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                        {selectedDate.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                        })}
                    </Text>
                </View>
            )}

            <View className="flex-row flex-wrap gap-2">
                {dates.map((date, idx) => {
                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                    const dayName = dayNames[date.getDay()];
                    const dayNum = date.getDate();
                    const monthName = monthNames[date.getMonth()];

                    return (
                        <TouchableOpacity
                            key={idx}
                            onPress={() => onDateChange(date)}
                            activeOpacity={0.7}
                            style={{ width: '13%' }}
                            className={`items-center py-2 rounded-xl border ${isSelected
                                ? 'bg-indigo-600 border-indigo-600'
                                : isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <Text style={{ fontSize: 9, fontWeight: '600', color: isSelected ? '#c7d2fe' : isDark ? '#94a3b8' : '#94a3b8' }}>
                                {dayName}
                            </Text>
                            <Text style={{ fontSize: 14, fontWeight: '700', color: isSelected ? '#fff' : isDark ? '#f1f5f9' : '#1e293b' }}>
                                {dayNum}
                            </Text>
                            <Text style={{ fontSize: 8, color: isSelected ? '#c7d2fe' : isDark ? '#64748b' : '#94a3b8' }}>
                                {monthName}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

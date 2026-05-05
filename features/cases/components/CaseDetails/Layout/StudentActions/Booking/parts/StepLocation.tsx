import React from 'react';
import { View, Text, TextInput, Animated } from 'react-native';
import { MapPin, CalendarDays, Clock } from 'lucide-react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

interface StepLocationProps {
    location: string;
    onLocationChange: (v: string) => void;
    selectedDate: Date | null;
    startTime: string;
    endTime: string;
    error?: string;
    isLoading: boolean;
    isRTL: boolean;
    locationLabel: string;
    locationPlaceholder: string;
    dateLabel: string;
    timeLabel: string;
    summary: string;
}

function calcDuration(start: string, end: string): string {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const diff = eh * 60 + em - (sh * 60 + sm);
    if (diff <= 0) return '';
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`;
}

function formatTime(t: string): string {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hh = h % 12 === 0 ? 12 : h % 12;
    return `${hh}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function StepLocation({
    location, onLocationChange, selectedDate, startTime, endTime,
    error, isLoading, isRTL, locationLabel, locationPlaceholder,
    dateLabel, timeLabel, summary,
}: StepLocationProps) {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';
    const durationStr = calcDuration(startTime, endTime);

    const summaryRows = [
        {
            icon: <CalendarDays size={13} color="#6366f1" />,
            label: dateLabel,
            value: selectedDate
                ? selectedDate.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                : '—',
        },
        {
            icon: <Clock size={13} color="#6366f1" />,
            label: timeLabel,
            value: startTime && endTime
                ? `${formatTime(startTime)} → ${formatTime(endTime)}${durationStr ? `  (${durationStr})` : ''}`
                : '—',
        },
        {
            icon: <MapPin size={13} color="#6366f1" />,
            label: locationLabel,
            value: location.trim() || '—',
        },
    ];

    return (
        <View>
            {/* Location Input */}
            <Text className={`text-[11px] mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {locationLabel} <Text style={{ color: '#ef4444' }}>*</Text>
            </Text>
            <View className={`flex-row items-center gap-2 rounded-xl border px-3 py-2.5 mb-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <MapPin size={13} color={isDark ? '#64748b' : '#94a3b8'} />
                <TextInput
                    value={location}
                    onChangeText={onLocationChange}
                    placeholder={locationPlaceholder}
                    placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
                    editable={!isLoading}
                    textAlign={isRTL ? 'right' : 'left'}
                    className={`flex-1 text-[13px] ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                />
            </View>

            {/* Summary Card */}
            <View className={`rounded-xl border overflow-hidden ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <Text className={`text-[10px] font-bold uppercase tracking-widest px-3 pt-3 pb-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {summary}
                </Text>
                {summaryRows.map(({ icon, label, value }, idx) => (
                    <View key={label} className={`flex-row items-start gap-2.5 px-3 py-2.5 ${idx < summaryRows.length - 1 ? `border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}` : 'pb-3'}`}>
                        <View className="mt-0.5">{icon}</View>
                        <View className="flex-1">
                            <Text className={`text-[10px] mb-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</Text>
                            <Text className={`text-[12px] font-medium leading-snug ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{value}</Text>
                        </View>
                    </View>
                ))}
            </View>

            {error && (
                <View className="mt-3 rounded-xl bg-red-500/10 px-3 py-2">
                    <Text className="text-[12px] text-red-500">{error}</Text>
                </View>
            )}
        </View>
    );
}

import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Clock } from 'lucide-react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

function calcDuration(start: string, end: string): string {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const diff = eh * 60 + em - (sh * 60 + sm);
    if (diff <= 0) return '';
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`;
}

interface StepTimeProps {
    startTime: string;
    endTime: string;
    onStartChange: (v: string) => void;
    onEndChange: (v: string) => void;
    isLoading: boolean;
    isRTL: boolean;
    startTimeLabel: string;
    endTimeLabel: string;
    durationLabel: string;
    errorTime: string;
}

export function StepTime({
    startTime, endTime, onStartChange, onEndChange,
    isLoading, isRTL, startTimeLabel, endTimeLabel, durationLabel, errorTime,
}: StepTimeProps) {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';
    const timeValid = endTime > startTime;
    const durationStr = calcDuration(startTime, endTime);
    const showError = startTime && endTime && !timeValid;

    const fields = [
        { label: startTimeLabel, value: startTime, onChange: onStartChange },
        { label: endTimeLabel, value: endTime, onChange: onEndChange },
    ];

    return (
        <View>
            <View className="flex-row gap-3 mb-4">
                {fields.map(({ label, value, onChange }) => (
                    <View key={label} className="flex-1">
                        <Text className={`text-[11px] mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {label}
                        </Text>
                        <View className={`flex-row items-center gap-2 rounded-xl border px-3 py-2.5 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                            <Clock size={13} color={isDark ? '#64748b' : '#94a3b8'} />
                            <TextInput
                                value={value}
                                onChangeText={onChange}
                                placeholder="HH:MM"
                                placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
                                editable={!isLoading}
                                keyboardType="numbers-and-punctuation"
                                maxLength={5}
                                textAlign={isRTL ? 'right' : 'left'}
                                className={`flex-1 text-[13px] ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                            />
                        </View>
                    </View>
                ))}
            </View>

            {timeValid && durationStr ? (
                <View className="flex-row items-center gap-2 bg-indigo-600/10 rounded-xl px-3 py-2.5">
                    <Clock size={13} color="#6366f1" />
                    <Text className="text-[12px] font-medium text-indigo-500">
                        {durationLabel}: {durationStr}
                    </Text>
                </View>
            ) : showError ? (
                <View className="flex-row items-center gap-2 bg-red-500/10 rounded-xl px-3 py-2.5">
                    <Text className="text-[12px] text-red-500">{errorTime}</Text>
                </View>
            ) : null}
        </View>
    );
}

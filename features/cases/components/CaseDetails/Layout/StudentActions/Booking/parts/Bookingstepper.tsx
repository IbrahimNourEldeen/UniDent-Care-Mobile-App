import React from 'react';
import { View, Text } from 'react-native';
import { Check } from 'lucide-react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

interface BookingstepperProps {
    currentStep: number;
    steps: string[];
    stepSubs: string[];
}

export default function Bookingstepper({ currentStep, steps, stepSubs }: BookingstepperProps) {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';

    return (
        <View className="flex-row items-start mb-6">
            {steps.map((label, i) => {
                const done = i < currentStep;
                const active = i === currentStep;
                const last = i === steps.length - 1;

                return (
                    <View key={label} className="flex-1 items-center" style={{ position: 'relative' }}>
                        {/* Connector */}
                        {!last && (
                            <View
                                style={{
                                    position: 'absolute', top: 14,
                                    left: '50%', right: 0, height: 2,
                                    backgroundColor: done ? '#6366f1' : isDark ? '#1e293b' : '#e2e8f0',
                                    borderRadius: 99, zIndex: 0,
                                }}
                            />
                        )}

                        {/* Circle */}
                        <View
                            style={{
                                zIndex: 1, width: 28, height: 28, borderRadius: 14,
                                borderWidth: 2, alignItems: 'center', justifyContent: 'center',
                                backgroundColor: done
                                    ? '#6366f1'
                                    : active
                                    ? isDark ? '#0f172a' : '#ffffff'
                                    : isDark ? '#1e293b' : '#f8fafc',
                                borderColor: done || active ? '#6366f1' : isDark ? '#334155' : '#e2e8f0',
                            }}>
                            {done ? (
                                <Check size={13} color="#ffffff" strokeWidth={3} />
                            ) : active ? (
                                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#6366f1' }} />
                            ) : (
                                <Text style={{ fontSize: 10, fontWeight: '700', color: isDark ? '#475569' : '#94a3b8' }}>
                                    {i + 1}
                                </Text>
                            )}
                        </View>

                        <Text className={`text-[10px] font-bold mt-1.5 text-center ${done || active
                            ? isDark ? 'text-slate-200' : 'text-slate-800'
                            : isDark ? 'text-slate-600' : 'text-slate-400'}`}
                            numberOfLines={1}>
                            {label}
                        </Text>
                        <Text className={`text-[9px] text-center mt-0.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}
                            numberOfLines={1}>
                            {stepSubs[i]}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
}

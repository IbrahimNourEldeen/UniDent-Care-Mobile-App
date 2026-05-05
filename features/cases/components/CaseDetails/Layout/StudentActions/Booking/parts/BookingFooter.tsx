import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

interface BookingFooterProps {
    step: number;
    totalSteps: number;
    isLastStep: boolean;
    isLoading: boolean;
    isRTL: boolean;
    confirmLabel: string;
    nextLabel: string;
    backLabel: string;
    bookingLabel: string;
    onNext: () => void;
    onBack: () => void;
    onCancel: () => void;
    cancelLabel: string;
}

export default function BookingFooter({
    step,
    totalSteps,
    isLastStep,
    isLoading,
    isRTL,
    confirmLabel,
    nextLabel,
    backLabel,
    bookingLabel,
    onNext,
    onBack,
    onCancel,
    cancelLabel,
}: BookingFooterProps) {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';

    return (
        <View className={`flex-row items-center gap-2 pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            {step > 0 ? (
                <TouchableOpacity
                    onPress={onBack}
                    disabled={isLoading}
                    activeOpacity={0.7}
                    className={`flex-row items-center gap-1.5 px-4 py-2.5 rounded-xl border ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
                    {isRTL
                        ? <ChevronRight size={16} color={isDark ? '#94a3b8' : '#64748b'} />
                        : <ChevronLeft size={16} color={isDark ? '#94a3b8' : '#64748b'} />}
                    <Text className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {backLabel}
                    </Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    onPress={onCancel}
                    disabled={isLoading}
                    activeOpacity={0.7}
                    className={`px-4 py-2.5 rounded-xl border ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
                    <Text className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {cancelLabel}
                    </Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity
                onPress={onNext}
                disabled={isLoading}
                activeOpacity={0.8}
                className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600">
                {isLoading ? (
                    <>
                        <ActivityIndicator size="small" color="#ffffff" />
                        <Text className="text-sm font-bold text-white">{bookingLabel}</Text>
                    </>
                ) : (
                    <>
                        <Text className="text-sm font-bold text-white">
                            {isLastStep ? confirmLabel : nextLabel}
                        </Text>
                        {!isLastStep && (
                            isRTL
                                ? <ChevronLeft size={16} color="#ffffff" />
                                : <ChevronRight size={16} color="#ffffff" />
                        )}
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
}

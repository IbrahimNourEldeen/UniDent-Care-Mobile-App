import React from 'react';
import { View, Text } from 'react-native';
import { Activity, Pill } from 'lucide-react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

interface MedicalInfoTabProps {
    medicalHistory?: string[];
    medications?: string[];
}

export default function MedicalInfoTab({ medicalHistory, medications }: MedicalInfoTabProps) {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';

    return (
        <View className="space-y-8">
            <View className={`rounded-2xl p-5 border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <View className="flex-row items-center gap-2.5 mb-4">
                    <View className={`p-2 rounded-lg ${isDark ? 'bg-indigo-900/40' : 'bg-indigo-100'}`}>
                        <Activity size={18} color={isDark ? '#818cf8' : '#4f46e5'} />
                    </View>
                    <Text className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        Medical History
                    </Text>
                </View>

                {medicalHistory && medicalHistory.length > 0 ? (
                    <View className="space-y-2">
                        {medicalHistory.map((item, i) => (
                            <View key={i} className="flex-row items-start gap-2">
                                <View className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isDark ? 'bg-slate-500' : 'bg-slate-400'}`} />
                                <Text className={`flex-1 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {item}
                                </Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text className={`text-sm italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        No medical history provided.
                    </Text>
                )}
            </View>

            <View className={`rounded-2xl p-5 border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <View className="flex-row items-center gap-2.5 mb-4">
                    <View className={`p-2 rounded-lg ${isDark ? 'bg-emerald-900/40' : 'bg-emerald-100'}`}>
                        <Pill size={18} color={isDark ? '#34d399' : '#059669'} />
                    </View>
                    <Text className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        Medications
                    </Text>
                </View>

                {medications && medications.length > 0 ? (
                    <View className="space-y-2">
                        {medications.map((item, i) => (
                            <View key={i} className="flex-row items-start gap-2">
                                <View className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isDark ? 'bg-slate-500' : 'bg-slate-400'}`} />
                                <Text className={`flex-1 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {item}
                                </Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text className={`text-sm italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        No medications provided.
                    </Text>
                )}
            </View>
        </View>
    );
}

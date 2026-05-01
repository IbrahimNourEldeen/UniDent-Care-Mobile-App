import { Activity, Pill } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

interface MedicalInfoTabProps {
    medicalHistory?: string[];
    medications?: string[];
}

export default function MedicalInfoTab({ medicalHistory, medications }: MedicalInfoTabProps) {
    return (
        <View className="space-y-8">
            <View className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
                <View className="flex-row items-center gap-2.5 mb-4">
                    <View className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg">
                        <Activity size={18} color="#4f46e5" />
                    </View>
                    <Text className="text-base font-bold text-slate-800 dark:text-white">
                        Medical History
                    </Text>
                </View>
                {medicalHistory && medicalHistory.length > 0 ? (
                    <View className="space-y-2 pl-2">
                        {medicalHistory.map((item, i) => (
                            <View key={i} className="flex-row items-start gap-2">
                                <View className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5" />
                                <Text className="flex-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {item}
                                </Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text className="text-sm text-slate-500 dark:text-slate-400 italic">
                        No medical history provided.
                    </Text>
                )}
            </View>

            <View className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 mt-6">
                <View className="flex-row items-center gap-2.5 mb-4">
                    <View className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                        <Pill size={18} color="#059669" />
                    </View>
                    <Text className="text-base font-bold text-slate-800 dark:text-white">
                        Medications
                    </Text>
                </View>
                {medications && medications.length > 0 ? (
                    <View className="space-y-2 pl-2">
                        {medications.map((item, i) => (
                            <View key={i} className="flex-row items-start gap-2">
                                <View className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5" />
                                <Text className="flex-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {item}
                                </Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text className="text-sm text-slate-500 dark:text-slate-400 italic">
                        No medications provided.
                    </Text>
                )}
            </View>
        </View>
    );
}

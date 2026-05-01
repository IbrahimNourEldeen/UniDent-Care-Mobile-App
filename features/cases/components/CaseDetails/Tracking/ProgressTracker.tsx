import { Check, Circle } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

interface ProgressTrackerProps {
    currentStep: number;
    processStatus?: string;
}

const STEPS = [
    { label: "Case Added", desc: "AI exam" },
    { label: "Diagnosis", desc: "Initial exam" },
    { label: "Treatment", desc: "Active care" },
    { label: "Follow-up", desc: "Post-review" },
];

export default function ProgressTracker({ currentStep, processStatus }: ProgressTrackerProps) {
    return (
        <View className="space-y-5">
            <View className="flex-row items-center justify-between mb-4">
                <Text className="text-sm font-semibold text-slate-800 dark:text-white">Treatment Progress</Text>
                {processStatus && (
                    <View className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40">
                        <Text className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                            {processStatus}
                        </Text>
                    </View>
                )}
            </View>

            <View className="flex-row items-start">
                {STEPS.map((step, i) => {
                    const done = i < currentStep;
                    const active = i === currentStep;
                    const last = i === STEPS.length - 1;

                    return (
                        <View key={step.label} className="flex-1 flex-col items-center">
                            {/* Connector line (absolute positioned to bridge gaps) */}
                            {!last && (
                                <View className="absolute top-4 left-[50%] w-full h-[3px] rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 z-0">
                                    <View
                                        style={{ width: done ? '100%' : '0%' }}
                                        className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full"
                                    />
                                </View>
                            )}

                            {/* Circle */}
                            <View
                                className={`z-10 w-9 h-9 rounded-full items-center justify-center border-2 ${
                                    done
                                        ? "bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500"
                                        : active
                                            ? "bg-white dark:bg-slate-900 border-indigo-500 dark:border-indigo-400"
                                            : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                                }`}
                            >
                                {done ? (
                                    <Check size={15} color="#ffffff" strokeWidth={3} />
                                ) : active ? (
                                    <View className="w-2.5 h-2.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
                                ) : (
                                    <Circle size={10} color="#94a3b8" />
                                )}
                            </View>

                            <Text className={`text-[11px] text-center font-semibold mt-2.5 ${
                                done || active ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-500"
                            }`}>
                                {step.label}
                            </Text>
                            <Text className="text-[9px] text-center text-slate-400 dark:text-slate-500 mt-0.5">
                                {step.desc}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

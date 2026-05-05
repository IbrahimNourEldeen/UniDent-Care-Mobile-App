import React from 'react';
import { View, Text } from 'react-native';
import { Check } from 'lucide-react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { progressTrackerTranslations } from '../../constants/progressTracker.translate';

interface ProgressTrackerProps {
    status: string;
    createdByRole: string;
    diagnosisdto: any[] | null;
    supervisingDoctorName?: string;
}

export default function ProgressTracker({ status, createdByRole, diagnosisdto }: ProgressTrackerProps) {
    const { theme, language } = useThemeLanguage();
    const isDark = theme === 'dark';
    const lang = (language as 'ar' | 'en') ?? 'en';
    const dict = progressTrackerTranslations[lang] ?? progressTrackerTranslations.en;
    const isAr = lang === 'ar';

    let currentStep = 0;
    if (status?.toLowerCase() === 'completed') {
        currentStep = 4;
    } else if (status?.toLowerCase() === 'inprogress') {
        currentStep = 2;
    } else if (diagnosisdto && diagnosisdto !== null) {
        currentStep = 1;
    } else {
        currentStep = 0;
    }

    const getInitialStageDesc = () => {
        if (!diagnosisdto || diagnosisdto.length === 0) {
            const roleKey = (createdByRole || '').toLowerCase() as keyof typeof dict;
            return createdByRole === 'Patient' ? dict.aiExam : `${dict.by} ${dict[roleKey] || createdByRole}`;
        }
        const firstStage = diagnosisdto[0]?.stage;
        if (firstStage === 0 || firstStage === 'AI') return dict.aiExam;
        return dict.byDoctor;
    };

    const isReviewed = (diagnosisdto && diagnosisdto !== null) && status === 'InProgress';
    const diagnosisLabel = isReviewed ? dict.reviewedBySupervisor : dict.clinicalDiagnosis;
    const diagnosisDesc = isReviewed ? dict.verifiedReview : dict.clinicalExam;

    const STEPS = [
        { label: dict.caseAdded, desc: getInitialStageDesc() },
        { label: diagnosisLabel, desc: diagnosisDesc },
        { label: dict.treatment, desc: dict.activeCare },
        { label: dict.caseClosed, desc: dict.completed },
    ];

    return (
        <View className="gap-5" style={{ direction: isAr ? 'rtl' : undefined } as any}>
            <Text className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {dict.treatmentProgress}
            </Text>

            <View className="flex-row items-start">
                {STEPS.map((step, i) => {
                    const done = i < currentStep;
                    const active = i === currentStep;
                    const last = i === STEPS.length - 1;

                    return (
                        <View key={step.label} className="flex-1 items-center" style={{ position: 'relative' }}>
                            {/* Connector line */}
                            {!last && (
                                <View
                                    style={{
                                        position: 'absolute',
                                        top: 18,
                                        left: '50%',
                                        right: 0,
                                        height: 3,
                                        zIndex: 0,
                                        borderRadius: 99,
                                        backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                                        overflow: 'hidden',
                                    }}>
                                    <View
                                        style={{
                                            width: done ? '100%' : '0%',
                                            height: '100%',
                                            backgroundColor: '#6366f1',
                                            borderRadius: 99,
                                        }}
                                    />
                                </View>
                            )}

                            {/* Circle */}
                            <View
                                style={{
                                    zIndex: 1,
                                    width: 36,
                                    height: 36,
                                    borderRadius: 18,
                                    borderWidth: 2,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: done
                                        ? '#4f46e5'
                                        : active
                                        ? isDark ? '#0f172a' : '#ffffff'
                                        : isDark ? '#1e293b' : '#f8fafc',
                                    borderColor: done
                                        ? '#4f46e5'
                                        : active
                                        ? '#6366f1'
                                        : isDark ? '#334155' : '#e2e8f0',
                                }}>
                                {done ? (
                                    <Check size={15} color="#ffffff" strokeWidth={3} />
                                ) : active ? (
                                    <View style={{
                                        width: 10, height: 10, borderRadius: 5,
                                        backgroundColor: '#6366f1',
                                    }} />
                                ) : (
                                    <View style={{
                                        width: 8, height: 8, borderRadius: 4,
                                        backgroundColor: isDark ? '#475569' : '#cbd5e1',
                                    }} />
                                )}
                            </View>

                            <Text
                                className={`text-[10px] font-semibold mt-2.5 text-center ${done || active
                                    ? isDark ? 'text-slate-200' : 'text-slate-800'
                                    : isDark ? 'text-slate-500' : 'text-slate-400'}`}
                                numberOfLines={2}>
                                {step.label}
                            </Text>
                            <Text
                                className={`text-[9px] text-center mt-0.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}
                                numberOfLines={1}>
                                {step.desc}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

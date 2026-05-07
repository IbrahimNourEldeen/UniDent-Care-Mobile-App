import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import {
    X, Tag, AlertCircle, FileText, GraduationCap,
    Stethoscope, Activity, MousePointerClick
} from 'lucide-react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import InfoRow from './InfoRow';
import PersonRow from './PersonRow';

export type DiagnosisStage = 'BasicClinic' | 'AI' | '' | 0 | 1;

export interface ToothPanelData {
    id?: string;
    toothNumber: number;
    caseType: string;
    caseTypeId?: string;
    diagnosisStage: DiagnosisStage;
    notes: string;
    assignedStudentName?: string | null;
    assignedDoctorName?: string | null;
}

interface ToothInfoPanelProps {
    data: ToothPanelData | null;
    onClose: () => void;
}

const getStageLabel = (data: ToothPanelData | null) => {
    const stage = data?.diagnosisStage;
    if (stage === 0 || stage === 'AI') return 'AI';
    if (stage === 1 || stage === 'BasicClinic') return 'Basic Clinic';
    return 'Unknown';
};

export default function ToothInfoPanel({ data, onClose }: ToothInfoPanelProps) {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';

    if (!data) {
        return (
            <View className={`rounded-2xl border-2 border-dashed items-center justify-center p-8 gap-4 ${isDark ? 'border-slate-700/60 bg-slate-800/20' : 'border-slate-200 bg-slate-50/30'}`}>
                <View className={`w-12 h-12 rounded-2xl items-center justify-center border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                    <MousePointerClick size={20} color={isDark ? '#6366f1' : '#818cf8'} />
                </View>
                <View className="items-center">
                    <Text className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        No tooth selected
                    </Text>
                    <Text className={`text-[11px] text-center mt-1 max-w-[160px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        Tap any tooth on the chart to view its diagnosis details
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 }}>
            {/* Header */}
            <View className={`flex-row items-center justify-between px-5 py-4 border-b ${isDark ? 'border-slate-800 bg-indigo-900/20' : 'border-slate-100 bg-indigo-50/80'}`}>
                <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-xl items-center justify-center"
                        style={{ backgroundColor: '#6366f1' }}>
                        <Text className="text-sm font-extrabold text-white">#{data.toothNumber}</Text>
                    </View>
                    <View>
                        <Text className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            Tooth {data.toothNumber}
                        </Text>
                        <Text className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                            Diagnosis Info
                        </Text>
                    </View>
                </View>
                <TouchableOpacity onPress={onClose} activeOpacity={0.7}
                    className={`w-7 h-7 rounded-lg items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <X size={14} color={isDark ? '#94a3b8' : '#64748b'} />
                </TouchableOpacity>
            </View>

            {/* Body */}
            <ScrollView className="p-5" contentContainerStyle={{ gap: 16 }}>
                <InfoRow
                    icon={<Tag size={13} color={isDark ? '#818cf8' : '#6366f1'} />}
                    label="Case Type"
                    value={data.caseType || 'Unknown'}
                />
                <InfoRow
                    icon={<AlertCircle size={13} color="#f59e0b" />}
                    label="Stage"
                    value={getStageLabel(data)}
                />

                <View className={`h-px ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />

                {data.notes ? (
                    <View className={`rounded-xl p-3.5 border ${isDark ? 'bg-indigo-900/10 border-indigo-800/40' : 'bg-indigo-50/60 border-indigo-100'}`}>
                        <View className="flex-row items-center gap-1.5 mb-2">
                            <FileText size={12} color={isDark ? '#6366f1' : '#818cf8'} />
                            <Text className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                                Clinical Notes
                            </Text>
                        </View>
                        <Text className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            {data.notes}
                        </Text>
                    </View>
                ) : (
                    <Text className={`text-xs italic px-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        No clinical notes recorded.
                    </Text>
                )}

                <View className={`h-px ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />

                <PersonRow
                    icon={<GraduationCap size={14} color="#10b981" />}
                    role="Assigned Student"
                    name={data.assignedStudentName}
                    emptyLabel="Not yet assigned"
                />
                <PersonRow
                    icon={<Stethoscope size={14} color="#3b82f6" />}
                    role="Supervising Doctor"
                    name={data.assignedDoctorName}
                    prefix="Dr."
                    emptyLabel="Not yet assigned"
                />

                <View className={`flex-row items-center gap-2 rounded-xl px-3.5 py-2.5 border ${isDark ? 'bg-indigo-900/10 border-indigo-800/40' : 'bg-indigo-50 border-indigo-100'}`}>
                    <Activity size={14} color="#6366f1" />
                    <Text className={`text-xs font-semibold ${isDark ? 'text-indigo-400' : 'text-indigo-700'}`}>
                        Case is under active treatment
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

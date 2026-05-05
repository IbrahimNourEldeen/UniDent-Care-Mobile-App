import React from 'react';
import { View, Text } from 'react-native';
import { User, Calendar, GraduationCap, FileText } from 'lucide-react-native';
import { StudentCaseItem } from '../../types/caseTypes';

interface PatientSummaryCardProps {
    patient: StudentCaseItem;
    isDark?: boolean;
}

const InfoCard = ({ icon: Icon, label, value, colorClass }: any) => (
    <View className="flex-row items-center gap-2">
        <View className={`w-8 h-8 rounded-lg items-center justify-center bg-slate-50 dark:bg-slate-800`}>
            <Icon size={16} className={colorClass} />
        </View>
        <View>
            <Text className="text-[10px] uppercase font-bold text-slate-400">{label}</Text>
            <Text className="text-xs font-bold text-slate-700 dark:text-slate-200" numberOfLines={1}>{value}</Text>
        </View>
    </View>
);

export default function PatientSummaryCard({ patient, isDark = false }: PatientSummaryCardProps) {
    const initials = patient.patientName
        ? patient.patientName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
        : "?";

    const textClass = isDark ? 'text-white' : 'text-slate-800';
    const subTextClass = isDark ? 'text-slate-400' : 'text-slate-500';
    const borderClass = isDark ? 'border-slate-800' : 'border-slate-100';
    const bgClass = isDark ? 'bg-slate-900' : 'bg-white';

    const caseTypeStr = patient.diagnosisdto?.caseType || patient.caseType?.name || "General Dentistry";
    const stageStr = patient.diagnosisdto?.diagnosisStage ? ` · ${patient.diagnosisdto.diagnosisStage}` : "";

    return (
        <View className={`rounded-[32px] p-5 sm:p-6 shadow-sm border ${bgClass} ${borderClass}`}>
            {/* Patient Identity */}
            <View className="flex-row items-center gap-3.5">
                <View className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-sm">
                    <Text className="text-white font-bold text-base">{initials}</Text>
                </View>
                <View className="flex-1">
                    <Text className={`text-lg font-bold tracking-tight ${textClass}`} numberOfLines={1}>
                        {patient.patientName}
                    </Text>
                    <Text className={`text-xs mt-0.5 ${subTextClass}`} numberOfLines={1}>
                        {caseTypeStr} Case{stageStr}
                    </Text>
                </View>
            </View>

            {/* Divider */}
            <View className={`h-px my-5 ${isDark ? 'bg-slate-800/80' : 'bg-slate-100'}`} />

            {/* Quick Info Grid */}
            <View className="flex-row flex-wrap justify-between gap-y-3">
                <View className="w-[48%]">
                    <InfoCard icon={User} label="Age" value={`${patient.patientAge || '?'} years`} colorClass="text-blue-500" />
                </View>
                <View className="w-[48%]">
                    <InfoCard icon={GraduationCap} label="University" value={patient.universityName || "Not Assigned"} colorClass="text-indigo-500" />
                </View>
                <View className="w-[48%]">
                    <InfoCard icon={Calendar} label="Created" value={patient.createAt ? new Date(patient.createAt).toLocaleDateString() : 'N/A'} colorClass="text-violet-500" />
                </View>
                <View className="w-[48%]">
                    <InfoCard icon={FileText} label="Sessions" value={`${patient.totalSessions || 0}`} colorClass="text-emerald-500" />
                </View>
            </View>
        </View>
    );
}

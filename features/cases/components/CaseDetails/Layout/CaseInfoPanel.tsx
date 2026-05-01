import {
    BookUser,
    Calendar,
    CheckCircle2,
    ClipboardList,
    Clock,
    GraduationCap,
    MapPin,
    Phone,
    Stethoscope,
    User,
    UserCircle
} from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { getPatientStatusConfig } from '../../../utils/CaseDetails.utils';
import InfoCard from '../Shared/InfoCard';
import ProgressTracker from '../Tracking/ProgressTracker';
import { StudentCaseItem } from '../../../types/caseTypes';

interface PatientInfoPanelProps {
    role: string | null;
    patient: StudentCaseItem;
    creatorData?: any;
    doctorOwnerData?: any;
    studentOwnerData?: any;
    scheduledSession?: any;
    onRefetch: () => void;
}

export default function CaseInfoPanel({
    role, patient, creatorData, doctorOwnerData, studentOwnerData, scheduledSession, onRefetch
}: PatientInfoPanelProps) {

    const sc = getPatientStatusConfig(patient?.status);
    const initials = patient?.patientName
        ? patient.patientName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
        : "?";

    return (
        <View className="space-y-5 px-5">
            {/* Patient Identity */}
            <View className="flex-row items-center gap-3.5 mb-5 mt-4">
                <View className={`w-14 h-14 rounded-2xl ${sc.bg} flex items-center justify-center shadow-sm`}>
                    <Text className={`font-black text-xl ${sc.text}`}>{initials}</Text>
                </View>
                <View className="flex-1">
                    <Text className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                        {patient?.patientName}
                    </Text>
                    <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {patient?.diagnosisdto?.caseType || patient?.caseType?.name || 'General Dentistry'} Case
                        {patient?.diagnosisdto?.diagnosisStage ? ` · ${patient.diagnosisdto.diagnosisStage}` : ''}
                    </Text>
                </View>
            </View>

            {/* Divider */}
            <View className="h-[1px] bg-slate-100 dark:bg-slate-800/80 mb-5" />

            {/* Description */}
            {(patient?.description || patient?.diagnosisdto?.notes) && (
                <View className="mb-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                    <Text className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        {patient.description || patient.diagnosisdto?.notes}
                    </Text>
                </View>
            )}

            {/* Info Grid */}
            <View className="flex-row flex-wrap justify-between gap-y-3">
                <View className="w-[48%]">
                    <InfoCard icon={User} label="Age" value={`${patient?.patientAge || '?'} years`} colorClass="text-blue-500" />
                </View>
                <View className="w-[48%]">
                    <InfoCard icon={Phone} label="Phone" value={patient?.phone || "Not Provided"} colorClass="text-emerald-500" />
                </View>
                <View className="w-[48%]">
                    <InfoCard icon={MapPin} label="City" value={patient?.city || "Not Provided"} colorClass="text-rose-500" />
                </View>
                <View className="w-[48%]">
                    <InfoCard icon={GraduationCap} label="University" value={patient?.universityName || "Not Assigned"} colorClass="text-indigo-500" />
                </View>
                <View className="w-[48%]">
                    <InfoCard icon={Calendar} label="Created At" value={patient?.createAt ? new Date(patient.createAt).toLocaleDateString() : 'N/A'} colorClass="text-violet-500" />
                </View>
                <View className="w-[48%]">
                    <InfoCard icon={ClipboardList} label="Total Sessions" value={`${patient?.totalSessions || 0}`} colorClass="text-violet-500" />
                </View>
                {patient?.createdByRole?.toLowerCase() !== "patient" && creatorData && (
                    <View className="w-full mt-2">
                        <InfoCard icon={UserCircle} label="Created By" value={creatorData?.data?.fullName || "Unknown"} colorClass="text-teal-500" />
                    </View>
                )}
                {patient?.assignedStudentId && studentOwnerData && (
                    <View className="w-full mt-2">
                        <InfoCard icon={BookUser} label="Assigned Student" value={studentOwnerData?.data?.fullName || "Unknown"} colorClass="text-cyan-500" />
                    </View>
                )}
                {patient?.assignedDoctorId && doctorOwnerData && (
                    <View className="w-full mt-2">
                        <InfoCard icon={Stethoscope} label="Supervising Doctor" value={doctorOwnerData?.data?.fullName || "Unknown"} colorClass="text-cyan-500" />
                    </View>
                )}
                {scheduledSession && (
                    <View className="w-full mt-2">
                        <InfoCard
                            icon={Clock}
                            label="Next Session"
                            value={new Date(scheduledSession.scheduledAt).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                            colorClass="text-blue-500"
                        />
                    </View>
                )}
            </View>

            {/* Treatment Progress */}
            <View className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 mb-6">
                <ProgressTracker currentStep={patient?.progressStep || 0} processStatus={patient?.processStatus} />
            </View>

            {/* Divider */}
            <View className="h-[1px] bg-slate-100 dark:bg-slate-800/80 mb-6" />

            {/* Role-Based Actions placeholders */}
            {/* We will leave this out for now until we build the specific role actions or keep them in the main screen */}

            {/* Completed */}
            {patient?.status === "Completed" && (
                <View className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/60 dark:border-emerald-800/50 p-4 space-y-2 mb-6">
                    <View className="flex-row items-center gap-1.5 mb-1">
                        <CheckCircle2 size={16} color="#059669" />
                        <Text className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                            Treatment Completed
                        </Text>
                    </View>
                    {patient.completedAt && (
                        <Text className="text-xs text-emerald-600 dark:text-emerald-500">
                            {new Date(patient.completedAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
}

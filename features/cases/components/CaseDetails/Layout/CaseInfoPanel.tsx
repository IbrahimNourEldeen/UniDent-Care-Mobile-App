import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { User, Calendar, CheckCircle, Phone, MapPin, GraduationCap, Stethoscope, UserCircle, ClipboardList, BookUser, Clock } from 'lucide-react-native';
import { getPatientStatusConfig } from '../../../utils/CaseDetails.utils';
import InfoCard from '../Shared/InfoCard';
import ProgressTracker from './ProgressTracker';
import StudentActions from './StudentActions';
import DoctorActions from './DoctorActions/DoctorActions';
import { useCase } from '@/features/cases/context/CaseContext';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

interface PatientInfoPanelProps {
    role: string | null;
    onRefetch: () => void;
}

export default function CaseInfoPanel({ role, onRefetch }: PatientInfoPanelProps) {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';

    const { caseData, creatorData, doctorOwnerData, studentOwnerData, refetchUserData, refetchSessions, refetchDoctorRequests, scheduledSession } = useCase();
    const patient: any = caseData; // Temporary typing until we migrate CaseDetails.types.ts
    const sc = getPatientStatusConfig(patient.status);

    useEffect(() => {
        refetchUserData();
        refetchSessions();
        refetchDoctorRequests();
    }, [refetchUserData, refetchSessions, refetchDoctorRequests]);

    const initials = patient.patientName
        ? patient.patientName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
        : "?";

    return (
        <View className="space-y-5 px-5">
            {/* Patient Identity */}
            <View className="flex-row items-center gap-3.5 mt-2">
                <View className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${isDark ? 'bg-slate-800 shadow-none' : 'bg-slate-100 shadow-slate-200/50'}`}>
                    <Text className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>{initials}</Text>
                </View>
                <View className="flex-1">
                    <Text className={`text-xl sm:text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`} numberOfLines={1}>
                        {patient.patientName}
                    </Text>
                    <Text className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {patient.caseType || patient.caseType?.name || 'General'} Case{patient.diagnoses?.[0]?.stage == 0 ? ` · AI Exam` : ''}
                    </Text>
                </View>
            </View>

            {/* Divider */}
            <View className={`h-px ${isDark ? 'bg-slate-800/80' : 'bg-slate-100'}`} />

            {/* Description */}
            {patient.description && (
                <Text className={`text-[13px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {patient.description}
                </Text>
            )}

            {/* Info Grid */}
            <View className="flex-row flex-wrap justify-between gap-y-3">
                <View className="w-[48%]">
                    <InfoCard icon={User} label="Age" value={`${patient.patientAge} years`} colorClass="text-blue-500" />
                </View>
                <View className="w-[48%]">
                    <InfoCard icon={Phone} label="Phone" value={patient.phone || "Not Provided"} colorClass="text-emerald-500" />
                </View>
                <View className="w-[48%]">
                    <InfoCard icon={MapPin} label="City" value={patient.city || "Not Provided"} colorClass="text-rose-500" />
                </View>
                <View className="w-[48%]">
                    <InfoCard icon={GraduationCap} label="University" value={patient.universityName || "Not Assigned"} colorClass="text-indigo-500" />
                </View>
                <View className="w-[48%]">
                    <InfoCard icon={Calendar} label="Created At" value={new Date(patient.createAt || patient.createdAt).toLocaleDateString()} colorClass="text-violet-500" />
                </View>
                <View className="w-[48%]">
                    <InfoCard icon={ClipboardList} label="Total Sessions" value={`${patient.totalSessions || 0}`} colorClass="text-violet-500" />
                </View>
                
                {patient.createdByRole?.toLowerCase() !== "patient" && creatorData && (
                    <View className="w-[48%]">
                        <InfoCard icon={UserCircle} label="Created By" value={creatorData?.data?.fullName || "Unknown"} colorClass="text-teal-500" />
                    </View>
                )}
                {patient.assignedStudentId && studentOwnerData && (
                    <View className="w-[48%]">
                        <InfoCard icon={BookUser} label="Assigned Student" value={studentOwnerData?.data?.fullName || "Unknown"} colorClass="text-cyan-500" />
                    </View>
                )}
                {patient.assignedDoctorId && doctorOwnerData && (
                    <View className="w-[48%]">
                        <InfoCard icon={Stethoscope} label="Supervising Doctor" value={doctorOwnerData?.data?.fullName || "Unknown"} colorClass="text-cyan-500" />
                    </View>
                )}
                {scheduledSession && (() => {
                    const status = scheduledSession.status?.toString().toLowerCase();
                    const isExpired = status === "expired" || status === "3" || (() => {
                        const sd = new Date(scheduledSession.scheduledAt);
                        sd.setHours(0, 0, 0, 0);
                        const td = new Date();
                        td.setHours(0, 0, 0, 0);
                        return sd.getTime() < td.getTime();
                    })();

                    if (isExpired) return null;

                    return (
                        <View className="w-[48%]">
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
                    );
                })()}
            </View>

            {/* Treatment Progress */}
            <View className={`mt-4 pt-6 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-100'}`}>
                <ProgressTracker status={patient.status} createdByRole={patient.createdByRole} diagnosisdto={patient.diagnoses ?? (patient.diagnosisdto ? [patient.diagnosisdto] : null)} />
            </View>

            {/* Divider */}
            <View className={`h-px my-6 ${isDark ? 'bg-slate-800/80' : 'bg-slate-100'}`} />

            {/* Role-Based Actions */}
            {(patient.userFlags?.isAssignedStudent || patient.userFlags?.hasRequest || !patient.assignedStudentId) && role === "Student" && (
                <StudentActions patient={patient} onRefetch={onRefetch} />
            )}

            {(patient.userFlags?.isAssignedDoctor || patient.userFlags?.hasRequest) && role === "Doctor" && (
                <DoctorActions patient={patient} onRefetch={onRefetch} />
            )}

            {/* Completed */}
            {patient.status === "Completed" && (
                <View className="space-y-4">
                    <View className={`rounded-2xl p-4 border space-y-2 ${isDark ? 'bg-emerald-900/10 border-emerald-800/50' : 'bg-emerald-50 border-emerald-200/60'}`}>
                        <View className="flex-row items-center gap-1.5">
                            <CheckCircle size={16} color={isDark ? '#10b981' : '#059669'} />
                            <Text className={`text-sm font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                Treatment Completed
                            </Text>
                        </View>
                        {patient.completedAt && (
                            <Text className={`text-xs ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`}>
                                {new Date(patient.completedAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                            </Text>
                        )}
                    </View>
                </View>
            )}
        </View>
    );
}

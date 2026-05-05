import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import DentalImageGallery from '../components/CaseDetails/Clinical/DentalImageGallery';
import CaseInfoPanel from '../components/CaseDetails/Layout/CaseInfoPanel';
import PatientDetailTabs from '../components/CaseDetails/Tabs/CaseDetailTabs';
import CaseDetailsSkeleton from '../components/CaseDetails/Layout/CaseDetailsSkeleton';
import CaseDetailsTopBar from '../components/CaseDetails/Layout/CaseDetailsTopBar';
import { useCaseDetails } from '../hooks/useCaseDetails';
import { CaseProvider } from '../context/CaseContext';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

export default function CaseDetailsScreen({ caseId }: { caseId: string }) {
    const { patient, isLoading, status, role, studentId, refetch } = useCaseDetails(caseId);
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';

    return (
        <CaseProvider caseData={patient} caseId={caseId} isLoading={isLoading} refetch={refetch}>
            <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
                {/* ═══ Top Bar ═══ */}
                <CaseDetailsTopBar currentStatus={status} patientName={patient?.patientName || ""} />

                {/* ═══ Content ═══ */}
                {isLoading ? (
                    <CaseDetailsSkeleton />
                ) : !patient ? (
                    <View className="flex-1 items-center justify-center p-10">
                        <Text className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Case not found.</Text>
                    </View>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}>
                        <View className="space-y-6 mt-4">
                            {/* IMAGE GALLERY */}
                            <DentalImageGallery images={patient.imageUrls || []} />

                            {/* INFO PANEL */}
                            <View className={`rounded-3xl border p-5 shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                                <CaseInfoPanel role={role} onRefetch={refetch} />
                            </View>

                            {/* TABS (Odontogram, Timeline, Medical, etc) */}
                            <PatientDetailTabs />
                        </View>
                    </ScrollView>
                )}
            </View>
        </CaseProvider>
    );
}

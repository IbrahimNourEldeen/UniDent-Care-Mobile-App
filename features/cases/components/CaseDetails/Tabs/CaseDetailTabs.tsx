import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Odontogram from '../Clinical/Odontogram';
import ActivityTimeline from '../Tracking/ActivityTimeline';
import MedicalInfoTab from './parts/MedicalInfoTab';
import BeforeAfterTab from './parts/BeforeAfterTab';
import DentalImageGallery from '../Clinical/DentalImageGallery';
import { useCase } from '@/features/cases/context/CaseContext';
import { getTabsForStatus } from '@/features/cases/utils/CaseDetails.utils';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

export default function CaseDetailTabs() {
    const role = useSelector((state: RootState) => state.auth.role);
    const { caseData } = useCase();
    const patient: any = caseData;
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';

    const tabs = getTabsForStatus(patient.status);
    const [activeTab, setActiveTab] = useState(tabs[0]?.key || 'odontogram');

    useEffect(() => {
        const newTabs = getTabsForStatus(patient.status);
        if (newTabs.length > 0) {
            setActiveTab(newTabs[0].key);
        }
    }, [patient.status]);

    return (
        <View className={`rounded-2xl border overflow-hidden mt-2 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            {/* Tab Headers */}
            <View className={`border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4 }}>
                    {tabs.map(({ key, label }) => (
                        <TouchableOpacity
                            key={key}
                            onPress={() => setActiveTab(key)}
                            activeOpacity={0.7}
                            className="relative px-5 py-4 justify-center"
                        >
                            <Text className={`text-[13px] font-semibold whitespace-nowrap ${activeTab === key ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-slate-400' : 'text-slate-500')}`}>
                                {label}
                            </Text>
                            {activeTab === key && (
                                <View className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-indigo-500 rounded-full" />
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Tab Content */}
            <View className="p-5 sm:p-7">
                {activeTab === "odontogram" && <Odontogram />}
                {activeTab === "medical" && <MedicalInfoTab medicalHistory={patient.medicalHistory} medications={patient.medications} />}
                {activeTab === "gallery" && <DentalImageGallery images={patient.imageUrls || []} />}
                {activeTab === "timeline" && <ActivityTimeline caseId={patient.id} />}
                {activeTab === "beforeAfter" && (
                    <BeforeAfterTab
                        beforeImageUrls={patient.beforeImageUrls}
                        afterImageUrls={patient.afterImageUrls}
                        defaultImageUrls={patient.imageUrls || []}
                    />
                )}
            </View>
        </View>
    );
}

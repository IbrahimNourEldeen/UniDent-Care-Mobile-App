import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { getTabsForStatus } from '../../../utils/CaseDetails.utils';
import WebOdontogram from '../Clinical/WebOdontogram';
import ActivityTimeline from '../Tracking/ActivityTimeline';
import BeforeAfterTab from './parts/BeforeAfterTab';
import MedicalInfoTab from './parts/MedicalInfoTab';

interface CaseDetailTabsProps {
    patient: any;
    isDark: boolean;
    // We can allow passing extra content like sessions
    sessionsContent?: React.ReactNode;
    totalSessionsCount?: number;
}

export default function CaseDetailTabs({ patient, isDark, sessionsContent, totalSessionsCount = 0 }: CaseDetailTabsProps) {
    // Get tabs from util, but append Sessions for mobile
    const baseTabs = getTabsForStatus(patient?.status || "Pending");
    const tabs = [...baseTabs, { key: "sessions", label: "Sessions" }];

    const [activeTab, setActiveTab] = useState(tabs[0].key);

    useEffect(() => {
        const newTabs = getTabsForStatus(patient?.status || "Pending");
        setActiveTab(newTabs[0].key);
    }, [patient?.status]);

    return (
        <View className="mb-8">
            <View className={`flex-row rounded-2xl p-1.5 ${isDark ? 'bg-slate-900' : 'bg-slate-200/60'}`}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {tabs.map((tab) => {
                        const active = activeTab === tab.key;
                        return (
                            <TouchableOpacity
                                key={tab.key}
                                onPress={() => setActiveTab(tab.key)}
                                className={`px-4 py-3 flex-row items-center justify-center gap-1.5 rounded-xl ${
                                    active ? (isDark ? 'bg-indigo-600 shadow-md' : 'bg-white shadow-sm') : 'bg-transparent'
                                }`}
                            >
                                <Text
                                    className={`text-[11px] font-bold uppercase tracking-wider ${
                                        active ? (isDark ? 'text-white' : 'text-indigo-600') : (isDark ? 'text-slate-400' : 'text-slate-500')
                                    }`}
                                >
                                    {tab.label}
                                </Text>
                                {tab.key === 'sessions' && totalSessionsCount > 0 && (
                                    <View className={`px-1.5 py-0.5 rounded-md ${active ? 'bg-white/20' : (isDark ? 'bg-slate-800' : 'bg-slate-300')}`}>
                                        <Text className={`text-[9px] font-bold ${active ? 'text-white' : (isDark ? 'text-slate-400' : 'text-slate-600')}`}>
                                            {totalSessionsCount}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            <View className="mt-6">
                {activeTab === 'odontogram' && (
                    <WebOdontogram
                        initialTeeth={patient?.diagnosisdto?.teeth || (patient?.diagnosisdto?.teethNumbers || []).map((n: number) => ({ number: n, status: 'needs-treatment' }))}
                        readonly={patient?.status === 'Available' || patient?.status === 'Unassigned'}
                        status={patient?.status}
                    />
                )}
                {activeTab === 'medical' && (
                    <MedicalInfoTab medicalHistory={patient?.medicalHistory} medications={patient?.medications} />
                )}
                {activeTab === 'timeline' && (
                    <ActivityTimeline events={patient?.timeline} />
                )}
                {activeTab === 'beforeAfter' && (
                    <BeforeAfterTab
                        beforeImageUrls={patient?.beforeImageUrls}
                        afterImageUrls={patient?.afterImageUrls}
                        defaultImageUrls={patient?.imageUrls}
                    />
                )}
                {activeTab === 'sessions' && sessionsContent}
            </View>
        </View>
    );
}

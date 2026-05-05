import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import CaseDetailsScreen from '@/features/cases/screens/CaseDetails.Screen';

export default function CaseDetailsRoute() {
    const { id } = useLocalSearchParams<{ id: string }>();

    if (!id) return null;

    return <CaseDetailsScreen caseId={id} />;
}

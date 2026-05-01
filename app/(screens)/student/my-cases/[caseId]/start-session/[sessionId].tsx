import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import StartSessionScreen from '@/features/cases/screens/StartSession.Screen';

export default function StartSessionRoute() {
    const { caseId, sessionId } = useLocalSearchParams<{ caseId: string; sessionId: string }>();

    return <StartSessionScreen caseId={caseId as string} sessionId={sessionId as string} />;
}

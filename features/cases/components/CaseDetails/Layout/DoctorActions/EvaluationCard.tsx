import React from 'react';
import { View, Text } from 'react-native';
import { Star, Info } from 'lucide-react-native';
import { useCase } from '@/features/cases/context/CaseContext';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

/**
 * EvaluationCard – shown to the assigned doctor when a session
 * needs evaluation. Mirrors the web project's DoctorActions alert block.
 */
export default function EvaluationCard() {
    const { caseData } = useCase();
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';

    const patient = caseData as any;

    // Only render when the doctor has a session to evaluate
    if (
        !patient?.userFlags?.isAssignedDoctor ||
        !patient?.hasEvaluatedSession ||
        !patient?.assignedStudentId
    ) {
        return null;
    }

    return (
        <View
            style={{
                marginTop: 16,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: isDark ? 'rgba(67,56,202,0.5)' : '#c7d2fe',
                backgroundColor: isDark ? 'rgba(49,46,129,0.1)' : 'rgba(238,242,255,0.5)',
                padding: 16,
                gap: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.03,
                shadowRadius: 4,
                elevation: 1,
            }}
        >
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View
                    style={{
                        padding: 6,
                        borderRadius: 10,
                        backgroundColor: isDark ? 'rgba(67,56,202,0.3)' : '#e0e7ff',
                    }}
                >
                    <Star size={18} color={isDark ? '#818cf8' : '#4f46e5'} />
                </View>
                <Text
                    style={{
                        fontSize: 11,
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        color: isDark ? '#818cf8' : '#4f46e5',
                    }}
                >
                    Action Required
                </Text>
            </View>

            {/* Body */}
            <View style={{ gap: 4 }}>
                <Text
                    style={{
                        fontSize: 14,
                        fontWeight: '700',
                        color: isDark ? '#f1f5f9' : '#1e293b',
                    }}
                >
                    You have a Session to Evaluate
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
                    <Info size={14} color={isDark ? '#818cf8' : '#6366f1'} style={{ marginTop: 2 }} />
                    <Text
                        style={{
                            fontSize: 12,
                            color: isDark ? '#94a3b8' : '#64748b',
                            lineHeight: 18,
                            flex: 1,
                        }}
                    >
                        Check the{' '}
                        <Text style={{ fontWeight: '700', color: isDark ? '#818cf8' : '#4f46e5' }}>
                            Timeline Tab
                        </Text>{' '}
                        below to select the session and start evaluation.
                    </Text>
                </View>
            </View>
        </View>
    );
}

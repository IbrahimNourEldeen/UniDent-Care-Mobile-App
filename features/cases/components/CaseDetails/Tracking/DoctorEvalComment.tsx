import React from 'react';
import { View, Text } from 'react-native';
import { Award } from 'lucide-react-native';
import { TimelineSessionItem } from '@/features/cases/types/caseTypes';
import { gradeStyle } from '@/features/cases/services/gradeStyle';
import StarRow from './StarRow';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

interface Props {
    session: TimelineSessionItem;
    isDoctor: boolean;
    onEdit: () => void;
}

/**
 * Displays the doctor's evaluation bubble for a completed session.
 * Ported from the web project's DoctorEvalComment.tsx.
 */
export default function DoctorEvalComment({ session, isDoctor, onEdit }: Props) {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';

    // grade=0 with empty doctorNote = backend default, not a real evaluation
    const isRealEval = !(session.grade === 0 && !session.doctorNote?.trim());
    if (!isRealEval || !session.evaluteDoctorName) return null;

    const gs = gradeStyle(session.grade);

    const initials = session.evaluteDoctorName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    return (
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            {/* Avatar */}
            <View
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: '#0d9488',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{initials}</Text>
            </View>

            {/* Bubble */}
            <View style={{ flex: 1, minWidth: 0 }}>
                <View
                    style={{
                        backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                        borderRadius: 16,
                        borderTopLeftRadius: 4,
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        borderWidth: 1,
                        borderColor: gs.borderHex,
                    }}
                >
                    {/* Header row */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 8,
                            marginBottom: 8,
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text
                                style={{
                                    fontSize: 13,
                                    fontWeight: '700',
                                    color: isDark ? '#f1f5f9' : '#1e293b',
                                }}
                            >
                                Dr. {session.evaluteDoctorName}
                            </Text>
                            <View
                                style={{
                                    backgroundColor: isDark ? '#134e4a' : '#f0fdfa',
                                    paddingHorizontal: 6,
                                    paddingVertical: 2,
                                    borderRadius: 4,
                                    borderWidth: 1,
                                    borderColor: isDark ? '#0d9488' : '#99f6e4',
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 9,
                                        fontWeight: '700',
                                        color: isDark ? '#2dd4bf' : '#0d9488',
                                        textTransform: 'uppercase',
                                        letterSpacing: 0.5,
                                    }}
                                >
                                    Supervisor
                                </Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            {/* Grade pill */}
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 4,
                                    paddingHorizontal: 8,
                                    paddingVertical: 3,
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: gs.borderHex,
                                    backgroundColor: gs.bgHex,
                                }}
                            >
                                <Award size={10} color={gs.colorHex} />
                                <Text
                                    style={{
                                        fontSize: 12,
                                        fontWeight: '900',
                                        color: gs.colorHex,
                                    }}
                                >
                                    {session.grade}/20
                                </Text>
                            </View>
                            <StarRow grade={session.grade} />
                        </View>
                    </View>

                    {/* Feedback text */}
                    {session.doctorNote ? (
                        <Text
                            style={{
                                fontSize: 13,
                                color: isDark ? '#cbd5e1' : '#475569',
                                lineHeight: 20,
                            }}
                        >
                            {session.doctorNote}
                        </Text>
                    ) : null}

                    {/* Grade label chip */}
                    <View
                        style={{
                            alignSelf: 'flex-start',
                            marginTop: 8,
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderColor: gs.borderHex,
                            backgroundColor: gs.bgHex,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 10,
                                fontWeight: '700',
                                color: gs.colorHex,
                                textTransform: 'uppercase',
                                letterSpacing: 1,
                            }}
                        >
                            {gs.label}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

import React from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { Send, Sparkles } from 'lucide-react-native';
import { TimelineSessionItem } from '@/features/cases/types/caseTypes';
import { gradeStyle } from '@/features/cases/services/gradeStyle';
import { useSessionEvaluation } from '@/features/cases/hooks/useSessionEvaluation';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

interface Props {
    session: TimelineSessionItem;
    existing: boolean;
    onSuccess: () => void;
    onCancel: () => void;
}

/**
 * Panel for submitting or editing a session evaluation (grade + note).
 * Ported from the web project's SessionGradePanel.tsx.
 */
export default function SessionGradePanel({ session, existing, onSuccess, onCancel }: Props) {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';
    const { grade, setGrade, note, setNote, isFinal, setIsFinal, loading, handleSubmit } =
        useSessionEvaluation(session, existing, onSuccess);

    const gs = gradeStyle(grade);

    const cardBg = isDark ? '#0f172a' : '#ffffff';
    const borderColor = isDark ? '#1e293b' : '#e2e8f0';
    const subText = isDark ? '#94a3b8' : '#64748b';
    const inputText = isDark ? '#e2e8f0' : '#334155';
    const inputPlaceholder = isDark ? '#475569' : '#94a3b8';

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: cardBg,
                borderRadius: 16,
                borderTopLeftRadius: 4,
                borderWidth: 1,
                borderColor,
                overflow: 'hidden',
            }}
        >
            {/* ── Grade picker ── */}
            <View
                style={{
                    paddingHorizontal: 16,
                    paddingTop: 16,
                    paddingBottom: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: borderColor,
                }}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 12,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 10,
                            fontWeight: '700',
                            color: subText,
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                        }}
                    >
                        Grade / 20
                    </Text>
                    {/* Current grade badge */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4,
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: gs.borderHex,
                            backgroundColor: gs.bgHex,
                        }}
                    >
                        <Text style={{ fontSize: 13, fontWeight: '900', color: gs.colorHex }}>
                            {grade}
                        </Text>
                        <Text style={{ fontSize: 11, color: gs.colorHex, opacity: 0.6 }}>/20</Text>
                        <Text style={{ fontSize: 9, fontWeight: '700', color: gs.colorHex, opacity: 0.7 }}>
                            · {gs.label}
                        </Text>
                    </View>
                </View>

                {/* Number grid 0–20 */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {Array.from({ length: 21 }, (_, i) => i).map((n) => (
                        <TouchableOpacity
                            key={n}
                            onPress={() => setGrade(n)}
                            activeOpacity={0.7}
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor:
                                    grade === n
                                        ? '#4f46e5'
                                        : isDark
                                        ? '#1e293b'
                                        : '#f1f5f9',
                                borderWidth: grade === n ? 2 : 0,
                                borderColor: grade === n ? '#818cf8' : 'transparent',
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 11,
                                    fontWeight: '700',
                                    color: grade === n ? '#fff' : subText,
                                }}
                            >
                                {n}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Progress bar */}
                <View
                    style={{
                        marginTop: 12,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
                        overflow: 'hidden',
                    }}
                >
                    <View
                        style={{
                            height: '100%',
                            width: `${(grade / 20) * 100}%`,
                            borderRadius: 3,
                            backgroundColor: gs.colorHex,
                        }}
                    />
                </View>
            </View>

            {/* ── Feedback textarea ── */}
            <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
                <TextInput
                    value={note}
                    onChangeText={setNote}
                    placeholder="Write your clinical feedback…"
                    placeholderTextColor={inputPlaceholder}
                    multiline
                    numberOfLines={3}
                    style={{
                        fontSize: 13,
                        color: inputText,
                        lineHeight: 20,
                        textAlignVertical: 'top',
                        minHeight: 72,
                    }}
                />
            </View>

            {/* ── Footer ── */}
            <View
                style={{
                    paddingHorizontal: 16,
                    paddingBottom: 16,
                    paddingTop: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    borderTopWidth: 1,
                    borderTopColor: isDark ? '#1e293b' : '#f1f5f9',
                }}
            >
                {/* Final session toggle */}
                <TouchableOpacity
                    onPress={() => setIsFinal(!isFinal)}
                    activeOpacity={0.8}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: isFinal
                            ? isDark ? '#4338ca' : '#a5b4fc'
                            : isDark ? '#334155' : '#e2e8f0',
                        backgroundColor: isFinal
                            ? isDark ? '#1e1b4b' : '#eef2ff'
                            : 'transparent',
                    }}
                >
                    <Sparkles size={10} color={isFinal ? '#6366f1' : subText} />
                    <Text
                        style={{
                            fontSize: 11,
                            fontWeight: '600',
                            color: isFinal ? '#6366f1' : subText,
                        }}
                    >
                        Final session
                    </Text>
                </TouchableOpacity>

                {/* Action buttons */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <TouchableOpacity
                        onPress={onCancel}
                        activeOpacity={0.8}
                        style={{
                            paddingHorizontal: 14,
                            paddingVertical: 8,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: isDark ? '#475569' : '#fca5a5',
                            backgroundColor: isDark ? '#1e293b' : '#fff1f2',
                        }}
                    >
                        <Text style={{ fontSize: 12, fontWeight: '600', color: isDark ? '#94a3b8' : '#ef4444' }}>
                            Cancel
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={loading}
                        activeOpacity={0.8}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                            paddingHorizontal: 14,
                            paddingVertical: 8,
                            borderRadius: 10,
                            backgroundColor: loading ? '#6366f1aa' : '#4f46e5',
                            opacity: loading ? 0.8 : 1,
                        }}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Send size={11} color="#fff" />
                        )}
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>
                            {loading ? 'Saving…' : existing ? 'Update' : 'Post'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

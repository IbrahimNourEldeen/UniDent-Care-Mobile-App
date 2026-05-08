import { useSessionEvaluation } from '@/features/cases/hooks/useSessionEvaluation';
import { gradeStyle } from '@/features/cases/services/gradeStyle';
import { TimelineSessionItem } from '@/features/cases/types/caseTypes';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { Send, Sparkles, X } from 'lucide-react-native';
import React from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Props {
    session: TimelineSessionItem;
    existing: boolean;
    onSuccess: () => void;
    onCancel: () => void;
    visible: boolean;
}

/**
 * Panel for submitting or editing a session evaluation (grade + note).
 * Now displayed as a modal for better screen space management.
 */
export default function SessionGradePanel({ session, existing, onSuccess, onCancel, visible }: Props) {
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
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View
                style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 16,
                }}
            >
                <View
                    style={{
                        width: '100%',
                        maxWidth: 500,
                        maxHeight: Dimensions.get('window').height * 0.85,
                        backgroundColor: cardBg,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor,
                        overflow: 'hidden',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.3,
                        shadowRadius: 20,
                        elevation: 10,
                    }}
                >
                    {/* Modal Header */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingHorizontal: 20,
                            paddingVertical: 16,
                            borderBottomWidth: 1,
                            borderBottomColor: borderColor,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: '700',
                                color: isDark ? '#fff' : '#1e293b',
                            }}
                        >
                            {existing ? 'Edit Evaluation' : 'Evaluate Session'}
                        </Text>
                        <TouchableOpacity
                            onPress={onCancel}
                            activeOpacity={0.7}
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                            }}
                        >
                            <X size={18} color={subText} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    >
                        <View
                            style={{
                                flex: 1,
                            }}
                        >
                            {/* ── Grade picker ── */}
                            <View
                                style={{
                                    paddingHorizontal: 20,
                                    paddingTop: 20,
                                    paddingBottom: 16,
                                }}
                            >
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginBottom: 16,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 11,
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
                                            paddingHorizontal: 12,
                                            paddingVertical: 6,
                                            borderRadius: 12,
                                            borderWidth: 1,
                                            borderColor: gs.borderHex,
                                            backgroundColor: gs.bgHex,
                                        }}
                                    >
                                        <Text style={{ fontSize: 15, fontWeight: '900', color: gs.colorHex }}>
                                            {grade}
                                        </Text>
                                        <Text style={{ fontSize: 12, color: gs.colorHex, opacity: 0.6 }}>/20</Text>
                                        <Text style={{ fontSize: 10, fontWeight: '700', color: gs.colorHex, opacity: 0.7 }}>
                                            · {gs.label}
                                        </Text>
                                    </View>
                                </View>

                                {/* Number grid 0–20 */}
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                    {Array.from({ length: 21 }, (_, i) => i).map((n) => (
                                        <TouchableOpacity
                                            key={n}
                                            onPress={() => setGrade(n)}
                                            activeOpacity={0.7}
                                            style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 10,
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
                                                    fontSize: 12,
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
                                        marginTop: 16,
                                        height: 8,
                                        borderRadius: 4,
                                        backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <View
                                        style={{
                                            height: '100%',
                                            width: `${(grade / 20) * 100}%`,
                                            borderRadius: 4,
                                            backgroundColor: gs.colorHex,
                                        }}
                                    />
                                </View>
                            </View>

                            {/* ── Feedback textarea ── */}
                            <View style={{ paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: borderColor }}>
                                <Text
                                    style={{
                                        fontSize: 11,
                                        fontWeight: '700',
                                        color: subText,
                                        textTransform: 'uppercase',
                                        letterSpacing: 1,
                                        marginBottom: 12,
                                    }}
                                >
                                    Clinical Feedback
                                </Text>
                                <View
                                    style={{
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        borderColor: isDark ? '#334155' : '#e2e8f0',
                                        backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                                        padding: 12,
                                    }}
                                >
                                    <TextInput
                                        value={note}
                                        onChangeText={setNote}
                                        placeholder="Write your clinical feedback…"
                                        placeholderTextColor={inputPlaceholder}
                                        multiline
                                        numberOfLines={4}
                                        style={{
                                            fontSize: 13,
                                            color: inputText,
                                            lineHeight: 20,
                                            textAlignVertical: 'top',
                                            minHeight: 100,
                                        }}
                                    />
                                </View>
                            </View>

                            {/* ── Final session toggle ── */}
                            <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
                                <TouchableOpacity
                                    onPress={() => setIsFinal(!isFinal)}
                                    activeOpacity={0.8}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 8,
                                        paddingHorizontal: 14,
                                        paddingVertical: 10,
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        borderColor: isFinal
                                            ? isDark ? '#4338ca' : '#a5b4fc'
                                            : isDark ? '#334155' : '#e2e8f0',
                                        backgroundColor: isFinal
                                            ? isDark ? '#1e1b4b' : '#eef2ff'
                                            : 'transparent',
                                    }}
                                >
                                    <Sparkles size={14} color={isFinal ? '#6366f1' : subText} />
                                    <Text
                                        style={{
                                            fontSize: 13,
                                            fontWeight: '600',
                                            color: isFinal ? '#6366f1' : subText,
                                        }}
                                    >
                                        Mark as final session
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>

                    {/* ── Footer Actions ── */}
                    <View
                        style={{
                            paddingHorizontal: 20,
                            paddingVertical: 16,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: 12,
                            borderTopWidth: 1,
                            borderTopColor: borderColor,
                        }}
                    >
                        <TouchableOpacity
                            onPress={onCancel}
                            activeOpacity={0.8}
                            style={{
                                paddingHorizontal: 20,
                                paddingVertical: 10,
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: isDark ? '#475569' : '#e2e8f0',
                                backgroundColor: isDark ? '#1e293b' : '#fff',
                            }}
                        >
                            <Text style={{ fontSize: 13, fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
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
                                gap: 8,
                                paddingHorizontal: 20,
                                paddingVertical: 10,
                                borderRadius: 12,
                                backgroundColor: loading ? '#6366f1aa' : '#4f46e5',
                                opacity: loading ? 0.8 : 1,
                            }}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Send size={14} color="#fff" />
                            )}
                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>
                                {loading ? 'Saving…' : existing ? 'Update Evaluation' : 'Submit Evaluation'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

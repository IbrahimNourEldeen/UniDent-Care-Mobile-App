import { getSessionTimeline } from '@/features/cases/services/caseService';
import { TimelineSessionItem } from '@/features/cases/types/caseTypes';
import { showToast } from '@/store/slices/uiSlice';
import { RootState } from '@/store/store';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import {
    CalendarDays,
    ClipboardList,
    Clock,
    MapPin,
    MessageSquareText,
    Star
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import DoctorEvalComment from './DoctorEvalComment';
import SessionGradePanel from './SessionGradePanel';

function formatDate(ts: string) {
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatTime(ts: string) {
    return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function TimelineSkeleton() {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';
    const shimmer = isDark ? '#1e293b' : '#f1f5f9';
    return (
        <View style={{ gap: 24 }}>
            {[0, 1, 2].map((i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 16 }}>
                    <View style={{ alignItems: 'center' }}>
                        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: shimmer }} />
                        {i < 2 && (
                            <View style={{ width: 2, flex: 1, marginTop: 8, backgroundColor: shimmer, borderRadius: 1 }} />
                        )}
                    </View>
                    <View
                        style={{
                            flex: 1,
                            borderRadius: 16,
                            padding: 20,
                            borderWidth: 1,
                            backgroundColor: isDark ? '#0f172a' : '#fff',
                            borderColor: isDark ? '#1e293b' : '#f1f5f9',
                        }}
                    >
                        <View style={{ height: 16, width: 144, borderRadius: 8, marginBottom: 8, backgroundColor: shimmer }} />
                        <View style={{ height: 12, width: 208, borderRadius: 6, marginBottom: 12, backgroundColor: shimmer }} />
                        <View style={{ height: 56, borderRadius: 12, backgroundColor: shimmer }} />
                    </View>
                </View>
            ))}
        </View>
    );
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState() {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';
    return (
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
            <View
                style={{
                    width: 64,
                    height: 64,
                    borderRadius: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    borderWidth: 1,
                    backgroundColor: isDark ? 'rgba(30,41,59,0.5)' : '#f8fafc',
                    borderColor: isDark ? 'rgba(51,65,85,0.5)' : '#e2e8f0',
                }}
            >
                <MessageSquareText size={24} color={isDark ? '#475569' : '#cbd5e1'} />
            </View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: isDark ? '#cbd5e1' : '#475569', textAlign: 'center' }}>
                No completed sessions yet
            </Text>
            <Text style={{ fontSize: 13, textAlign: 'center', marginTop: 6, paddingHorizontal: 40, lineHeight: 20, color: isDark ? '#64748b' : '#94a3b8' }}>
                Sessions will appear here once completed.
            </Text>
        </View>
    );
}

// ── Session Card ──────────────────────────────────────────────────────────────
function SessionCard({
    session,
    index,
    isLast,
    role,
    userId,
    onRefresh,
}: {
    session: TimelineSessionItem;
    index: number;
    isLast: boolean;
    role: string | null;
    userId: string | null;
    onRefresh: () => void;
}) {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';

    const isEvaluated = !(session.grade === 0 && !session.doctorNote?.trim());
    const isDone = ['done', 'completed'].includes(session.status?.toLowerCase() ?? '');
    const isDoctor = role === 'Doctor';
    const isAssignedEvaluator = !session.evaluteDoctorId || session.evaluteDoctorId === userId;
    const canEvaluate = isDoctor && isDone && isAssignedEvaluator;

    const [showEvalForm, setShowEvalForm] = useState(false);

    return (
        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 8 }}>
            {/* Left timeline rail */}
            <View style={{ alignItems: 'center', width: 44 }}>
                <View
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: isEvaluated ? '#6366f1' : isDark ? '#1e293b' : '#f1f5f9',
                        borderWidth: 2,
                        borderColor: isEvaluated ? '#6366f1' : isDark ? '#334155' : '#e2e8f0',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Text
                        style={{
                            fontSize: 13,
                            fontWeight: '700',
                            color: isEvaluated ? '#fff' : isDark ? '#94a3b8' : '#64748b',
                        }}
                    >
                        {index + 1}
                    </Text>
                </View>
                {!isLast && (
                    <View
                        style={{
                            width: 2,
                            flex: 1,
                            marginTop: 4,
                            backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
                            borderRadius: 1,
                        }}
                    />
                )}
            </View>

            {/* Card */}
            <View
                style={{
                    flex: 1,
                    borderRadius: 16,
                    borderWidth: 1,
                    padding: 16,
                    marginBottom: 16,
                    backgroundColor: isDark ? '#0f172a' : '#fff',
                    borderColor: isDark ? '#1e293b' : '#f1f5f9',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.04,
                    shadowRadius: 8,
                    elevation: 2,
                }}
            >
                {/* Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <View>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: isDark ? '#fff' : '#1e293b' }}>
                            Session {index + 1}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                            <CalendarDays size={11} color={isDark ? '#94a3b8' : '#64748b'} />
                            <Text style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#64748b' }}>
                                {formatDate(session.scheduledAt)}
                            </Text>
                        </View>
                    </View>
                    <View
                        style={{
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 20,
                            backgroundColor: isEvaluated
                                ? isDark ? 'rgba(6,78,59,0.3)' : '#f0fdf4'
                                : isDark ? '#1e293b' : '#f8fafc',
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 10,
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                                color: isEvaluated
                                    ? isDark ? '#34d399' : '#059669'
                                    : isDark ? '#64748b' : '#94a3b8',
                            }}
                        >
                            {isEvaluated ? 'Evaluated' : 'Pending'}
                        </Text>
                    </View>
                </View>

                {/* Time & Location */}
                <View style={{ flexDirection: 'row', gap: 16, marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Clock size={11} color={isDark ? '#94a3b8' : '#64748b'} />
                        <Text style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#64748b' }}>
                            {formatTime(session.scheduledAt)}
                            {session.endAt ? ` – ${formatTime(session.endAt)}` : ''}
                        </Text>
                    </View>
                    {session.location ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <MapPin size={11} color={isDark ? '#94a3b8' : '#64748b'} />
                            <Text
                                style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#64748b' }}
                                numberOfLines={1}
                            >
                                {session.location}
                            </Text>
                        </View>
                    ) : null}
                </View>

                {/* Grade row */}
                {isEvaluated && session.grade !== undefined && session.grade > 0 && (
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                            borderRadius: 12,
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            marginBottom: 8,
                            backgroundColor: isDark ? 'rgba(120,53,15,0.2)' : '#fffbeb',
                        }}
                    >
                        <Star size={13} color="#f59e0b" fill="#f59e0b" />
                        <Text style={{ fontSize: 12, fontWeight: '600', color: isDark ? '#fcd34d' : '#92400e' }}>
                            Grade: {session.grade}/20
                        </Text>
                    </View>
                )}

                {/* Doctor note */}
                {session.doctorNote?.trim() ? (
                    <View
                        style={{
                            borderRadius: 12,
                            padding: 12,
                            marginBottom: 12,
                            borderWidth: 1,
                            backgroundColor: isDark ? 'rgba(49,46,129,0.1)' : 'rgba(238,242,255,0.6)',
                            borderColor: isDark ? 'rgba(67,56,202,0.4)' : '#e0e7ff',
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                            <ClipboardList size={11} color="#6366f1" />
                            <Text style={{ fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, color: '#6366f1' }}>
                                Doctor's Note
                            </Text>
                        </View>
                        <Text style={{ fontSize: 11, lineHeight: 18, color: isDark ? '#cbd5e1' : '#475569' }}>
                            {session.doctorNote}
                        </Text>
                    </View>
                ) : null}

                {/* ── Evaluation Section (Doctor only) ── */}
                <View style={{ gap: 12, marginTop: 4 }}>
                    {/* Existing eval comment */}
                    <DoctorEvalComment
                        session={session}
                        isDoctor={canEvaluate}
                        onEdit={() => setShowEvalForm(true)}
                    />

                    {/* Grade panel modal */}
                    {canEvaluate && (
                        <SessionGradePanel
                            session={session}
                            existing={isEvaluated}
                            visible={showEvalForm}
                            onSuccess={() => {
                                setShowEvalForm(false);
                                onRefresh();
                            }}
                            onCancel={() => setShowEvalForm(false)}
                        />
                    )}

                    {/* Add evaluation button */}
                    {canEvaluate && !isEvaluated && !showEvalForm && (
                        <TouchableOpacity
                            onPress={() => setShowEvalForm(true)}
                            activeOpacity={0.8}
                            style={{
                                paddingHorizontal: 16,
                                paddingVertical: 12,
                                borderRadius: 16,
                                borderWidth: 1,
                                borderStyle: 'dashed',
                                borderColor: isDark ? '#334155' : '#e2e8f0',
                                backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                            }}
                        >
                            <Text style={{ fontSize: 13, color: isDark ? '#475569' : '#94a3b8', textAlign: 'center' }}>
                                Add your evaluation for this session…
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ActivityTimeline({ caseId }: { caseId: string }) {
    const role = useSelector((state: RootState) => state.auth.role);
    const user = useSelector((state: RootState) => state.auth.user);
    const userId = (user as any)?.publicId ?? null;
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';
    const dispatch = useDispatch();

    const [sessions, setSessions] = useState<TimelineSessionItem[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getSessionTimeline(caseId, { pageSize: 100 });
            // API may return data directly or wrapped in res.data
            const items: any[] = res?.items ?? res?.data?.items ?? [];
            const done = items.filter((s: any) =>
                ['done', 'completed'].includes(s.status?.toLowerCase() ?? ''),
            );
            setSessions(done as TimelineSessionItem[]);
        } catch (e: any) {
            dispatch(showToast({ message: e.message || 'Failed to load sessions', type: 'error' }));
        } finally {
            setLoading(false);
        }
    }, [caseId, dispatch]);

    useEffect(() => {
        load();
    }, [load]);

    if (loading) return <TimelineSkeleton />;
    if (sessions.length === 0) return <EmptyState />;

    const evaluated = sessions.filter((s) => !(s.grade === 0 && !s.doctorNote?.trim())).length;

    return (
        <View>
            {/* Feed header */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 24,
                    paddingBottom: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: isDark ? '#1e293b' : '#f1f5f9',
                }}
            >
                <View>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: isDark ? '#fff' : '#1e293b' }}>
                        Clinical Sessions Timeline
                    </Text>
                    <Text style={{ fontSize: 11, marginTop: 2, color: isDark ? '#64748b' : '#94a3b8' }}>
                        {sessions.length} completed · {evaluated} evaluated
                    </Text>
                </View>
                {sessions.length > 0 && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontSize: 11, color: isDark ? '#64748b' : '#94a3b8' }}>
                            {Math.round((evaluated / sessions.length) * 100)}% reviewed
                        </Text>
                        <View
                            style={{
                                width: 80,
                                height: 6,
                                borderRadius: 3,
                                overflow: 'hidden',
                                backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                            }}
                        >
                            <View
                                style={{
                                    height: '100%',
                                    width: `${(evaluated / sessions.length) * 100}%`,
                                    borderRadius: 3,
                                    backgroundColor: '#6366f1',
                                }}
                            />
                        </View>
                    </View>
                )}
            </View>

            {/* Timeline */}
            <View>
                {sessions.map((session, i) => (
                    <SessionCard
                        key={session.id}
                        session={session}
                        index={i}
                        isLast={i === sessions.length - 1}
                        role={role}
                        userId={userId}
                        onRefresh={load}
                    />
                ))}
            </View>
        </View>
    );
}

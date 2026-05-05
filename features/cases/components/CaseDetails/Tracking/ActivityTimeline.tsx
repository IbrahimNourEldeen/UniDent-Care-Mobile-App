import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { MessageSquareText, Star, ClipboardList, MapPin, CalendarDays, Clock } from 'lucide-react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import api from '@/utils/api';
import { useDispatch } from 'react-redux';
import { showToast } from '@/store/slices/uiSlice';

interface TimelineSession {
    id: string;
    status: string;
    scheduledAt: string;
    endAt?: string;
    location?: string;
    grade?: number;
    doctorNote?: string;
    totalNotes?: number;
}

function formatDate(ts: string) {
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(ts: string) {
    return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function TimelineSkeleton() {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';
    const shimmer = isDark ? 'bg-slate-800' : 'bg-slate-100';
    return (
        <View className="gap-6">
            {[0, 1, 2].map((i) => (
                <View key={i} className="flex-row gap-4">
                    <View className="items-center">
                        <View className={`w-11 h-11 rounded-full ${shimmer}`} />
                        {i < 2 && <View className={`w-px flex-1 mt-2 ${shimmer}`} />}
                    </View>
                    <View className={`flex-1 rounded-2xl p-5 border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                        <View className={`h-4 w-36 rounded-lg mb-2 ${shimmer}`} />
                        <View className={`h-3 w-52 rounded mb-3 ${shimmer}`} />
                        <View className={`h-14 rounded-xl ${shimmer}`} />
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
        <View className="items-center justify-center py-20">
            <View className={`w-16 h-16 rounded-3xl items-center justify-center mb-4 border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                <MessageSquareText size={24} color={isDark ? '#475569' : '#cbd5e1'} />
            </View>
            <Text className={`text-base font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                No completed sessions yet
            </Text>
            <Text className={`text-sm text-center mt-1.5 px-10 leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Sessions will appear here once completed. Track your clinical progress over time.
            </Text>
        </View>
    );
}

// ── Session Card ──────────────────────────────────────────────────────────────
function SessionCard({ session, index, isLast }: { session: TimelineSession; index: number; isLast: boolean; }) {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';
    const isEvaluated = !(session.grade === 0 && !session.doctorNote?.trim());

    return (
        <View className="flex-row gap-4">
            {/* Left timeline */}
            <View className="items-center" style={{ width: 44 }}>
                <View
                    style={{
                        width: 44, height: 44, borderRadius: 22,
                        backgroundColor: isEvaluated ? '#6366f1' : isDark ? '#1e293b' : '#f1f5f9',
                        borderWidth: 2,
                        borderColor: isEvaluated ? '#6366f1' : isDark ? '#334155' : '#e2e8f0',
                        alignItems: 'center', justifyContent: 'center',
                    }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: isEvaluated ? '#fff' : isDark ? '#94a3b8' : '#64748b' }}>
                        {index + 1}
                    </Text>
                </View>
                {!isLast && (
                    <View style={{ width: 2, flex: 1, marginTop: 4, backgroundColor: isDark ? '#1e293b' : '#e2e8f0', borderRadius: 1 }} />
                )}
            </View>

            {/* Card */}
            <View className={`flex-1 rounded-2xl border p-4 mb-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>

                {/* Header */}
                <View className="flex-row items-center justify-between mb-3">
                    <View>
                        <Text className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            Session {index + 1}
                        </Text>
                        <View className="flex-row items-center gap-1.5 mt-0.5">
                            <CalendarDays size={11} color={isDark ? '#94a3b8' : '#64748b'} />
                            <Text className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {formatDate(session.scheduledAt)}
                            </Text>
                        </View>
                    </View>
                    <View className={`px-2.5 py-1 rounded-full ${isEvaluated
                        ? isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'
                        : isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        <Text className={`text-[10px] font-bold uppercase tracking-wider ${isEvaluated
                            ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                            : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {isEvaluated ? 'Evaluated' : 'Pending'}
                        </Text>
                    </View>
                </View>

                {/* Details row */}
                <View className="flex-row gap-4 mb-3">
                    <View className="flex-row items-center gap-1.5">
                        <Clock size={11} color={isDark ? '#94a3b8' : '#64748b'} />
                        <Text className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {formatTime(session.scheduledAt)}
                            {session.endAt ? ` – ${formatTime(session.endAt)}` : ''}
                        </Text>
                    </View>
                    {session.location && (
                        <View className="flex-row items-center gap-1.5">
                            <MapPin size={11} color={isDark ? '#94a3b8' : '#64748b'} />
                            <Text className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`} numberOfLines={1}>
                                {session.location}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Grade */}
                {isEvaluated && session.grade !== undefined && session.grade > 0 && (
                    <View className={`flex-row items-center gap-2 rounded-xl px-3 py-2 mb-2 ${isDark ? 'bg-amber-900/20' : 'bg-amber-50'}`}>
                        <Star size={13} color="#f59e0b" />
                        <Text className={`text-[12px] font-semibold ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                            Grade: {session.grade}/10
                        </Text>
                    </View>
                )}

                {/* Doctor Note */}
                {session.doctorNote?.trim() && (
                    <View className={`rounded-xl p-3 border ${isDark ? 'bg-indigo-900/10 border-indigo-800/40' : 'bg-indigo-50/60 border-indigo-100'}`}>
                        <View className="flex-row items-center gap-1.5 mb-1.5">
                            <ClipboardList size={11} color="#6366f1" />
                            <Text className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                                Doctor's Note
                            </Text>
                        </View>
                        <Text className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            {session.doctorNote}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ActivityTimeline({ caseId }: { caseId: string }) {
    const role = useSelector((state: RootState) => state.auth.role);
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';
    const dispatch = useDispatch();

    const [sessions, setSessions] = useState<TimelineSession[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/Sessions/case/${caseId}?pageNumber=1&pageSize=100`);
            if (res.data?.items) {
                const done = res.data.items.filter((s: any) =>
                    ['done', 'completed'].includes(s.status?.toLowerCase())
                );
                setSessions(done);
            }
        } catch (e: any) {
            dispatch(showToast({ message: e.message || 'Failed to load sessions', type: 'error' }));
        } finally {
            setLoading(false);
        }
    }, [caseId, dispatch]);

    useEffect(() => { load(); }, [load]);

    if (loading) return <TimelineSkeleton />;
    if (sessions.length === 0) return <EmptyState />;

    const evaluated = sessions.filter(s => !(s.grade === 0 && !s.doctorNote?.trim())).length;

    return (
        <View>
            {/* Feed header */}
            <View className={`flex-row items-center justify-between mb-6 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <View>
                    <Text className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        Clinical Sessions Timeline
                    </Text>
                    <Text className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {sessions.length} completed · {evaluated} evaluated
                    </Text>
                </View>
                {sessions.length > 0 && (
                    <View className="flex-row items-center gap-2">
                        <Text className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {Math.round((evaluated / sessions.length) * 100)}% reviewed
                        </Text>
                        <View className={`w-20 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            <View
                                className="h-full rounded-full bg-indigo-500"
                                style={{ width: `${(evaluated / sessions.length) * 100}%` }}
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
                    />
                ))}
            </View>
        </View>
    );
}

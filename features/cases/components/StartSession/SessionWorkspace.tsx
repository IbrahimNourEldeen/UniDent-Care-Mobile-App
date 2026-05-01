import React from 'react';
import { View, Text } from 'react-native';
import { ClipboardList, FileText } from 'lucide-react-native';
import { SessionDto } from '../../types/caseTypes';
import { SessionNoteDto } from '../../hooks/useSessionDetails';
import NoteCard from './NoteCard';
import AddNoteForm from './AddNoteForm';

interface SessionWorkspaceProps {
    session: SessionDto | null;
    notes: SessionNoteDto[];
    onAddNote?: (note: string, isPrivate: boolean, imageUrl?: string) => Promise<void>;
    noteLoading: boolean;
    isDark?: boolean;
}

export default function SessionWorkspace({
    session,
    notes,
    onAddNote,
    noteLoading,
    isDark = false,
}: SessionWorkspaceProps) {
    const textClass = isDark ? 'text-white' : 'text-slate-800';
    const subTextClass = isDark ? 'text-slate-400' : 'text-slate-500';

    return (
        <View className="space-y-5">
            {/* ═══ Session Info Header ═══ */}
            {session && (
                <View className={`rounded-[32px] p-5 sm:p-6 shadow-sm border ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                }`}>
                    <View className="flex-row items-center gap-3 mb-4">
                        <View className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-sm">
                            <ClipboardList size={18} color="#ffffff" />
                        </View>
                        <View>
                            <Text className={`text-base font-bold ${textClass}`}>Session Details</Text>
                            <Text className={`text-[11px] font-medium ${subTextClass}`}>Treatment workspace</Text>
                        </View>
                    </View>

                    <View className="flex-row flex-wrap gap-3">
                        <View className={`flex-1 min-w-[45%] rounded-xl px-3 py-2.5 border ${
                            isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50/70 border-slate-100/50'
                        }`}>
                            <Text className={`text-[10px] font-medium uppercase tracking-wider mb-1 ${
                                isDark ? 'text-slate-500' : 'text-slate-400'
                            }`}>Patient</Text>
                            <Text className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`} numberOfLines={1}>
                                {session.patientName || 'Unknown'}
                            </Text>
                        </View>

                        <View className={`flex-1 min-w-[45%] rounded-xl px-3 py-2.5 border ${
                            isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50/70 border-slate-100/50'
                        }`}>
                            <Text className={`text-[10px] font-medium uppercase tracking-wider mb-1 ${
                                isDark ? 'text-slate-500' : 'text-slate-400'
                            }`}>Treatment Type</Text>
                            <Text className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`} numberOfLines={1}>
                                {session.treatmentType || "General"}
                            </Text>
                        </View>

                        <View className={`flex-1 min-w-[45%] rounded-xl px-3 py-2.5 border ${
                            isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50/70 border-slate-100/50'
                        }`}>
                            <Text className={`text-[10px] font-medium uppercase tracking-wider mb-1 ${
                                isDark ? 'text-slate-500' : 'text-slate-400'
                            }`}>Scheduled</Text>
                            <Text className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                {session.scheduledAt ? new Date(session.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : 'No Date'}
                            </Text>
                        </View>

                        <View className={`flex-1 min-w-[45%] rounded-xl px-3 py-2.5 border ${
                            isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50/70 border-slate-100/50'
                        }`}>
                            <Text className={`text-[10px] font-medium uppercase tracking-wider mb-1 ${
                                isDark ? 'text-slate-500' : 'text-slate-400'
                            }`}>Status</Text>
                            <Text className={`text-sm font-semibold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                                {session.status}
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            {/* ═══ Notes Section ═══ */}
            <View className={`rounded-[32px] p-5 sm:p-6 shadow-sm border mt-5 ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
            }`}>
                <View className="flex-row items-center gap-2.5 mb-5">
                    <View className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center shadow-sm">
                        <FileText size={15} color="#ffffff" />
                    </View>
                    <View>
                        <Text className={`text-sm font-bold ${textClass}`}>Clinical Notes</Text>
                        <Text className={`text-[10px] ${subTextClass}`}>
                            {notes.length === 0
                                ? "No notes yet — add your first note below"
                                : `${notes.length} note${notes.length === 1 ? "" : "s"} recorded`
                            }
                        </Text>
                    </View>
                </View>

                {/* Notes Timeline */}
                {notes.length > 0 && (
                    <View className="mb-6">
                        {notes.map((n, i) => (
                            <View key={n.id} className="mb-4">
                                <NoteCard note={n as any} index={i} isDark={isDark} />
                            </View>
                        ))}
                    </View>
                )}

                {/* Empty State */}
                {notes.length === 0 && (
                    <View className="flex-col items-center justify-center py-10 mb-6 text-center">
                        <View className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                            isDark ? 'bg-slate-800' : 'bg-slate-100'
                        }`}>
                            <FileText size={28} color={isDark ? '#475569' : '#cbd5e1'} />
                        </View>
                        <Text className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Start documenting your session
                        </Text>
                        <Text className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Clinical notes will appear here as you add them
                        </Text>
                    </View>
                )}

                {/* Divider */}
                {session?.status?.toLowerCase() !== "cancelled" && onAddNote && (
                    <>
                        <View className={`h-px mb-5 ${isDark ? 'bg-slate-800/80' : 'bg-slate-100'}`} />

                        {/* Add Note Form */}
                        <AddNoteForm onSubmit={onAddNote} isLoading={noteLoading} isDark={isDark} />
                    </>
                )}
            </View>
        </View>
    );
}

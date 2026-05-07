import React from 'react';
import { View, Text } from 'react-native';
import { ClipboardList, FileText } from 'lucide-react-native';
import { SessionDto, SessionNoteItem } from '../../types/caseTypes';
import { MediaFile } from './AddNoteForm';
import NoteCard from './NoteCard';
import AddNoteForm from './AddNoteForm';

interface SessionWorkspaceProps {
  session: SessionDto | null;
  notes: SessionNoteItem[];
  onAddNote?: (note: string, mediaFiles?: MediaFile[]) => Promise<void>;
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
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';

  const isDone = session?.status?.toLowerCase() === 'done';
  const isCancelled = session?.status?.toLowerCase() === 'cancelled';

  return (
    <View className="space-y-5">
      {/* ═══ Session Info Header ═══ */}
      {session && (
        <View className={`rounded-[32px] p-5 shadow-sm border ${cardBg}`}>
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
            {/* Patient */}
            <View
              className={`flex-1 min-w-[45%] rounded-xl px-3 py-2.5 border ${
                isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50/70 border-slate-100/50'
              }`}
            >
              <Text
                className={`text-[10px] font-medium uppercase tracking-wider mb-1 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Patient
              </Text>
              <Text
                className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                numberOfLines={1}
              >
                {session.patientName || 'Unknown'}
              </Text>
            </View>

            {/* Treatment Type */}
            <View
              className={`flex-1 min-w-[45%] rounded-xl px-3 py-2.5 border ${
                isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50/70 border-slate-100/50'
              }`}
            >
              <Text
                className={`text-[10px] font-medium uppercase tracking-wider mb-1 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Treatment Type
              </Text>
              <Text
                className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                numberOfLines={1}
              >
                {session.treatmentType || 'General'}
              </Text>
            </View>

            {/* Scheduled */}
            <View
              className={`flex-1 min-w-[45%] rounded-xl px-3 py-2.5 border ${
                isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50/70 border-slate-100/50'
              }`}
            >
              <Text
                className={`text-[10px] font-medium uppercase tracking-wider mb-1 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Scheduled
              </Text>
              <Text
                className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
              >
                {session.scheduledAt
                  ? new Date(session.scheduledAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'No Date'}
              </Text>
            </View>

            {/* Status */}
            <View
              className={`flex-1 min-w-[45%] rounded-xl px-3 py-2.5 border ${
                isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50/70 border-slate-100/50'
              }`}
            >
              <Text
                className={`text-[10px] font-medium uppercase tracking-wider mb-1 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Status
              </Text>
              <Text
                className={`text-sm font-semibold ${
                  isDone
                    ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                    : isCancelled
                    ? isDark ? 'text-red-400' : 'text-red-600'
                    : isDark ? 'text-amber-400' : 'text-amber-600'
                }`}
              >
                {session.status || '—'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* ═══ Clinical Notes Section ═══ */}
      <View className={`rounded-[32px] overflow-hidden border shadow-sm ${cardBg}`}>
        {/* Header */}
        <View
          className={`flex-row items-center justify-between px-5 py-4 border-b ${
            isDark
              ? 'border-slate-800 bg-violet-950/20'
              : 'border-slate-100 bg-violet-50/60'
          }`}
        >
          <View className="flex-row items-center gap-3">
            <View className="w-9 h-9 rounded-xl bg-violet-500 flex items-center justify-center shadow-sm">
              <FileText size={15} color="#ffffff" />
            </View>
            <View>
              <Text className={`text-sm font-bold ${textClass}`}>Clinical Notes</Text>
              <Text className={`text-[10px] font-medium mt-0.5 ${subTextClass}`}>
                {notes.length === 0
                  ? 'No notes yet — start below'
                  : `${notes.length} note${notes.length === 1 ? '' : 's'} recorded`}
              </Text>
            </View>
          </View>

          {notes.length > 0 && (
            <View
              className={`w-7 h-7 rounded-full items-center justify-center ${
                isDark ? 'bg-violet-900/30' : 'bg-violet-100'
              }`}
            >
              <Text
                className={`text-[12px] font-bold ${
                  isDark ? 'text-violet-400' : 'text-violet-600'
                }`}
              >
                {notes.length}
              </Text>
            </View>
          )}
        </View>

        <View className="p-5">
          {/* Notes Timeline */}
          {notes.length > 0 && (
            <View className="mb-4">
              {notes.map((n, i) => (
                <NoteCard key={n.id} note={n} index={i} isDark={isDark} />
              ))}
            </View>
          )}

          {/* Empty State */}
          {notes.length === 0 && (
            <View className="items-center justify-center py-10 mb-4">
              <View
                className={`w-16 h-16 rounded-2xl items-center justify-center mb-4 shadow-inner ${
                  isDark ? 'bg-slate-800' : 'bg-slate-100'
                }`}
              >
                <FileText size={28} color={isDark ? '#475569' : '#cbd5e1'} />
              </View>
              <Text className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                Start documenting your session
              </Text>
              <Text className={`text-xs mt-1 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Clinical notes will appear here as you add them
              </Text>
            </View>
          )}

          {/* Add Note Form — only if session is active */}
          {!isDone && !isCancelled && onAddNote && (
            <>
              {/* Divider with label */}
              <View className="flex-row items-center gap-3 mb-4">
                <View className={`flex-1 h-px ${isDark ? 'bg-slate-800/80' : 'bg-slate-100'}`} />
                <Text
                  className={`text-[10px] font-bold uppercase tracking-widest px-1 ${
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  New Note
                </Text>
                <View className={`flex-1 h-px ${isDark ? 'bg-slate-800/80' : 'bg-slate-100'}`} />
              </View>

              <AddNoteForm onSubmit={onAddNote} isLoading={noteLoading} isDark={isDark} />
            </>
          )}
        </View>
      </View>
    </View>
  );
}

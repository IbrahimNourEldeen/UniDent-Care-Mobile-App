import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import api from '@/utils/api';
import { SessionDto } from '../types/caseTypes';
import { caseKeys } from './caseQueryKeys';

export interface SessionNoteDto {
  id: string;
  sessionId: string;
  note: string;
  createAt: string;
}

async function fetchSessionDetails(id: string): Promise<SessionDto> {
  const res = await api.get<{ data: SessionDto }>(`/Sessions/${id}`);
  return res.data.data;
}

async function fetchSessionNotes(id: string): Promise<SessionNoteDto[]> {
  const res = await api.get<{ data: SessionNoteDto[] }>(`/Sessions/${id}/notes`);
  return res.data.data || [];
}

async function updateStatusApi(sessionId: string, status: string) {
  const res = await api.patch(`/Sessions/${sessionId}/status`, { sessionId, status });
  return res.data;
}

async function addNoteApi(sessionId: string, note: string, isPrivate: boolean, imageUrl?: string) {
  // If imageUrl is undefined, we pass an empty string to ensure the backend receives a value if it expects one.
  // Note: if the backend strictly forbids unknown properties, this might return a 400.
  const res = await api.post(`/Sessions/${sessionId}/notes`, { 
    sessionId, 
    note, 
    isPrivate,
    imageUrl: imageUrl || ""
  });
  return res.data;
}

export function useSessionDetails(sessionId: string | null) {
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.auth.user);
  const studentId = (user as any)?.publicId ?? '';

  const detailsQuery = useQuery({
    queryKey: caseKeys.session(sessionId as string),
    queryFn: () => fetchSessionDetails(sessionId as string),
    enabled: !!sessionId,
  });

  const notesQuery = useQuery({
    queryKey: caseKeys.sessionNotes(sessionId as string),
    queryFn: () => fetchSessionNotes(sessionId as string),
    enabled: !!sessionId,
  });

  const isLoading = detailsQuery.isLoading || notesQuery.isLoading;
  const isError = detailsQuery.isError || notesQuery.isError;

  const statusMutation = useMutation({
    mutationFn: (newStatus: string) => updateStatusApi(sessionId as string, newStatus),
    onSuccess: () => {
      const caseId = detailsQuery.data?.caseId as string;
      // Refresh the single session so the detail screen reflects the new status
      queryClient.invalidateQueries({ queryKey: caseKeys.session(sessionId as string) });
      // Refresh the session list for the case (completedCount / scheduledCount)
      queryClient.invalidateQueries({ queryKey: caseKeys.sessions(caseId) });
      // Refresh the case detail (totalSessions progress bar)
      queryClient.invalidateQueries({ queryKey: caseKeys.detail(caseId) });
      // Refresh the student dashboard stats (completedSessions counter)
      if (studentId) {
        queryClient.invalidateQueries({ queryKey: caseKeys.studentStats(studentId) });
      }
    },
  });

  const noteMutation = useMutation({
    mutationFn: (data: { note: string; isPrivate: boolean; imageUrl?: string }) => 
        addNoteApi(sessionId as string, data.note, data.isPrivate, data.imageUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: caseKeys.sessionNotes(sessionId as string) });
    },
  });

  const refetchAll = async () => {
    await Promise.all([detailsQuery.refetch(), notesQuery.refetch()]);
  };

  return {
    session: detailsQuery.data,
    notes: notesQuery.data ?? [],
    isLoading,
    isError,
    refetchAll,
    updateStatus: statusMutation.mutateAsync,
    isUpdatingStatus: statusMutation.isPending,
    addNote: async (note: string, isPrivate: boolean, imageUrl?: string) => {
        await noteMutation.mutateAsync({ note, isPrivate, imageUrl });
    },
    isAddingNote: noteMutation.isPending,
  };
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import api from '@/utils/api';
import { SessionDto, SessionNoteItem, SessionMediaItem } from '../types/caseTypes';
import { caseKeys } from './caseQueryKeys';

export interface SessionNoteDto extends SessionNoteItem {}

async function fetchSessionDetails(id: string): Promise<SessionDto> {
  const res = await api.get<{ data: SessionDto }>(`/Sessions/${id}`);
  return res.data.data;
}

async function fetchSessionNotes(id: string): Promise<SessionNoteItem[]> {
  const res = await api.get<{ data: SessionNoteItem[] }>(`/Sessions/${id}/notes`);
  return res.data.data || [];
}

async function updateStatusApi(sessionId: string, status: string) {
  const res = await api.patch(`/Sessions/${sessionId}/status`, { sessionId, status });
  return res.data;
}

async function addNoteApi(sessionId: string, note: string): Promise<SessionNoteItem> {
  const res = await api.post<{ data: SessionNoteItem }>(`/Sessions/${sessionId}/notes`, {
    sessionId,
    note,
  });
  return res.data.data;
}

async function addNoteMediaApi(
  sessionId: string,
  noteId: string,
  fileUri: string,
  fileName: string,
  mimeType: string,
): Promise<SessionMediaItem> {
  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    name: fileName,
    type: mimeType,
  } as any);
  const res = await api.post<{ data: SessionMediaItem }>(
    `/Sessions/${sessionId}/notes/${noteId}/media`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return res.data.data;
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
      queryClient.invalidateQueries({ queryKey: caseKeys.session(sessionId as string) });
      queryClient.invalidateQueries({ queryKey: caseKeys.sessions(caseId) });
      queryClient.invalidateQueries({ queryKey: caseKeys.detail(caseId) });
      if (studentId) {
        queryClient.invalidateQueries({ queryKey: caseKeys.studentStats(studentId) });
      }
    },
  });

  /**
   * Adds a note then optionally uploads multiple media files.
   * Returns the created note (with medias populated).
   */
  const addNoteWithMedia = async (
    noteText: string,
    mediaFiles?: Array<{ uri: string; name: string; mimeType: string }>,
  ): Promise<void> => {
    // 1. Create the text note
    const createdNote = await addNoteApi(sessionId as string, noteText);

    // 2. Upload media sequentially
    if (mediaFiles && mediaFiles.length > 0) {
      for (const file of mediaFiles) {
        try {
          await addNoteMediaApi(
            sessionId as string,
            createdNote.id,
            file.uri,
            file.name,
            file.mimeType,
          );
        } catch {
          // continue uploading remaining files even if one fails
        }
      }
    }

    // 3. Refresh notes list so the UI shows new note + media
    queryClient.invalidateQueries({ queryKey: caseKeys.sessionNotes(sessionId as string) });
  };

  const noteMutation = useMutation({
    mutationFn: (data: {
      note: string;
      mediaFiles?: Array<{ uri: string; name: string; mimeType: string }>;
    }) => addNoteWithMedia(data.note, data.mediaFiles),
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
    addNote: async (
      note: string,
      mediaFiles?: Array<{ uri: string; name: string; mimeType: string }>,
    ) => {
      await noteMutation.mutateAsync({ note, mediaFiles });
    },
    isAddingNote: noteMutation.isPending,
  };
}

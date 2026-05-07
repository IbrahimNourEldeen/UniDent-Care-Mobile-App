import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { useDispatch } from 'react-redux';
import { showToast } from '@/store/slices/uiSlice';

import { useSessionDetails } from '../hooks/useSessionDetails';
import { useCaseDetails } from '../hooks/useCaseDetails';
import { MediaFile } from '../components/StartSession/AddNoteForm';

import ActionModal from '@/components/common/ActionModal';
import SessionTopBar from '../components/StartSession/SessionTopBar';
import SessionWorkspace from '../components/StartSession/SessionWorkspace';
import PatientSummaryCard from '../components/StartSession/PatientSummaryCard';
import DentalImageGallery from '../components/CaseDetails/Clinical/DentalImageGallery';

interface StartSessionScreenProps {
  caseId: string;
  sessionId: string;
}

export default function StartSessionScreen({ caseId, sessionId }: StartSessionScreenProps) {
  const router = useRouter();
  const { theme } = useThemeLanguage();
  const isDark = theme === 'dark';
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  // ── Data ─────────────────────────────────────────────────────────────────────
  const { patient, isLoading: caseLoading } = useCaseDetails(caseId);

  const {
    session,
    notes,
    isLoading: sessionLoading,
    updateStatus,
    addNote,
    isAddingNote,
  } = useSessionDetails(sessionId);

  const [showEndModal, setShowEndModal] = useState(false);
  const [endSessionLoading, setEndSessionLoading] = useState(false);

  const isLoading = caseLoading || sessionLoading;
  const bgClass = isDark ? 'bg-[#020617]' : 'bg-slate-50';

  // ── Auto-update Scheduled → InProgress (mirrors web SessionContent) ──────────
  useEffect(() => {
    if (!session) return;
    const status = session.status?.toLowerCase();
    if (status === 'scheduled') {
      updateStatus('InProgress').catch(() => {
        // silently ignore — user can still work
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id]);

  // ── Loading State ────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View
        className={`flex-1 ${bgClass} justify-center items-center`}
        style={{ paddingTop: insets.top }}
      >
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text
          className={`mt-4 font-semibold ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          Loading Workspace...
        </Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View
        className={`flex-1 ${bgClass} justify-center items-center`}
        style={{ paddingTop: insets.top }}
      >
        <Text className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>
          Session not found.
        </Text>
      </View>
    );
  }

  // ── Handle Add Note (with media upload) ──────────────────────────────────────
  const handleAddNote = async (noteText: string, mediaFiles?: MediaFile[]) => {
    try {
      await addNote(noteText, mediaFiles);
      dispatch(
        showToast({
          message:
            mediaFiles && mediaFiles.length > 0
              ? 'Note & media saved!'
              : 'Note added successfully',
          type: 'success',
        }),
      );
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || error?.message || 'Failed to add note';
      dispatch(showToast({ message: msg, type: 'error' }));
      throw error; // re-throw so AddNoteForm knows it failed
    }
  };

  // ── Handle End Session ───────────────────────────────────────────────────────
  const handleEndSession = async () => {
    setEndSessionLoading(true);
    try {
      await updateStatus('Done');
      setShowEndModal(false);
      dispatch(showToast({ message: 'Session completed successfully', type: 'success' }));
      router.replace('/(tabs)/student-dashboard' as any);
    } catch {
      dispatch(showToast({ message: 'Failed to end session', type: 'error' }));
    } finally {
      setEndSessionLoading(false);
    }
  };

  // Modal message mirrors web: warn when no notes
  const endModalMessage =
    notes.length === 0
      ? "Warning: You haven't added any clinical notes yet. Notes are mandatory before ending the session."
      : 'Are you sure you want to end this session? Make sure you have saved all your clinical notes before proceeding.';

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <View className={`flex-1 ${bgClass}`}>
      <View style={{ paddingTop: insets.top }} className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120, paddingTop: 16 }}
        >
          <View className="px-5 space-y-5">

            {/* ═══ 1. Top Bar (back + timer + status + end) ═══ */}
            <SessionTopBar
              patientName={session.patientName || ''}
              sessionId={sessionId}
              caseId={caseId}
              onEndSession={() => setShowEndModal(true)}
              endSessionLoading={endSessionLoading}
              sessionStatus={session.status || undefined}
              isDark={isDark}
            />

            {/* ═══ 2. Patient Summary (mirrors web LEFT column) ═══ */}
            {patient && (
              <PatientSummaryCard patient={patient} isDark={isDark} />
            )}

            {/* ═══ 3. Case Images Gallery (mirrors web DentalImageGallery) ═══ */}
            {patient && patient.imageUrls && patient.imageUrls.length > 0 && (
              <View
                className={`rounded-[32px] p-5 border shadow-sm ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                }`}
              >
                <Text
                  className={`text-sm font-bold mb-4 ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}
                >
                  Case Images
                </Text>
                <DentalImageGallery images={patient.imageUrls} compact />
              </View>
            )}

            {/* ═══ 4. Session Workspace (notes + add-note form) ═══ */}
            <SessionWorkspace
              session={session}
              notes={notes}
              onAddNote={handleAddNote}
              noteLoading={isAddingNote}
              isDark={isDark}
            />

          </View>
        </ScrollView>
      </View>

      {/* ── End Session Confirmation Modal ─────────────────────────────────────── */}
      <ActionModal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        onAction={async () => {
          // Mirror web: block if no notes exist
          if (notes.length === 0) {
            dispatch(
              showToast({
                message:
                  'You must add at least one clinical note before ending the session.',
                type: 'error',
              }),
            );
            setShowEndModal(false);
            return;
          }
          await handleEndSession();
        }}
        title="End Session"
        message={endModalMessage}
        actionText="End Session"
        cancelText="Continue Session"
        isLoading={endSessionLoading}
        variant="danger"
        isDark={isDark}
      />
    </View>
  );
}

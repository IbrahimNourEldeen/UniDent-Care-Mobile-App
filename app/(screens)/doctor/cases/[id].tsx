import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Pressable,
  Platform,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  User,
  Calendar,
  Stethoscope,
  CheckCircle2,
  Clock,
  XCircle,
  ClipboardList,
  Plus,
  FileText,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  doctorDashboardService,
  PatientCaseDto,
  DiagnosisDto,
  SessionDto,
} from '@/features/dashboard/services/doctorDashboardService';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STAGE_LABELS = ['initial', 'intermediate', 'final'];
const STATUS_COLORS: Record<string, { bg: string; bgDark: string; text: string; textDark: string }> = {
  'in progress': { bg: '#dbeafe', bgDark: '#1e3a5f', text: '#1d4ed8', textDark: '#60a5fa' },
  'completed':   { bg: '#d1fae5', bgDark: '#064e3b', text: '#065f46', textDark: '#34d399' },
  'diagnosis':   { bg: '#ede9fe', bgDark: '#3b1f5e', text: '#5b21b6', textDark: '#a78bfa' },
  'scheduled':   { bg: '#fef3c7', bgDark: '#451a03', text: '#92400e', textDark: '#fbbf24' },
  'cancelled':   { bg: '#fee2e2', bgDark: '#450a0a', text: '#991b1b', textDark: '#f87171' },
};

function getStatusColor(status: string, isDark: boolean) {
  const key = (status ?? '').toLowerCase();
  const c = STATUS_COLORS[key] ?? { bg: '#f1f5f9', bgDark: '#1e293b', text: '#475569', textDark: '#94a3b8' };
  return { bg: isDark ? c.bgDark : c.bg, text: isDark ? c.textDark : c.text };
}

function StatusBadge({ status, isDark }: { status: string; isDark: boolean }) {
  const { bg, text } = getStatusColor(status, isDark);
  return (
    <View style={{ backgroundColor: bg }} className="flex-row items-center gap-1.5 px-3 py-1 rounded-full">
      <Text style={{ color: text }} className="text-[10px] font-black uppercase tracking-wider">{status}</Text>
    </View>
  );
}

function SectionHeader({ title, count, expanded, onToggle, isDark }: { title: string; count?: number; expanded: boolean; onToggle: () => void; isDark: boolean }) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      className={`flex-row items-center justify-between p-5 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center gap-2">
        <Text className="font-black text-slate-900 dark:text-white text-base">{title}</Text>
        {count !== undefined && (
          <View className="bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 rounded-full">
            <Text className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">{count}</Text>
          </View>
        )}
      </View>
      {expanded ? <ChevronUp size={16} color={isDark ? '#64748b' : '#94a3b8'} /> : <ChevronDown size={16} color={isDark ? '#64748b' : '#94a3b8'} />}
    </TouchableOpacity>
  );
}

// ─── Session Card ─────────────────────────────────────────────────────────────

function SessionCard({ session, isDark, locale, t, onStatusUpdate }:
  { session: SessionDto; isDark: boolean; locale: string; t: (k: string) => string; onStatusUpdate: (id: string, status: string) => void }) {
  const { bg, text: textColor } = getStatusColor(session.status, isDark);
  const scheduledDate = new Date(session.scheduledAt).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const scheduledTime = new Date(session.scheduledAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

  return (
    <View className={`mx-1 mb-3 rounded-2xl border ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-100'} overflow-hidden`}>
      <View style={{ height: 3, backgroundColor: textColor }} />
      <View className="p-4">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <Text className="font-black text-slate-900 dark:text-white text-sm">{session.treatmentType}</Text>
            <View className="flex-row items-center gap-1.5 mt-1">
              <Calendar size={11} color={isDark ? '#64748b' : '#94a3b8'} />
              <Text className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{scheduledDate} · {scheduledTime}</Text>
            </View>
          </View>
          <StatusBadge status={session.status} isDark={isDark} />
        </View>

        <View className="flex-row items-center gap-3 pt-3 border-t border-slate-50 dark:border-slate-700/40">
          <View className="flex-row items-center gap-1">
            <User size={11} color={isDark ? '#64748b' : '#94a3b8'} />
            <Text className="text-[11px] text-slate-400 dark:text-slate-500 font-medium" numberOfLines={1}>{session.studentName}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <FileText size={11} color={isDark ? '#64748b' : '#94a3b8'} />
            <Text className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{session.totalNotes} notes</Text>
          </View>
        </View>

        {session.status.toLowerCase() === 'scheduled' && (
          <View className="flex-row gap-2 mt-3">
            <TouchableOpacity
              onPress={() => onStatusUpdate(session.id, 'Completed')}
              className="flex-1 flex-row items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500"
            >
              <CheckCircle2 size={12} color="white" />
              <Text className="text-white text-[11px] font-black uppercase">{t('mark_completed')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onStatusUpdate(session.id, 'Cancelled')}
              className="flex-1 flex-row items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-500"
            >
              <XCircle size={12} color="white" />
              <Text className="text-white text-[11px] font-black uppercase">{t('mark_cancelled')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Diagnosis Card ──────────────────────────────────────────────────────────

function DiagnosisCard({ diagnosis, isDark, t, onAccept, accepting }:
  { diagnosis: DiagnosisDto; isDark: boolean; t: (k: string, o?: any) => string; onAccept: (id: string) => void; accepting: string | null }) {

  const stageLabel = STAGE_LABELS[diagnosis.stage] ?? 'initial';
  const isAccepted = diagnosis.isAccepted === true;
  const isPending = diagnosis.isAccepted === null || diagnosis.isAccepted === false;

  return (
    <View className={`mx-1 mb-3 rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-100'}`}>
      <View style={{ height: 3, backgroundColor: isAccepted ? '#34d399' : '#fbbf24' }} />
      <View className="p-4">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <Text className="font-black text-slate-900 dark:text-white text-sm">{diagnosis.caseTypeName}</Text>
            <Text className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5 capitalize">
              {t('diagnosis_stage')}: {t(stageLabel)} · {diagnosis.role}
            </Text>
          </View>
          {isAccepted ? (
            <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 size={11} color={isDark ? '#34d399' : '#059669'} />
              <Text className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase">Accepted</Text>
            </View>
          ) : (
            <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/20">
              <Clock size={11} color={isDark ? '#fbbf24' : '#d97706'} />
              <Text className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase">{t('diagnosis_pending')}</Text>
            </View>
          )}
        </View>

        {diagnosis.notes && (
          <View className={`p-3 rounded-xl mb-3 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
            <Text className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{diagnosis.notes}</Text>
          </View>
        )}

        {diagnosis.teethNumbers?.length > 0 && (
          <Text className="text-[11px] text-indigo-500 dark:text-indigo-400 font-bold mb-3">
            {t('teeth')}: {diagnosis.teethNumbers.join(', ')}
          </Text>
        )}

        {isPending && (
          <TouchableOpacity
            onPress={() => onAccept(diagnosis.id)}
            disabled={accepting === diagnosis.id}
            className="flex-row items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600"
            style={{ opacity: accepting === diagnosis.id ? 0.6 : 1 }}
          >
            {accepting === diagnosis.id ? (
              <ActivityIndicator size={13} color="white" />
            ) : (
              <CheckCircle2 size={13} color="white" />
            )}
            <Text className="text-white text-xs font-black uppercase tracking-wide">{t('accept_diagnosis')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function CaseDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme, language } = useThemeLanguage();
  const isDark = theme === 'dark';
  const isRtl = I18nManager.isRTL;
  const locale = language === 'ar' ? 'ar-EG' : 'en-GB';

  const caseId = params.id as string;

  const [caseData, setCaseData] = useState<PatientCaseDto | null>(null);
  const [diagnoses, setDiagnoses] = useState<DiagnosisDto[]>([]);
  const [sessions, setSessions] = useState<SessionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [updatingSessionId, setUpdatingSessionId] = useState<string | null>(null);

  // Expand state
  const [showOverview, setShowOverview] = useState(true);
  const [showDiagnoses, setShowDiagnoses] = useState(true);
  const [showSessions, setShowSessions] = useState(true);

  // Add session modal
  const [showAddSession, setShowAddSession] = useState(false);
  const [sessionDate, setSessionDate] = useState('');
  const [sessionLocation, setSessionLocation] = useState('');
  const [submittingSession, setSubmittingSession] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!caseId) return;
    try {
      setLoading(true);
      const [c, d, s] = await Promise.all([
        doctorDashboardService.getCaseById(caseId),
        doctorDashboardService.getDiagnosesForCase(caseId),
        doctorDashboardService.getSessionsForCase(caseId),
      ]);
      setCaseData(c);
      setDiagnoses(d.items ?? []);
      setSessions(s.items ?? []);
    } catch (e) {
      console.error('fetchAll', e);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => { fetchAll(); }, [caseId]);

  const handleAcceptDiagnosis = async (diagnosisId: string) => {
    setAcceptingId(diagnosisId);
    try {
      await doctorDashboardService.acceptDiagnosis(diagnosisId);
      setDiagnoses(prev => prev.map(d => d.id === diagnosisId ? { ...d, isAccepted: true } : d));
    } catch (e) {
      Alert.alert('', 'Failed to accept diagnosis.');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleSessionStatusUpdate = async (sessionId: string, status: string) => {
    setUpdatingSessionId(sessionId);
    try {
      await doctorDashboardService.updateSessionStatus(sessionId, status);
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status } : s));
    } catch (e) {
      Alert.alert('', 'Failed to update session status.');
    } finally {
      setUpdatingSessionId(null);
    }
  };

  const handleAddSession = async () => {
    if (!caseData) return;
    if (!sessionDate.trim()) {
      Alert.alert('', t('session_date') + ' is required');
      return;
    }
    const studentId = caseData.assignedStudentId;
    if (!studentId) {
      Alert.alert('', t('assigned_student') + ' not found');
      return;
    }
    try {
      setSubmittingSession(true);
      await doctorDashboardService.createSession({
        studentId,
        patientCaseId: caseId,
        sessionDate: new Date(sessionDate).toISOString(),
        location: sessionLocation.trim() || undefined,
      });
      setShowAddSession(false);
      setSessionDate('');
      setSessionLocation('');
      // Refresh sessions
      const s = await doctorDashboardService.getSessionsForCase(caseId);
      setSessions(s.items ?? []);
    } catch (e) {
      Alert.alert('', 'Failed to create session. Check date format (YYYY-MM-DD HH:MM).');
    } finally {
      setSubmittingSession(false);
    }
  };

  // ─── Loading ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950 items-center justify-center">
        <ActivityIndicator size="large" color={isDark ? '#818cf8' : '#4f46e5'} />
      </SafeAreaView>
    );
  }

  if (!caseData) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950 items-center justify-center">
        <Text className="text-slate-400 font-bold mb-4">{t('load_error')}</Text>
        <TouchableOpacity onPress={fetchAll} className="flex-row items-center gap-2 px-5 py-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
          <RefreshCw size={14} color={isDark ? '#818cf8' : '#4f46e5'} />
          <Text className="text-indigo-600 dark:text-indigo-400 font-black text-sm">{t('retry')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const { bg: statusBg, text: statusText } = getStatusColor(caseData.status, isDark);
  const initials = (caseData.patientName ?? 'P').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      {/* Navbar */}
      <View className="flex-row items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 mr-3"
        >
          <ArrowLeft size={20} color={isDark ? '#cbd5e1' : '#1e293b'} style={{ transform: [{ scaleX: isRtl ? -1 : 1 }] }} />
        </TouchableOpacity>
        <Text className="text-base font-black text-slate-900 dark:text-white flex-1" numberOfLines={1}>
          {caseData.patientName}
        </Text>
        <StatusBadge status={caseData.status} isDark={isDark} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero Card */}
        <LinearGradient
          colors={isDark ? ['#1e1b4b', '#0f172a'] : ['#4f46e5', '#6366f1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-6 pt-6 pb-10"
        >
          <View className="flex-row items-center gap-5">
            <View className="w-16 h-16 rounded-2xl bg-white/20 items-center justify-center">
              <Text className="text-white text-2xl font-black">{initials}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white text-xl font-black" numberOfLines={1}>{caseData.patientName}</Text>
              <Text className="text-white/70 text-sm font-medium mt-0.5">
                {caseData.patientAge}y · {caseData.gender === 0 ? 'Male' : caseData.gender === 1 ? 'Female' : 'N/A'}
              </Text>
              {caseData.caseType && (
                <View className="flex-row items-center gap-1.5 mt-2 bg-white/15 px-3 py-1 rounded-full self-start">
                  <Stethoscope size={11} color="white" />
                  <Text className="text-white text-[11px] font-bold">{caseData.caseType.name}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Mini stats */}
          <View className="flex-row gap-3 mt-5">
            {[
              { label: t('sessions'), value: caseData.totalSessions },
              { label: t('diagnoses'), value: diagnoses.length },
              { label: t('pending_requests'), value: caseData.pendingRequests },
            ].map((stat) => (
              <View key={stat.label} className="flex-1 bg-white/15 rounded-2xl p-3 items-center">
                <Text className="text-white text-xl font-black">{stat.value}</Text>
                <Text className="text-white/70 text-[10px] font-bold mt-0.5 text-center">{stat.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Cards */}
        <View className="mx-4 -mt-4">
          {/* Overview */}
          <View className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none mb-4 overflow-hidden">
            <SectionHeader title={t('overview')} expanded={showOverview} onToggle={() => setShowOverview(p => !p)} isDark={isDark} />
            {showOverview && (
              <View className="px-5 py-4 gap-3">
                {[
                  { label: t('patient_name'), value: caseData.patientName },
                  { label: t('assigned_student'), value: caseData.assignedStudentId ? t('assigned_student') : t('not_assigned') },
                  { label: t('assigned_doctor'), value: caseData.assignedDoctorId ? t('assigned_doctor') : t('not_assigned') },
                  { label: t('university'), value: caseData.universityName ?? '—' },
                  { label: t('submitted_on'), value: new Date(caseData.createAt).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }) },
                ].map(row => (
                  <View key={row.label} className="flex-row items-start justify-between gap-4 py-2 border-b border-slate-50 dark:border-slate-800/40">
                    <Text className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex-shrink-0">{row.label}</Text>
                    <Text className="text-xs font-semibold text-slate-800 dark:text-white text-right flex-1" numberOfLines={2}>{row.value}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Diagnoses */}
          <View className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none mb-4 overflow-hidden">
            <SectionHeader title={t('diagnoses')} count={diagnoses.length} expanded={showDiagnoses} onToggle={() => setShowDiagnoses(p => !p)} isDark={isDark} />
            {showDiagnoses && (
              <View className="p-4">
                {diagnoses.length === 0 ? (
                  <View className="py-8 items-center">
                    <ClipboardList size={32} color={isDark ? '#334155' : '#cbd5e1'} />
                    <Text className="text-sm font-bold text-slate-400 dark:text-slate-500 mt-3">{t('no_diagnoses')}</Text>
                    <Text className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-center">{t('no_diagnoses_desc')}</Text>
                  </View>
                ) : (
                  diagnoses.map(d => (
                    <DiagnosisCard key={d.id} diagnosis={d} isDark={isDark} t={t} onAccept={handleAcceptDiagnosis} accepting={acceptingId} />
                  ))
                )}
              </View>
            )}
          </View>

          {/* Sessions */}
          <View className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none overflow-hidden">
            <SectionHeader title={t('sessions')} count={sessions.length} expanded={showSessions} onToggle={() => setShowSessions(p => !p)} isDark={isDark} />
            {showSessions && (
              <View className="p-4">
                {/* Add Session Button */}
                <TouchableOpacity
                  onPress={() => setShowAddSession(true)}
                  className="flex-row items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 mb-4"
                >
                  <Plus size={14} color={isDark ? '#818cf8' : '#4f46e5'} />
                  <Text className="text-xs font-black text-indigo-600 dark:text-indigo-400">{t('add_session')}</Text>
                </TouchableOpacity>

                {sessions.length === 0 ? (
                  <View className="py-8 items-center">
                    <Clock size={32} color={isDark ? '#334155' : '#cbd5e1'} />
                    <Text className="text-sm font-bold text-slate-400 dark:text-slate-500 mt-3">{t('sessions_empty')}</Text>
                    <Text className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-center">{t('sessions_empty_desc')}</Text>
                  </View>
                ) : (
                  sessions.map(s => (
                    <SessionCard
                      key={s.id}
                      session={s}
                      isDark={isDark}
                      locale={locale}
                      t={t}
                      onStatusUpdate={handleSessionStatusUpdate}
                    />
                  ))
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Add Session Modal */}
      <Modal
        visible={showAddSession}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddSession(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }}
          onPress={() => setShowAddSession(false)}
        >
          <Pressable style={{ marginTop: 'auto' }} onPress={e => e.stopPropagation()}>
            <View className="bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-100 dark:border-slate-800 px-6 pt-4 pb-10">
              {/* Handle */}
              <View className="items-center mb-4">
                <View className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
              </View>

              <Text className="text-lg font-black text-slate-900 dark:text-white mb-5">{t('add_session')}</Text>

              {/* Date / time input */}
              <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">{t('session_date')}</Text>
              <TextInput
                value={sessionDate}
                onChangeText={setSessionDate}
                placeholder="2025-06-01 09:00"
                placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
                className={`px-4 py-3.5 rounded-2xl border text-sm font-medium text-slate-800 dark:text-white mb-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                style={{ writingDirection: 'ltr' }}
                keyboardType="numbers-and-punctuation"
              />

              {/* Location */}
              <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">{t('location')}</Text>
              <TextInput
                value={sessionLocation}
                onChangeText={setSessionLocation}
                placeholder="Clinic Room 3"
                placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
                className={`px-4 py-3.5 rounded-2xl border text-sm font-medium text-slate-800 dark:text-white mb-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                style={{ writingDirection: isRtl ? 'rtl' : 'ltr' }}
              />

              <TouchableOpacity
                onPress={handleAddSession}
                disabled={submittingSession}
                className="rounded-2xl overflow-hidden"
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#6366f1', '#4f46e5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="flex-row items-center justify-center gap-2 py-4"
                >
                  {submittingSession ? (
                    <ActivityIndicator size={16} color="white" />
                  ) : (
                    <Plus size={16} color="white" />
                  )}
                  <Text className="text-white font-black text-sm">{submittingSession ? t('updating') : t('add_session')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

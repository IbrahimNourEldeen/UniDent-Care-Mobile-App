import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  FileText,
  User,
  GraduationCap,
  Hospital,
  BookOpen,
  Stethoscope,
  Calendar,
  Info,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  doctorDashboardService,
  CaseRequest,
} from '@/features/dashboard/services/doctorDashboardService';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStatusStyle(status: string, isDark: boolean) {
  switch (status.toLowerCase()) {
    case 'approved':
      return {
        bg: isDark ? '#064e3b' : '#d1fae5',
        text: isDark ? '#34d399' : '#065f46',
        bar: ['#34d399', '#059669'],
        icon: <CheckCircle2 size={16} color={isDark ? '#34d399' : '#059669'} />,
      };
    case 'rejected':
      return {
        bg: isDark ? '#450a0a' : '#fee2e2',
        text: isDark ? '#f87171' : '#991b1b',
        bar: ['#f87171', '#dc2626'],
        icon: <XCircle size={16} color={isDark ? '#f87171' : '#dc2626'} />,
      };
    default:
      return {
        bg: isDark ? '#451a03' : '#fef3c7',
        text: isDark ? '#fbbf24' : '#92400e',
        bar: ['#fbbf24', '#d97706'],
        icon: <Clock size={16} color={isDark ? '#fbbf24' : '#d97706'} />,
      };
  }
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function MyStudentDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme, language } = useThemeLanguage();
  const isDark = theme === 'dark';
  const isRtl = I18nManager.isRTL;
  const locale = language === 'ar' ? 'ar-EG' : 'en-GB';

  const requestId = params.id as string;

  const [request, setRequest] = useState<CaseRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequest = useCallback(async () => {
    if (!requestId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await doctorDashboardService.getCaseRequestById(requestId);
      setRequest(data);
    } catch (e: any) {
      console.error('fetchRequest', e);
      setError(t('could_not_load_request'));
    } finally {
      setLoading(false);
    }
  }, [requestId, t]);

  useEffect(() => {
    fetchRequest();
  }, [requestId]);

  function getInitials(name: string) {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  const s = request ? getStatusStyle(request.status, isDark) : null;

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <View className="flex-1">
        {/* Top Navbar */}
        <View className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
          >
            <ArrowLeft size={20} color={isDark ? '#cbd5e1' : '#1e293b'} style={{ transform: [{ scaleX: isRtl ? -1 : 1 }] }} />
          </TouchableOpacity>
          <Text className="text-base font-black text-slate-800 dark:text-white ml-4 flex-1">
            {t('full_details')}
          </Text>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={isDark ? '#60a5fa' : '#2563eb'} />
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center p-8">
            <Text className="text-base font-bold text-slate-500 dark:text-slate-400 text-center">
              {error}
            </Text>
            <TouchableOpacity
              onPress={fetchRequest}
              className="mt-6 px-6 py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex-row items-center gap-2"
            >
              <RefreshCw size={16} color={isDark ? '#818cf8' : '#4f46e5'} />
              <Text className="font-black text-indigo-600 dark:text-indigo-400 text-sm">{t('retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : request && s ? (
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
            {/* Patient / Main Card */}
            <View className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mb-5">
              <View style={{ height: 6, backgroundColor: s.bar[0] }} />
              <View className="p-6">
                <View className="flex-row items-center gap-5">
                  <View className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
                    <Text className="text-white font-black text-xl">{getInitials(request.studentName)}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-black text-slate-900 dark:text-white" numberOfLines={1}>
                      {request.studentName}
                    </Text>
                    <View className="flex-row flex-wrap items-center mt-1 gap-4">
                      <View className="flex-row items-center gap-1.5">
                        <Hospital size={13} color="#94a3b8" />
                        <Text className="text-xs text-slate-400 dark:text-slate-500 font-medium">{request.university}</Text>
                      </View>
                      <View className="flex-row items-center gap-1.5">
                        <BookOpen size={13} color="#94a3b8" />
                        <Text className="text-xs text-slate-400 dark:text-slate-500 font-medium">{t('level_label')} {request.level}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Status bubble */}
                <View style={{ backgroundColor: s.bg }} className="mt-6 flex-row items-center justify-center p-3.5 rounded-2xl gap-2 border border-black/5 dark:border-white/5">
                  {s.icon}
                  <Text style={{ color: s.text }} className="text-sm font-black uppercase tracking-wider">
                    {request.status}
                  </Text>
                </View>
              </View>
            </View>

            {/* Description */}
            {request.description && (
              <View className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 mb-5">
                <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
                  {t('motivation_label')}
                </Text>
                <View className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                  <Text className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {request.description}
                  </Text>
                </View>
              </View>
            )}

            {/* Details Grid */}
            <View className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6">
              <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
                {t('request_information')}
              </Text>
              
              <View className="gap-3">
                <DetailItem icon={<FileText size={14} color="#6366f1" />} label={t('case_name')} value={request.caseName} isDark={isDark} />
                <DetailItem icon={<User size={14} color="#6366f1" />} label={t('patient_name')} value={request.patientName || 'N/A'} isDark={isDark} />
                <DetailItem icon={<Stethoscope size={14} color="#6366f1" />} label={t('doctor_name')} value={request.doctorName} isDark={isDark} />
                <DetailItem icon={<Info size={14} color="#6366f1" />} label={t('level_label')} value={String(request.level)} isDark={isDark} />
                <DetailItem icon={<Calendar size={14} color="#6366f1" />} label={t('submitted_on')} value={new Date(request.createAt).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })} isDark={isDark} />
                <DetailItem icon={<BookOpen size={14} color="#6366f1" />} label={t('student_id')} value={request.studentPublicId} isDark={isDark} />
              </View>
            </View>
          </ScrollView>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function DetailItem({ icon, label, value, isDark }: { icon: React.ReactNode; label: string; value: string; isDark: boolean }) {
  return (
    <View className="flex-row items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
      <View className="mt-1">{icon}</View>
      <View className="flex-1">
        <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</Text>
        <Text className="text-sm font-black text-slate-800 dark:text-white mt-1" selectable>{value}</Text>
      </View>
    </View>
  );
}

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Users,
  Hospital,
  BookOpen,
  GraduationCap,
  ChevronRight,
  RefreshCw,
  ClipboardList,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/store/hooks';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { useRouter } from 'expo-router';
import {
  doctorDashboardService,
  CaseRequest,
} from '@/features/dashboard/services/doctorDashboardService';

// ─── Types ───────────────────────────────────────────────────────────────────

interface StudentGroup {
  studentPublicId: string;
  studentName: string;
  university: string;
  level: number;
  requests: CaseRequest[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStatusStyle(status: string, isDark: boolean) {
  switch (status.toLowerCase()) {
    case 'approved':
      return { bg: isDark ? '#064e3b' : '#d1fae5', text: isDark ? '#34d399' : '#065f46', icon: 'approved' };
    case 'rejected':
      return { bg: isDark ? '#450a0a' : '#fee2e2', text: isDark ? '#f87171' : '#991b1b', icon: 'rejected' };
    default:
      return { bg: isDark ? '#451a03' : '#fef3c7', text: isDark ? '#fbbf24' : '#92400e', icon: 'pending' };
  }
}

function StatusBadge({ status, isDark }: { status: string; isDark: boolean }) {
  const s = getStatusStyle(status, isDark);
  return (
    <View style={{ backgroundColor: s.bg }} className="flex-row items-center gap-1 px-2.5 py-0.5 rounded-full">
      {s.icon === 'approved' && <CheckCircle2 size={10} color={s.text} />}
      {s.icon === 'rejected' && <XCircle size={10} color={s.text} />}
      {s.icon === 'pending' && <Clock size={10} color={s.text} />}
      <Text style={{ color: s.text }} className="text-[10px] font-bold">
        {status}
      </Text>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function MyStudentListScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);
  const { theme, language } = useThemeLanguage();
  const isDark = theme === 'dark';
  const isRtl = I18nManager.isRTL;
  const locale = language === 'ar' ? 'ar-EG' : 'en-GB';

  const doctorId = (user as any)?.publicId ?? (user as any)?.id;

  const [students, setStudents] = useState<StudentGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalRequests, setTotalRequests] = useState(0);

  const fetchStudents = useCallback(async () => {
    if (!doctorId) return;
    try {
      setLoading(true);
      // Fetch many requests to group them
      const res = await doctorDashboardService.getCaseRequestsByDoctor(doctorId, 1, 100);
      setTotalRequests(res.totalCount);

      // Grouping logic
      const map = new Map<string, StudentGroup>();
      for (const req of res.items) {
        if (!map.has(req.studentPublicId)) {
          map.set(req.studentPublicId, {
            studentPublicId: req.studentPublicId,
            studentName: req.studentName,
            university: req.university,
            level: req.level,
            requests: [],
          });
        }
        map.get(req.studentPublicId)!.requests.push(req);
      }

      // Sorting: students with 'Pending' first
      const sorted = Array.from(map.values()).sort((a, b) => {
        const aPending = a.requests.some((r) => r.status === 'Pending') ? 0 : 1;
        const bPending = b.requests.some((r) => r.status === 'Pending') ? 0 : 1;
        return aPending - bPending;
      });

      setStudents(sorted);
    } catch (e) {
      console.error('fetchStudents', e);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchStudents();
  }, [doctorId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStudents();
    setRefreshing(false);
  };

  function getInitials(name: string) {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? '#6366f1' : '#4f46e5'}
          />
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
      >
        {/* ── Welcome Header ── */}
        <View className="flex-row items-center justify-between mb-8">
          <View className="flex-1">
            <Text className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest mb-1.5">
              {t('overview')}
            </Text>
            <Text className="text-2xl font-black text-slate-900 dark:text-white leading-none">
              {t('student_list')}
            </Text>
          </View>
          <TouchableOpacity
            onPress={fetchStudents}
            className={`p-3 rounded-2xl ${isDark ? 'bg-slate-900' : 'bg-white shadow-sm border border-slate-100'}`}
          >
            {loading ? (
              <ActivityIndicator size={20} color={isDark ? '#6366f1' : '#4f46e5'} />
            ) : (
              <RefreshCw size={20} color={isDark ? '#6366f1' : '#4f46e5'} strokeWidth={2.5} />
            )}
          </TouchableOpacity>
        </View>

        {/* ── Summary Card ── */}
        <View className="bg-indigo-600 dark:bg-indigo-900/50 p-6 rounded-3xl mb-8 shadow-xl shadow-indigo-200 dark:shadow-none flex-row items-center justify-between">
          <View>
            <Text className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Total Students</Text>
            <Text className="text-white text-3xl font-black">{students.length}</Text>
          </View>
          <View className="h-10 w-px bg-white/20 mx-4" />
          <View className="flex-1">
            <Text className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Total Requests</Text>
            <Text className="text-white text-3xl font-black">{totalRequests}</Text>
          </View>
        </View>

        {/* ── List ── */}
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <View
              key={i}
              className="h-44 bg-slate-200/50 dark:bg-slate-900/50 rounded-3xl mb-4 animate-pulse border border-dashed border-slate-200 dark:border-slate-800"
            />
          ))
        ) : students.length === 0 ? (
          <View className="py-24 items-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <ClipboardList size={40} color={isDark ? '#334155' : '#cbd5e1'} strokeWidth={1.5} />
            <Text className="text-slate-400 dark:text-slate-500 font-bold mt-4">{t('no_students_yet')}</Text>
          </View>
        ) : (
          students.map((student) => {
            const hasPending = student.requests.some((r) => r.status === 'Pending');
            const pendingCount = student.requests.filter((r) => r.status === 'Pending').length;
            
            return (
              <View
                key={student.studentPublicId}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none mb-6 overflow-hidden"
              >
                {/* Student Profile Row */}
                <View className="p-5 flex-row items-center gap-4 border-b border-slate-50 dark:border-slate-800/60">
                  <LinearGradient
                    colors={isDark ? ['#4f46e5', '#1e1b4b'] : ['#6366f1', '#3b82f6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="w-14 h-14 rounded-2xl items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none"
                  >
                    <Text className="text-white font-black text-lg">{getInitials(student.studentName)}</Text>
                  </LinearGradient>
                  
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-1.5">
                      <Text className="font-black text-slate-900 dark:text-white text-lg flex-1" numberOfLines={1}>
                        {student.studentName}
                      </Text>
                      {hasPending && (
                        <View className="bg-amber-500 px-2 py-0.5 rounded-full shadow-sm shadow-amber-200 dark:shadow-none">
                          <Text className="text-[9px] font-black text-white uppercase">{pendingCount} {t('pending')}</Text>
                        </View>
                      )}
                    </View>
                    
                    <View className="flex-row items-center gap-3">
                      <View className="flex-row items-center gap-1">
                        <Hospital size={10} color="#94a3b8" />
                        <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-bold" numberOfLines={1}>
                          {student.university}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <BookOpen size={10} color="#94a3b8" />
                        <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                          {t('level_label')} {student.level}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Sub-list of requests */}
                <View className="bg-slate-50/40 dark:bg-slate-800/20 px-4 py-2">
                  <Text className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">
                    {t('recent_requests')}
                  </Text>
                  {student.requests.slice(0, 3).map((req) => (
                    <TouchableOpacity
                      key={req.id}
                      onPress={() => router.push({ pathname: '/doctor/my-student/[id]', params: { id: req.id } })}
                      className="flex-row items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 mb-2 active:bg-slate-50"
                    >
                      <View className="flex-1 mr-3">
                        <Text className="text-sm font-bold text-slate-900 dark:text-slate-200" numberOfLines={1}>
                          {req.caseName}
                        </Text>
                        <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">
                          {new Date(req.createAt).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <StatusBadge status={req.status} isDark={isDark} />
                        <ChevronRight size={14} color={isDark ? '#475569' : '#94a3b8'} />
                      </View>
                    </TouchableOpacity>
                  ))}
                  {student.requests.length > 3 && (
                    <TouchableOpacity 
                      className="items-center py-2"
                      onPress={() => router.push({ pathname: '/doctor/my-student/[id]', params: { id: student.requests[0].id } })}
                    >
                      <Text className="text-[10px] font-black text-indigo-500 uppercase">View All {student.requests.length} Requests</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

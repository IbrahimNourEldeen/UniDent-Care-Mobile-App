import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  I18nManager,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Users,
  Hospital,
  BookOpen,
  ChevronRight,
  RefreshCw,
  ClipboardList,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
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
  const { t } = useTranslation();
  const s = getStatusStyle(status, isDark);
  return (
    <View style={{ backgroundColor: s.bg }} className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-full`}>
      {s.icon === 'approved' && <CheckCircle2 size={12} color={s.text} />}
      {s.icon === 'rejected' && <XCircle size={12} color={s.text} />}
      {s.icon === 'pending' && <Clock size={12} color={s.text} />}
      <Text style={{ color: s.text }} className="text-[10px] font-bold tracking-wider uppercase">
        {t(`status_${status.toLowerCase().replace(/\s/g, '')}`)}
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
  const isRtl = language === 'ar';
  const locale = isRtl ? 'ar-EG' : 'en-GB';

  const doctorId = (user as any)?.publicId ?? (user as any)?.id;

  const [students, setStudents] = useState<StudentGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalRequests, setTotalRequests] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null); // 'Pending', 'Approved', 'Rejected'

  const fetchStudents = useCallback(async () => {
    if (!doctorId) return;
    try {
      setLoading(true);
      const res = await doctorDashboardService.getCaseRequestsByDoctor(doctorId, 1, 100);
      setTotalRequests(res.totalCount);

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

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Name search
      const matchesSearch = student.studentName.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Level filter
      const matchesLevel = levelFilter === null || student.level === levelFilter;
      
      // Status filter: student must have at least one request matching the selected status
      const matchesStatus = statusFilter === null || student.requests.some(r => r.status === statusFilter);

      return matchesSearch && matchesLevel && matchesStatus;
    });
  }, [students, searchQuery, levelFilter, statusFilter]);

  const toggleLevelFilter = (lvl: number) => {
    setLevelFilter(prev => prev === lvl ? null : lvl);
  };

  const toggleStatusFilter = (sts: string) => {
    setStatusFilter(prev => prev === sts ? null : sts);
  };

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
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 110 }}
      >
        {/* ── Welcome Header ── */}
        <View className={`flex-row items-center justify-between mb-8 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <View className={`flex-1 ${isRtl ? 'items-end' : ''}`}>
            <Text className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest mb-1.5">
              {t('overview')}
            </Text>
            <Text className={`text-2xl font-black text-slate-900 dark:text-white leading-none ${isRtl ? 'text-right' : ''}`}>
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

        {/* ── Search & Filters ── */}
        <View className="mb-6 space-y-4">
          <View className={`flex-row items-center px-4 py-3.5 rounded-2xl border ${isRtl ? 'flex-row-reverse' : ''} ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <Search size={20} color={isDark ? '#64748b' : '#94a3b8'} />
            <TextInput
              className={`flex-1 ${isRtl ? 'mr-3 text-right' : 'ml-3'} text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}
              placeholder={t('search_students_placeholder')}
              placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 8, flexDirection: isRtl ? 'row-reverse' : 'row' }}>
            <View className={`flex-row items-center px-3 py-1.5 rounded-xl border ${isRtl ? 'flex-row-reverse' : ''} ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <Filter size={14} color={isDark ? '#94a3b8' : '#64748b'} className={isRtl ? 'ml-2' : 'mr-2'} />
              <Text className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('filters')}</Text>
            </View>

            {/* Level Filters */}
            {[3, 4, 5].map(lvl => (
              <TouchableOpacity
                key={`lvl-${lvl}`}
                onPress={() => toggleLevelFilter(lvl)}
                className={`px-4 py-1.5 rounded-xl border ${
                  levelFilter === lvl
                    ? (isDark ? 'bg-indigo-900/50 border-indigo-500' : 'bg-indigo-50 border-indigo-200')
                    : (isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')
                }`}
              >
                <Text className={`text-xs font-bold ${
                  levelFilter === lvl
                    ? (isDark ? 'text-indigo-400' : 'text-indigo-600')
                    : (isDark ? 'text-slate-400' : 'text-slate-600')
                }`}>
                  {t('level_label')} {lvl}
                </Text>
              </TouchableOpacity>
            ))}

            <View className="w-px h-6 bg-slate-200 dark:bg-slate-800 self-center mx-1" />

            {/* Status Filters */}
            {['Pending', 'Approved'].map(sts => (
              <TouchableOpacity
                key={`sts-${sts}`}
                onPress={() => toggleStatusFilter(sts)}
                className={`px-4 py-1.5 rounded-xl border ${
                  statusFilter === sts
                    ? (sts === 'Pending' 
                        ? (isDark ? 'bg-amber-900/40 border-amber-500/50' : 'bg-amber-50 border-amber-200')
                        : (isDark ? 'bg-emerald-900/40 border-emerald-500/50' : 'bg-emerald-50 border-emerald-200'))
                    : (isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')
                }`}
              >
                <Text className={`text-xs font-bold ${
                  statusFilter === sts
                    ? (sts === 'Pending' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400')
                    : (isDark ? 'text-slate-400' : 'text-slate-600')
                }`}>
                  {t(`status_${sts.toLowerCase()}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Summary Card ── */}
        {!searchQuery && !levelFilter && !statusFilter && (
          <View className={`bg-indigo-600 dark:bg-indigo-900/50 p-6 rounded-3xl mb-8 shadow-xl shadow-indigo-200 dark:shadow-none flex-row items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
            <View className={isRtl ? 'items-end' : ''}>
              <Text className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">{t('total_students')}</Text>
              <Text className="text-white text-3xl font-black">{students.length}</Text>
            </View>
            <View className="h-10 w-px bg-white/20 mx-4" />
            <View className={`flex-1 ${isRtl ? 'items-end' : ''}`}>
              <Text className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">{t('total_requests')}</Text>
              <Text className="text-white text-3xl font-black">{totalRequests}</Text>
            </View>
          </View>
        )}

        {/* ── List ── */}
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <View
              key={i}
              className="h-44 bg-slate-200/50 dark:bg-slate-900/50 rounded-3xl mb-4 animate-pulse border border-dashed border-slate-200 dark:border-slate-800"
            />
          ))
        ) : filteredStudents.length === 0 ? (
          <View className="py-24 items-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <ClipboardList size={40} color={isDark ? '#334155' : '#cbd5e1'} strokeWidth={1.5} />
            <Text className="text-slate-400 dark:text-slate-500 font-bold mt-4 text-center">
              {searchQuery || levelFilter || statusFilter ? t('no_matching_students') : t('no_students_yet')}
            </Text>
          </View>
        ) : (
          filteredStudents.map((student) => {
            const hasPending = student.requests.some((r) => r.status === 'Pending');
            const pendingCount = student.requests.filter((r) => r.status === 'Pending').length;
            
            return (
              <View
                key={student.studentPublicId}
                className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none mb-6 overflow-hidden"
              >
                {/* Student Profile Row */}
                <View className={`p-5 flex-row items-center gap-4 border-b border-slate-50 dark:border-slate-800/60 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <LinearGradient
                    colors={isDark ? ['#4f46e5', '#1e1b4b'] : ['#6366f1', '#3b82f6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="w-14 h-14 rounded-2xl items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none"
                  >
                    <Text className="text-white font-black text-lg">{getInitials(student.studentName)}</Text>
                  </LinearGradient>
                  
                  <View className="flex-1">
                    <View className={`flex-row items-center gap-2 mb-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <Text className={`font-black text-slate-900 dark:text-white text-lg flex-1 ${isRtl ? 'text-right' : ''}`} numberOfLines={1}>
                        {student.studentName}
                      </Text>
                      {hasPending && (
                        <View className="bg-amber-500 px-2 py-0.5 rounded-full shadow-sm shadow-amber-200 dark:shadow-none">
                          <Text className="text-[9px] font-black text-white uppercase tracking-wider">{pendingCount} {t('pending')}</Text>
                        </View>
                      )}
                    </View>
                    
                    <View className={`flex-row items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <View className={`flex-row items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <Hospital size={12} color="#94a3b8" />
                        <Text className="text-xs text-slate-500 dark:text-slate-400 font-bold" numberOfLines={1}>
                          {student.university}
                        </Text>
                      </View>
                      <View className={`flex-row items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <BookOpen size={12} color="#94a3b8" />
                        <Text className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                          {t('level_label')} {student.level}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Sub-list of requests */}
                <View className="bg-slate-50/70 dark:bg-slate-900/60 p-5">
                  <Text className={`text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 ${isRtl ? 'text-right' : ''}`}>
                    {t('recent_requests')}
                  </Text>
                  {student.requests.slice(0, 3).map((req) => (
                    <TouchableOpacity
                      key={req.id}
                      activeOpacity={0.8}
                      onPress={() => router.push({ pathname: '/doctor/my-student/[id]', params: { id: req.id } })}
                      className={`flex-row items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 mb-3 shadow-sm dark:shadow-none ${isRtl ? 'flex-row-reverse' : ''}`}
                    >
                      <View className={`flex-1 ${isRtl ? 'ml-3 items-end' : 'mr-3'} space-y-1`}>
                        <Text className={`text-sm font-black text-slate-900 dark:text-white leading-tight ${isRtl ? 'text-right' : ''}`} numberOfLines={1}>
                          {req.caseName}
                        </Text>
                        <Text className={`text-[11px] font-bold text-slate-500 dark:text-slate-400 ${isRtl ? 'text-right' : ''}`} numberOfLines={1}>
                          <Text className="text-slate-400 dark:text-slate-500">{t('patient')}:</Text> {req.patientName}
                        </Text>
                        <View className={`flex-row items-center mt-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                          <Clock size={10} color={isDark ? '#64748b' : '#94a3b8'} className={isRtl ? 'ml-1' : 'mr-1'} />
                          <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                            {new Date(req.createAt).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}
                          </Text>
                        </View>
                      </View>
                      <View className={`items-end gap-2 ${isRtl ? 'items-start' : ''}`}>
                        <StatusBadge status={req.status} isDark={isDark} />
                        <View className={`bg-indigo-50 dark:bg-indigo-900/30 w-8 h-8 rounded-full items-center justify-center ${isRtl ? 'rotate-180' : ''}`}>
                          <ChevronRight size={14} color={isDark ? '#818cf8' : '#4f46e5'} />
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                  {student.requests.length > 3 && (
                    <TouchableOpacity 
                      className="items-center py-2 mt-1"
                      activeOpacity={0.7}
                      onPress={() => router.push({ pathname: '/doctor/my-student/[id]', params: { id: student.requests[0].id } })}
                    >
                      <Text className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                        View All {student.requests.length} Requests
                      </Text>
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

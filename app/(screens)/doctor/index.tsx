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
  Clock,
  CheckCircle2,
  RefreshCw,
  ClipboardList,
  XCircle,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/store/hooks';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { StatCard } from '@/components/common/StatCard';
import {
  doctorDashboardService,
  DoctorStats,
  CaseRequest,
  PaginatedRequests,
} from '@/features/dashboard/services/doctorDashboardService';

const PAGE_SIZE = 10;

// ─── Status helpers ────────────────────────────────────────────────────────────

function getStatusColors(status: string, isDark: boolean) {
  switch (status.toLowerCase()) {
    case 'approved':
      return { bg: isDark ? '#064e3b' : '#d1fae5', text: isDark ? '#34d399' : '#065f46' };
    case 'rejected':
      return { bg: isDark ? '#450a0a' : '#fee2e2', text: isDark ? '#f87171' : '#991b1b' };
    default:
      return { bg: isDark ? '#451a03' : '#fef3c7', text: isDark ? '#fbbf24' : '#92400e' };
  }
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function DoctorDashboardScreen() {
  const { t } = useTranslation();
  const { user, role } = useAppSelector((s) => s.auth);
  const { theme, language } = useThemeLanguage();
  const isDark = theme === 'dark';
  const isRtl = I18nManager.isRTL;

  const doctorId = (user as any)?.publicId ?? (user as any)?.id;

  const [stats, setStats] = useState<DoctorStats | null>(null);
  const [requestsData, setRequestsData] = useState<PaginatedRequests | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [reqsLoading, setReqsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchStats = useCallback(async () => {
    if (!doctorId) return;
    try {
      setStatsLoading(true);
      const res = await doctorDashboardService.getDoctorDetails(doctorId);
      setStats(res);
    } catch (e) {
      console.error('fetchStats', e);
    } finally {
      setStatsLoading(false);
    }
  }, [doctorId]);

  const fetchRequests = useCallback(
    async (page = currentPage) => {
      try {
        setReqsLoading(true);
        const res = await doctorDashboardService.getDoctorRequests(doctorId, page, PAGE_SIZE);
        setRequestsData(res);
      } catch (e) {
        console.error('fetchRequests', e);
      } finally {
        setReqsLoading(false);
      }
    },
    [currentPage],
  );

  useEffect(() => {
    fetchStats();
    fetchRequests(1);
  }, [doctorId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStats(), fetchRequests(currentPage)]);
    setRefreshing(false);
  };

  const handleApprove = async (requestId: string) => {
    if (actionLoading) return;
    setActionLoading(requestId);
    try {
      await doctorDashboardService.approveRequest(requestId);
      await Promise.all([fetchStats(), fetchRequests(currentPage)]);
    } catch (e) {
      console.error('approve', e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (actionLoading) return;
    setActionLoading(requestId);
    try {
      await doctorDashboardService.rejectRequest(requestId);
      await Promise.all([fetchStats(), fetchRequests(currentPage)]);
    } catch (e) {
      console.error('reject', e);
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Stat cards data ────────────────────────────────────────────────────────

  const statItems = [
    {
      label: t('total_students'),
      value: stats?.totalStudents ?? 0,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/30',
      iconColor: isDark ? '#60a5fa' : '#2563eb',
    },
    {
      label: t('pending_requests'),
      value: stats?.pendingRequests ?? 0,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/30',
      iconColor: isDark ? '#fbbf24' : '#d97706',
    },
    {
      label: t('approved_requests'),
      value: stats?.approvedRequests ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
      iconColor: isDark ? '#34d399' : '#059669',
    },
  ];

  // ─── Render ─────────────────────────────────────────────────────────────────

  const userName = (user as any)?.fullName ?? 'Doctor';
  const initials = userName.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase();

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
              {t('welcome_back')}
            </Text>
            <Text className="text-2xl font-black text-slate-900 dark:text-white leading-none">
              {role === 'Doctor' ? t('doctor_prefix') : ''}
              {userName}
            </Text>
          </View>
          <LinearGradient
            colors={isDark ? ['#4f46e5', '#1e1b4b'] : ['#6366f1', '#3b82f6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-14 h-14 rounded-full items-center justify-center border-4 border-white dark:border-slate-900 shadow-xl shadow-indigo-200 dark:shadow-none"
          >
            <Text className="text-white font-black text-base">{initials}</Text>
          </LinearGradient>
        </View>

        {/* ── Stat Cards Grid ── */}
        <View className="flex-row flex-wrap gap-3 mb-8">
          {statItems.map((item, idx) => (
            <View 
              key={idx} 
              className="bg-white dark:bg-slate-900 flex-1 min-w-[140px] p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-200/50 dark:shadow-none"
            >
              <View className={`${item.bgColor} w-11 h-11 rounded-2xl items-center justify-center mb-4`}>
                <item.icon size={22} color={item.iconColor} strokeWidth={2.5} />
              </View>
              <Text className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                {statsLoading ? '...' : item.value}
              </Text>
              <Text className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">
                {item.label}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Recent Requests ── */}
        <View className="mb-4 flex-row items-center justify-between px-1">
          <Text className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
            {t('recent_cases')}
          </Text>
          <TouchableOpacity onPress={() => fetchRequests(1)} activeOpacity={0.7}>
            <Text className="text-xs font-bold text-indigo-500">{t('refresh')}</Text>
          </TouchableOpacity>
        </View>

        {reqsLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <View
              key={i}
              className="h-44 bg-slate-200/50 dark:bg-slate-900/50 rounded-3xl mb-4 animate-pulse border border-dashed border-slate-200 dark:border-slate-800"
            />
          ))
        ) : requestsData?.items.length === 0 ? (
          <View className="py-20 items-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <ClipboardList size={40} color={isDark ? '#334155' : '#cbd5e1'} strokeWidth={1.5} />
            <Text className="text-slate-400 dark:text-slate-500 font-bold mt-4">{t('no_requests')}</Text>
          </View>
        ) : (
          requestsData?.items.map((req) => {
            const isPending = req.status === 'Pending';
            const s = {
              bg: isPending ? (isDark ? '#451a03' : '#fef3c7') : (isDark ? '#064e3b' : '#d1fae5'),
              text: isPending ? (isDark ? '#fbbf24' : '#92400e') : (isDark ? '#34d399' : '#065f46')
            };

            return (
              <View
                key={req.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none mb-4 overflow-hidden"
              >
                <View className="flex-row p-5 gap-4">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-2">
                      <View className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50">
                        <Text className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase">
                          Case #{req.id.slice(-4)}
                        </Text>
                      </View>
                      <View style={{ backgroundColor: s.bg }} className="px-2 py-0.5 rounded-full">
                        <Text style={{ color: s.text }} className="text-[9px] font-black uppercase">
                          {req.status}
                        </Text>
                      </View>
                    </View>
                    
                    <Text className="text-base font-black text-slate-900 dark:text-white leading-tight mb-3" numberOfLines={1}>
                      {req.caseName}
                    </Text>

                    <View className="flex-row items-center gap-4">
                      <View className="flex-row items-center gap-1.5">
                        <View className="w-5 h-5 rounded-full bg-slate-50 dark:bg-slate-800 items-center justify-center">
                          <Users size={10} color={isDark ? '#94a3b8' : '#64748b'} />
                        </View>
                        <Text className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                          {req.studentName}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="items-end justify-between">
                    <TouchableOpacity
                      onPress={() => handleApprove(req.id)}
                      disabled={!!actionLoading}
                      className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 items-center justify-center border border-emerald-100 dark:border-emerald-900/30"
                      style={{ opacity: actionLoading ? 0.5 : 1 }}
                    >
                      <CheckCircle2 size={18} color={isDark ? '#34d399' : '#059669'} />
                    </TouchableOpacity>
                    
                    <View className="flex-row items-center gap-1">
                      <Clock size={10} color={isDark ? '#475569' : '#94a3b8'} />
                      <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                        {new Date(req.createAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-GB', { day: 'numeric', month: 'short' })}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

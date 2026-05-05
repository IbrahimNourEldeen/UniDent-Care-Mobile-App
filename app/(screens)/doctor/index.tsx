import { DoctorStatsGrid, StatItem } from '@/features/dashboard/components/doctor/DoctorStatsGrid';
import { WelcomeHeader } from '@/features/dashboard/components/doctor/WelcomeHeader';
import {
  useDoctorCaseCounts,
  useDoctorProfile,
  useDoctorRequestActions,
  useDoctorRequests,
} from '@/features/dashboard/hooks/useDoctorQueries';
import { useAppSelector } from '@/store/hooks';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { useQueryClient } from '@tanstack/react-query';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Layers,
  Users,
  XCircle,
  X,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DoctorDashboardScreen() {
  const { t } = useTranslation();
  const { user, role } = useAppSelector((s) => s.auth);
  const { theme, language } = useThemeLanguage();
  const isDark = theme === 'dark';
  const isRtl = language === 'ar';

  const doctorId = (user as any)?.publicId ?? (user as any)?.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // ─── Data Fetching ────────────────────────────────────────────────────────
  const { data: profile, isLoading: statsLoading } = useDoctorProfile(doctorId);
  const { ongoingCount, completedCount, cancelledCount, underReviewCount, rejectedCount, isLoading: countsLoading } = useDoctorCaseCounts(doctorId);
  const { data: requestsData, isLoading: reqsLoading } = useDoctorRequests(doctorId, 1, 5, 0); // Pending only
  const { approveRequest, rejectRequest } = useDoctorRequestActions();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isLoading = statsLoading || countsLoading;

  // ─── Refresh ──────────────────────────────────────────────────────────────
  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['doctor'] });
    setRefreshing(false);
  };

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleApprove = async (requestId: string) => {
    if (actionLoading) return;
    setActionLoading(requestId);
    try { await approveRequest(requestId); } catch (e) { /* silent */ }
    finally { setActionLoading(null); }
  };

  const handleReject = async (requestId: string) => {
    if (actionLoading) return;
    setActionLoading(requestId);
    try { await rejectRequest(requestId); } catch (e) { /* silent */ }
    finally { setActionLoading(null); }
  };

  // ─── Stat Cards ───────────────────────────────────────────────────────────
  const statItems: StatItem[] = [
    {
      label: t('pending_requests'),
      value: profile?.pendingRequests ?? 0,
      icon: Clock,
      bgColor: 'bg-amber-50 dark:bg-amber-900/30',
      iconColor: isDark ? '#fbbf24' : '#d97706',
      accentColor: 'bg-amber-200 dark:bg-amber-800',
    },
    {
      label: t('ongoing_cases'),
      value: ongoingCount,
      icon: Layers,
      bgColor: 'bg-blue-50 dark:bg-blue-900/30',
      iconColor: isDark ? '#60a5fa' : '#2563eb',
      accentColor: 'bg-blue-200 dark:bg-blue-800',
    },
    {
      label: t('completed_cases'),
      value: completedCount,
      icon: CheckCircle2,
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
      iconColor: isDark ? '#34d399' : '#059669',
      accentColor: 'bg-emerald-200 dark:bg-emerald-800',
    },
    {
      label: t('under_review'),
      value: underReviewCount,
      icon: Clock,
      bgColor: 'bg-amber-50 dark:bg-amber-900/30',
      iconColor: isDark ? '#fbbf24' : '#d97706',
      accentColor: 'bg-amber-200 dark:bg-amber-800',
    },
    {
      label: t('cancelled_cases', 'Cancelled'),
      value: cancelledCount,
      icon: XCircle,
      bgColor: 'bg-slate-50 dark:bg-slate-900/30',
      iconColor: isDark ? '#94a3b8' : '#64748b',
      accentColor: 'bg-slate-200 dark:bg-slate-800',
    },
    {
      label: t('rejected_cases', 'Rejected'),
      value: rejectedCount,
      icon: X,
      bgColor: 'bg-rose-50 dark:bg-rose-900/30',
      iconColor: isDark ? '#fb7185' : '#e11d48',
      accentColor: 'bg-rose-200 dark:bg-rose-800',
    },
  ];

  const userName = (user as any)?.fullName ?? 'Doctor';
  const initials = userName.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase();

  // ─── Pending requests for quick action section ────────────────────────────
  const pendingRequests = (requestsData?.items ?? []).filter(r => r.status === 'Pending');

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <StatusBar barStyle="light-content" />

      {/* Fixed Gradient Background */}
      <View className="absolute top-0 left-0 right-0 h-[280px]">
        <LinearGradient
          colors={isDark ? ['#1e1b4b', '#0f172a'] : ['#3b82f6', '#4f46e5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-full h-full rounded-b-[48px] shadow-2xl shadow-indigo-500/20"
        />
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? '#818cf8' : 'white'}
          />
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 64, paddingBottom: 110 }}
      >
        {/* Welcome Header */}
        <Animated.View entering={FadeInUp.duration(600).delay(200)}>
          <WelcomeHeader
            userName={userName}
            role={role || ''}
            initials={initials}
            isDark={isDark}
          />
        </Animated.View>

        {/* 4-Card Stats Grid */}
        <DoctorStatsGrid stats={statItems} loading={isLoading} />

        {/* Quick Actions Row */}
        <View className={`flex-row gap-3 mb-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
          {/* Browse Cases */}
          <TouchableOpacity
            onPress={() => router.push('/(screens)/doctor/cases' as any)}
            activeOpacity={0.85}
            className="flex-1"
          >
            <LinearGradient
              colors={isDark ? ['#1e1b4b', '#1e293b'] : ['#4f46e5', '#6366f1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-3xl px-5 py-5 items-center gap-2 shadow-lg shadow-indigo-200/60 dark:shadow-none"
            >
              <View className="w-10 h-10 rounded-2xl bg-white/20 items-center justify-center">
                <Briefcase size={20} color="white" />
              </View>
              <Text className="text-white font-black text-xs text-center">
                {t('browse_cases')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Student List */}
          <TouchableOpacity
            onPress={() => router.push('/(screens)/doctor/student-list' as any)}
            activeOpacity={0.85}
            className="flex-1"
          >
            <LinearGradient
              colors={isDark ? ['#064e3b', '#1e293b'] : ['#059669', '#10b981']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-3xl px-5 py-5 items-center gap-2 shadow-lg shadow-emerald-200/60 dark:shadow-none"
            >
              <View className="w-10 h-10 rounded-2xl bg-white/20 items-center justify-center">
                <Users size={20} color="white" />
              </View>
              <Text className="text-white font-black text-xs text-center">
                {t('my_students')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Pending Requests Section */}
        <View className={`flex-row items-center justify-between mb-4 px-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <View className={`flex-row items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <Text className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
              {t('pending_requests')}
            </Text>
            {(profile?.pendingRequests ?? 0) > 0 && (
              <View className="bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                <Text className="text-[10px] font-black text-amber-600 dark:text-amber-400">
                  {profile?.pendingRequests}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={() => router.push('/(screens)/doctor/cases' as any)} activeOpacity={0.7}>
            <Text className="text-xs font-bold text-indigo-500">{t('view_all')}</Text>
          </TouchableOpacity>
        </View>

        {reqsLoading ? (
          // Skeleton cards for requests
          Array.from({ length: 2 }).map((_, i) => (
            <View
              key={i}
              className="h-24 bg-slate-200/50 dark:bg-slate-900/50 rounded-3xl mb-3 border border-dashed border-slate-200 dark:border-slate-800"
            />
          ))
        ) : pendingRequests.length === 0 ? (
          <View className="py-14 items-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <CheckCircle2 size={36} color={isDark ? '#334155' : '#cbd5e1'} strokeWidth={1.5} />
            <Text className="text-slate-400 dark:text-slate-500 font-bold mt-3 text-sm">
              {t('no_requests')}
            </Text>
          </View>
        ) : (
          pendingRequests.map((req) => (
            <TouchableOpacity
              key={req.id}
              activeOpacity={0.7}
              onPress={() => router.push(`/case-details/${req.patientCasePublicId || req.id}`)}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none mb-3 overflow-hidden"
            >
              <View className={`flex-row items-center p-4 gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <View className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 items-center justify-center">
                  <Users size={18} color={isDark ? '#818cf8' : '#4f46e5'} />
                </View>

                {/* Info */}
                <View className={`flex-1 ${isRtl ? 'items-end' : ''}`}>
                  <Text
                    className={`text-sm font-black text-slate-900 dark:text-white leading-tight ${isRtl ? 'text-right' : ''}`}
                    numberOfLines={1}
                  >
                    {req.caseName}
                  </Text>
                  <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {req.studentName}
                  </Text>
                </View>

                {/* Approve button */}
                <TouchableOpacity
                  onPress={() => handleApprove(req.id)}
                  disabled={!!actionLoading}
                  style={{ opacity: actionLoading === req.id ? 0.5 : 1 }}
                  className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 items-center justify-center border border-emerald-100 dark:border-emerald-900/30"
                >
                  <CheckCircle2 size={18} color={isDark ? '#34d399' : '#059669'} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

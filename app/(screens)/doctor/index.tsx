import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  RefreshControl,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Users,
  Clock,
  CheckCircle2,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/store/hooks';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import {
  doctorDashboardService,
  DoctorStats,
  PaginatedRequests,
} from '@/features/dashboard/services/doctorDashboardService';
import { WelcomeHeader } from '@/features/dashboard/components/doctor/WelcomeHeader';
import { DoctorStatsGrid } from '@/features/dashboard/components/doctor/DoctorStatsGrid';
import { RecentRequests } from '@/features/dashboard/components/doctor/RecentRequests';

const PAGE_SIZE = 10;

export default function DoctorDashboardScreen() {
  const { t } = useTranslation();
  const { user, role } = useAppSelector((s) => s.auth);
  const { theme, language } = useThemeLanguage();
  const isDark = theme === 'dark';

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
    [currentPage, doctorId],
  );

  useEffect(() => {
    fetchStats();
    fetchRequests(1);
  }, [doctorId, fetchStats, fetchRequests]);

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
        <WelcomeHeader 
          userName={userName} 
          role={role || ''} 
          initials={initials} 
          isDark={isDark} 
        />

        <DoctorStatsGrid 
          stats={statItems} 
          loading={statsLoading} 
        />

        <RecentRequests
          requests={requestsData?.items || []}
          loading={reqsLoading}
          onApprove={handleApprove}
          onReject={handleReject}
          actionLoading={actionLoading}
          isDark={isDark}
          language={language}
          onRefresh={() => fetchRequests(1)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

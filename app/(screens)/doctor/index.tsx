import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  RefreshControl,
  I18nManager,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Users,
  Clock,
  CheckCircle2,
  Briefcase,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/store/hooks';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { useRouter } from 'expo-router';
import {
  doctorDashboardService,
  DoctorStats,
  PagedResult,
  CaseRequest,
} from '@/features/dashboard/services/doctorDashboardService';
import { WelcomeHeader } from '@/features/dashboard/components/doctor/WelcomeHeader';
import { DoctorStatsGrid } from '@/features/dashboard/components/doctor/DoctorStatsGrid';
import { RecentRequests } from '@/features/dashboard/components/doctor/RecentRequests';
import { useDoctorProfile, useDoctorRequests, useDoctorRequestActions } from '@/features/dashboard/hooks/useDoctorQueries';
import { useQueryClient } from '@tanstack/react-query';

const PAGE_SIZE = 10;

export default function DoctorDashboardScreen() {
  const { t } = useTranslation();
  const { user, role } = useAppSelector((s) => s.auth);
  const { theme, language } = useThemeLanguage();
  const isDark = theme === 'dark';

  const doctorId = (user as any)?.publicId ?? (user as any)?.id;

  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  // Use React Query hooks
  const { data: stats, isLoading: statsLoading } = useDoctorProfile(doctorId);
  const { data: requestsData, isLoading: reqsLoading } = useDoctorRequests(doctorId, currentPage, PAGE_SIZE);
  const { approveRequest, rejectRequest } = useDoctorRequestActions();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['doctor'] });
    setRefreshing(false);
  };

  const handleApprove = async (requestId: string) => {
    if (actionLoading) return;
    setActionLoading(requestId);
    try {
      await approveRequest(requestId);
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
      await rejectRequest(requestId);
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

        {/* Browse Cases Quick Action */}
        <TouchableOpacity
          onPress={() => router.push('/(screens)/doctor/cases' as any)}
          activeOpacity={0.85}
          className="mb-5"
        >
          <LinearGradient
            colors={isDark ? ['#1e1b4b', '#1e293b'] : ['#4f46e5', '#6366f1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex-row items-center gap-4 px-5 py-4 rounded-3xl shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <View className="w-10 h-10 rounded-2xl bg-white/20 items-center justify-center">
              <Briefcase size={20} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-black text-sm">{t('browse_cases')}</Text>
              <Text className="text-white/60 text-[11px] font-medium mt-0.5">{t('available_cases_desc')}</Text>
            </View>
            <Text className="text-white/50 text-lg">›</Text>
          </LinearGradient>
        </TouchableOpacity>

        <RecentRequests
          requests={requestsData?.items || []}
          loading={reqsLoading}
          onApprove={handleApprove}
          onReject={handleReject}
          actionLoading={actionLoading}
          isDark={isDark}
          language={language}
          onRefresh={onRefresh}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

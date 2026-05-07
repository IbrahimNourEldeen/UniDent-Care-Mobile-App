import { doctorDashboardService, SessionDto } from '@/features/dashboard/services/doctorDashboardService';
import { useAppSelector } from '@/store/hooks';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  FolderOpen,
  MessageSquare,
  RefreshCw,
  Stethoscope,
  Users,
  ChevronRight,
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Calendar } from 'react-native-calendars';

const { width } = Dimensions.get('window');

const PIE_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#f43f5e', // rose
];

export default function DoctorDashboardScreen() {
  const { t } = useTranslation();
  const { user } = useAppSelector((s) => s.auth);
  const { theme, language } = useThemeLanguage();
  const isDark = theme === 'dark';
  const isRtl = language === 'ar';
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const doctorId = (user as any)?.publicId ?? (user as any)?.id;
  const firstName = (user as any)?.fullName?.split(' ')[0] || (isRtl ? 'دكتور' : 'Doctor');

  // ─── Data Fetching ────────────────────────────────────────────────────────
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['doctor', 'dashboard', 'stats', doctorId],
    queryFn: async () => {
      const [casesRes, reqsRes, evalRes, schedRes] = await Promise.all([
        doctorDashboardService.getCasesByDoctor(doctorId, undefined, 1, 1),
        doctorDashboardService.getDoctorRequests(doctorId, 1, 1, 0),
        doctorDashboardService.getSessionsToEvaluate({ pageSize: 1 }),
        doctorDashboardService.getScheduleSessions({ pageSize: 500 }),
      ]);

      const today = format(new Date(), 'yyyy-MM-dd');
      const todayCount = (schedRes?.items ?? []).filter(
        (s: SessionDto) => s.scheduledAt?.startsWith(today)
      ).length;

      return {
        totalCases: casesRes?.totalCount ?? 0,
        pendingRequests: reqsRes?.totalCount ?? 0,
        toEvaluate: evalRes?.totalCount ?? 0,
        todaySessions: todayCount,
        allSessions: schedRes?.items ?? [],
      };
    },
    enabled: !!doctorId,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['doctor'] });
    await refetchStats();
    setRefreshing(false);
  };

  // ─── Process Data for UI ──────────────────────────────────────────────────
  const pieData = useMemo(() => {
    const sessions = stats?.allSessions ?? [];
    const counts: Record<string, number> = {};
    sessions.forEach((s) => {
      const key = s.treatmentType || (isRtl ? 'أخرى' : 'Other');
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([text, value], idx) => ({
        value,
        text,
        color: PIE_COLORS[idx % PIE_COLORS.length],
      }));
  }, [stats?.allSessions, isRtl]);

  const latestNotes = useMemo(() => {
    const notes: any[] = [];
    (stats?.allSessions ?? []).forEach((s) => {
      // In mobile, we might need to fetch notes separately if not in session object
      // but let's assume session object might have count or we use placeholder for parity
    });
    // For now, let's show upcoming sessions as "Activity" if notes are missing
    return (stats?.allSessions ?? [])
      .sort((a, b) => new Date(b.createAt).getTime() - new Date(a.createAt).getTime())
      .slice(0, 5);
  }, [stats?.allSessions]);

  const now = new Date();
  const todayStr = isRtl
    ? now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const statCards = [
    {
      key: 'totalCases',
      label: t('total_cases', 'Total Cases'),
      value: stats?.totalCases ?? 0,
      icon: FolderOpen,
      colors: ['#2563eb', '#4f46e5'],
      bg: isDark ? 'bg-blue-900/20' : 'bg-blue-50/60',
      text: 'text-blue-600 dark:text-blue-400',
    },
    {
      key: 'pendingRequests',
      label: t('pending_requests'),
      value: stats?.pendingRequests ?? 0,
      icon: Clock,
      colors: ['#f59e0b', '#f97316'],
      bg: isDark ? 'bg-amber-900/20' : 'bg-amber-50/60',
      text: 'text-amber-600 dark:text-amber-400',
    },
    {
      key: 'toEvaluate',
      label: t('needs_evaluate'),
      value: stats?.toEvaluate ?? 0,
      icon: AlertCircle,
      colors: ['#e11d48', '#be123c'],
      bg: isDark ? 'bg-rose-900/20' : 'bg-rose-50/60',
      text: 'text-rose-600 dark:text-rose-400',
    },
    {
      key: 'todaySessions',
      label: t('todays_agenda'),
      value: stats?.todaySessions ?? 0,
      icon: CalendarDays,
      colors: ['#7c3aed', '#6d28d9'],
      bg: isDark ? 'bg-violet-900/20' : 'bg-violet-50/60',
      text: 'text-violet-600 dark:text-violet-400',
    },
  ];

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 60 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
        }
      >
        {/* Header Section */}
        <Animated.View entering={FadeInUp.duration(600)} className="px-5 mb-8">
          <View className={`flex-row justify-between items-start ${isRtl ? 'flex-row-reverse' : ''}`}>
            <View className={`flex-row items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <LinearGradient
                colors={['#4f46e5', '#7c3aed']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
              >
                <Stethoscope size={28} color="white" />
              </LinearGradient>
              <View className={isRtl ? 'items-end' : 'items-start'}>
                <Text className="text-2xl font-black text-slate-800 dark:text-white">
                  {isRtl ? `أهلاً بك، د. ${firstName}! 👋` : `Welcome, Dr. ${firstName}! 👋`}
                </Text>
                <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                  {todayStr}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onRefresh}
              className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm"
            >
              <RefreshCw size={20} color={isDark ? '#94a3b8' : '#64748b'} className={refreshing ? 'animate-spin' : ''} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Stats Grid */}
        <View className="px-5 mb-8">
          <View className="flex-row flex-wrap justify-between">
            {statCards.map((card, idx) => (
              <Animated.View
                key={card.key}
                entering={FadeInDown.delay(idx * 100)}
                style={{ width: (width - 50) / 2 }}
                className={`p-5 rounded-[32px] mb-4 border border-white/20 dark:border-white/5 ${card.bg} shadow-sm`}
              >
                <View className="flex-row justify-between items-start mb-4">
                  <View className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm">
                    <card.icon size={18} color={card.colors[0]} />
                  </View>
                </View>
                <Text className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">
                  {card.label}
                </Text>
                {statsLoading ? (
                  <ActivityIndicator size="small" color={card.colors[0]} style={{ alignSelf: 'flex-start' }} />
                ) : (
                  <Text className={`text-3xl font-black ${card.text}`}>{card.value}</Text>
                )}
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Calendar Section */}
        <View className="px-5 mb-8">
          <View className={`flex-row justify-between items-center mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <View className={`flex-row items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <CalendarDays size={20} color="#6366f1" />
              <Text className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider">
                {t('my_schedule', 'My Schedule')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(screens)/doctor/pending-request' as any)}>
              <Text className="text-xs font-bold text-indigo-500">{t('view_all')}</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white dark:bg-slate-900 rounded-[32px] p-2 overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
            <Calendar
              theme={{
                backgroundColor: 'transparent',
                calendarBackground: 'transparent',
                textSectionTitleColor: isDark ? '#94a3b8' : '#64748b',
                selectedDayBackgroundColor: '#6366f1',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#6366f1',
                dayTextColor: isDark ? '#f1f5f9' : '#1e293b',
                textDisabledColor: isDark ? '#334155' : '#cbd5e1',
                dotColor: '#6366f1',
                selectedDotColor: '#ffffff',
                arrowColor: '#6366f1',
                monthTextColor: isDark ? '#f8fafc' : '#0f172a',
                indicatorColor: '#6366f1',
                textDayFontWeight: '700',
                textMonthFontWeight: '900',
                textDayHeaderFontWeight: '700',
              }}
              enableSwipeMonths
            />
          </View>
        </View>

        {/* Analytics Section */}
        <View className="px-5 mb-8">
          <View className={`flex-row justify-between items-center mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <View className={`flex-row items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <MessageSquare size={20} color="#10b981" />
              <Text className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider">
                {t('cases_distribution', 'Case Distribution')}
              </Text>
            </View>
          </View>

          <View className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex-row items-center">
            {pieData.length > 0 ? (
              <>
                <PieChart
                  data={pieData}
                  donut
                  radius={70}
                  innerRadius={50}
                  innerCircleColor={isDark ? '#0f172a' : '#ffffff'}
                  centerLabelComponent={() => (
                    <View className="items-center justify-center">
                      <Text className="text-xl font-black text-slate-800 dark:text-white">
                        {stats?.totalCases ?? 0}
                      </Text>
                      <Text className="text-[8px] font-bold text-slate-400 uppercase">
                        {t('cases')}
                      </Text>
                    </View>
                  )}
                />
                <View className="flex-1 ml-6 gap-3">
                  {pieData.slice(0, 4).map((item, idx) => (
                    <View key={idx} className={`flex-row items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color }} />
                      <Text className="text-[10px] font-bold text-slate-600 dark:text-slate-300 flex-1" numberOfLines={1}>
                        {item.text}
                      </Text>
                      <Text className="text-[10px] font-black text-slate-800 dark:text-white">
                        {item.value}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <View className="flex-1 py-10 items-center">
                <Text className="text-slate-400 font-bold">{t('no_data_available', 'No data available')}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Recent Activity / Notes */}
        <View className="px-5">
          <View className={`flex-row justify-between items-center mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <View className={`flex-row items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <FileText size={20} color="#f59e0b" />
              <Text className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider">
                {t('latest_notes', 'Latest Notes')}
              </Text>
            </View>
          </View>

          {latestNotes.length > 0 ? (
            latestNotes.map((session, idx) => (
              <Animated.View
                key={session.id}
                entering={FadeInDown.delay(idx * 100)}
                className="bg-white dark:bg-slate-900 rounded-3xl p-4 mb-3 border border-slate-100 dark:border-slate-800 shadow-sm flex-row items-center gap-4"
              >
                <View className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 items-center justify-center">
                  <FolderOpen size={20} color={isDark ? '#818cf8' : '#4f46e5'} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-black text-slate-800 dark:text-white" numberOfLines={1}>
                    {session.treatmentType || (isRtl ? 'جلسة علاج' : 'Treatment Session')}
                  </Text>
                  <Text className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {session.patientName || (isRtl ? 'مريض مجهول' : 'Anonymous Patient')}
                  </Text>
                  <View className={`flex-row items-center gap-1 mt-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <Clock size={10} color="#94a3b8" />
                    <Text className="text-[10px] text-slate-400">
                      {format(new Date(session.scheduledAt), 'MMM d, h:mm a')}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#cbd5e1" />
              </Animated.View>
            ))
          ) : (
            <View className="bg-white dark:bg-slate-900 rounded-[32px] p-10 items-center border border-slate-100 dark:border-slate-800 border-dashed">
              <Text className="text-slate-400 font-bold">{t('no_notes', 'No recent activity')}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

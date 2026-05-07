import { useDoctorRequestActions, useDoctorRequests } from '@/features/dashboard/hooks/useDoctorQueries';
import { doctorDashboardService, CaseRequest } from '@/features/dashboard/services/doctorDashboardService';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { useAppSelector } from '@/store/hooks';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Activity,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  GraduationCap,
  LayoutGrid,
  List,
  Search,
  User,
  X,
  XCircle,
  ClipboardList,
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  I18nManager,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const TABS = [
  { id: 'all', labelKey: 'all_tab', label: 'All', icon: Activity, value: undefined },
  { id: 'pending', labelKey: 'pending', label: 'Pending', icon: Clock, value: 0 },
  { id: 'approved', labelKey: 'approved', label: 'Approved', icon: CheckCircle2, value: 2 },
  { id: 'rejected', labelKey: 'rejected', label: 'Rejected', icon: XCircle, value: 3 },
] as const;

type TabId = typeof TABS[number]['id'];


function RequestCard({
  item,
  isDark,
  locale,
  t,
  onApprove,
  onReject,
  actionLoading,
}: {
  item: CaseRequest;
  isDark: boolean;
  locale: string;
  t: any;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  actionLoading: string | null;
}) {
  const isRtl = I18nManager.isRTL;
  const router = useRouter();

  const status = item.status;
  const isApproved = status === 'Approved';
  const isRejected = status === 'Rejected';
  const isPending = status === 'Pending';

  const initials = (item.studentName ?? 'S')
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const formattedDate = new Date(item.createAt).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Animated.View entering={FadeInDown.duration(400)}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push(`/case-details/${item.patientCasePublicId || item.id}`)}
        className={`mb-5 rounded-[28px] overflow-hidden border-2 ${
          isDark
            ? isPending ? 'bg-slate-900 border-amber-500/20' : 'bg-slate-900 border-slate-800'
            : isPending ? 'bg-white border-amber-100 shadow-xl shadow-amber-900/5' : 'bg-white border-slate-50 shadow-sm shadow-slate-200/50'
        }`}
      >
        {/* Pending Indicator Strip */}
        {isPending && <View className="h-1.5 w-full bg-amber-400/80" />}

        <View className="p-5">
          <View className={`flex-row items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
            {/* Avatar with dynamic ring */}
            <View className={`p-1 rounded-[20px] ${isPending ? 'border-2 border-amber-400/30' : ''}`}>
                <LinearGradient
                colors={isDark ? ['#334155', '#1e293b'] : ['#4f46e5', '#6366f1']}
                className="w-14 h-14 rounded-[16px] items-center justify-center"
                >
                <Text className="text-white font-black text-lg">{initials}</Text>
                </LinearGradient>
            </View>

            {/* Info Section */}
            <View className={`flex-1 ${isRtl ? 'items-end' : 'items-start'}`}>
              <View className={`flex-row items-center gap-2 mb-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <Text
                  className={`font-black text-slate-900 dark:text-white text-lg leading-tight ${isRtl ? 'text-right' : ''}`}
                  numberOfLines={1}
                >
                  {item.diagnosisdto?.[0]?.caseType || item.diagnosisdto?.[0]?.caseTypeName || (item.diagnosisdto as any)?.caseType || (item.diagnosisdto as any)?.caseTypeName || item.caseName || (item as any).title || t('unknown_case', 'Unknown Case')}
                </Text>
              </View>
              
              <View className={`flex-row items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <GraduationCap size={14} color={isDark ? '#94a3b8' : '#64748b'} />
                <Text className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  {item.studentName}
                </Text>
              </View>
            </View>

            {/* Status Badge */}
            <View
                className={`px-3 py-1.5 rounded-xl ${
                isApproved ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                isRejected ? 'bg-rose-100 dark:bg-rose-900/30' :
                'bg-amber-100 dark:bg-amber-900/30'
                }`}
            >
                <Text
                className={`text-[10px] font-black uppercase tracking-tighter ${
                    isApproved ? 'text-emerald-700 dark:text-emerald-400' :
                    isRejected ? 'text-rose-700 dark:text-rose-400' :
                    'text-amber-700 dark:text-amber-500'
                }`}
                >
                {t('status_' + status.toLowerCase(), status)}
                </Text>
            </View>
          </View>

          {/* Details Row */}
          <View className={`flex-row items-center justify-between mt-5 p-3 rounded-2xl ${isDark ? 'bg-slate-950/50' : 'bg-slate-50'}`}>
            <View className={`flex-row items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <User size={14} color="#94a3b8" />
              <Text className="text-xs font-bold text-slate-600 dark:text-slate-400">
                {item.patientName || 'Anonymous'}
              </Text>
            </View>
            <View className={`flex-row items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <Calendar size={14} color="#94a3b8" />
              <Text className="text-xs font-bold text-slate-600 dark:text-slate-400">
                {formattedDate}
              </Text>
            </View>
          </View>

          {/* Action Area */}
          {isPending ? (
            <View className={`flex-row gap-3 mt-5 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <TouchableOpacity
                onPress={() => onApprove(item.id)}
                disabled={!!actionLoading}
                className="flex-[2] h-14 bg-emerald-500 rounded-2xl items-center justify-center flex-row gap-2 shadow-lg shadow-emerald-500/30"
              >
                {actionLoading === item.id ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Check size={20} color="white" strokeWidth={3} />
                )}
                <Text className="text-white font-black text-sm uppercase tracking-widest">
                  {t('approve', 'Approve')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onReject(item.id)}
                disabled={!!actionLoading}
                className="flex-1 h-14 bg-rose-50 dark:bg-rose-900/20 rounded-2xl items-center justify-center border border-rose-100 dark:border-rose-900/30"
              >
                <X size={22} color={isDark ? '#fb7185' : '#e11d48'} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => router.push(`/case-details/${item.patientCasePublicId || item.id}`)}
              className="mt-4 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl items-center justify-center flex-row gap-2"
            >
              <Eye size={18} color={isDark ? '#818cf8' : '#4f46e5'} />
              <Text className="text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase">
                {t('view_details', 'View Case Details')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function PendingRequestsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);
  const { theme, language } = useThemeLanguage();
  const isDark = theme === 'dark';
  const isRtl = language === 'ar';
  const locale = isRtl ? 'ar-EG' : 'en-GB';

  const doctorId = (user as any)?.publicId ?? (user as any)?.id;
  const [activeTab, setActiveTab] = useState<TabId>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const activeStatus = useMemo(() => TABS.find((t) => t.id === activeTab)?.value, [activeTab]);

  const { data: resData, isLoading, refetch } = useDoctorRequests(doctorId, page, 30, activeStatus);
  const { approveRequest, rejectRequest } = useDoctorRequestActions();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const items = useMemo(() => resData?.items ?? [], [resData]);
  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((item) =>
      (
        (item.studentName || '') +
        (item.patientName || '') +
        (item.diagnosisdto?.[0]?.caseType ||
          item.diagnosisdto?.[0]?.caseTypeName ||
          (item.diagnosisdto as any)?.caseType ||
          (item.diagnosisdto as any)?.caseTypeName ||
          item.caseName ||
          (item as any).title ||
          '')
      )
        .toLowerCase()
        .includes(q)
    );
  }, [items, searchQuery]);

  const handleApprove = async (requestId: string) => {
    if (actionLoading) return;
    setActionLoading(requestId);
    try {
      await approveRequest(requestId);
      await refetch();
    } catch (e) {
      /* handled by mutation */
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (actionLoading) return;
    setActionLoading(requestId);
    try {
      await rejectRequest(requestId);
      await refetch();
    } catch (e) {
      /* handled by mutation */
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <StatusBar barStyle="light-content" />

      {/* Hero Header */}
      <View className="absolute top-0 left-0 right-0 h-[320px]">
        <LinearGradient
          colors={isDark ? ['#1e1b4b', '#0f172a'] : ['#f59e0b', '#d97706']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-full h-full rounded-b-[48px] shadow-2xl shadow-amber-500/20"
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="white" />
        }
      >
        <Animated.View entering={FadeInUp.duration(600)} className="px-6 pt-16 pb-10">
          <View className={`flex-row justify-between items-center ${isRtl ? 'flex-row-reverse' : ''}`}>
            <View className={isRtl ? 'items-end' : 'items-start'}>
              <Text className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">
                {t('doctor_panel', 'Doctor Panel')}
              </Text>
              <View className="flex-row items-center gap-3">
                <Text className="text-white text-3xl font-black">
                  {t('case_requests', 'Case Requests')}
                </Text>
                {isLoading && (
                  <View className="bg-white/20 px-2 py-1 rounded-full flex-row items-center gap-1.5">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-[8px] font-bold text-white uppercase">Syncing</Text>
                  </View>
                )}
              </View>
            </View>
            <View className="bg-white/20 px-4 py-2 rounded-2xl">
              <Text className="text-white/70 text-[10px] font-bold uppercase tracking-wider">
                {t('total', 'Total')}
              </Text>
              <Text className="text-white text-2xl font-black text-center">
                {resData?.totalCount ?? 0}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Tabs */}
        <View className="px-5 z-20 mb-8">
          <View
            className={`rounded-[32px] p-2 shadow-xl ${isDark ? 'bg-slate-900 shadow-black/50' : 'bg-white shadow-amber-900/10'}`}
            style={{ elevation: 15 }}
          >
            <View className={`flex-row p-1 rounded-2xl ${isDark ? 'bg-slate-950/50' : 'bg-slate-50'}`}>
              {TABS.map((tab) => {
                const active = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => {
                      setActiveTab(tab.id);
                      setPage(1);
                    }}
                    className={`flex-1 py-4 flex-row items-center justify-center gap-1.5 rounded-xl ${
                      active
                        ? isDark
                          ? 'bg-amber-600/20 shadow-md'
                          : 'bg-white shadow-sm border border-slate-100'
                        : 'bg-transparent'
                    }`}
                  >
                    <Icon
                      size={14}
                      color={active ? (isDark ? '#fbbf24' : '#d97706') : isDark ? '#475569' : '#94a3b8'}
                    />
                    <Text
                      className={`text-[10px] font-black uppercase tracking-wider ${
                        active
                          ? isDark ? 'text-amber-400' : 'text-amber-600'
                          : isDark ? 'text-slate-500' : 'text-slate-400'
                      }`}
                      numberOfLines={1}
                    >
                      {t(tab.labelKey, tab.label)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Content */}
        <View className="px-5">
          {/* Search */}
          <View className={`flex-row items-center px-4 h-14 mb-6 rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm shadow-slate-200/50'}`}>
            <Search size={20} color={isDark ? '#475569' : '#94a3b8'} />
            <TextInput
              placeholder={t('search_placeholder_students_requests', 'Search student or patient...')}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={isDark ? '#334155' : '#cbd5e1'}
              className={`flex-1 ml-3 text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'} ${isRtl ? 'text-right' : 'text-left'}`}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color={isDark ? '#475569' : '#94a3b8'} />
              </TouchableOpacity>
            )}
          </View>

          {isLoading && items.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => (
              <View key={i} className={`h-40 rounded-[32px] mb-4 border border-dashed ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100'}`} />
            ))
          ) : filteredItems.length === 0 ? (
            <Animated.View entering={FadeInDown.delay(200)} className={`py-24 items-center rounded-[48px] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
              <View className="w-24 h-24 rounded-[40px] bg-amber-50 dark:bg-amber-900/20 items-center justify-center mb-6">
                <ClipboardList size={40} color={isDark ? '#f59e0b' : '#d97706'} />
              </View>
              <Text className="text-xl font-black text-slate-800 dark:text-white">
                {t('no_requests_found', 'No requests found')}
              </Text>
              <Text className="text-sm text-slate-400 dark:text-slate-500 mt-2 text-center px-12 font-bold">
                {t('no_requests_desc', 'There are no requests in this category yet.')}
              </Text>
            </Animated.View>
          ) : (
            filteredItems.map((item) => (
              <RequestCard
                key={item.id}
                item={item}
                isDark={isDark}
                locale={locale}
                t={t}
                onApprove={handleApprove}
                onReject={handleReject}
                actionLoading={actionLoading}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

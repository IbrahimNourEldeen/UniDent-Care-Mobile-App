import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  TextInput,
  ActivityIndicator,
  I18nManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import {
  ClipboardList,
  Search,
  X,
  User,
  Calendar,
  Stethoscope,
  BookOpen,
  CheckCircle2,
  Clock,
  Loader,
  GraduationCap,
} from 'lucide-react-native';

import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { useAppSelector } from '@/store/hooks';
import { doctorDashboardService, CaseRequest, PatientCaseDto, PagedResult } from '@/features/dashboard/services/doctorDashboardService';
import { useQuery } from '@tanstack/react-query';


// ─── Constants ───────────────────────────────────────────────────────────────

// RequestStatus enum: 0=Pending, 1=Approved, 2=Rejected, 3=Cancelled, 4=Taken, 5=Completed
const TABS = [
  {
    id: 'in_progress',
    labelKey: 'in_progress',
    label: 'In Progress',
    icon: Loader,
    statusNum: 1,
    statusStr: 'InProgress',
    source: 'cases' as const,
    color: { active: '#6366f1', bg: '#eef2ff', bgDark: '#1e1b4b', text: '#4338ca', textDark: '#818cf8' },
  },
  {
    id: 'completed',
    labelKey: 'completed',
    label: 'Completed',
    icon: CheckCircle2,
    statusNum: 5,
    statusStr: 'Completed',
    source: 'cases' as const,
    color: { active: '#10b981', bg: '#d1fae5', bgDark: '#064e3b', text: '#065f46', textDark: '#34d399' },
  },
] as const;

type TabId = typeof TABS[number]['id'];

const PAGE_SIZE = 30;



function CaseCard({
  item,
  isDark,
  locale,
  t,
  tabColor,
  onPress,
}: {
  item: PatientCaseDto;
  isDark: boolean;
  locale: string;
  t: (k: string, fallback?: string) => string;
  tabColor: typeof TABS[number]['color'];
  onPress: () => void;
}) {
  const isRtl = I18nManager.isRTL;
  const initials = (item.patientName ?? 'P')
    .split(' ')
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase();

  const formattedDate = new Date(item.createAt).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const diagArray = item.diagnoses || item.diagnosisdto || (item as any).diagnosisDto;
  const diag = Array.isArray(diagArray) ? diagArray[0] : diagArray;
  const resolvedCaseType =
    diag?.caseTypeName ||
    diag?.caseType ||
    item.caseType?.name ||
    (item as any).caseTypeName ||
    (item as any).caseName ||
    (item as any).title ||
    (typeof item.caseType === 'string' ? item.caseType : '') ||
    '—';

  return (
    <Animated.View entering={FadeInDown.duration(300)}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        className={`mb-4 rounded-[28px] overflow-hidden border ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm shadow-slate-200/60'
        }`}
      >
        <View style={{ height: 3, backgroundColor: tabColor.active }} />

        <View className="p-5">
          <View className={`flex-row items-start gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <LinearGradient
              colors={isDark ? ['#1e1b4b', '#0f172a'] : ['#3b82f6', '#4f46e5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>{initials}</Text>
            </LinearGradient>

            <View className={`flex-1 ${isRtl ? 'items-end' : ''}`}>
              <Text
                className={`font-black text-slate-900 dark:text-white text-base leading-tight ${isRtl ? 'text-right' : ''}`}
                numberOfLines={1}
              >
                {item.patientName}
              </Text>
              <View className={`flex-row items-center gap-1.5 mt-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <Stethoscope size={11} color={isDark ? '#64748b' : '#94a3b8'} />
                <Text className="text-xs font-bold text-slate-400 dark:text-slate-500" numberOfLines={1}>
                  {resolvedCaseType}
                </Text>
              </View>
            </View>
          </View>

          <View className={`h-px mt-4 mb-4 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`} />

          <View className={`flex-row flex-wrap gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <View className={`flex-row items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <View className="w-6 h-6 rounded-lg items-center justify-center" style={{ backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }}>
                <User size={11} color={isDark ? '#94a3b8' : '#64748b'} />
              </View>
              <View>
                <Text className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{t('age', 'Age')}</Text>
                <Text className="text-xs font-black text-slate-700 dark:text-slate-300">{item.patientAge}y</Text>
              </View>
            </View>

            <View className={`flex-row items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <View className="w-6 h-6 rounded-lg items-center justify-center" style={{ backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }}>
                <Calendar size={11} color={isDark ? '#94a3b8' : '#64748b'} />
              </View>
              <View>
                <Text className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{t('date', 'Date')}</Text>
                <Text className="text-xs font-black text-slate-700 dark:text-slate-300">{formattedDate}</Text>
              </View>
            </View>
            
            {(item as any).assignedStudentName && (
              <View className={`flex-row items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <View className="w-6 h-6 rounded-lg items-center justify-center" style={{ backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }}>
                  <GraduationCap size={11} color={isDark ? '#818cf8' : '#4f46e5'} />
                </View>
                <View>
                  <Text className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{t('student', 'Student')}</Text>
                  <Text className="text-xs font-black text-indigo-600 dark:text-indigo-400">{(item as any).assignedStudentName}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function MyStudentsCasesScreen() {
  const { t } = useTranslation();
  const { user } = useAppSelector((s) => s.auth);
  const { theme, language } = useThemeLanguage();
  const isDark = theme === 'dark';
  const isRtl = language === 'ar';
  const locale = isRtl ? 'ar-EG' : 'en-GB';
  const queryClient = useQueryClient();

  const doctorId = (user as any)?.publicId ?? (user as any)?.id;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabId>('in_progress');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState<PatientCaseDto | null>(null);

  const currentTab = TABS.find((t) => t.id === activeTab)!;

  // Fetch data filtered by status
  const { data: resData, isLoading: loading, refetch } = useQuery({
    queryKey: ['doctor-student-data', doctorId, activeTab],
    queryFn: async () => {
        return doctorDashboardService.getCasesByDoctor(doctorId, currentTab.statusStr, 1, PAGE_SIZE);
    },
    enabled: !!doctorId,
  });

  const items = resData?.items ?? [];

  const filteredItems = items.filter((item: any) => {
    const q = searchQuery.toLowerCase();
    const dArray = item.diagnoses || item.diagnosisdto || (item as any).diagnosisDto;
    const d = Array.isArray(dArray) ? dArray[0] : dArray;
    const caseTypeStr =
      d?.caseTypeName ||
      d?.caseType ||
      item.caseType?.name ||
      (item as any).caseTypeName ||
      (item as any).caseName ||
      (item as any).title ||
      (typeof item.caseType === 'string' ? item.caseType : '') ||
      '';
    const nameToMatch =
      (item.studentName || '') +
      (item.patientName || '') +
      (item as any).assignedStudentName +
      caseTypeStr;
    return nameToMatch.toLowerCase().includes(q);
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Count badge per tab
  const { data: inProgressData } = useQuery({
    queryKey: ['doctor-requests-count-v2', doctorId, 'InProgress'],
    queryFn: () => doctorDashboardService.getCasesByDoctor(doctorId, 'InProgress', 1, 1),
    enabled: !!doctorId,
  });
  const { data: completedData } = useQuery({
    queryKey: ['doctor-requests-count-v2', doctorId, 'Completed'],
    queryFn: () => doctorDashboardService.getCasesByDoctor(doctorId, 'Completed', 1, 1),
    enabled: !!doctorId,
  });

  const counts: Record<TabId, number> = {
    in_progress: inProgressData?.totalCount ?? 0,
    completed: completedData?.totalCount ?? 0,
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <StatusBar barStyle="light-content" />

      {/* Fixed Gradient Background */}
      <View className="absolute top-0 left-0 right-0 h-[300px]">
        <LinearGradient
          colors={isDark ? ['#1e1b4b', '#0f172a'] : ['#6366f1', '#4f46e5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-full h-full rounded-b-[48px] shadow-2xl shadow-indigo-500/20"
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? '#818cf8' : 'white'}
          />
        }
      >
        {/* ── Header ── */}
        <Animated.View entering={FadeInUp.duration(600)} className="px-6 pt-16 pb-10">
          <View className={`flex-row justify-between items-center ${isRtl ? 'flex-row-reverse' : ''}`}>
            <View className={isRtl ? 'items-end' : 'items-start'}>
              <Text className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">
                {t('doctor_panel', 'Doctor Panel')}
              </Text>
              <View className="flex-row items-center gap-3">
                <Text className="text-white text-3xl font-black" numberOfLines={1}>
                  {t('student_cases', 'Student Cases')}
                </Text>
                {loading && (
                  <View className="bg-white/20 px-2 py-1 rounded-full flex-row items-center gap-1.5">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-[8px] font-bold text-white uppercase tracking-tighter">Syncing</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Total badge */}
            <View className="bg-white/20 px-4 py-2 rounded-2xl">
              <Text className="text-white/70 text-[10px] font-bold uppercase tracking-wider">
                {t('total', 'Total')}
              </Text>
              <Text className="text-white text-2xl font-black text-center">
                {(inProgressData?.totalCount ?? 0) +
                  (completedData?.totalCount ?? 0)}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Floating Tab Card ── */}
        <View className="px-5 z-20 mb-6">
          <View
            className={`rounded-[32px] p-2 shadow-xl ${isDark ? 'bg-slate-900 shadow-black/50' : 'bg-white shadow-indigo-900/10'}`}
            style={{ elevation: 15 }}
          >
            <View className={`flex-row p-1.5 rounded-2xl ${isDark ? 'bg-slate-950/50' : 'bg-slate-50'}`}>
              {TABS.map((tab) => {
                const active = activeTab === tab.id;
                const Icon = tab.icon;
                const count = counts[tab.id];
                return (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => {
                      setActiveTab(tab.id);
                      setSearchQuery('');
                    }}
                    className={`flex-1 py-3.5 flex-row items-center justify-center gap-1.5 rounded-xl ${
                      active
                        ? isDark
                          ? 'shadow-md'
                          : 'bg-white shadow-sm border border-slate-100'
                        : 'bg-transparent'
                    }`}
                    style={active && isDark ? { backgroundColor: tab.color.active + '30' } : {}}
                  >
                    <Icon
                      size={14}
                      color={active ? tab.color.active : isDark ? '#64748b' : '#64748b'}
                    />
                    <Text
                      className={`text-[10px] font-black uppercase tracking-wider`}
                      style={{ color: active ? tab.color.active : isDark ? '#64748b' : '#94a3b8' }}
                      numberOfLines={1}
                    >
                      {t(tab.labelKey, tab.label)}
                    </Text>
                    {count > 0 && (
                      <View
                        className="px-1.5 py-0.5 rounded-md"
                        style={{
                          backgroundColor: active
                            ? tab.color.active + '30'
                            : isDark
                            ? '#1e293b'
                            : '#f1f5f9',
                        }}
                      >
                        <Text
                          className="text-[9px] font-bold"
                          style={{ color: active ? tab.color.active : isDark ? '#64748b' : '#94a3b8' }}
                        >
                          {count}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* ── Content ── */}
        <View className="px-5">
          {/* Search bar */}
          <View
            className={`flex-row items-center px-4 h-14 mb-5 rounded-3xl border ${
              isDark
                ? 'bg-slate-900 border-slate-800'
                : 'bg-white border-slate-100 shadow-sm shadow-slate-200/50'
            }`}
          >
            <Search size={20} color={isDark ? '#64748b' : '#94a3b8'} />
            <TextInput
              placeholder={t('search_placeholder_students_requests', 'Search by student, patient...')}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
              className={`flex-1 ml-3 text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
              style={{ textAlign: isRtl ? 'right' : 'left' }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color={isDark ? '#64748b' : '#94a3b8'} />
              </TouchableOpacity>
            )}
          </View>

          {/* Status header strip */}
          <View
            className={`flex-row items-center gap-2 mb-5 px-1 ${isRtl ? 'flex-row-reverse' : ''}`}
          >
            <View
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: currentTab.color.active }}
            />
            <Text
              className="text-xs font-black uppercase tracking-widest"
              style={{ color: currentTab.color.active }}
            >
              {t(currentTab.labelKey, currentTab.label)}
            </Text>
            <Text className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              · {filteredItems.length} {t('results', 'results')}
            </Text>
          </View>

          {/* List */}
          {loading && !refreshing ? (
            Array.from({ length: 4 }).map((_, i) => (
              <View
                key={i}
                className={`h-36 rounded-[28px] mb-4 border border-dashed ${
                  isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100'
                }`}
              />
            ))
          ) : filteredItems.length === 0 ? (
            <Animated.View
              entering={FadeInDown.delay(200)}
              className={`py-24 items-center rounded-[40px] border ${
                isDark
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-100 shadow-sm'
              }`}
            >
              <View
                className="w-20 h-20 rounded-[28px] items-center justify-center mb-5"
                style={{ backgroundColor: currentTab.color.active + '20' }}
              >
                <ClipboardList size={36} color={currentTab.color.active} />
              </View>
              <Text className="text-lg font-black text-slate-800 dark:text-white">
                {searchQuery ? t('no_matching_students') : t('no_requests_in_tab', 'No requests found')}
              </Text>
              <Text className="text-sm text-slate-400 dark:text-slate-500 mt-2 text-center px-12 font-bold leading-5">
                {searchQuery
                  ? t('no_cases_matched', { search: searchQuery })
                  : t('no_requests_desc', 'There are no requests in this category yet.')}
              </Text>
            </Animated.View>
          ) : (
            filteredItems.map((item: any) => (
                <CaseCard
                  key={item.id}
                  item={item}
                  isDark={isDark}
                  locale={locale}
                  t={t as any}
                  tabColor={currentTab.color}
                  onPress={() => router.push(`/case-details/${item.id}`)} 
                />
            ))
          )}
        </View>
      </ScrollView>




    </View>
  );
}

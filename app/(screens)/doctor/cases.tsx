import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  Layers,
  PlusCircle,
  Search,
  Stethoscope,
  User,
  X,
} from 'lucide-react-native';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  I18nManager,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { AddCaseForm } from '@/features/dashboard/components/cases/AddCaseForm';
import {
  doctorDashboardService,
  PatientCaseDto,
} from '@/features/dashboard/services/doctorDashboardService';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { useAppSelector } from '@/store/hooks';

const PAGE_SIZE = 30;

function CaseTypeLabel({ caseId, initialValue, isDark }: { caseId: string, initialValue?: string, isDark: boolean }) {
  const { data: diagnosesData } = useQuery({
    queryKey: ['case-diagnoses', caseId],
    queryFn: () => doctorDashboardService.getDiagnosesForCase(caseId),
    enabled: !initialValue || initialValue.includes('Unspecified') || initialValue === '—',
    staleTime: 60_000,
  });

  const { t } = useTranslation();

  const value = (initialValue && !initialValue.includes('Unspecified') && initialValue !== '—')
    ? initialValue 
    : diagnosesData?.items?.[0]?.caseType || (diagnosesData?.items?.[0] as any)?.caseTypeName || null;

  return (
    <Text className="text-xs font-bold text-slate-400 dark:text-slate-500" numberOfLines={1}>
      {value || (diagnosesData ? t('unspecified_case_type', 'Unspecified Case Type') : '...')}
    </Text>
  );
}

// ─── Pending Case Card ────────────────────────────────────────────────────────

function PendingCaseCard({
  item,
  isDark,
  locale,
  onPress,
}: {
  item: PatientCaseDto;
  isDark: boolean;
  locale: string;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const isRtl = I18nManager.isRTL;

  const initials = (item.patientName ?? 'P')
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const resolvedCaseType = item.diagnosisdto?.caseType || (item as any).diagnosisDto?.caseType || (item.diagnosisdto as any)?.caseTypeName || item.caseType?.name || (item as any).caseName || (item as any).title;

  const date = new Date(item.createAt).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className={`mb-4 rounded-[28px] overflow-hidden border ${
        isDark
          ? 'bg-slate-900 border-slate-800'
          : 'bg-white border-slate-100 shadow-sm shadow-slate-200/50'
      }`}
    >
      {/* Amber accent stripe for pending */}
      <View style={{ height: 3, backgroundColor: '#f59e0b' }} />

      <View className="p-5">
        <View className={`flex-row items-start gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
          {/* Avatar */}
          <LinearGradient
            colors={isDark ? ['#78350f', '#451a03'] : ['#fbbf24', '#f59e0b']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>{initials}</Text>
          </LinearGradient>

          {/* Info */}
          <View className={`flex-1 ${isRtl ? 'items-end' : ''}`}>
            <Text
              className={`font-black text-slate-900 dark:text-white text-base leading-tight ${isRtl ? 'text-right' : ''}`}
              numberOfLines={1}
            >
              {item.patientName}
            </Text>

            {/* Case type */}
            <View className={`flex-row items-center gap-1.5 mt-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <Stethoscope size={11} color={isDark ? '#64748b' : '#94a3b8'} />
              <CaseTypeLabel 
                caseId={item.id} 
                initialValue={resolvedCaseType} 
                isDark={isDark} 
              />
            </View>

            {/* Status badge */}
            <View
              className="mt-2 self-start px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: isDark ? '#451a03' : '#fef3c7' }}
            >
              <Text style={{ color: isDark ? '#fbbf24' : '#92400e' }} className="text-[10px] font-black uppercase tracking-wider">
                {item.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View className={`h-px mt-4 mb-4 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`} />

        {/* Meta */}
        <View className={`flex-row flex-wrap gap-5 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <View className={`flex-row items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <User size={12} color={isDark ? '#64748b' : '#94a3b8'} />
            <Text className="text-xs font-bold text-slate-400 dark:text-slate-500">
              {item.patientAge ? `${item.patientAge}y` : '—'}
              {item.gender === 0 ? ' · ♂' : item.gender === 1 ? ' · ♀' : ''}
            </Text>
          </View>
          <View className={`flex-row items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <Calendar size={12} color={isDark ? '#64748b' : '#94a3b8'} />
            <Text className="text-xs font-bold text-slate-400 dark:text-slate-500">{date}</Text>
          </View>
          {item.universityName ? (
            <Text className="text-xs font-bold text-indigo-400 dark:text-indigo-400" numberOfLines={1}>
              {item.universityName}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}


import { useDoctorCaseCounts } from '@/features/dashboard/hooks/useDoctorQueries';

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function CasesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);
  const { theme, language } = useThemeLanguage();
  const isDark = theme === 'dark';
  const isRtl = language === 'ar';
  const locale = isRtl ? 'ar-EG' : 'en-GB';
  const queryClient = useQueryClient();

  const doctorId = (user as any)?.publicId ?? (user as any)?.id;
  const [activeTab, setActiveTab] = useState<'pending' | 'add'>('pending');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState<PatientCaseDto | null>(null);



  // Fetch cases based on active tab
  const { data: casesData, isLoading: loading, refetch } = useQuery({
    queryKey: ['doctor-cases', activeTab, searchQuery, doctorId],
    queryFn: () => {
      if (activeTab === 'pending') {
        return doctorDashboardService.getCases({
          PatientName: searchQuery.trim() || undefined,
          Status: 'Pending',
          Page: 1,
          PageSize: PAGE_SIZE,
          SortBy: 'createAt',
          SortDirection: 'desc',
        });
      }
      return { items: [], totalCount: 0, currentPage: 1, totalPages: 1, hasPreviousPage: false, hasNextPage: false };
    },
    staleTime: 30_000,
    enabled: activeTab !== 'add' && !!doctorId,
  });

  const displayCases = casesData?.items ?? [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Debounced search
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const handleSearch = (text: string) => {
    setDebouncedQuery(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearchQuery(text);
    }, 400);
  };

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
              <Text className="text-white text-3xl font-black" numberOfLines={1}>
                {t('cases')}
              </Text>
            </View>
            {activeTab !== 'add' && (
              <View className="bg-white/20 px-4 py-2 rounded-2xl">
                <Text className="text-white/70 text-[10px] font-bold uppercase tracking-wider">
                  {t('pending')}
                </Text>
                <Text className="text-white text-2xl font-black text-center">
                  {casesData?.totalCount ?? 0}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* ── Floating Tab Card ── */}
        <View className="px-5 z-20 mb-8">
          <View
            className={`rounded-[32px] p-2 shadow-xl ${isDark ? 'bg-slate-900 shadow-black/50' : 'bg-white shadow-indigo-900/10'}`}
            style={{ elevation: 15 }}
          >
            <View className={`flex-row p-1 rounded-2xl ${isDark ? 'bg-slate-950/50' : 'bg-slate-50'}`}>
              {[
                { id: 'pending', labelKey: 'pending', icon: ClipboardList, count: casesData?.totalCount && activeTab === 'pending' ? casesData.totalCount : 0 },
                { id: 'add', labelKey: 'add', icon: PlusCircle, count: 0 },
              ].map((tab) => {
                const active = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => {
                      setActiveTab(tab.id as any);
                      setDebouncedQuery('');
                      setSearchQuery('');
                    }}
                    className={`flex-1 py-4 flex-row items-center justify-center gap-2 rounded-xl ${
                      active
                        ? isDark
                          ? 'bg-indigo-600 shadow-md shadow-indigo-500/20'
                          : 'bg-white shadow-sm border border-slate-100'
                        : 'bg-transparent'
                    }`}
                  >
                    <Icon size={14} color={active ? (isDark ? '#ffffff' : '#4f46e5') : (isDark ? '#64748b' : '#64748b')} />
                    <Text
                      className={`text-xs font-black uppercase tracking-wider ${
                        active
                          ? isDark ? 'text-white' : 'text-indigo-600'
                          : isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {t(tab.labelKey)}
                    </Text>
                    {tab.count > 0 && (
                      <View className={`px-2 py-0.5 rounded-md ${active ? 'bg-indigo-500/30 dark:bg-white/20' : (isDark ? 'bg-slate-800' : 'bg-slate-200')}`}>
                        <Text className={`text-[10px] font-bold ${active ? 'text-white' : (isDark ? 'text-slate-400' : 'text-slate-500')}`}>
                          {tab.count}
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
        <View className="flex-1 mt-2">
          {activeTab !== 'add' && (
            <View className="px-5">
              {/* Search Bar */}
              <View className={`flex-row items-center px-4 h-14 mb-6 rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm shadow-slate-200/50'}`}>
                <Search size={20} color={isDark ? '#64748b' : '#94a3b8'} />
                <TextInput
                  placeholder={t('search_placeholder_cases', 'Search by patient name...')}
                  value={debouncedQuery}
                  onChangeText={handleSearch}
                  placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
                  className={`flex-1 ml-3 text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'} ${isRtl ? 'text-right' : 'text-left'}`}
                />
                {debouncedQuery.length > 0 && (
                  <TouchableOpacity onPress={() => { setDebouncedQuery(''); setSearchQuery(''); }}>
                    <X size={18} color={isDark ? '#64748b' : '#94a3b8'} />
                  </TouchableOpacity>
                )}
              </View>

              {loading && !refreshing ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <View key={i} className={`h-40 rounded-[28px] mb-4 border border-dashed ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100'}`} />
                ))
              ) : displayCases.length === 0 ? (
                <Animated.View
                  entering={FadeInDown.delay(200)}
                  className={`py-24 items-center rounded-[48px] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}
                >
                  <View className="w-24 h-24 rounded-[40px] bg-amber-50 dark:bg-amber-900/20 items-center justify-center mb-6">
                    <ClipboardList size={40} color={isDark ? '#78350f' : '#f59e0b'} />
                  </View>
                  <Text className="text-xl font-black text-slate-800 dark:text-white">
                    {debouncedQuery ? t('no_matching_students') : t('no_pending_cases')}
                  </Text>
                  <Text className="text-sm text-slate-400 dark:text-slate-500 mt-2 text-center px-12 font-bold leading-5">
                    {debouncedQuery
                      ? t('no_cases_matched', { search: debouncedQuery })
                      : t('no_pending_cases_desc')}
                  </Text>
                </Animated.View>
              ) : (
                displayCases.map((item) => (
                  <PendingCaseCard
                    key={item.id}
                    item={item}
                    isDark={isDark}
                    locale={locale}
                    onPress={() => router.push(`/case-details/${item.id}`)} 
                  />
                ))
              )}
            </View>
          )}

          {activeTab === 'add' && (
            <AddCaseForm
              isDark={isDark}
              locale={locale}
              universityId={(user as any)?.universityId}
              onSuccess={() => {
                setActiveTab('pending');
                onRefresh();
              }}
            />
          )}
        </View>
      </ScrollView>


    </View>
  );
}

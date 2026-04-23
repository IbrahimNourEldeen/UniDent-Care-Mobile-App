import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  X,
  User,
  Calendar,
  ChevronRight,
  Stethoscope,
  RefreshCw,
  FolderOpen,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { useRouter } from 'expo-router';
import {
  doctorDashboardService,
  PatientCaseDto,
} from '@/features/dashboard/services/doctorDashboardService';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStatusColor(status: string, isDark: boolean) {
  switch ((status ?? '').toLowerCase()) {
    case 'in progress': return { bg: isDark ? '#1e3a5f' : '#dbeafe', text: isDark ? '#60a5fa' : '#1d4ed8' };
    case 'completed': return { bg: isDark ? '#064e3b' : '#d1fae5', text: isDark ? '#34d399' : '#065f46' };
    case 'diagnosis': return { bg: isDark ? '#3b1f5e' : '#ede9fe', text: isDark ? '#a78bfa' : '#5b21b6' };
    default: return { bg: isDark ? '#1e293b' : '#f1f5f9', text: isDark ? '#94a3b8' : '#475569' };
  }
}

const GENDER_FILTERS = [
  { label: 'filter_all', value: undefined },
  { label: 'filter_male', value: 0 },
  { label: 'filter_female', value: 1 },
];

const PAGE_SIZE = 12;

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function BrowseCasesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme, language } = useThemeLanguage();
  const isDark = theme === 'dark';
  const isRtl = I18nManager.isRTL;
  const locale = language === 'ar' ? 'ar-EG' : 'en-GB';

  const [cases, setCases] = useState<PatientCaseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchCases = useCallback(async (query: string, genderFilter: number | undefined, page: number) => {
    try {
      setLoading(true);
      const res = await doctorDashboardService.getCases({
        PatientName: query.trim() || undefined,
        Gender: genderFilter,
        Page: page,
        PageSize: PAGE_SIZE,
        SortBy: 'createAt',
        SortDirection: 'desc',
      });
      setCases(res.items ?? []);
      setTotalPages(res.totalPages ?? 1);
      setTotalCount(res.totalCount ?? 0);
      setCurrentPage(res.currentPage ?? page);
    } catch (e) {
      console.error('fetchCases', e);
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases(search, gender, 1);
  }, [gender]);

  const onSearchChange = (text: string) => {
    setSearch(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      fetchCases(text, gender, 1);
    }, 400);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCases(search, gender, 1);
    setRefreshing(false);
  };

  const goToPage = (page: number) => fetchCases(search, gender, page);

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      {/* Top Bar */}
      <View className="px-5 pt-4 pb-3">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-black text-slate-900 dark:text-white">{t('all_cases')}</Text>
          <TouchableOpacity onPress={onRefresh} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            {loading && !refreshing ? (
              <ActivityIndicator size={18} color={isDark ? '#818cf8' : '#4f46e5'} />
            ) : (
              <RefreshCw size={18} color={isDark ? '#94a3b8' : '#64748b'} />
            )}
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View className={`flex-row items-center gap-3 px-4 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} mb-3`}>
          <Search size={16} color={isDark ? '#64748b' : '#94a3b8'} />
          <TextInput
            value={search}
            onChangeText={onSearchChange}
            placeholder={t('search_placeholder_cases')}
            placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
            className="flex-1 text-sm text-slate-800 dark:text-white py-3.5 font-medium"
            style={{ writingDirection: isRtl ? 'rtl' : 'ltr' }}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(''); fetchCases('', gender, 1); }}>
              <X size={16} color={isDark ? '#475569' : '#94a3b8'} />
            </TouchableOpacity>
          )}
        </View>

        {/* Gender filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2" contentContainerStyle={{ gap: 8 }}>
          {GENDER_FILTERS.map((f) => {
            const active = gender === f.value;
            return (
              <TouchableOpacity
                key={String(f.value)}
                onPress={() => setGender(f.value)}
                className={`px-4 py-2 rounded-full border ${
                  active
                    ? 'bg-indigo-600 border-indigo-600'
                    : isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
                }`}
              >
                <Text className={`text-xs font-bold ${active ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {t(f.label)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Stats strip */}
      <View className="flex-row items-center px-5 mb-2">
        <Text className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          {totalCount} {t('total').toLowerCase()}
        </Text>
      </View>

      {/* List */}
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDark ? '#818cf8' : '#4f46e5'} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 40 }}
      >
        {loading && !refreshing ? (
          Array.from({ length: 6 }).map((_, i) => (
            <View key={i} className="h-28 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 mb-3 opacity-50" />
          ))
        ) : cases.length === 0 ? (
          <View className="py-24 items-center">
            <View className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center mb-5">
              <FolderOpen size={36} color={isDark ? '#334155' : '#cbd5e1'} />
            </View>
            <Text className="text-base font-bold text-slate-500 dark:text-slate-400">{t('no_cases_found')}</Text>
            <Text className="text-sm text-slate-400 dark:text-slate-500 mt-1 text-center px-8">
              {search ? t('no_cases_matched', { search }) : t('no_cases_available')}
            </Text>
          </View>
        ) : (
          cases.map((c) => {
            const s = getStatusColor(c.status, isDark);
            const initials = (c.patientName ?? 'P').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => router.push({ pathname: '/doctor/cases/[id]', params: { id: c.id } })}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none mb-3 p-4 flex-row items-center gap-4"
                activeOpacity={0.8}
              >
                {/* Avatar */}
                <View className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 items-center justify-center">
                  <Text className="text-indigo-600 dark:text-indigo-400 font-black text-base">{initials}</Text>
                </View>

                {/* Info */}
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="font-black text-slate-900 dark:text-white text-sm flex-1 mr-2" numberOfLines={1}>
                      {c.patientName}
                    </Text>
                    <View style={{ backgroundColor: s.bg }} className="px-2.5 py-0.5 rounded-full">
                      <Text style={{ color: s.text }} className="text-[10px] font-black uppercase">{c.status}</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-3">
                    {c.caseType && (
                      <View className="flex-row items-center gap-1">
                        <Stethoscope size={10} color={isDark ? '#475569' : '#94a3b8'} />
                        <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-medium" numberOfLines={1}>
                          {c.caseType.name}
                        </Text>
                      </View>
                    )}
                    <View className="flex-row items-center gap-1">
                      <User size={10} color={isDark ? '#475569' : '#94a3b8'} />
                      <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        {c.patientAge}y{c.gender === 0 ? ' ♂' : c.gender === 1 ? ' ♀' : ''}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Calendar size={10} color={isDark ? '#475569' : '#94a3b8'} />
                      <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        {formatDate(c.createAt)}
                      </Text>
                    </View>
                  </View>

                  {/* Sub stats */}
                  <View className="flex-row items-center gap-3 mt-1.5">
                    <Text className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold">
                      {t('total_sessions_label', { count: c.totalSessions })}
                    </Text>
                    {c.pendingRequests > 0 && (
                      <Text className="text-[10px] text-amber-500 dark:text-amber-400 font-bold">
                        {t('pending_requests_count', { count: c.pendingRequests })}
                      </Text>
                    )}
                  </View>
                </View>

                <ChevronRight size={16} color={isDark ? '#475569' : '#cbd5e1'} />
              </TouchableOpacity>
            );
          })
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              {t('page_of', { current: currentPage, total: totalPages })}
            </Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                style={{ opacity: currentPage <= 1 ? 0.4 : 1 }}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <Text className="text-xs font-bold text-slate-600 dark:text-slate-300">‹ {t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                style={{ opacity: currentPage >= totalPages ? 0.4 : 1 }}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <Text className="text-xs font-bold text-slate-600 dark:text-slate-300">Next ›</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

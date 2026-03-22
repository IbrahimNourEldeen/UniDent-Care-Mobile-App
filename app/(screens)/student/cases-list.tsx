import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchX, RefreshCw } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { useAvailableCases } from '@/features/dashboard/hooks/useAvailableCases';
import { CaseItem } from '@/features/cases/types/caseTypes';

import CasesHeader from '@/features/dashboard/components/student/CasesHeader';
import CaseCard from '@/features/dashboard/components/student/CaseCard';
import CasesListView from '@/features/dashboard/components/student/CasesListView';
import Pagination from '@/components/common/Pagination';

// ---- Skeleton Card ----
function SkeletonCard() {
  return (
    <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 mb-4 border border-slate-100 dark:border-slate-800">
      <View className="flex-row items-center justify-between mb-4">
        <View className="h-6 w-24 bg-slate-100 dark:bg-slate-800 rounded-full" />
        <View className="h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded-full" />
      </View>
      <View className="flex-row items-center mb-4">
        <View className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 mr-3" />
        <View>
          <View className="h-5 w-32 bg-slate-100 dark:bg-slate-800 rounded mb-2" />
          <View className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
        </View>
      </View>
      <View className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4" />
      <View className="flex-row items-center justify-between">
        <View className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
        <View className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </View>
    </View>
  );
}

// ---- Skeleton List Row ----
function SkeletonListRow() {
  return (
    <View className="px-5 py-4 flex-row items-center gap-3 border-b border-slate-50 dark:border-slate-800">
      <View className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0" />
      <View className="flex-1">
        <View className="h-4 w-36 bg-slate-100 dark:bg-slate-800 rounded mb-2" />
        <View className="h-3 w-48 bg-slate-100 dark:bg-slate-800 rounded" />
      </View>
      <View className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded-xl" />
    </View>
  );
}

// ---- Empty State ----
function EmptyState({ search, onClear }: { search: string; onClear: () => void }) {
  const { t } = useTranslation();
  const { theme } = useThemeLanguage();
  const isDark = theme === 'dark';
  return (
    <View className="items-center py-16 px-6">
      <SearchX size={52} color={isDark ? '#334155' : '#cbd5e1'} strokeWidth={1.5} />
      <Text className="mt-4 text-lg font-black text-slate-700 dark:text-white text-center">
        {t('no_cases_found')}
      </Text>
      <Text className="mt-2 text-sm text-slate-400 dark:text-slate-500 text-center leading-5">
        {search
          ? t('no_cases_matched', { search })
          : t('no_cases_available')}
      </Text>
      {search ? (
        <TouchableOpacity
          onPress={onClear}
          className="mt-6 px-6 py-3 bg-blue-600 dark:bg-indigo-600 rounded-full"
        >
          <Text className="text-white font-bold text-sm">{t('clear_search')}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ---- Main Screen ----
export default function CasesListScreen() {
  const { t } = useTranslation();
  const { theme } = useThemeLanguage();
  const isDark = theme === 'dark';
  const [activeCaseForModal, setActiveCaseForModal] = useState<CaseItem | null>(null);

  const {
    cases,
    caseTypes,
    loading,
    error,
    search,
    setSearch,
    selectedCaseType,
    setSelectedCaseType,
    viewMode,
    setViewMode,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    hasPreviousPage,
    hasNextPage,
    onPageChange,
    refetch,
  } = useAvailableCases();

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refetch}
            tintColor={isDark ? '#818cf8' : '#4f46e5'}
          />
        }
      >
        {/* Header with search, filter, view toggle */}
        <View className="pt-4">
          <CasesHeader
            totalCount={totalCount}
            showingCount={cases.length}
            search={search}
            setSearch={setSearch}
            selectedCaseType={selectedCaseType}
            setSelectedCaseType={setSelectedCaseType}
            caseTypes={caseTypes}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        </View>

        {/* Error State */}
        {error && !loading && (
          <View className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-2xl p-5 mb-4 flex-row items-center gap-3">
            <RefreshCw size={18} color={isDark ? '#fca5a5' : '#dc2626'} />
            <View className="flex-1">
              <Text className="text-red-700 dark:text-red-400 font-bold text-sm mb-1 text-left">
                {t('load_error')}
              </Text>
              <Text className="text-red-500 dark:text-red-500 text-xs text-left">{error}</Text>
            </View>
            <TouchableOpacity onPress={refetch} className="px-3 py-2 bg-red-600 rounded-xl">
              <Text className="text-white text-xs font-bold">{t('retry')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading State */}
        {loading && (
          viewMode === 'cards' ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <View className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 mb-4">
              <SkeletonListRow />
              <SkeletonListRow />
              <SkeletonListRow />
              <SkeletonListRow />
            </View>
          )
        )}

        {/* Cases Grid (Cards View) */}
        {!loading && cases.length > 0 && viewMode === 'cards' && (
          <>
            {cases.map((c) => (
              <CaseCard key={c.id} caseItem={c} onRequestSent={refetch} />
            ))}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              hasPreviousPage={hasPreviousPage}
              hasNextPage={hasNextPage}
              onPageChange={onPageChange}
            />
          </>
        )}

        {/* Cases List View */}
        {!loading && cases.length > 0 && viewMode === 'list' && (
          <>
            <CasesListView
              cases={cases}
              onRequest={(item) => setActiveCaseForModal(item)}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              hasPreviousPage={hasPreviousPage}
              hasNextPage={hasNextPage}
              onPageChange={onPageChange}
            />
          </>
        )}

        {/* Empty State */}
        {!loading && !error && cases.length === 0 && (
          <EmptyState search={search} onClear={() => setSearch('')} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

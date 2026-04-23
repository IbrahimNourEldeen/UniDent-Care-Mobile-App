import React from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity, Text, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RefreshCw, ArrowUpDown, ArrowUp, ArrowDown, Activity, User, Calendar, BookOpen, AlertCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

import { useAvailableCases, SortKey } from '../hooks/useAvailableCases';
import CasesHeader from '../components/AvailableCases/CasesHeader';
import CasesGrid from '../components/AvailableCases/CasesGrid';
import CasesTable from '../components/AvailableCases/CasesTable';

const { width } = Dimensions.get('window');

// ---- Advanced Sort Pills ----
const SORT_OPTIONS: { key: SortKey; label: string; icon: any }[] = [
  { key: 'patientName', label: 'Name', icon: User },
  { key: 'patientAge', label: 'Age', icon: Activity },
  { key: 'createAt', label: 'Date', icon: Calendar },
];

function SortPills({
  sortConfig,
  onSort,
  isDark,
}: {
  sortConfig: ReturnType<typeof useAvailableCases>['sortConfig'];
  onSort: (key: SortKey) => void;
  isDark: boolean;
}) {
  return (
    <View className="mb-4">
      <View className="px-6 mb-3">
        <Text style={{ letterSpacing: 2 }} className={`text-[10px] font-black uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sort Records By</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingHorizontal: 20, paddingBottom: 6 }}
      >
        {SORT_OPTIONS.map((opt) => {
          const active = sortConfig?.key === opt.key;
          const dir = sortConfig?.direction;
          const Icon = opt.icon;
          const DirIcon = dir === 'asc' ? ArrowUp : ArrowDown;
          
          return (
            <TouchableOpacity
              key={opt.key}
              onPress={() => onSort(opt.key)}
              activeOpacity={0.7}
              className={`flex-row items-center gap-2 px-5 py-2.5 mt-1 rounded-full border shadow-sm ${active ? (isDark ? 'bg-indigo-600 border-indigo-500' : 'bg-indigo-600 border-indigo-600 shadow-indigo-200') : (isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}`}
            >
              <Icon size={12} color={active ? '#ffffff' : (isDark ? '#64748b' : '#94a3b8')} />
              <Text className={`text-xs font-bold ${active ? 'text-white' : (isDark ? 'text-slate-300' : 'text-slate-600')}`}>
                {opt.label}
              </Text>
              {active && <DirIcon size={12} color="#ffffff" />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default function AvailableCasesScreen() {
    const { t } = useTranslation();
    const { theme } = useThemeLanguage();
    const insets = useSafeAreaInsets();
    const isDark = theme === 'dark';

    const {
        sortedCases, caseTypes, loading, error, search, setSearch,
        selectedCaseType, setSelectedCaseType, viewMode, setViewMode,
        currentPage, totalPages, totalCount, pageSize, hasPreviousPage, hasNextPage,
        sortConfig, handleSort, onPageChange, refetch,
    } = useAvailableCases();

    const bgClass = isDark ? 'bg-[#020617]' : 'bg-slate-50';

    return (
        <View className={`flex-1 ${bgClass}`}>
            {/* Hero Background */}
            <View className="bg-indigo-600 dark:bg-indigo-900 absolute top-0 left-0 right-0" style={{ height: 260 + insets.top, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }} />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={false}
                        onRefresh={refetch}
                        tintColor="#ffffff"
                    />
                }
            >
                <View style={{ paddingTop: insets.top + 20 }}>
                    {/* Header Title Area */}
                    <View className="px-6 flex-row items-center justify-between mb-8">
                        <View>
                            <Text className="text-3xl font-black text-white tracking-tight">{t('available_cases')}</Text>
                            <Text className="text-sm font-medium text-indigo-100 mt-1 opacity-90">{t('available_cases_desc')}</Text>
                        </View>
                        <TouchableOpacity onPress={refetch} className="w-12 h-12 rounded-2xl items-center justify-center bg-white/20 dark:bg-black/20">
                            <RefreshCw size={20} color="#ffffff" />
                        </TouchableOpacity>
                    </View>

                    {/* Floating Search & Filters Card */}
                    <View className="px-5 z-20 mb-8">
                        <View className={`rounded-[32px] p-6 shadow-xl ${isDark ? 'bg-slate-900 shadow-black/50' : 'bg-white shadow-indigo-900/10'}`} style={{ elevation: 15 }}>
                            <CasesHeader
                                totalCount={totalCount}
                                showingCount={sortedCases.length}
                                search={search}
                                setSearch={setSearch}
                                selectedCaseType={selectedCaseType}
                                setSelectedCaseType={setSelectedCaseType}
                                caseTypes={caseTypes}
                                viewMode={viewMode}
                                setViewMode={setViewMode}
                            />
                        </View>
                    </View>

                    {/* Sort Pills */}
                    <SortPills sortConfig={sortConfig} onSort={handleSort} isDark={isDark} />

                    {/* Error State */}
                    {error && !loading && (
                        <View className="mx-5 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/30 rounded-[28px] p-5 mb-6 flex-row items-center gap-4">
                            <View className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 items-center justify-center">
                                <AlertCircle size={20} color={isDark ? '#f87171' : '#dc2626'} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-red-700 dark:text-red-400 font-black text-sm mb-0.5">
                                    {t('load_error')}
                                </Text>
                                <Text className="text-red-500 dark:text-red-500/70 text-xs font-medium">{error}</Text>
                            </View>
                            <TouchableOpacity onPress={refetch} className="px-4 py-2 bg-red-600 rounded-xl">
                                <Text className="text-white text-xs font-bold">{t('retry')}</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Content Section */}
                    <View className="flex-1 mt-2">
                        {viewMode === 'cards' ? (
                            <CasesGrid
                                cases={sortedCases}
                                loading={loading}
                                search={search}
                                onClearFilters={() => setSearch('')}
                                currentPage={currentPage}
                                totalPages={totalPages}
                                hasPreviousPage={hasPreviousPage}
                                hasNextPage={hasNextPage}
                                onPageChange={onPageChange}
                                refetch={refetch}
                            />
                        ) : (
                            <CasesTable
                                cases={sortedCases}
                                loading={loading}
                                search={search}
                                onClearFilters={() => setSearch('')}
                                currentPage={currentPage}
                                totalPages={totalPages}
                                hasPreviousPage={hasPreviousPage}
                                hasNextPage={hasNextPage}
                                onPageChange={onPageChange}
                                refetch={refetch}
                            />
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}


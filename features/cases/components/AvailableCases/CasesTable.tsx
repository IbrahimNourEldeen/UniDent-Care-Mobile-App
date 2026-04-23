import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SearchX } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import CasesListView from '@/features/dashboard/components/student/CasesListView';
import Pagination from '@/components/common/Pagination';
import { CaseItem } from '@/features/cases/types/caseTypes';

// ---- Skeleton List Row ----
function SkeletonListRow({ isDark }: { isDark: boolean }) {
    const shimmer = isDark ? 'bg-slate-800' : 'bg-slate-100';
    return (
        <View className="px-5 py-5 flex-row items-center gap-4 border-b border-slate-50 dark:border-slate-800/50">
            <View className={`w-12 h-12 rounded-xl ${shimmer} shrink-0`} />
            <View className="flex-1">
                <View className={`h-4 w-32 ${shimmer} rounded-md mb-2`} />
                <View className={`h-3 w-48 ${shimmer} rounded-md`} />
            </View>
            <View className={`h-9 w-20 ${shimmer} rounded-xl`} />
        </View>
    );
}

// ---- Empty State ----
function EmptyState({ search, onClear }: { search?: string; onClear: () => void }) {
    const { t } = useTranslation();
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';
    return (
        <View className={`mx-5 py-12 px-6 rounded-[32px] items-center justify-center mt-4 border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100 shadow-sm shadow-indigo-900/5'}`}>
            <View className={`w-20 h-20 rounded-full items-center justify-center mb-5 shadow-sm ${isDark ? 'bg-slate-800' : 'bg-indigo-50'}`}>
                <SearchX size={32} color={isDark ? '#4f46e5' : '#6366f1'} />
            </View>
            <Text className={`text-lg font-black text-center mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {t('no_cases_found')}
            </Text>
            <Text className={`text-xs text-center leading-5 px-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {search ? t('no_cases_matched', { search }) : t('no_cases_available')}
            </Text>
            {search ? (
                <TouchableOpacity onPress={onClear} className="mt-8 px-8 py-3.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30">
                    <Text className="text-white font-black text-sm">{t('clear_search')}</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

interface CasesTableProps {
    cases: CaseItem[];
    loading: boolean;
    search?: string;
    onClearFilters: () => void;
    currentPage: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    onPageChange: (page: number) => void;
    refetch: () => void;
}

export default function CasesTable({
    cases,
    loading,
    search,
    onClearFilters,
    currentPage,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    onPageChange,
    refetch,
}: CasesTableProps) {
    const [_, setActiveCaseForModal] = useState<CaseItem | null>(null);

    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';

    if (loading) {
        return (
            <View className="px-4">
                <View className={`rounded-[32px] overflow-hidden border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} mb-4 shadow-sm`}>
                    <SkeletonListRow isDark={isDark} />
                    <SkeletonListRow isDark={isDark} />
                    <SkeletonListRow isDark={isDark} />
                    <SkeletonListRow isDark={isDark} />
                </View>
            </View>
        );
    }

    if (!cases || cases.length === 0) {
        return <EmptyState search={search} onClear={onClearFilters} />;
    }

    return (
        <View className="px-4">
            <CasesListView cases={cases} onRequest={(item) => setActiveCaseForModal(item)} />
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                hasPreviousPage={hasPreviousPage}
                hasNextPage={hasNextPage}
                onPageChange={onPageChange}
            />
        </View>
    );
}

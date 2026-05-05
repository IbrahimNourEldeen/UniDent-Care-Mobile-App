import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SearchX, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import CaseCard from '@/features/dashboard/components/student/CaseCard';
import Pagination from '@/components/common/Pagination';
import { CaseItem } from '@/features/cases/types/caseTypes';
import { SortKey } from '@/features/cases/hooks/useAvailableCases';

// ---- Skeleton Card ----
function SkeletonCard({ isDark }: { isDark: boolean }) {
    const shimmer = isDark ? 'bg-slate-800' : 'bg-slate-100';
    return (
        <View className={`rounded-[32px] p-6 mb-5 border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <View className="flex-row items-center justify-between mb-5">
                <View className={`h-6 w-24 ${shimmer} rounded-full`} />
                <View className={`h-6 w-16 ${shimmer} rounded-xl`} />
            </View>
            <View className="flex-row items-center mb-6">
                <View className={`w-14 h-14 rounded-[22px] ${shimmer}`} />
                <View className="ml-4 flex-1">
                    <View className={`h-5 w-32 ${shimmer} rounded-lg mb-2`} />
                    <View className={`h-3 w-20 ${shimmer} rounded-md`} />
                </View>
            </View>
            <View className={`h-14 ${shimmer} rounded-[24px] mb-6`} />
            <View className="flex-row items-center justify-between">
                <View className={`h-4 w-24 ${shimmer} rounded-md`} />
                <View className={`h-10 w-28 ${shimmer} rounded-2xl`} />
            </View>
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

interface CasesGridProps {
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

export default function CasesGrid({
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
}: CasesGridProps) {
    const router = useRouter();

    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';

    if (loading) {
        return (
            <View className="px-4">
                <SkeletonCard isDark={isDark} />
                <SkeletonCard isDark={isDark} />
                <SkeletonCard isDark={isDark} />
            </View>
        );
    }

    if (!cases || cases.length === 0) {
        return <EmptyState search={search} onClear={onClearFilters} />;
    }

    return (
        <View className="px-4">
            {cases.map((c) => (
                <CaseCard
                    key={c.id}
                    caseItem={c}
                    onRequestSent={refetch}
                />
            ))}
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

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  onPageChange,
}: PaginationProps) {
  const { theme } = useThemeLanguage();
  const isDark = theme === 'dark';

  if (totalPages <= 1) return null;

  // Generate page numbers to show (at most 5 max)
  const pages: number[] = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <View className="flex-row items-center justify-center gap-2 mt-4 mb-6">
      <TouchableOpacity
        disabled={!hasPreviousPage}
        onPress={() => onPageChange(1)}
        className={`p-2 rounded-xl ${hasPreviousPage ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700' : 'opacity-30'}`}
      >
        <ChevronsLeft size={16} color={isDark ? '#cbd5e1' : '#1e293b'} />
      </TouchableOpacity>
      <TouchableOpacity
        disabled={!hasPreviousPage}
        onPress={() => onPageChange(currentPage - 1)}
        className={`p-2 rounded-xl ${hasPreviousPage ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700' : 'opacity-30'}`}
      >
        <ChevronLeft size={16} color={isDark ? '#cbd5e1' : '#1e293b'} />
      </TouchableOpacity>

      {pages.map((page) => (
        <TouchableOpacity
          key={page}
          onPress={() => onPageChange(page)}
          className={`w-9 h-9 rounded-xl items-center justify-center ${
            page === currentPage
              ? 'bg-blue-600 dark:bg-indigo-600'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Text
            className={`font-black text-sm ${
              page === currentPage ? 'text-white' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            {page}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        disabled={!hasNextPage}
        onPress={() => onPageChange(currentPage + 1)}
        className={`p-2 rounded-xl ${hasNextPage ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700' : 'opacity-30'}`}
      >
        <ChevronRight size={16} color={isDark ? '#cbd5e1' : '#1e293b'} />
      </TouchableOpacity>
      <TouchableOpacity
        disabled={!hasNextPage}
        onPress={() => onPageChange(totalPages)}
        className={`p-2 rounded-xl ${hasNextPage ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700' : 'opacity-30'}`}
      >
        <ChevronsRight size={16} color={isDark ? '#cbd5e1' : '#1e293b'} />
      </TouchableOpacity>
    </View>
  );
}

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { Search, X, LayoutGrid, List, Filter, ChevronDown, Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { CaseType } from '@/features/cases/types/caseTypes';
import { ViewMode } from '../../hooks/useAvailableCases';

interface CasesHeaderProps {
  totalCount: number;
  showingCount: number;
  search: string;
  setSearch: (v: string) => void;
  selectedCaseType: string;
  setSelectedCaseType: (v: string) => void;
  caseTypes: CaseType[];
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
}

export default function CasesHeader({
  totalCount,
  showingCount,
  search,
  setSearch,
  selectedCaseType,
  setSelectedCaseType,
  caseTypes,
  viewMode,
  setViewMode,
}: CasesHeaderProps) {
  const { t } = useTranslation();
  const { theme } = useThemeLanguage();
  const isDark = theme === 'dark';
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedLabel =
    caseTypes.find((t) => t.publicId === selectedCaseType)?.name ?? t('all_types');

  return (
    <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 mb-5 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none">
      {/* Title Row */}
      <View className="flex-row items-center mb-4">
        <View className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-indigo-600 items-center justify-center mr-3">
          <Filter size={18} color="white" strokeWidth={2.5} />
        </View>
        <View className="flex-1">
          <Text className="text-xl font-black text-slate-900 dark:text-white leading-6">
            {t('available_cases')}
          </Text>
          <Text className="text-xs text-slate-500 dark:text-slate-400">
            {t('available_cases_desc')}
          </Text>
        </View>
        {/* Live counters */}
        <View className="items-end gap-1">
          <View className="flex-row items-center bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full">
            <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
            <Text className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
              {totalCount} {t('total')}
            </Text>
          </View>
          <View className="flex-row items-center bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
            <Text className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
              {showingCount} {t('shown')}
            </Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 mb-3">
        <Search size={16} color={isDark ? '#94a3b8' : '#64748b'} />
        <TextInput
          className="flex-1 ml-2 text-sm text-slate-900 dark:text-white font-medium text-left"
          placeholder={t('search_placeholder_cases')}
          placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} className="p-1">
            <X size={14} color={isDark ? '#94a3b8' : '#64748b'} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter + View Mode Row */}
      <View className="flex-row items-center gap-3">
        {/* Case Type Filter */}
        <TouchableOpacity
          onPress={() => setDropdownOpen(true)}
          className="flex-1 flex-row items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5"
        >
          <Text className="flex-1 text-sm font-bold text-slate-700 dark:text-slate-300" numberOfLines={1}>
            {selectedLabel}
          </Text>
          <ChevronDown size={14} color={isDark ? '#94a3b8' : '#64748b'} />
        </TouchableOpacity>

        {/* View Mode Toggle */}
        <View className="flex-row bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <TouchableOpacity
            onPress={() => setViewMode('cards')}
            className={`p-2 rounded-lg ${viewMode === 'cards' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
          >
            <LayoutGrid size={18} color={viewMode === 'cards' ? (isDark ? '#818cf8' : '#2563eb') : (isDark ? '#94a3b8' : '#64748b')} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
          >
            <List size={18} color={viewMode === 'list' ? (isDark ? '#818cf8' : '#2563eb') : (isDark ? '#94a3b8' : '#64748b')} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Case Type Dropdown Modal */}
      <Modal visible={dropdownOpen} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/40 justify-end"
          onPress={() => setDropdownOpen(false)}
        >
          <View className="bg-white dark:bg-slate-900 rounded-t-3xl p-2 pb-8 max-h-[60%]">
            <View className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full self-center mb-4 mt-2" />
            <Text className="text-base font-black text-slate-900 dark:text-white px-4 mb-3">
              {t('select_case_type')}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* All Types Option */}
              <TouchableOpacity
                onPress={() => { setSelectedCaseType(''); setDropdownOpen(false); }}
                className={`flex-row items-center px-4 py-3 rounded-2xl mx-2 mb-1 ${!selectedCaseType ? 'bg-blue-50 dark:bg-indigo-900/40' : ''}`}
              >
                <Text className={`flex-1 font-bold ${!selectedCaseType ? 'text-blue-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'} text-left`}>
                  {t('all_types')}
                </Text>
                {!selectedCaseType && <Check size={16} color={isDark ? '#818cf8' : '#2563eb'} />}
              </TouchableOpacity>
              {caseTypes.map((ct) => (
                <TouchableOpacity
                  key={ct.publicId}
                  onPress={() => { setSelectedCaseType(ct.publicId); setDropdownOpen(false); }}
                  className={`flex-row items-center px-4 py-3 rounded-2xl mx-2 mb-1 ${selectedCaseType === ct.publicId ? 'bg-blue-50 dark:bg-indigo-900/40' : ''}`}
                >
                  <Text className={`flex-1 font-bold ${selectedCaseType === ct.publicId ? 'text-blue-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'} text-left`}>
                    {ct.name}
                  </Text>
                  {selectedCaseType === ct.publicId && <Check size={16} color={isDark ? '#818cf8' : '#2563eb'} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

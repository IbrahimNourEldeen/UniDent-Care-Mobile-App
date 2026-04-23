import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, ScrollView, Pressable } from 'react-native';
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

  const cardBg = isDark ? 'bg-slate-900 shadow-black/50' : 'bg-white shadow-indigo-900/10';
  const inputBg = isDark ? 'bg-slate-950/60' : 'bg-slate-50';

  return (
    <View>
      {/* Counters Bar */}
      <View className="flex-row items-center justify-between mb-6 px-1">
        <View className="flex-row gap-2">
            <View className={`px-3 py-1.5 rounded-2xl flex-row items-center gap-1.5 ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-50 border border-indigo-100'}`}>
                <View className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <Text className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-indigo-400' : 'text-indigo-700'}`}>{totalCount} {t('total')}</Text>
            </View>
            <View className={`px-3 py-1.5 rounded-2xl flex-row items-center gap-1.5 ${isDark ? 'bg-slate-800' : 'bg-slate-100 border border-slate-200'}`}>
                <Text className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{showingCount} {t('shown')}</Text>
            </View>
        </View>

        {/* View Mode Switcher */}
        <View className={`flex-row p-1 rounded-2xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
            <TouchableOpacity onPress={() => setViewMode('cards')} className={`p-2 rounded-xl ${viewMode === 'cards' ? (isDark ? 'bg-indigo-600 shadow-md shadow-indigo-500/30' : 'bg-white shadow-sm border border-slate-200/50') : ''}`}>
                <LayoutGrid size={16} color={viewMode === 'cards' ? (isDark ? '#ffffff' : '#4f46e5') : (isDark ? '#64748b' : '#94a3b8')} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setViewMode('list')} className={`p-2 rounded-xl ${viewMode === 'list' ? (isDark ? 'bg-indigo-600 shadow-md shadow-indigo-500/30' : 'bg-white shadow-sm border border-slate-200/50') : ''}`}>
                <List size={16} color={viewMode === 'list' ? (isDark ? '#ffffff' : '#4f46e5') : (isDark ? '#64748b' : '#94a3b8')} />
            </TouchableOpacity>
        </View>
      </View>

      {/* Search Input Area */}
      <View className={`flex-row items-center ${inputBg} border ${isDark ? 'border-slate-800' : 'border-slate-200'} rounded-[24px] px-4 py-3.5 mb-4 shadow-inner`}>
        <Search size={18} color={isDark ? '#64748b' : '#94a3b8'} strokeWidth={2.5} />
        <TextInput
          className={`flex-1 ml-3 text-sm font-bold text-left ${isDark ? 'text-white' : 'text-slate-800'}`}
          placeholder={t('search_placeholder_cases')}
          placeholderTextColor={isDark ? '#475569' : '#cbd5e1'}
          value={search}
          onChangeText={setSearch}
          selectionColor="#4f46e5"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.6} className={`w-6 h-6 rounded-full items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
            <X size={12} color={isDark ? '#94a3b8' : '#64748b'} strokeWidth={3} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        onPress={() => setDropdownOpen(true)}
        activeOpacity={0.7}
        className={`flex-row items-center ${inputBg} border ${isDark ? 'border-slate-800' : 'border-slate-200'} rounded-[24px] px-5 py-3.5`}
      >
        <Filter size={16} color={isDark ? '#818cf8' : '#4f46e5'} strokeWidth={2.5} />
        <View className="flex-1 ml-3">
            <Text className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Case Category</Text>
            <Text className={`text-sm font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`} numberOfLines={1}>
                {selectedLabel}
            </Text>
        </View>
        <View className={`w-8 h-8 rounded-full items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
            <ChevronDown size={14} color={isDark ? '#94a3b8' : '#64748b'} strokeWidth={3} />
        </View>
      </TouchableOpacity>

      <Modal visible={dropdownOpen} transparent animationType="slide">
        <Pressable className="flex-1 bg-black/60 justify-end" onPress={() => setDropdownOpen(false)}>
          <View className={`rounded-t-[40px] p-2 pb-10 ${isDark ? 'bg-slate-900' : 'bg-white'} shadow-2xl shadow-black`}>
            <View className={`w-12 h-1.5 self-center rounded-full mb-6 mt-4 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
            
            <View className="px-6 mb-4">
                <Text className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Select Category</Text>
                <Text className={`text-xs font-medium mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Filter cases by dentistry specializations</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="px-4">
              <TouchableOpacity
                onPress={() => { setSelectedCaseType(''); setDropdownOpen(false); }}
                className={`flex-row items-center px-5 py-4 rounded-[24px] mb-2 ${!selectedCaseType ? (isDark ? 'bg-indigo-600/20 border border-indigo-500/50' : 'bg-indigo-50 border border-indigo-100') : 'border border-transparent'}`}
              >
                <View className={`w-10 h-10 rounded-2xl items-center justify-center mr-4 ${!selectedCaseType ? (isDark ? 'bg-indigo-500/20' : 'bg-indigo-600') : (isDark ? 'bg-slate-800' : 'bg-slate-100')}`}>
                   <Check size={18} color={!selectedCaseType ? '#ffffff' : (isDark ? '#475569' : '#cbd5e1')} strokeWidth={3} />
                </View>
                <Text className={`flex-1 text-sm font-black ${!selectedCaseType ? (isDark ? 'text-indigo-400' : 'text-indigo-600') : (isDark ? 'text-slate-400' : 'text-slate-500')}`}>
                  {t('all_types')}
                </Text>
              </TouchableOpacity>

              {caseTypes.map((ct) => {
                const active = selectedCaseType === ct.publicId;
                return (
                    <TouchableOpacity
                      key={ct.publicId}
                      onPress={() => { setSelectedCaseType(ct.publicId); setDropdownOpen(false); }}
                      className={`flex-row items-center px-5 py-4 rounded-[24px] mb-2 ${active ? (isDark ? 'bg-indigo-600/20 border border-indigo-500/50' : 'bg-indigo-50 border border-indigo-100') : 'border border-transparent'}`}
                    >
                      <View className={`w-10 h-10 rounded-2xl items-center justify-center mr-4 ${active ? (isDark ? 'bg-indigo-500/20' : 'bg-indigo-600') : (isDark ? 'bg-slate-800' : 'bg-slate-100')}`}>
                         <Check size={18} color={active ? '#ffffff' : (isDark ? '#475569' : '#cbd5e1')} strokeWidth={3} />
                      </View>
                      <Text className={`flex-1 text-sm font-black ${active ? (isDark ? 'text-indigo-400' : 'text-indigo-600') : (isDark ? 'text-slate-400' : 'text-slate-500')}`}>
                        {ct.name}
                      </Text>
                    </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}


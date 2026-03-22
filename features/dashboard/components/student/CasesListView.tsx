import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  User,
  Stethoscope,
  Clock,
  Calendar,
  Send,
  CheckCircle2,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { CaseItem } from '@/features/cases/types/caseTypes';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

interface CasesListRowProps {
  caseItem: CaseItem;
  onRequest: (item: CaseItem) => void;
}

function CasesListRow({ caseItem, onRequest }: CasesListRowProps) {
  const { t } = useTranslation();
  const { theme } = useThemeLanguage();
  const isDark = theme === 'dark';
  const isAvailable = caseItem.status === 'Available';

  return (
    <View className="bg-white dark:bg-slate-900 px-5 py-4 border-b border-slate-50 dark:border-slate-800/60 flex-row items-center gap-3">
      {/* Icon */}
      <View className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-900/30 items-center justify-center shrink-0">
        <User size={20} color={isDark ? '#60a5fa' : '#2563eb'} />
      </View>

      {/* Main Info */}
      <View className="flex-1 min-w-0">
        <View className="flex-row items-center gap-2 mb-0.5">
          <Text className="font-black text-slate-900 dark:text-white text-sm flex-1 text-left" numberOfLines={1}>
            {caseItem.patientName}
          </Text>
          <View className={`px-2 py-0.5 rounded-full ${isAvailable ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-blue-50 dark:bg-blue-900/30'}`}>
            <Text className={`text-[10px] font-black uppercase ${isAvailable ? 'text-emerald-700 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
              {caseItem.status}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center flex-wrap gap-x-3 gap-y-0.5">
          <View className="flex-row items-center gap-1">
            <Stethoscope size={10} color={isDark ? '#818cf8' : '#4f46e5'} />
            <Text className="text-[11px] text-slate-500 dark:text-slate-400">
              {caseItem.caseType?.name ?? 'General'}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Clock size={10} color={isDark ? '#64748b' : '#94a3b8'} />
            <Text className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('requests_count', { count: caseItem.pendingRequests })}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Calendar size={10} color={isDark ? '#64748b' : '#94a3b8'} />
            <Text className="text-[11px] text-slate-500 dark:text-slate-400">
              {new Date(caseItem.createAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
            </Text>
          </View>
        </View>
      </View>

      {/* Request Button */}
      <TouchableOpacity
        onPress={() => onRequest(caseItem)}
        className="flex-row items-center bg-blue-600 dark:bg-indigo-600 px-3 py-2 rounded-xl gap-1.5 shrink-0"
      >
        <Send size={12} color="white" />
        <Text className="text-white text-xs font-black">{t('apply_action')}</Text>
      </TouchableOpacity>
    </View>
  );
}

interface CasesListViewProps {
  cases: CaseItem[];
  onRequest: (item: CaseItem) => void;
}

export default function CasesListView({ cases, onRequest }: CasesListViewProps) {
  const { t } = useTranslation();
  return (
    <View className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 mb-4">
      {/* Header Row */}
      <View className="flex-row px-5 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
        <Text className="flex-1 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 text-left">{t('patient_header')}</Text>
        <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 text-right">{t('action_header')}</Text>
      </View>
      {cases.map((item) => (
        <CasesListRow key={item.id} caseItem={item} onRequest={onRequest} />
      ))}
    </View>
  );
}

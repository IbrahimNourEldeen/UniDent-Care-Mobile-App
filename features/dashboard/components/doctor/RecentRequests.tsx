import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Users, Clock, CheckCircle2, ClipboardList, Search } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { CaseRequest } from '../../services/doctorDashboardService';

interface RecentRequestsProps {
  requests: CaseRequest[];
  loading: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  actionLoading: string | null;
  isDark: boolean;
  language: string;
  onRefresh: () => void;
}

export const RecentRequests: React.FC<RecentRequestsProps> = ({
  requests,
  loading,
  onApprove,
  onReject,
  actionLoading,
  isDark,
  language,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const { language: currentLang } = useThemeLanguage();
  const isRtl = currentLang === 'ar';
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAndSortedRequests = useMemo(() => {
    // 1. Filter only Pending
    let result = requests.filter((req) => req.status === 'Pending');

    // 2. Filter by Search Query (Student Name or Patient Name)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (req) =>
          (req.studentName && req.studentName.toLowerCase().includes(q)) ||
          (req.patientName && req.patientName.toLowerCase().includes(q)) ||
          (req.caseName && req.caseName.toLowerCase().includes(q))
      );
    }

    // 3. Sort by date (newest first)
    result.sort((a, b) => new Date(b.createAt).getTime() - new Date(a.createAt).getTime());

    return result;
  }, [requests, searchQuery]);

  return (
    <>
      <View className={`mb-4 flex-row items-center justify-between px-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <Text className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
          {t('recent_cases')}
        </Text>
        <TouchableOpacity onPress={onRefresh} activeOpacity={0.7}>
          <Text className="text-xs font-bold text-indigo-500">{t('refresh')}</Text>
        </TouchableOpacity>
      </View>

      <View className={`flex-row items-center px-4 py-3 rounded-2xl mb-4 border ${isRtl ? 'flex-row-reverse' : ''} ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
        <Search size={18} color={isDark ? '#64748b' : '#94a3b8'} />
        <TextInput
          className={`flex-1 ${isRtl ? 'mr-3 text-right' : 'ml-3'} text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}
          placeholder={t('search_placeholder_students_requests')}
          placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <View
            key={i}
            className="h-44 bg-slate-200/50 dark:bg-slate-900/50 rounded-3xl mb-4 animate-pulse border border-dashed border-slate-200 dark:border-slate-800"
          />
        ))
      ) : filteredAndSortedRequests.length === 0 ? (
        <View className="py-20 items-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <ClipboardList size={40} color={isDark ? '#334155' : '#cbd5e1'} strokeWidth={1.5} />
          <Text className="text-slate-400 dark:text-slate-500 font-bold mt-4">{t('no_requests')}</Text>
        </View>
      ) : (
        filteredAndSortedRequests.map((req) => {
          const isPending = req.status === 'Pending';
          const s = {
            bg: isPending ? (isDark ? '#451a03' : '#fef3c7') : (isDark ? '#064e3b' : '#d1fae5'),
            text: isPending ? (isDark ? '#fbbf24' : '#92400e') : (isDark ? '#34d399' : '#065f46')
          };

          return (
            <View
              key={req.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none mb-4 overflow-hidden"
            >
              <View className={`flex-row p-5 gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <View className="flex-1">
                  <View className={`flex-row items-center gap-2 mb-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <View className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50">
                      <Text className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase">
                        {t('case_id_prefix')} #{req.id.slice(-4)}
                      </Text>
                    </View>
                    <View style={{ backgroundColor: s.bg }} className="px-2 py-0.5 rounded-full">
                      <Text style={{ color: s.text }} className="text-[9px] font-black uppercase">
                        {t(`status_${req.status.toLowerCase().replace(/\s/g, '')}`)}
                      </Text>
                    </View>
                  </View>
                  
                  <Text className={`text-base font-black text-slate-900 dark:text-white leading-tight mb-3 ${isRtl ? 'text-right' : ''}`} numberOfLines={1}>
                    {req.caseName}
                  </Text>

                  <View className={`flex-row items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <View className={`flex-row items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <View className="w-5 h-5 rounded-full bg-slate-50 dark:bg-slate-800 items-center justify-center">
                        <Users size={10} color={isDark ? '#94a3b8' : '#64748b'} />
                      </View>
                      <Text className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                        {req.studentName}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className={`items-end justify-between ${isRtl ? 'items-start' : ''}`}>
                  {isPending && (
                    <TouchableOpacity
                      onPress={() => onApprove(req.id)}
                      disabled={!!actionLoading}
                      className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 items-center justify-center border border-emerald-100 dark:border-emerald-900/30"
                      style={{ opacity: actionLoading ? 0.5 : 1 }}
                    >
                      <CheckCircle2 size={18} color={isDark ? '#34d399' : '#059669'} />
                    </TouchableOpacity>
                  )}
                  
                  <View className={`flex-row items-center gap-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <Clock size={10} color={isDark ? '#475559' : '#94a3b8'} />
                    <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                      {new Date(req.createAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-GB', { day: 'numeric', month: 'short' })}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })
      )}
    </>
  );
};

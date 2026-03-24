import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Users, Clock, CheckCircle2, ClipboardList } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
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

  return (
    <>
      <View className="mb-4 flex-row items-center justify-between px-1">
        <Text className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
          {t('recent_cases')}
        </Text>
        <TouchableOpacity onPress={onRefresh} activeOpacity={0.7}>
          <Text className="text-xs font-bold text-indigo-500">{t('refresh')}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <View
            key={i}
            className="h-44 bg-slate-200/50 dark:bg-slate-900/50 rounded-3xl mb-4 animate-pulse border border-dashed border-slate-200 dark:border-slate-800"
          />
        ))
      ) : requests.length === 0 ? (
        <View className="py-20 items-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <ClipboardList size={40} color={isDark ? '#334155' : '#cbd5e1'} strokeWidth={1.5} />
          <Text className="text-slate-400 dark:text-slate-500 font-bold mt-4">{t('no_requests')}</Text>
        </View>
      ) : (
        requests.map((req) => {
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
              <View className="flex-row p-5 gap-4">
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-2">
                    <View className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50">
                      <Text className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase">
                        Case #{req.id.slice(-4)}
                      </Text>
                    </View>
                    <View style={{ backgroundColor: s.bg }} className="px-2 py-0.5 rounded-full">
                      <Text style={{ color: s.text }} className="text-[9px] font-black uppercase">
                        {req.status}
                      </Text>
                    </View>
                  </View>
                  
                  <Text className="text-base font-black text-slate-900 dark:text-white leading-tight mb-3" numberOfLines={1}>
                    {req.caseName}
                  </Text>

                  <View className="flex-row items-center gap-4">
                    <View className="flex-row items-center gap-1.5">
                      <View className="w-5 h-5 rounded-full bg-slate-50 dark:bg-slate-800 items-center justify-center">
                        <Users size={10} color={isDark ? '#94a3b8' : '#64748b'} />
                      </View>
                      <Text className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                        {req.studentName}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="items-end justify-between">
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
                  
                  <View className="flex-row items-center gap-1">
                    <Clock size={10} color={isDark ? '#475569' : '#94a3b8'} />
                    <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                      {new Date(req.createAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-GB', { day: 'numeric', month: 'short' })}
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

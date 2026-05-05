import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { User, Calendar, Briefcase, ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { useRouter } from 'expo-router';
import { CaseRequest } from '../../services/doctorDashboardService';

interface ApprovedRequestsListProps {
  requests: CaseRequest[];
  loading: boolean;
  isDark: boolean;
}

export const ApprovedRequestsList: React.FC<ApprovedRequestsListProps> = ({ requests, loading, isDark }) => {
  const { t } = useTranslation();
  const { language } = useThemeLanguage();
  const isRtl = language === 'ar';
  const router = useRouter();

  const approvedRequests = requests.filter(req => req.status === 'Approved');

  if (loading) {
    return (
      <View className="mb-8">
        <Text className={`text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest px-1 mb-4 ${isRtl ? 'text-right' : ''}`}>
          {isRtl ? 'الحالات المعتمدة' : 'Approved Cases'}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4 }}>
          {Array.from({ length: 2 }).map((_, i) => (
            <View
              key={i}
              className="w-72 h-40 bg-slate-200/50 dark:bg-slate-900/50 rounded-[32px] mr-4 animate-pulse border border-dashed border-slate-200 dark:border-slate-800"
            />
          ))}
        </ScrollView>
      </View>
    );
  }

  if (approvedRequests.length === 0) {
    return null;
  }

  return (
    <View className="mb-8">
      <View className={`flex-row items-center justify-between px-1 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <Text className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
          {isRtl ? 'الحالات التي تمت الموافقة عليها' : 'Approved Cases'}
        </Text>
        <View className="bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
          <Text className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
            {approvedRequests.length}
          </Text>
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 8 }}
      >
        {approvedRequests.map((req) => (
          <View
            key={req.id}
            className={`w-80 bg-white dark:bg-slate-900 rounded-[32px] p-5 ${isRtl ? 'ml-4' : 'mr-4'} border border-slate-100 dark:border-slate-800 shadow-sm`}
          >
            <View className={`flex-row items-center gap-4 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <View className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 items-center justify-center overflow-hidden">
                <User size={24} color={isDark ? '#818cf8' : '#4f46e5'} />
              </View>
              <View className="flex-1">
                <Text className={`font-black text-slate-900 dark:text-white text-base ${isRtl ? 'text-right' : ''}`} numberOfLines={1}>
                  {req.studentName}
                </Text>
                <View className={`flex-row items-center gap-1.5 mt-0.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <Calendar size={10} color={isDark ? '#64748b' : '#94a3b8'} />
                  <Text className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {new Date(req.createAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
              </View>
            </View>

            <View className={`bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 mb-4 ${isRtl ? 'items-end' : ''}`}>
              <View className={`flex-row items-center gap-2 mb-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <Briefcase size={12} color={isDark ? '#818cf8' : '#4f46e5'} />
                <Text className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter">
                  {isRtl ? 'عنوان الحالة' : 'Case Title'}
                </Text>
              </View>
              <Text className={`text-sm font-bold text-slate-700 dark:text-slate-300 ${isRtl ? 'text-right' : ''}`} numberOfLines={2}>
                {req.caseName}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

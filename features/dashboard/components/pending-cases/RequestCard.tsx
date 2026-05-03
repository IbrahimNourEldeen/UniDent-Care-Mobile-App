import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CaseRequest } from '@/features/dashboard/services/doctorDashboardService';
import { getInitials, formatDate } from './pendingCasesHelpers';

interface RequestCardProps {
  request: CaseRequest;
  onPress: () => void;
  isDark: boolean;
  locale: string;
  t: (k: string) => string;
}

export function RequestCard({ request, onPress, isDark, locale, t }: RequestCardProps) {
  const initials = getInitials(request.studentName);

  return (
    <Animated.View entering={FadeInDown.duration(400)}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        className={`mb-4 rounded-[32px] overflow-hidden border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm shadow-slate-200/50'}`}
      >
        <View className="p-5 flex-row items-center gap-4">
          <LinearGradient colors={['#3b82f6', '#4f46e5']} className="w-15 h-15 rounded-[22px] items-center justify-center">
            <Text className="text-white font-black text-xl">{initials}</Text>
          </LinearGradient>

          <View className="flex-1">
            <View className={`flex-row items-center justify-between mb-1.5`}>
               <Text className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{t('case_request_item')}</Text>
               <Text className="text-[10px] text-slate-400 font-bold">{formatDate(request.createAt, locale)}</Text>
            </View>
            
            <Text className="text-[17px] font-black text-slate-900 dark:text-white leading-tight mb-2" numberOfLines={1}>
              {request.caseName}
            </Text>

            <View className="flex-row items-center gap-2.5">
              <Text className="text-sm font-bold text-slate-600 dark:text-slate-300" numberOfLines={1}>
                {request.studentName}
              </Text>
              <View className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              <Text className="text-xs font-medium text-slate-400" numberOfLines={1}>
                {request.university}
              </Text>
            </View>
          </View>
        </View>

        <View className={`px-6 py-3.5 flex-row items-center justify-between ${isDark ? 'bg-slate-800/30' : 'bg-slate-50/70'}`}>
           <View className="flex-row items-center gap-2">
              <User size={14} color={isDark ? '#64748b' : '#94a3b8'} />
              <Text className="text-xs font-bold text-slate-500 dark:text-slate-400">{request.patientName || 'N/A'}</Text>
           </View>
           <View className="flex-row items-center gap-1.5 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full">
              <View className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <Text className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">{t('status_pending')}</Text>
           </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

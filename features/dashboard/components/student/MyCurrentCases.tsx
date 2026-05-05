import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { router } from 'expo-router';
import { Briefcase, User } from 'lucide-react-native';
import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useStudentDashboardData } from '../../hooks/useStudentDashboardData';

export default function MyCurrentCases() {
  const { theme, language } = useThemeLanguage();
  const isDark = theme === 'dark';
  const isRtl = language === 'ar';
  const { myCases } = useStudentDashboardData();
  const { data, isLoading, isError } = myCases;

  if (isError) {
    return (
      <View className={`rounded-2xl border p-6 flex items-center justify-center min-h-[200px] ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
        <Text className="text-red-500 font-medium">
          {isRtl ? "حدث خطأ في تحميل حالاتك" : "Failed to load your cases"}
        </Text>
      </View>
    );
  }

  const currentCases = data?.data?.items?.filter((item: any) => item.status === "InProgress") || [];

  return (
    <View className={`rounded-2xl border mb-4 overflow-hidden shadow-sm ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
      <View className="absolute top-0 right-0 h-1 w-full bg-blue-500/80" />

      <View className={`pt-5 pb-3 px-5 flex-row items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <Briefcase size={16} color={isDark ? '#94a3b8' : '#94a3b8'} />
        <Text className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          {isRtl ? "حالاتك الحالية" : "My Current Cases"}
        </Text>
      </View>

      <View className="px-5 pb-5">
        {isLoading ? (
          <View className="gap-3">
            <View className={`h-20 w-full rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
            <View className={`h-20 w-full rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
          </View>
        ) : currentCases.length === 0 ? (
          <View className="flex-1 items-center justify-center py-8">
            <View className={`p-5 rounded-full mb-4 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
              <Briefcase size={36} color={isDark ? '#475569' : '#cbd5e1'} />
            </View>
            <Text className={`font-semibold text-sm ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
              {isRtl ? "لا توجد حالات جارية حالياً" : "No in-progress cases at the moment"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={currentCases}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={{ gap: 14 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push(`/case-details/${item.id}`)}
                activeOpacity={0.7}
                className={`p-5 rounded-2xl border ${isDark ? 'border-slate-800 bg-slate-800/20' : 'border-slate-100 bg-slate-50/50'}`}
              >
                <View className={`flex-row items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <View className={`w-12 h-12 rounded-full items-center justify-center ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                    <User size={22} color="#3b82f6" />
                  </View>
                  
                  <View className={`flex-1 ${isRtl ? 'items-end' : 'items-start'}`}>
                    <Text className={`font-bold text-lg mb-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                      {item.patientName}
                    </Text>
                    
                    <View className={`flex-row flex-wrap gap-x-4 gap-y-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <View className={`flex-row items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <View className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <Text className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {item.phone || (isRtl ? "بدون هاتف" : "No phone")}
                        </Text>
                      </View>
                      
                      <View className={`flex-row items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <View className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <Text className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {item.diagnosisdto?.caseType || (isRtl ? "غير محدد" : "Not specified")}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
}

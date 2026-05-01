import { cancelCaseRequest } from '@/features/cases/services/caseService';
import { RootState } from '@/store/store';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { router } from 'expo-router';
import { Calendar, FileText, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useStudentDashboardData } from '../../hooks/useStudentDashboardData';

export default function MyRequests() {
  const { theme, language } = useThemeLanguage();
  const isDark = theme === 'dark';
  const isRtl = language === 'ar';
  
  const user = useSelector((state: RootState) => state.auth.user);
  const studentId = (user as any)?.publicId ?? '';

  const { myRequests } = useStudentDashboardData();
  const { data, isLoading, isError, refetch } = myRequests;

  const [cancellingId, setCancellingId] = useState<string | null>(null);

  if (isError) {
    return (
      <View className={`rounded-2xl border p-6 flex items-center justify-center min-h-[200px] ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
        <Text className="text-red-500 font-medium">
          {isRtl ? "حدث خطأ في تحميل الطلبات" : "Failed to load your requests"}
        </Text>
      </View>
    );
  }

  const pendingRequests = data?.data?.items?.filter((item: any) => item.status === "Pending") || [];

  const handleCancelRequest = (requestId: string) => {
    Alert.alert(
      isRtl ? 'إلغاء الطلب' : 'Cancel Request',
      isRtl ? 'هل أنت متأكد من إلغاء هذا الطلب؟' : 'Are you sure you want to cancel this request?',
      [
        { text: isRtl ? 'تراجع' : 'Cancel', style: 'cancel' },
        { 
          text: isRtl ? 'تأكيد' : 'Confirm', 
          style: 'destructive',
          onPress: async () => {
            setCancellingId(requestId);
            try {
              const res = await cancelCaseRequest(requestId, studentId);
              if (res.success) {
                refetch();
              } else {
                Alert.alert('Error', res.message || (isRtl ? 'فشل الإلغاء' : 'Failed to cancel'));
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || (isRtl ? 'فشل الإلغاء' : 'Failed to cancel'));
            } finally {
              setCancellingId(null);
            }
          }
        }
      ]
    );
  };

  return (
    <View className={`rounded-2xl border mb-4 overflow-hidden shadow-sm ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
      <View className="absolute top-0 right-0 h-1 w-full bg-amber-500/80" />

      <View className={`pt-5 pb-3 px-5 flex-row items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <FileText size={16} color={isDark ? '#94a3b8' : '#94a3b8'} />
        <Text className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          {isRtl ? "طلباتك الحالية" : "My Requests"}
        </Text>
      </View>

      <View className="px-5 pb-5">
        {isLoading ? (
          <View className="gap-3">
            <View className={`h-24 w-full rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
            <View className={`h-24 w-full rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
          </View>
        ) : pendingRequests.length === 0 ? (
          <View className="flex-1 items-center justify-center py-8">
            <View className={`p-5 rounded-full mb-4 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
              <FileText size={36} color={isDark ? '#475569' : '#cbd5e1'} />
            </View>
            <Text className={`font-semibold text-sm ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
              {isRtl ? "لا توجد طلبات معلقة حالياً" : "No pending requests at the moment"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={pendingRequests}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={{ gap: 14 }}
            renderItem={({ item }) => (
              <View
                className={`p-5 rounded-2xl border ${isDark ? 'border-slate-800 bg-slate-800/20' : 'border-slate-100 bg-slate-50/50'}`}
              >
                <View className={`flex-row items-start gap-4 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <View className={`w-12 h-12 rounded-full items-center justify-center ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
                    <User size={22} color="#f59e0b" />
                  </View>
                  
                  <View className={`flex-1 ${isRtl ? 'items-end' : 'items-start'}`}>
                    <Text className={`font-bold text-lg mb-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                      {item.patientName}
                    </Text>
                    <Text className={`text-xs font-semibold mb-1 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                      {isRtl ? "دكتور:" : "Doctor:"} {item.doctorName}
                    </Text>
                    <Text className={`text-xs font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'} ${isRtl ? 'text-right' : 'text-left'}`} numberOfLines={2}>
                      {item.description}
                    </Text>
                  </View>
                </View>

                <View className={`flex-row justify-between items-center pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'} ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <View className={`flex-row items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <Calendar size={14} color={isDark ? '#94a3b8' : '#64748b'} />
                    <Text className={`text-xs font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {new Date(item.createAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                  </View>

                  <View className={`flex-row items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => router.push({ pathname: "/(screens)/case-detail/[id]", params: { id: item.patientCasePublicId } })}
                      className={`h-10 px-4 rounded-xl items-center justify-center border ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}
                    >
                      <Text className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                        {isRtl ? "عرض" : "View"}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleCancelRequest(item.id)}
                      disabled={cancellingId === item.id}
                      className={`h-10 px-4 rounded-xl items-center justify-center ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}
                    >
                      {cancellingId === item.id ? (
                        <ActivityIndicator size="small" color="#ef4444" />
                      ) : (
                        <Text className="text-xs font-bold text-red-600">
                          {isRtl ? "إلغاء" : "Cancel"}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

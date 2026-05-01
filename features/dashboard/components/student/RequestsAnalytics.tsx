import { useStudentStats } from '@/features/dashboard/hooks/useStudentStats';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

export default function RequestsAnalytics() {
  const { theme, language } = useThemeLanguage();
  const isDark = theme === 'dark';
  const isRtl = language === 'ar';
  
  const { stats, loading } = useStudentStats();

  // Colors based on the web chart setup
  const chartColors = {
    Approved: '#059669', // Emerald 600
    Pending: '#d97706',  // Amber 600
    Rejected: '#e11d48', // Rose 600
  };

  const chartColorsDark = {
    Approved: '#10b981', // Emerald 500
    Pending: '#fbbf24',  // Amber 400
    Rejected: '#fb7185', // Rose 400
  };

  const currentColors = isDark ? chartColorsDark : chartColors;

  const rawData = [
    { name: 'Approved', value: stats.approvedRequests, color: currentColors.Approved, text: isRtl ? 'مقبول' : 'Approved' },
    { name: 'Pending', value: stats.pendingRequests, color: currentColors.Pending, text: isRtl ? 'قيد الانتظار' : 'Pending' },
    { name: 'Rejected', value: stats.rejectedRequests, color: currentColors.Rejected, text: isRtl ? 'مرفوض' : 'Rejected' },
  ];

  const pieData = rawData
    .filter(item => item.value > 0)
    .map(item => ({
      value: item.value,
      color: item.color,
      text: item.text,
    }));

  return (
    <View className={`rounded-2xl border mb-4 shadow-sm ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
      <View className="items-center pt-6 pb-2 px-6">
        <Text className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          {isRtl ? "إحصائيات الطلبات" : "Requests Analytics"}
        </Text>
        <Text className={`text-2xl font-bold mt-1 text-center ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
          {isRtl ? "حالة طلباتك الحالية" : "Current status of your requests"}
        </Text>
      </View>
      
      <View className="pb-6 px-6 justify-center items-center">
        {loading ? (
          <View className="h-[220px] justify-center items-center">
            <ActivityIndicator size="large" color="#4f46e5" />
          </View>
        ) : pieData.length === 0 ? (
          <View className="h-[220px] justify-center items-center">
            <Text className={`font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {isRtl ? "لا توجد طلبات لعرضها" : "No requests to display"}
            </Text>
          </View>
        ) : (
          <View className="items-center justify-center min-h-[220px]">
            <PieChart
              data={pieData}
              donut
              innerRadius={60}
              radius={85}
              innerCircleColor={isDark ? '#0f172a' : '#ffffff'}
              centerLabelComponent={() => {
                return (
                  <View className="justify-center items-center">
                    <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {stats.totalRequests}
                    </Text>
                  </View>
                );
              }}
            />
            <View className={`flex-row flex-wrap justify-center mt-6 gap-x-6 gap-y-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
              {pieData.map((item, index) => (
                <View key={index} className={`flex-row items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <View style={{ backgroundColor: item.color }} className="w-3 h-3 rounded-full" />
                  <Text className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {item.text}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

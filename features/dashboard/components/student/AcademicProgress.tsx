import { useStudentStats } from '@/features/dashboard/hooks/useStudentStats';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { Target } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

export default function AcademicProgress() {
  const { theme, language } = useThemeLanguage();
  const isDark = theme === 'dark';
  const isRtl = language === 'ar';
  
  const { stats, loading } = useStudentStats();

  const percentage = stats.totalSessions > 0 ? Math.round((stats.completedSessions / stats.totalSessions) * 100) : 0;

  return (
    <View className={`rounded-2xl border mb-4 shadow-sm ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
      <View className={`pt-6 pb-4 px-6 flex-row justify-between items-start ${isRtl ? 'flex-row-reverse' : ''}`}>
        <View className={`flex-1 ${isRtl ? 'items-end' : 'items-start'}`}>
          <Text className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {isRtl ? "التقدم الأكاديمي" : "Academic Progress"}
          </Text>
          <View className="" />
          <Text className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            {stats.completedSessions} / {stats.totalSessions}{' '}
            <Text className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {isRtl ? "جلسات" : "Sessions"}
            </Text>
          </Text>
        </View>
        <View className={`p-2.5 rounded-xl ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
          <Target size={20} color={isDark ? '#818cf8' : '#4f46e5'} />
        </View>
      </View>

      <View className="px-6 pb-6 justify-end">
        {loading ? (
          <View className="gap-4">
            <View className={`h-2.5 w-full rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
            <View className={`h-4 w-48 rounded-md ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
          </View>
        ) : (
          <View className="gap-5">
            <View className={`flex-row justify-between items-end ${isRtl ? 'flex-row-reverse' : ''}`}>
              <Text className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {isRtl ? "نسبة الإنجاز" : "Completion"}
              </Text>
              <Text className={`text-lg font-black ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                {percentage}%
              </Text>
            </View>
            
            <View className={`h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <View 
                style={{ width: `${percentage}%` }} 
                className={`h-full rounded-full ${isDark ? 'bg-indigo-500' : 'bg-indigo-600'}`} 
              />
            </View>
            
            <Text className={`text-xs leading-relaxed font-bold ${isRtl ? 'text-right' : 'text-left'} ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {isRtl
                ? `أنجزت ${percentage}% من متطلباتك لهذا الفصل. استمر في العمل الرائع!`
                : `You've completed ${percentage}% of your requirements this semester. Keep up the great work!`}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

export interface StatItem {
  label: string;
  value: number;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  accentColor: string;
}

interface DoctorStatsProps {
  stats: StatItem[];
  loading: boolean;
}

function StatCardSkeleton() {
  return (
    <View className="flex-1 min-w-[44%] bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none">
      <View className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4" />
      <View className="w-12 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 mb-2" />
      <View className="w-20 h-3 rounded-full bg-slate-100 dark:bg-slate-800" />
    </View>
  );
}

export const DoctorStatsGrid: React.FC<DoctorStatsProps> = ({ stats, loading }) => {
  const { language } = useThemeLanguage();
  const isRtl = language === 'ar';

  if (loading) {
    return (
      <View className="mb-8">
        <View className={`flex-row gap-3 mb-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <StatCardSkeleton />
          <StatCardSkeleton />
        </View>
        <View className={`flex-row gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <StatCardSkeleton />
          <StatCardSkeleton />
        </View>
      </View>
    );
  }

  // Split into rows of 2
  const rows: StatItem[][] = [];
  for (let i = 0; i < stats.length; i += 2) {
    rows.push(stats.slice(i, i + 2));
  }

  return (
    <View className="mb-8">
      {rows.map((row, rowIdx) => (
        <View
          key={rowIdx}
          className={`flex-row gap-3 ${rowIdx < rows.length - 1 ? 'mb-3' : ''} ${isRtl ? 'flex-row-reverse' : ''}`}
        >
          {row.map((item, idx) => (
            <View
              key={idx}
              className="flex-1 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-200/50 dark:shadow-none"
            >
              {/* Icon badge */}
              <View
                className={`w-11 h-11 rounded-2xl items-center justify-center mb-4 ${item.bgColor} ${isRtl ? 'self-end' : 'self-start'}`}
              >
                <item.icon size={21} color={item.iconColor} strokeWidth={2.5} />
              </View>

              {/* Value */}
              <Text
                className={`text-3xl font-black text-slate-900 dark:text-white leading-none mb-1 ${isRtl ? 'text-right' : ''}`}
              >
                {item.value}
              </Text>

              {/* Label */}
              <Text
                className={`text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-tight ${isRtl ? 'text-right' : ''}`}
                numberOfLines={2}
              >
                {item.label}
              </Text>

              {/* Bottom accent line */}
              <View className={`h-0.5 rounded-full mt-3 ${item.accentColor}`} />
            </View>
          ))}
          {/* If odd number of stats, pad last row */}
          {row.length < 2 && <View className="flex-1" />}
        </View>
      ))}
    </View>
  );
};

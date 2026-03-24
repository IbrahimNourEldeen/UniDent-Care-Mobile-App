import React from 'react';
import { View, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface StatItem {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  iconColor: string;
}

interface DoctorStatsProps {
  stats: StatItem[];
  loading: boolean;
}

export const DoctorStatsGrid: React.FC<DoctorStatsProps> = ({ stats, loading }) => {
  return (
    <View className="flex-row flex-wrap gap-3 mb-8">
      {stats.map((item, idx) => (
        <View 
          key={idx} 
          className="bg-white dark:bg-slate-900 flex-1 min-w-[140px] p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-200/50 dark:shadow-none"
        >
          <View className={`${item.bgColor} w-11 h-11 rounded-2xl items-center justify-center mb-4`}>
            <item.icon size={22} color={item.iconColor} strokeWidth={2.5} />
          </View>
          <Text className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
            {loading ? '...' : item.value}
          </Text>
          <Text className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

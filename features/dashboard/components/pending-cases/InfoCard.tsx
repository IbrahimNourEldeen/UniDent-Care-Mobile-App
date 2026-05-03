import React from 'react';
import { View, Text } from 'react-native';

interface InfoCardProps {
  icon: any;
  label: string;
  value: string;
  isDark: boolean;
  colorClass: string;
}

export function InfoCard({ 
  icon: Icon, 
  label, 
  value, 
  isDark,
  colorClass 
}: InfoCardProps) {
  return (
    <View className={`p-4 rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
      <View className="flex-row items-center gap-2.5 mb-1.5">
        <View className={`w-7 h-7 rounded-lg items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
          <Icon size={14} className={colorClass} />
        </View>
        <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {label}
        </Text>
      </View>
      <Text className="text-[13px] font-bold text-slate-900 dark:text-white" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

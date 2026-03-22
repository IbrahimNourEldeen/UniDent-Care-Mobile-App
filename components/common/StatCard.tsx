import React from 'react';
import { View, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  iconColor: string;
  loading?: boolean;
  progress?: number;
}

export function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  color, 
  bgColor, 
  iconColor, 
  loading = false, 
  progress 
}: StatCardProps) {
  const clampedProgress = progress != null ? Math.min(100, Math.max(0, progress)) : null;

  return (
    <View className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none mb-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">{label}</Text>
          {loading ? (
            <View className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
          ) : (
            <Text className="text-3xl font-black text-slate-900 dark:text-white">{value}</Text>
          )}
        </View>
        <View className={`p-4 rounded-2xl ${bgColor}`}>
          <Icon size={26} color={iconColor} strokeWidth={2.5} />
        </View>
      </View>

      {clampedProgress != null && !loading && (
        <View className="mt-5">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500">Progress</Text>
            <Text className={`text-xs font-black ${color}`}>{clampedProgress}%</Text>
          </View>
          <View className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <View
              className={`h-full rounded-full ${bgColor}`}
              style={{ width: `${clampedProgress}%` }}
            />
          </View>
        </View>
      )}
    </View>
  );
}

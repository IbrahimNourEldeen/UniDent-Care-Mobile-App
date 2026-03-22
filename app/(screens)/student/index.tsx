import React, { useState } from "react";
import { ScrollView, Text, View, RefreshControl, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Bell } from "lucide-react-native";

import { RootState } from "@/store/store";
import { useThemeLanguage } from "@/store/ThemeLanguageContext";
import { useStudentStats } from "@/features/dashboard/hooks/useStudentStats";

import StatsCards from "@/features/dashboard/components/student/StatsCards";
import UpcomingSessions from "@/features/dashboard/components/student/UpcomingSessions";
import QuickActions from "@/features/dashboard/components/student/QuickActions";
import RecentActivity from "@/features/dashboard/components/student/RecentActivity";

export default function StudentDashboardScreen() {
  const { t } = useTranslation();
  const user = useSelector((state: RootState) => state.auth.user);
  const { theme } = useThemeLanguage();
  const isDark = theme === "dark";
  
  const { stats, upcomingSessions, recentActivity, loading } = useStudentStats();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // In a real app, this would refetch data
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDark ? "#818cf8" : "#4f46e5"} />
        }
      >
        {/* Header Section */}
        <View className="flex-row justify-between items-center pt-6 mb-8">
          <View>
            <Text className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">
              {getGreeting()}
            </Text>
            <Text className="text-3xl font-black text-slate-900 dark:text-white" numberOfLines={1}>
              {user?.fullName?.split(' ')[0] || "Student"} 👋
            </Text>
          </View>
          <TouchableOpacity className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl items-center justify-center shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800">
            <View className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full z-10 border-2 border-white dark:border-slate-900" />
            <Bell size={24} color={isDark ? "#cbd5e1" : "#1e293b"} />
          </TouchableOpacity>
        </View>

        {/* Dashoard Greeting/Motivator */}
        <View className="bg-blue-600 dark:bg-indigo-600 p-6 rounded-[32px] mb-8 shadow-xl shadow-blue-300 dark:shadow-none relative overflow-hidden">
          {/* Subtle decorative circles */}
          <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
          <View className="absolute -bottom-20 -left-10 w-48 h-48 bg-white/5 rounded-full" />
          
          <Text className="text-white text-xl font-black mb-1">
            {t('dashboard_greeting')}
          </Text>
          <Text className="text-blue-100/80 font-medium text-sm">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>

        {/* Stats Grid */}
        <StatsCards />

        {/* Quick Actions */}
        <QuickActions />

        {/* Upcoming Sessions */}
        <UpcomingSessions sessions={upcomingSessions} loading={loading} />

        {/* Recent Activity */}
        <RecentActivity activities={recentActivity} loading={loading} />

      </ScrollView>
    </SafeAreaView>
  );
}

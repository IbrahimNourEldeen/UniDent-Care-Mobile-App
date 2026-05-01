import React, { useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  View,
  StatusBar
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { LinearGradient } from 'expo-linear-gradient';

import { useStudentDashboardData } from "@/features/dashboard/hooks/useStudentDashboardData";
import { RootState } from "@/store/store";
import { useThemeLanguage } from "@/store/ThemeLanguageContext";

import AcademicProgress from "@/features/dashboard/components/student/AcademicProgress";
import CalendarWidget from "@/features/dashboard/components/student/CalendarWidget";
import MyCurrentCases from "@/features/dashboard/components/student/MyCurrentCases";
import MyRequests from "@/features/dashboard/components/student/MyRequests";
import RequestsAnalytics from "@/features/dashboard/components/student/RequestsAnalytics";
import StatsCards from "@/features/dashboard/components/student/StatsCards";

export default function StudentDashboardScreen() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { theme, language } = useThemeLanguage();
  const isDark = theme === "dark";
  const isRtl = language === "ar";
  const insets = useSafeAreaInsets();

  const { profile, sessions, upcomingSessions, myCases, myRequests } = useStudentDashboardData();
  
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      profile.refetch(),
      sessions.refetch(),
      upcomingSessions.refetch(),
      myCases.refetch(),
      myRequests.refetch()
    ]);
    setRefreshing(false);
  };

  const firstName = (profile.data as any)?.data?.fullName?.split(" ")[0] || user?.fullName?.split(" ")[0] || (isRtl ? "طبيب" : "Doctor");

  return (
    <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <StatusBar barStyle="light-content" />

      {/* Fixed Header Background */}
      <View className="absolute top-0 left-0 right-0 h-[280px]">
        <LinearGradient
          colors={isDark ? ['#1e1b4b', '#0f172a'] : ['#3b82f6', '#4f46e5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-full h-full rounded-b-[48px] shadow-2xl shadow-indigo-500/20"
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? "#818cf8" : "#4f46e5"}
          />
        }
      >
        <Animated.View 
          entering={FadeInUp.duration(600)} 
          style={{ paddingTop: insets.top + 20 }}
          className="px-5 pb-8"
        >
          <View className={`flex-row justify-between items-end mb-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <View className={isRtl ? 'items-end' : 'items-start'}>
              <Text className="text-white/70 font-bold text-xs uppercase tracking-[3px] mb-1">
                {isRtl ? 'لوحة التحكم' : 'Dashboard'}
              </Text>
              <Text className={`text-2xl sm:text-3xl font-black text-white`}>
                {isRtl ? `أهلاً ${firstName}! 👋` : `Hello, ${firstName}! 👋`}
              </Text>
            </View>
          </View>
        </Animated.View>

        <View className="px-5 pb-8 gap-y-4">
          {/* Row 1: Stats Cards */}
          <View>
            <StatsCards />
          </View>

          {/* Row 2: Components */}
          <MyCurrentCases />
          <MyRequests />
          <AcademicProgress />
          <RequestsAnalytics />
          <CalendarWidget />
        </View>
      </ScrollView>
    </View>
  );
}

import React, { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { Bell, Search, Settings } from "lucide-react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';

import { RootState } from "@/store/store";
import { useThemeLanguage } from "@/store/ThemeLanguageContext";
import { usePatientDashboard } from "@/features/patient/hooks/usePatientDashboard";

import DashboardCharts from "@/features/dashboard/components/patient/DashboardCharts";
import UpcomingAppointmentsList from "@/features/dashboard/components/patient/UpcomingAppointmentsList";
import RecentCasesList from "@/features/dashboard/components/patient/RecentCasesList";
import PatientCalendarWidget from "@/features/dashboard/components/patient/PatientCalendarWidget";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useTranslation } from "react-i18next";

function getGreeting(t: any) {
  const h = new Date().getHours();
  if (h < 12) return t("good_morning");
  if (h < 18) return t("good_afternoon");
  return t("good_evening");
}

export default function PatientDashboardScreen() {
  const user = useSelector((state: RootState) => state.auth.user);
  const patientId = user?.publicId;
  const firstName = user?.fullName?.split(" ")[0] || "Patient";
  const { theme, language } = useThemeLanguage();
  const isDark = theme === "dark";
  const isRtl = language === "ar";
  const { t } = useTranslation();
  const router = useRouter();

  const { dashboardData, isLoading, isError, refetchAll, sessions } = usePatientDashboard(patientId || "");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchAll();
    setRefreshing(false);
  };

  if (!patientId || (isLoading && !dashboardData)) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 dark:bg-slate-950">
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text className="mt-4 text-slate-500 font-bold">{t("sync_data")}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <StatusBar barStyle="light-content" />
      
      {/* Fixed Header Background */}
      <View className="absolute top-0 left-0 right-0 h-[300px]">
        <LinearGradient
          colors={isDark ? ['#1e1b4b', '#0f172a'] : ['#3b82f6', '#4f46e5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-full h-full rounded-b-[48px] shadow-2xl shadow-indigo-500/20"
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? "#818cf8" : "#4f46e5"}
          />
        }
      >
        {/* Header Content - Scrolls with data */}
        <Animated.View entering={FadeInUp.duration(600)} className="px-6 pt-16 pb-10">
          <View className={`flex-row justify-between items-center ${isRtl ? 'flex-row-reverse' : ''}`}>
            <View className={isRtl ? 'items-end' : 'items-start'}>
              <Text className="text-white/70 font-bold text-xs uppercase tracking-[3px] mb-1">
                {getGreeting(t)}
              </Text>
              <Text className="text-white text-3xl font-black" numberOfLines={1}>
                {firstName} 👋
              </Text>
            </View>

            <View className={`flex-row items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl ${isRtl ? 'flex-row-reverse' : ''}`}>
              <Text className="text-white text-xs font-bold uppercase tracking-wider">
                {new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { weekday: "long", day: "numeric", month: "long" })}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Content Section */}
        <View className="px-6 pb-12">
          {isError && !isLoading && (
            <View className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-3xl p-5 mb-6 shadow-sm">
              <Text className="text-rose-600 dark:text-rose-400 text-sm font-bold text-center">
                {t("pull_to_refresh_error")}
              </Text>
            </View>
          )}

          {dashboardData && (
            <>
              {/* Analytics Charts */}
              <DashboardCharts charts={dashboardData.charts} />

              {/* Progress Card (Matching Web Progress) */}
              <Animated.View 
                entering={FadeInDown.delay(300).duration(500)}
                className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm mb-6"
              >
                <View className={`flex-row justify-between items-center mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <Text className="text-lg font-black text-slate-800 dark:text-white">{t("session_progress")}</Text>
                  <Text className="text-sm font-black text-indigo-600 dark:text-indigo-400">{dashboardData.progress.progressPercentage}%</Text>
                </View>
                <View className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <Animated.View 
                    className={`h-full bg-indigo-500 rounded-full ${isRtl ? 'self-end' : ''}`} 
                    style={{ width: `${dashboardData.progress.progressPercentage}%` }}
                  />
                </View>
                <Text className={`text-xs font-bold text-slate-400 mt-3 ${isRtl ? 'text-right' : ''}`}>
                  {t("sessions_completed_label", { completed: dashboardData.progress.completedSessions, total: dashboardData.progress.totalSessions })}
                </Text>
              </Animated.View>

              {/* Schedule Calendar */}
              <Animated.View entering={FadeInDown.delay(400).duration(500)}>
                <PatientCalendarWidget sessions={sessions} />
              </Animated.View>

              {/* Upcoming Appointments */}
              <Animated.View entering={FadeInDown.delay(500).duration(500)}>
                <UpcomingAppointmentsList sessions={dashboardData.upcomingSessions} />
              </Animated.View>

              {/* Activity Timeline */}
              <Animated.View entering={FadeInDown.delay(600).duration(500)}>
                <RecentCasesList activities={dashboardData.recentActivity} />
              </Animated.View>
            </>
          )}
        </View>

      </ScrollView>
    </View>
  );
}
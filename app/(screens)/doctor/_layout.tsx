import React from "react";
import { LayoutGrid, Clock, Users, User, Settings as SettingsIcon } from "lucide-react-native";
import { Tabs } from "expo-router";
import { CustomTabBar } from "@/components/ui/CustomTabBar";
import { useTranslation } from "react-i18next";

export default function DoctorTabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: t("dashboard"),
          tabBarIcon: ({ color, size }) => <LayoutGrid size={size} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="pending-cases" 
        options={{ 
          title: t("pending"),
          tabBarIcon: ({ color, size }) => <Clock size={size} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="student-list" 
        options={{ 
          title: t("students"),
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: t("profile"),
          tabBarIcon: ({ color, size }) => <User size={size} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="settings" 
        options={{ 
          title: t("settings"),
          tabBarIcon: ({ color, size }) => <SettingsIcon size={size} color={color} /> 
        }} 
      />
      <Tabs.Screen
        name="my-student/[id]"
        options={{ 
          // @ts-ignore
          href: null 
        }}
      />
      <Tabs.Screen
        name="cases"
        options={{ 
          // @ts-ignore
          href: null 
        }}
      />
    </Tabs>
  );
}
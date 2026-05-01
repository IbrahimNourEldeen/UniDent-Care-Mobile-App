import React from "react";
import { Home, PlusCircle, Briefcase, User, Settings as SettingsIcon } from "lucide-react-native";
import { Tabs } from "expo-router";
import { CustomTabBar } from "@/components/ui/CustomTabBar";
import { useTranslation } from "react-i18next";

export default function PatientTabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: t("home"),
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="add-case" 
        options={{ 
          title: t("add_case"),
          tabBarIcon: ({ color, size }) => <PlusCircle size={size} color={color} />,
          tabBarStyle: { display: 'none' }
        }} 
      />
      <Tabs.Screen 
        name="my_cases" 
        options={{ 
          title: t("my_cases"),
          tabBarIcon: ({ color, size }) => <Briefcase size={size} color={color} /> 
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
    </Tabs>
  );
}

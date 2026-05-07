import React from "react";
import { LayoutGrid, Clock, Users, User, Settings as SettingsIcon } from "lucide-react-native";
import { Tabs } from "expo-router";
import { CustomTabBar } from "@/components/ui/CustomTabBar";
import { SwipeableTabsContainer } from "@/components/ui/SwipeableTabsContainer";
import { useTranslation } from "react-i18next";

export default function DoctorTabsLayout() {
  const { t } = useTranslation();

  // Define tab paths for swipe navigation
  const tabPaths = [
    { name: "index", path: "/(screens)/doctor" },
    { name: "pending-request", path: "/(screens)/doctor/pending-request" },
    { name: "my-students-cases", path: "/(screens)/doctor/my-students-cases" },
    { name: "profile", path: "/(screens)/doctor/profile" },
    { name: "settings", path: "/(screens)/doctor/settings" },
  ];

  return (
    <SwipeableTabsContainer tabs={tabPaths}>
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
          name="pending-request" 
          options={{ 
            title: t("case_requests"),
            tabBarIcon: ({ color, size }) => <Clock size={size} color={color} /> 
          }} 
        />
        <Tabs.Screen 
          name="my-students-cases" 
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
      </Tabs>
    </SwipeableTabsContainer>
  );
}

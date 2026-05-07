import React from "react";
import { Home, PlusCircle, Briefcase, User, Settings as SettingsIcon } from "lucide-react-native";
import { Tabs } from "expo-router";
import { CustomTabBar } from "@/components/ui/CustomTabBar";
import { SwipeableTabsContainer } from "@/components/ui/SwipeableTabsContainer";
import { useTranslation } from "react-i18next";

export default function PatientTabsLayout() {
  const { t } = useTranslation();

  // Define tab paths for swipe navigation
  const tabPaths = [
    { name: "index", path: "/(screens)/patient" },
    { name: "add-case", path: "/(screens)/patient/add-case" },
    { name: "my_cases", path: "/(screens)/patient/my_cases" },
    { name: "profile", path: "/(screens)/patient/profile" },
    { name: "settings", path: "/(screens)/patient/settings" },
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
        <Tabs.Screen 
          name="ai-chatbot" 
          options={{ 
            href: null,
            tabBarStyle: { display: 'none' }
          }} 
        />
      </Tabs>
    </SwipeableTabsContainer>
  );
}

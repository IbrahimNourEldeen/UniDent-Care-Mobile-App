import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useThemeLanguage } from "../../../store/ThemeLanguageContext";

export default function DoctorTabsLayout() {
  const { theme } = useThemeLanguage();
  const isDark = theme === "dark";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: isDark ? "#ffffff" : "#2563eb", 
        tabBarInactiveTintColor: isDark ? "#475569" : "#8e8e8e",
        tabBarStyle: {
          backgroundColor: isDark ? "#0f172a" : "#ffffff",
          height: Platform.OS === "ios" ? 88 : 65,
          borderTopWidth: 0.5,
          borderTopColor: isDark ? "#1e293b" : "#dbdbdb",
          paddingBottom: Platform.OS === "ios" ? 30 : 10,
          paddingTop: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "grid" : "grid-outline"} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="pending-cases"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "time" : "time-outline"} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="student-list"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "settings" : "settings-outline"} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="my-student/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
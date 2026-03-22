import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useThemeLanguage } from "../../../store/ThemeLanguageContext";

export default function TabsLayout() {
  const { theme } = useThemeLanguage();
  const isDark = theme === "dark";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: isDark ? "#ffffff" : "#000000",
        tabBarInactiveTintColor: isDark ? "#475569" : "#8e8e8e",
        tabBarStyle: {
          backgroundColor: isDark ? "#0f172a" : "#ffffff",
          height: Platform.OS === "ios" ? 88 : 65,
          borderTopWidth: 0.5,
          borderTopColor: isDark ? "#1e293b" : "#dbdbdb",
          elevation: 0,
          shadowOpacity: 0,
          paddingBottom: Platform.OS === "ios" ? 30 : 10,
          paddingTop: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="cases-list"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "search" : "search-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="my-cases"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "copy" : "copy-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

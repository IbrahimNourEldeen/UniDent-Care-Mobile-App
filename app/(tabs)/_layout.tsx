import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, View } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true, 
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#94a3b8", 
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#f1f5f9",
          height: Platform.OS === "ios" ? 88 : 65,
          paddingBottom: Platform.OS === "ios" ? 30 : 10,
          paddingTop: 10,
          elevation: 0, 
          shadowOpacity: 0, 
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="add-case"
        options={{
          title: "Add Case",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                backgroundColor: focused ? "#2563eb" : "#f1f5f9",
                width: 45,
                height: 45,
                borderRadius: 15,
                alignItems: "center",
                justifyContent: "center",
                marginTop: -5, // حركة بسيطة عشان يبرز لفوق
              }}
            >
              <Ionicons
                name="add"
                size={30}
                color={focused ? "white" : "#64748b"}
              />
            </View>
          ),
          // لو عاوز تخفي الاسم تحت زرار الإضافة عشان يبقى شكله "Action Button"
          tabBarLabel: () => null,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
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

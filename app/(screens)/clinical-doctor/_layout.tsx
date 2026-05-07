import React from "react";
import { LayoutGrid, FolderOpen, User, Settings as SettingsIcon, PlusCircle } from "lucide-react-native";
import { Tabs } from "expo-router";
import { CustomTabBar } from "@/components/ui/CustomTabBar";
import { useTranslation } from "react-i18next";

export default function ClinicalDoctorTabsLayout() {
    const { t } = useTranslation();

    return (
        <Tabs
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: t("cases"),
                    tabBarIcon: ({ color, size }) => <FolderOpen size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="add-case"
                options={{
                    title: t("add_case", "Add Case"),
                    tabBarIcon: ({ color, size }) => <PlusCircle size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: t("settings"),
                    tabBarIcon: ({ color, size }) => <SettingsIcon size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}

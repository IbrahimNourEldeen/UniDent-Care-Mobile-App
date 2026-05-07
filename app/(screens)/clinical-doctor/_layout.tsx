import React from "react";
import { LayoutGrid, FolderOpen, User, Settings as SettingsIcon, PlusCircle } from "lucide-react-native";
import { Tabs } from "expo-router";
import { CustomTabBar } from "@/components/ui/CustomTabBar";
import { SwipeableTabsContainer } from "@/components/ui/SwipeableTabsContainer";
import { useTranslation } from "react-i18next";

export default function ClinicalDoctorTabsLayout() {
    const { t } = useTranslation();

    // Define tab paths for swipe navigation
    const tabPaths = [
        { name: "index", path: "/(screens)/clinical-doctor" },
        { name: "add-case", path: "/(screens)/clinical-doctor/add-case" },
        { name: "settings", path: "/(screens)/clinical-doctor/settings" },
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
        </SwipeableTabsContainer>
    );
}

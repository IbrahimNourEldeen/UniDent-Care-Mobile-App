import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { Tabs } from "expo-router";
import { CustomTabBar } from "./CustomTabBar";
import { SwipeableTabLayout } from "./SwipeableTabLayout";
import { usePathname } from "expo-router";

interface TabConfig {
  name: string;
  title: string;
  icon: any;
  component: React.ComponentType<any>;
}

interface SwipeableTabsWrapperProps {
  tabs: TabConfig[];
  screenOptions?: any;
}

export function SwipeableTabsWrapper({ tabs, screenOptions }: SwipeableTabsWrapperProps) {
  const pathname = usePathname();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Update current index based on pathname
  useEffect(() => {
    const index = tabs.findIndex(tab => pathname.includes(tab.name));
    if (index >= 0) {
      setCurrentIndex(index);
    }
  }, [pathname, tabs]);

  return (
    <Tabs
      tabBar={(props) => (
        <CustomTabBar 
          {...props} 
          onTabPress={(index) => {
            setCurrentIndex(index);
            const route = props.state.routes[index];
            props.navigation.navigate(route.name, route.params);
          }}
        />
      )}
      screenOptions={screenOptions}
    >
      {tabs.map((tab, index) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: tab.icon,
          }}
        />
      ))}
    </Tabs>
  );
}

import React, { useRef, useEffect, useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import PagerView from "react-native-pager-view";
import { usePathname, useRouter } from "expo-router";
import { CustomTabBar } from "../ui/CustomTabBar";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

interface TabRoute {
  name: string;
  path: string;
  component: React.ComponentType<any>;
}

interface CustomSwipeableTabNavigatorProps {
  tabs: TabRoute[];
  tabBarProps: BottomTabBarProps;
  basePath: string;
}

export function CustomSwipeableTabNavigator({
  tabs,
  tabBarProps,
  basePath,
}: CustomSwipeableTabNavigatorProps) {
  const pathname = usePathname();
  const router = useRouter();
  const pagerRef = useRef<PagerView>(null);
  const [isUserSwiping, setIsUserSwiping] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // Calculate current index based on pathname
  const getCurrentIndex = () => {
    for (let i = 0; i < tabs.length; i++) {
      if (pathname === tabs[i].path || pathname.startsWith(tabs[i].path + "/")) {
        return i;
      }
    }
    return 0;
  };

  const currentIndex = getCurrentIndex();

  // Sync pager with navigation changes (from tab bar clicks or external navigation)
  useEffect(() => {
    if (pagerRef.current && !isUserSwiping && currentIndex !== currentPage) {
      pagerRef.current.setPage(currentIndex);
      setCurrentPage(currentIndex);
    }
  }, [currentIndex, isUserSwiping, currentPage]);

  const handlePageSelected = (e: any) => {
    const newIndex = e.nativeEvent.position;
    setIsUserSwiping(false);
    setCurrentPage(newIndex);

    if (newIndex !== currentIndex && tabs[newIndex]) {
      router.push(tabs[newIndex].path);
    }
  };

  const handlePageScrollStateChanged = (e: any) => {
    const state = e.nativeEvent.pageScrollState;
    if (state === "dragging") {
      setIsUserSwiping(true);
    } else if (state === "idle") {
      setIsUserSwiping(false);
    }
  };

  const handleTabPress = (index: number) => {
    if (pagerRef.current) {
      pagerRef.current.setPage(index);
    }
    if (tabs[index]) {
      router.push(tabs[index].path);
    }
  };

  return (
    <View style={styles.container}>
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={currentIndex}
        onPageSelected={handlePageSelected}
        onPageScrollStateChanged={handlePageScrollStateChanged}
        overdrag={Platform.OS === "android"}
        scrollEnabled={true}
      >
        {tabs.map((tab, index) => {
          const Component = tab.component;
          return (
            <View key={tab.name} style={styles.page} collapsable={false}>
              <Component />
            </View>
          );
        })}
      </PagerView>

      <CustomTabBar {...tabBarProps} onTabPress={handleTabPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
});

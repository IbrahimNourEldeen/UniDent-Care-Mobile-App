import React, { useRef, useEffect, useState, useCallback } from "react";
import { View, StyleSheet, Platform } from "react-native";
import PagerView from "react-native-pager-view";
import { usePathname, useRouter } from "expo-router";

interface TabConfig {
  name: string;
  path: string;
}

interface TabsWithSwipeProps {
  tabs: TabConfig[];
  children: React.ReactNode;
}

export function TabsWithSwipe({ tabs, children }: TabsWithSwipeProps) {
  const pathname = usePathname();
  const router = useRouter();
  const pagerRef = useRef<PagerView>(null);
  const [isUserSwiping, setIsUserSwiping] = useState(false);

  // Get current tab index
  const getCurrentIndex = useCallback(() => {
    const index = tabs.findIndex((tab) => {
      // Check if current path matches this tab
      if (pathname === tab.path) return true;
      // Check if current path starts with this tab path (for nested routes)
      if (tab.name !== "index" && pathname.startsWith(tab.path + "/")) return true;
      // Handle index route
      if (tab.name === "index" && (pathname === tab.path || pathname.endsWith("/student") || pathname.endsWith("/doctor") || pathname.endsWith("/patient"))) return true;
      return false;
    });
    return index >= 0 ? index : 0;
  }, [pathname, tabs]);

  const currentIndex = getCurrentIndex();

  // Sync pager with navigation
  useEffect(() => {
    if (pagerRef.current && !isUserSwiping) {
      pagerRef.current.setPage(currentIndex);
    }
  }, [currentIndex, isUserSwiping]);

  const handlePageSelected = (e: any) => {
    const newIndex = e.nativeEvent.position;
    setIsUserSwiping(false);

    if (newIndex !== currentIndex && tabs[newIndex]) {
      router.push(tabs[newIndex].path as any);
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
        {tabs.map((tab) => (
          <View key={tab.name} style={styles.page} collapsable={false}>
            {children}
          </View>
        ))}
      </PagerView>
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

import React, { useRef, useEffect, useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import PagerView from "react-native-pager-view";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { CustomTabBar } from "./CustomTabBar";

interface SwipeableTabsProps extends BottomTabBarProps {
  children: React.ReactNode;
}

export function SwipeableTabs({ 
  state, 
  descriptors, 
  navigation, 
  children 
}: SwipeableTabsProps) {
  const pagerRef = useRef<PagerView>(null);
  const [isUserSwiping, setIsUserSwiping] = useState(false);

  // Sync pager with navigation state (only when not swiping)
  useEffect(() => {
    if (pagerRef.current && !isUserSwiping) {
      pagerRef.current.setPage(state.index);
    }
  }, [state.index, isUserSwiping]);

  const handlePageSelected = (e: any) => {
    const newIndex = e.nativeEvent.position;
    setIsUserSwiping(false);
    
    // Only navigate if it's a different tab
    if (newIndex !== state.index) {
      const route = state.routes[newIndex];
      navigation.navigate(route.name, route.params);
    }
  };

  const handlePageScrollStateChanged = (e: any) => {
    const scrollState = e.nativeEvent.pageScrollState;
    // Track when user is actively swiping
    if (scrollState === 'dragging') {
      setIsUserSwiping(true);
    } else if (scrollState === 'idle') {
      setIsUserSwiping(false);
    }
  };

  const handleTabPress = (index: number) => {
    if (pagerRef.current) {
      pagerRef.current.setPage(index);
    }
  };

  // Filter out routes that should not be displayed as tabs
  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    // @ts-ignore
    return options.href !== null && options.tabBarIcon;
  });

  return (
    <View style={styles.container}>
      {/* PagerView for swipeable content - takes full screen */}
      <View style={styles.pagerContainer}>
        <PagerView
          ref={pagerRef}
          style={styles.pager}
          initialPage={state.index}
          onPageSelected={handlePageSelected}
          onPageScrollStateChanged={handlePageScrollStateChanged}
          overdrag={Platform.OS === "android"}
          scrollEnabled={true}
        >
          {visibleRoutes.map((route) => {
            return (
              <View key={route.key} style={styles.page} collapsable={false}>
                {/* Render the screen content */}
                {React.Children.toArray(children).find((child: any) => {
                  return child?.props?.route?.key === route.key;
                })}
              </View>
            );
          })}
        </PagerView>
      </View>

      {/* Custom Tab Bar - Fixed at the bottom, outside PagerView */}
      <View style={styles.tabBarContainer} pointerEvents="box-none">
        <CustomTabBar 
          state={state} 
          descriptors={descriptors} 
          navigation={navigation}
          onTabPress={handleTabPress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pagerContainer: {
    flex: 1,
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // Allow touches to pass through to the tab bar
    pointerEvents: 'box-none',
  },
});

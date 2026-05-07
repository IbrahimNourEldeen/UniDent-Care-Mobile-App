import React, { useRef, useEffect, useState, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import PagerView from "react-native-pager-view";
import { usePathname, useRouter, useSegments } from "expo-router";

interface SwipeableTabNavigatorProps {
  children: React.ReactNode;
  tabScreens: string[]; // Array of tab screen names in order
}

export function SwipeableTabNavigator({ children, tabScreens }: SwipeableTabNavigatorProps) {
  const pathname = usePathname();
  const router = useRouter();
  const segments = useSegments();
  const pagerRef = useRef<PagerView>(null);
  const [isUserSwiping, setIsUserSwiping] = useState(false);

  // Get current tab index based on pathname
  const currentIndex = useMemo(() => {
    const lastSegment = segments[segments.length - 1];
    
    // Handle index route
    if (!lastSegment || lastSegment === 'student' || lastSegment === 'doctor' || lastSegment === 'patient') {
      return 0;
    }

    const index = tabScreens.findIndex(screen => {
      // Remove file extensions and compare
      const screenName = screen.replace(/\.(tsx|ts|jsx|js)$/, '');
      return lastSegment === screenName || lastSegment === 'index' && screenName === 'index';
    });

    return index >= 0 ? index : 0;
  }, [pathname, segments, tabScreens]);

  // Sync pager with navigation changes (from tab bar clicks)
  useEffect(() => {
    if (pagerRef.current && !isUserSwiping) {
      pagerRef.current.setPage(currentIndex);
    }
  }, [currentIndex, isUserSwiping]);

  const handlePageSelected = (e: any) => {
    const newIndex = e.nativeEvent.position;
    setIsUserSwiping(false);

    if (newIndex !== currentIndex && tabScreens[newIndex]) {
      const screenName = tabScreens[newIndex].replace(/\.(tsx|ts|jsx|js)$/, '');
      
      // Build the new path
      const baseSegments = segments.slice(0, -1);
      const newPath = [...baseSegments, screenName === 'index' ? '' : screenName]
        .filter(Boolean)
        .join('/');
      
      router.push(`/${newPath}`);
    }
  };

  const handlePageScrollStateChanged = (e: any) => {
    const state = e.nativeEvent.pageScrollState;
    if (state === 'dragging') {
      setIsUserSwiping(true);
    } else if (state === 'idle') {
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
        overdrag={true}
        scrollEnabled={true}
      >
        {React.Children.map(children, (child, index) => (
          <View key={index} style={styles.page} collapsable={false}>
            {child}
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

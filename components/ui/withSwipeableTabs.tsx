import React, { useRef, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import PagerView from "react-native-pager-view";
import { usePathname, useRouter } from "expo-router";

interface WithSwipeableTabsProps {
  children: React.ReactNode;
  routes: string[];
  basePath: string;
}

export function withSwipeableTabs(Component: React.ComponentType<any>) {
  return function SwipeableTabsComponent(props: any) {
    const pathname = usePathname();
    const router = useRouter();
    const pagerRef = useRef<PagerView>(null);
    const [isUserSwiping, setIsUserSwiping] = useState(false);

    // Get visible routes from props
    const routes = props.routes || [];
    const basePath = props.basePath || "";

    // Calculate current index based on pathname
    const getCurrentIndex = () => {
      const index = routes.findIndex((route: string) => {
        const fullPath = `${basePath}/${route}`;
        return pathname === fullPath || pathname.startsWith(fullPath);
      });
      return index >= 0 ? index : 0;
    };

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

      if (newIndex !== currentIndex && routes[newIndex]) {
        const newPath = `${basePath}/${routes[newIndex]}`;
        router.push(newPath);
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
          {routes.map((route: string, index: number) => (
            <View key={route} style={styles.page}>
              <Component {...props} currentRoute={route} />
            </View>
          ))}
        </PagerView>
      </View>
    );
  };
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

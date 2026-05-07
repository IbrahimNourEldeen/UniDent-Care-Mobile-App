import React, { useRef, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import PagerView from "react-native-pager-view";

interface SwipeableTabLayoutProps {
  currentIndex: number;
  onPageChange: (index: number) => void;
  children: React.ReactNode;
}

export function SwipeableTabLayout({ 
  currentIndex, 
  onPageChange, 
  children 
}: SwipeableTabLayoutProps) {
  const pagerRef = useRef<PagerView>(null);
  const [isUserSwiping, setIsUserSwiping] = useState(false);

  // Sync pager with external navigation (tab bar clicks)
  useEffect(() => {
    if (pagerRef.current && !isUserSwiping) {
      pagerRef.current.setPage(currentIndex);
    }
  }, [currentIndex, isUserSwiping]);

  const handlePageSelected = (e: any) => {
    const newIndex = e.nativeEvent.position;
    setIsUserSwiping(false);
    
    // Notify parent of page change
    if (newIndex !== currentIndex) {
      onPageChange(newIndex);
    }
  };

  const handlePageScrollStateChanged = (e: any) => {
    const state = e.nativeEvent.pageScrollState;
    // Track when user is actively swiping
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
          <View key={index} style={styles.page}>
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

import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  withTiming,
} from "react-native-reanimated";
import { useRouter, usePathname } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.15; // تقليل الحد الأدنى للسحب
const SWIPE_VELOCITY_THRESHOLD = 500; // سرعة السحب

interface SwipeableTabsContainerProps {
  children: React.ReactNode;
  tabs: Array<{ name: string; path: string }>;
}

export function SwipeableTabsContainer({ children, tabs }: SwipeableTabsContainerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const translateX = useSharedValue(0);
  const isNavigating = useSharedValue(false);

  // Get current tab index
  const getCurrentIndex = () => {
    const index = tabs.findIndex((tab) => pathname.includes(tab.path));
    return index >= 0 ? index : 0;
  };

  const currentIndex = getCurrentIndex();

  const navigateToTab = (direction: "left" | "right") => {
    const newIndex = direction === "left" ? currentIndex + 1 : currentIndex - 1;
    
    if (newIndex >= 0 && newIndex < tabs.length) {
      router.push(tabs[newIndex].path as any);
    }
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10]) // تفعيل السحب بعد 10 بكسل
    .failOffsetY([-10, 10]) // إلغاء السحب إذا كان عمودي
    .onStart(() => {
      isNavigating.value = false;
    })
    .onUpdate((event) => {
      // السماح بالسحب الأفقي فقط
      if (!isNavigating.value) {
        // تحديد الاتجاه
        const canSwipeLeft = currentIndex < tabs.length - 1;
        const canSwipeRight = currentIndex > 0;
        
        // تطبيق الحركة مع القيود
        if (event.translationX < 0 && canSwipeLeft) {
          // السحب لليسار
          translateX.value = event.translationX;
        } else if (event.translationX > 0 && canSwipeRight) {
          // السحب لليمين
          translateX.value = event.translationX;
        } else {
          // مقاومة خفيفة في الحواف
          translateX.value = event.translationX * 0.3;
        }
      }
    })
    .onEnd((event) => {
      const distance = Math.abs(event.translationX);
      const velocity = Math.abs(event.velocityX);
      
      // تحديد إذا كان يجب التنقل
      const shouldSwipe = distance > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD;
      
      if (shouldSwipe && !isNavigating.value) {
        isNavigating.value = true;
        
        if (event.translationX > 0 && currentIndex > 0) {
          // السحب لليمين - الرجوع للتاب السابق
          translateX.value = withTiming(SCREEN_WIDTH, { duration: 200 }, () => {
            runOnJS(navigateToTab)("right");
          });
        } else if (event.translationX < 0 && currentIndex < tabs.length - 1) {
          // السحب لليسار - الانتقال للتاب التالي
          translateX.value = withTiming(-SCREEN_WIDTH, { duration: 200 }, () => {
            runOnJS(navigateToTab)("left");
          });
        } else {
          // إعادة للوضع الطبيعي
          translateX.value = withSpring(0, {
            damping: 20,
            stiffness: 200,
          });
        }
      } else {
        // إعادة للوضع الطبيعي
        translateX.value = withSpring(0, {
          damping: 20,
          stiffness: 200,
        });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value * 0.5 }], // حركة أكثر وضوحاً
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

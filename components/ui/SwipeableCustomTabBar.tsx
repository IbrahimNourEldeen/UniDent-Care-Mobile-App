import React, { useState, useEffect, useRef } from "react";
import { Platform, View, TouchableOpacity, Text, Keyboard } from "react-native";
import { BlurView } from "expo-blur";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useThemeLanguage } from "../../store/ThemeLanguageContext";
import PagerView from "react-native-pager-view";
import { useRouter, usePathname } from "expo-router";

export function SwipeableCustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { theme, language } = useThemeLanguage();
  const isDark = theme === "dark";
  const isRtl = language === "ar";
  const router = useRouter();
  const pathname = usePathname();
  const pagerRef = useRef<PagerView>(null);
  const [isUserSwiping, setIsUserSwiping] = useState(false);

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  // Sync pager with navigation
  useEffect(() => {
    if (pagerRef.current && !isUserSwiping) {
      pagerRef.current.setPage(state.index);
    }
  }, [state.index, isUserSwiping]);

  const focusedRoute = state.routes[state.index];
  const focusedOptions = descriptors[focusedRoute.key].options;

  if ((focusedOptions.tabBarStyle as any)?.display === 'none' || isKeyboardVisible) {
    return null;
  }

  const handlePageSelected = (e: any) => {
    const newIndex = e.nativeEvent.position;
    setIsUserSwiping(false);

    if (newIndex !== state.index) {
      const route = state.routes[newIndex];
      navigation.navigate(route.name, route.params);
    }
  };

  const handlePageScrollStateChanged = (e: any) => {
    const scrollState = e.nativeEvent.pageScrollState;
    if (scrollState === "dragging") {
      setIsUserSwiping(true);
    } else if (scrollState === "idle") {
      setIsUserSwiping(false);
    }
  };

  return (
    <>
      {/* Swipeable Pager Overlay */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="box-none">
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={state.index}
          onPageSelected={handlePageSelected}
          onPageScrollStateChanged={handlePageScrollStateChanged}
          overdrag={Platform.OS === "android"}
          scrollEnabled={true}
        >
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            // @ts-ignore
            if (options.href === null || !options.tabBarIcon) return null;

            return (
              <View key={route.key} style={{ flex: 1 }} collapsable={false} />
            );
          })}
        </PagerView>
      </View>

      {/* Tab Bar */}
      <View style={{
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 24 : 16,
        left: 16,
        right: 16,
        borderRadius: 32,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: isDark ? "#000" : "#475569",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      }}>
        <BlurView 
          intensity={isDark ? 40 : 60} 
          tint={isDark ? "dark" : "light"} 
          style={{
            flexDirection: isRtl ? 'row-reverse' : 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 8,
            paddingVertical: 10,
            backgroundColor: isDark ? "rgba(15, 23, 42, 0.75)" : "rgba(255, 255, 255, 0.85)",
          }}
        >
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            
            // @ts-ignore
            if (options.href === null || !options.tabBarIcon) return null;

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const color = isFocused ? (isDark ? "#818cf8" : "#4f46e5") : (isDark ? "#64748b" : "#94a3b8");
            
            const label = 
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            return (
              <TouchableOpacity 
                key={index} 
                onPress={onPress} 
                activeOpacity={0.8}
                style={{ flex: isFocused ? 2.5 : 1, alignItems: 'center' }}
              >
                <Animated.View 
                  layout={LinearTransition.springify().damping(16).stiffness(150)}
                  style={{
                    height: 48,
                    borderRadius: 24,
                    flexDirection: isRtl ? 'row-reverse' : 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: isFocused ? 14 : 0,
                    backgroundColor: isFocused ? (isDark ? "rgba(99, 102, 241, 0.25)" : "#eef2ff") : "transparent",
                  }}
                >
                  {options.tabBarIcon({ focused: isFocused, color, size: 20 })}
                  
                  {isFocused && (
                    <Animated.Text 
                      entering={FadeIn.delay(100).duration(200)}
                      exiting={FadeOut.duration(100)}
                      numberOfLines={1}
                      style={{ 
                        marginLeft: isRtl ? 0 : 8, 
                        marginRight: isRtl ? 8 : 0,
                        fontSize: 12, 
                        fontWeight: 'bold', 
                        color: isDark ? "#818cf8" : "#4f46e5" 
                      }}>
                      {typeof label === 'string' ? label : route.name}
                    </Animated.Text>
                  )}
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </BlurView>
      </View>
    </>
  );
}

import React, { useState, useEffect } from "react";
import { Platform, View, TouchableOpacity, Text, Keyboard } from "react-native";
import { BlurView } from "expo-blur";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useThemeLanguage } from "../../store/ThemeLanguageContext";

interface CustomTabBarProps {
  state: BottomTabBarProps['state'];
  descriptors: BottomTabBarProps['descriptors'];
  navigation: BottomTabBarProps['navigation'];
  onTabPress?: (index: number) => void;
}

export function CustomTabBar({ state, descriptors, navigation, onTabPress }: CustomTabBarProps) {
  const { theme, language } = useThemeLanguage();
  const isDark = theme === "dark";
  const isRtl = language === "ar";

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

  const focusedRoute = state.routes[state.index];
  const focusedOptions = descriptors[focusedRoute.key].options;

  if ((focusedOptions.tabBarStyle as any)?.display === 'none' || isKeyboardVisible) {
    return null;
  }

  // Whitelist of allowed routes to prevent extra tabs
  // If the layout has explicit screens, it should only show those.
  // However, since we want to be generic, we can just use href check.

  return (
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
          if (options.href === null) return null;
          
          // Fallback check: if it's not a common tab name and doesn't have a tabBarIcon, skip it
          if (!options.tabBarIcon) return null;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              // If onTabPress callback is provided, use it (for swipeable tabs)
              if (onTabPress) {
                onTabPress(index);
              } else {
                navigation.navigate(route.name, route.params);
              }
            }
          };

          const color = isFocused ? (isDark ? "#818cf8" : "#4f46e5") : (isDark ? "#64748b" : "#94a3b8");
          
          // Get label from options
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
  );
}

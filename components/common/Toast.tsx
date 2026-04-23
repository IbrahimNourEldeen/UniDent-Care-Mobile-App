import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring, 
    withTiming, 
    runOnJS 
} from 'react-native-reanimated';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { hideToast } from '@/store/slices/uiSlice';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Toast = () => {
    const dispatch = useAppDispatch();
    const insets = useSafeAreaInsets();
    const { visible, message, type } = useAppSelector((state) => state.ui.toast);
    
    const translateY = useSharedValue(-100);
    const opacity = useSharedValue(0);

    const closeToast = () => {
        dispatch(hideToast());
    };

    useEffect(() => {
        if (visible) {
            opacity.value = withTiming(1, { duration: 300 });
            translateY.value = withSpring(insets.top + 10, { damping: 15 });
            
            const timer = setTimeout(() => {
                hide();
            }, 4000);
            
            return () => clearTimeout(timer);
        } else {
            hide();
        }
    }, [visible, insets.top]);

    const hide = () => {
        opacity.value = withTiming(0, { duration: 300 });
        translateY.value = withTiming(-100, { duration: 300 }, () => {
            runOnJS(closeToast)();
        });
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
            opacity: opacity.value,
        };
    });

    if (!visible && opacity.value === 0) return null;

    const getColors = () => {
        switch (type) {
            case 'success': return { bg: '#ecfdf5', border: '#10b981', text: '#065f46', icon: '#10b981' };
            case 'error': return { bg: '#fef2f2', border: '#ef4444', text: '#991b1b', icon: '#ef4444' };
            case 'info':
            default: return { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af', icon: '#3b82f6' };
        }
    };

    const colors = getColors();
    const Icon = type === 'success' ? CheckCircle2 : type === 'error' ? AlertCircle : Info;

    return (
        <Animated.View 
            style={[styles.container, animatedStyle, { backgroundColor: colors.bg, borderColor: colors.border }]}
            className="shadow-lg shadow-black/10"
        >
            <View className="flex-row items-center px-4 py-3">
                <Icon size={20} color={colors.icon} />
                <Text 
                    className="flex-1 ml-3 mr-2 text-sm font-semibold" 
                    style={{ color: colors.text }}
                >
                    {message}
                </Text>
                <Pressable onPress={hide} className="p-1">
                    <X size={16} color={colors.text} opacity={0.5} />
                </Pressable>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 20,
        right: 20,
        zIndex: 9999,
        borderWidth: 1,
        borderRadius: 16,
    },
});

export default Toast;

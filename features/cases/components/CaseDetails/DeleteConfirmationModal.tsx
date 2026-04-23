import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { Trash2, AlertTriangle, X } from 'lucide-react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isLoading?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Delete Item',
    message = 'Are you sure you want to delete this item? This action cannot be undone.',
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    isLoading = false,
}) => {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';

    return (
        <Modal visible={isOpen} transparent animationType="none" onRequestClose={onClose}>
            <View className="flex-1 justify-center px-6">
                <Pressable 
                    className="absolute inset-0 bg-black/60" 
                    onPress={isLoading ? undefined : onClose} 
                />
                
                <Animated.View
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                    className={`rounded-[32px] overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-white'}`}
                    style={{ elevation: 20 }}
                >
                    <View className="p-8 items-center">
                        <View className={`w-16 h-16 rounded-3xl items-center justify-center mb-6 ${isDark ? 'bg-red-500/20' : 'bg-red-50'}`}>
                            <Trash2 size={28} color="#ef4444" />
                        </View>
                        
                        <Text className={`text-xl font-black text-center mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {title}
                        </Text>
                        <Text className={`text-sm font-medium text-center leading-5 px-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {message}
                        </Text>
                        
                        <View className="w-full mt-8 gap-3">
                            <TouchableOpacity
                                onPress={onConfirm}
                                disabled={isLoading}
                                className="w-full bg-red-500 py-4 rounded-2xl items-center justify-center shadow-lg shadow-red-500/30"
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-black text-base">{confirmLabel}</Text>
                                )}
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                onPress={onClose}
                                disabled={isLoading}
                                className={`w-full py-4 rounded-2xl items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}
                            >
                                <Text className={`font-bold text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {cancelLabel}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

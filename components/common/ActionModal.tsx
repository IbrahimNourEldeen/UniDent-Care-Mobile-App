import React from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { X, AlertTriangle, Info } from 'lucide-react-native';

interface ActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAction: () => void;
    title: string;
    message: string;
    actionText?: string;
    cancelText?: string;
    isLoading?: boolean;
    variant?: 'primary' | 'danger';
    isDark?: boolean;
}

export default function ActionModal({
    isOpen,
    onClose,
    onAction,
    title,
    message,
    actionText = 'Confirm',
    cancelText = 'Cancel',
    isLoading = false,
    variant = 'danger',
    isDark = false,
}: ActionModalProps) {
    if (!isOpen) return null;

    const isDanger = variant === 'danger';
    const Icon = isDanger ? AlertTriangle : Info;
    
    // Theme classes
    const overlayBg = isDark ? 'bg-black/60' : 'bg-black/40';
    const modalBg = isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white';
    
    const iconBgColor = isDanger 
        ? (isDark ? 'bg-red-500/20' : 'bg-red-100')
        : (isDark ? 'bg-blue-500/20' : 'bg-blue-100');
        
    const iconColor = isDanger 
        ? (isDark ? '#ef4444' : '#dc2626') // red-500 / red-600
        : (isDark ? '#3b82f6' : '#2563eb'); // blue-500 / blue-600

    const actionButtonClass = isDanger 
        ? (isDark ? 'bg-red-900/40 border border-red-800' : 'bg-rose-50 border border-rose-200')
        : 'bg-indigo-600';
        
    const actionTextClass = isDanger
        ? (isDark ? 'text-red-400' : 'text-rose-600')
        : 'text-white';

    const cancelClass = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
    const cancelTextClass = isDark ? 'text-slate-300' : 'text-slate-700';

    const textClass = isDark ? 'text-white' : 'text-slate-900';
    const subTextClass = isDark ? 'text-slate-400' : 'text-slate-500';
    const footerBg = isDark ? 'bg-slate-800/50 border-t border-slate-800' : 'bg-slate-50 border-t border-slate-100';

    return (
        <Modal
            visible={isOpen}
            transparent
            animationType="fade"
            onRequestClose={!isLoading ? onClose : undefined}
        >
            <View className={`flex-1 justify-center items-center px-4 ${overlayBg}`}>
                <View className={`w-full max-w-sm rounded-3xl overflow-hidden shadow-xl ${modalBg}`}>
                    <View className="p-6">
                        <View className="flex-row justify-between items-start mb-4">
                            <View className={`p-3 rounded-full ${iconBgColor}`}>
                                <Icon size={24} color={iconColor} />
                            </View>
                            <TouchableOpacity
                                onPress={onClose}
                                disabled={isLoading}
                                className={`p-2 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}
                            >
                                <X size={18} color={isDark ? '#94a3b8' : '#64748b'} />
                            </TouchableOpacity>
                        </View>

                        <View>
                            <Text className={`text-xl font-bold mb-2 ${textClass}`}>
                                {title}
                            </Text>
                            <Text className={`text-sm leading-5 ${subTextClass}`}>
                                {message}
                            </Text>
                        </View>
                    </View>

                    {/* Actions */}
                    <View className={`px-6 py-4 flex-row items-center gap-3 ${footerBg}`}>
                        <TouchableOpacity
                            onPress={onClose}
                            disabled={isLoading}
                            className={`flex-1 py-3 rounded-xl border items-center justify-center ${cancelClass}`}
                        >
                            <Text className={`font-semibold ${cancelTextClass}`}>
                                {cancelText}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onAction}
                            disabled={isLoading}
                            className={`flex-1 py-3 rounded-xl border items-center justify-center flex-row gap-2 ${actionButtonClass} ${isLoading ? 'opacity-70' : ''}`}
                        >
                            {isLoading && <ActivityIndicator size="small" color={isDanger ? iconColor : '#ffffff'} />}
                            <Text className={`font-semibold ${actionTextClass}`}>
                                {isLoading ? 'Processing...' : actionText}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Send, XCircle } from 'lucide-react-native';
import ActionModal from '@/components/common/ActionModal';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

interface Props {
    requestStatus: string;
    cancelLoading: boolean;
    onCancel: () => void;
}

export default function PendingRequestSection({ requestStatus, cancelLoading, onCancel }: Props) {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <View className="space-y-3">
            <View className={`rounded-2xl p-4 flex-row items-center justify-between border ${isDark ? 'bg-blue-900/10 border-blue-800/50' : 'bg-blue-50 border-blue-200/60'}`}>
                <View className="flex-row items-center gap-2">
                    <Send size={14} color={isDark ? '#3b82f6' : '#3b82f6'} />
                    <Text className={`text-sm font-semibold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                        Request {requestStatus}
                    </Text>
                </View>
            </View>
            
            {requestStatus === "Pending" && (
                <TouchableOpacity
                    onPress={() => setIsModalOpen(true)}
                    disabled={cancelLoading}
                    activeOpacity={0.8}
                    className={`flex-row items-center justify-center gap-2 py-3.5 rounded-xl border ${isDark ? 'border-red-800 bg-red-900/20' : 'border-red-200 bg-red-50'}`}
                >
                    {cancelLoading ? (
                        <ActivityIndicator size="small" color={isDark ? '#f87171' : '#dc2626'} />
                    ) : (
                        <XCircle size={15} color={isDark ? '#f87171' : '#dc2626'} />
                    )}
                    <Text className={`text-sm font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                        Cancel Request
                    </Text>
                </TouchableOpacity>
            )}

            <ActionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAction={() => {
                    onCancel();
                    setIsModalOpen(false);
                }}
                title="Cancel Case Request"
                message="Are you sure you want to cancel this pending request? This action cannot be undone."
                actionText="Yes, Cancel it"
                cancelText="Keep it"
                isLoading={cancelLoading}
                variant="danger"
            />
        </View>
    );
}

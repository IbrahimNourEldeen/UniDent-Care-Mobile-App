import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Send } from 'lucide-react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

interface Props {
    onSendRequest: () => void;
}

export default function SendRequestSection({ onSendRequest }: Props) {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';

    return (
        <TouchableOpacity
            onPress={onSendRequest}
            activeOpacity={0.8}
            className={`flex-row items-center justify-center gap-2 py-3.5 rounded-xl shadow-sm ${isDark ? 'bg-indigo-600' : 'bg-indigo-600'}`}
        >
            <Send size={15} color="#ffffff" />
            <Text className="text-sm font-bold text-white">
                Send Request
            </Text>
        </TouchableOpacity>
    );
}

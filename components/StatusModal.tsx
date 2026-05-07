import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react-native';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';

interface StatusModalProps {
  visible: boolean;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  onClose: () => void;
  isDark?: boolean;
}

export default function StatusModal({ visible, type, title, message, onClose, isDark }: StatusModalProps) {
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm';
  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const subTextColor = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/60 items-center justify-center px-8">
        <Animated.View 
          entering={ZoomIn} 
          exiting={ZoomOut} 
          className={`w-full p-8 rounded-[40px] items-center border ${cardBg} shadow-2xl`}
        >
          <View className={`w-20 h-20 rounded-full items-center justify-center mb-6 ${
            type === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 
            type === 'error' ? 'bg-rose-100 dark:bg-rose-900/30' : 
            'bg-blue-100 dark:bg-blue-900/30'
          }`}>
            {type === 'success' && <CheckCircle2 size={40} color="#10b981" />}
            {type === 'error' && <AlertTriangle size={40} color="#f43f5e" />}
            {type === 'info' && <Info size={40} color="#3b82f6" />}
          </View>
          <Text className={`text-2xl font-black mb-2 ${textColor}`}>{title}</Text>
          <Text className={`text-sm text-center mb-8 font-bold leading-5 ${subTextColor}`}>{message}</Text>
          <TouchableOpacity 
            onPress={onClose} 
            className={`w-full py-4 rounded-2xl items-center ${
              type === 'success' ? 'bg-emerald-600' : 
              type === 'error' ? 'bg-rose-600' : 
              'bg-indigo-600'
            }`}
          >
            <Text className="text-white font-black uppercase tracking-widest text-sm">Got it</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

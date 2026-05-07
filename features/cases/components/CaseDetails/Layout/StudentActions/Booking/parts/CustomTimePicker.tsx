import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Clock, X } from 'lucide-react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

interface CustomTimePickerProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (time: string) => void;
    initialTime?: string;
    title: string;
}

export default function CustomTimePicker({
    visible,
    onClose,
    onConfirm,
    initialTime = '',
    title,
}: CustomTimePickerProps) {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';

    // Parse initial time (HH:MM 24-hour format)
    const parseTime = (time24: string) => {
        if (!time24) return { hour: 9, minute: 0, period: 'AM' };
        const [h, m] = time24.split(':').map(Number);
        const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        const period = h >= 12 ? 'PM' : 'AM';
        return { hour: hour12, minute: m, period };
    };

    const initial = parseTime(initialTime);
    const [selectedHour, setSelectedHour] = useState(initial.hour);
    const [selectedMinute, setSelectedMinute] = useState(initial.minute);
    const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>(initial.period);

    useEffect(() => {
        if (visible) {
            const parsed = parseTime(initialTime);
            setSelectedHour(parsed.hour);
            setSelectedMinute(parsed.minute);
            setSelectedPeriod(parsed.period);
        }
    }, [visible, initialTime]);

    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    const handleConfirm = () => {
        // Convert to 24-hour format
        let hour24 = selectedHour;
        if (selectedPeriod === 'AM') {
            hour24 = selectedHour === 12 ? 0 : selectedHour;
        } else {
            hour24 = selectedHour === 12 ? 12 : selectedHour + 12;
        }
        const timeString = `${String(hour24).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;
        onConfirm(timeString);
        onClose();
    };

    const renderScrollPicker = (
        items: number[],
        selected: number,
        onSelect: (v: number) => void,
        format?: (v: number) => string
    ) => (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 80 }}
            style={{ height: 200 }}
        >
            {items.map((item) => {
                const isSelected = item === selected;
                return (
                    <TouchableOpacity
                        key={item}
                        onPress={() => onSelect(item)}
                        activeOpacity={0.7}
                        className={`py-3 px-4 mx-2 rounded-xl mb-2 ${
                            isSelected
                                ? isDark
                                    ? 'bg-indigo-600'
                                    : 'bg-indigo-600'
                                : isDark
                                ? 'bg-slate-800/50'
                                : 'bg-slate-100'
                        }`}
                    >
                        <Text
                            className={`text-center text-base font-bold ${
                                isSelected
                                    ? 'text-white'
                                    : isDark
                                    ? 'text-slate-400'
                                    : 'text-slate-600'
                            }`}
                        >
                            {format ? format(item) : String(item).padStart(2, '0')}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View className="flex-1 justify-center items-center bg-black/50 px-6">
                <View
                    className={`w-full rounded-3xl p-6 ${
                        isDark ? 'bg-slate-900' : 'bg-white'
                    }`}
                    style={{ maxWidth: 400 }}
                >
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-6">
                        <View className="flex-row items-center gap-2">
                            <Clock size={20} color={isDark ? '#818cf8' : '#4f46e5'} />
                            <Text
                                className={`text-lg font-bold ${
                                    isDark ? 'text-white' : 'text-slate-800'
                                }`}
                            >
                                {title}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            activeOpacity={0.7}
                            className={`w-8 h-8 rounded-xl items-center justify-center ${
                                isDark ? 'bg-slate-800' : 'bg-slate-100'
                            }`}
                        >
                            <X size={16} color={isDark ? '#94a3b8' : '#64748b'} />
                        </TouchableOpacity>
                    </View>

                    {/* Time Display */}
                    <View
                        className={`rounded-2xl p-4 mb-6 ${
                            isDark ? 'bg-indigo-900/20' : 'bg-indigo-50'
                        }`}
                    >
                        <Text
                            className={`text-center text-4xl font-black tracking-wider ${
                                isDark ? 'text-indigo-400' : 'text-indigo-600'
                            }`}
                        >
                            {String(selectedHour).padStart(2, '0')}:
                            {String(selectedMinute).padStart(2, '0')}{' '}
                            <Text className="text-2xl">{selectedPeriod}</Text>
                        </Text>
                    </View>

                    {/* Pickers */}
                    <View className="flex-row gap-2 mb-6">
                        {/* Hour */}
                        <View className="flex-1">
                            <Text
                                className={`text-xs font-semibold mb-2 text-center ${
                                    isDark ? 'text-slate-400' : 'text-slate-500'
                                }`}
                            >
                                Hour
                            </Text>
                            {renderScrollPicker(hours, selectedHour, setSelectedHour)}
                        </View>

                        {/* Minute */}
                        <View className="flex-1">
                            <Text
                                className={`text-xs font-semibold mb-2 text-center ${
                                    isDark ? 'text-slate-400' : 'text-slate-500'
                                }`}
                            >
                                Minute
                            </Text>
                            {renderScrollPicker(minutes, selectedMinute, setSelectedMinute)}
                        </View>

                        {/* AM/PM */}
                        <View className="w-20">
                            <Text
                                className={`text-xs font-semibold mb-2 text-center ${
                                    isDark ? 'text-slate-400' : 'text-slate-500'
                                }`}
                            >
                                Period
                            </Text>
                            <View className="flex-1 justify-center gap-2" style={{ paddingVertical: 80 }}>
                                {(['AM', 'PM'] as const).map((period) => (
                                    <TouchableOpacity
                                        key={period}
                                        onPress={() => setSelectedPeriod(period)}
                                        activeOpacity={0.7}
                                        className={`py-3 px-2 rounded-xl ${
                                            selectedPeriod === period
                                                ? isDark
                                                    ? 'bg-indigo-600'
                                                    : 'bg-indigo-600'
                                                : isDark
                                                ? 'bg-slate-800/50'
                                                : 'bg-slate-100'
                                        }`}
                                    >
                                        <Text
                                            className={`text-center text-sm font-bold ${
                                                selectedPeriod === period
                                                    ? 'text-white'
                                                    : isDark
                                                    ? 'text-slate-400'
                                                    : 'text-slate-600'
                                            }`}
                                        >
                                            {period}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Actions */}
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={onClose}
                            activeOpacity={0.7}
                            className={`flex-1 py-3.5 rounded-xl border ${
                                isDark
                                    ? 'bg-slate-800 border-slate-700'
                                    : 'bg-slate-100 border-slate-200'
                            }`}
                        >
                            <Text
                                className={`text-center text-sm font-bold ${
                                    isDark ? 'text-slate-300' : 'text-slate-600'
                                }`}
                            >
                                Cancel
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleConfirm}
                            activeOpacity={0.8}
                            className="flex-1 py-3.5 rounded-xl bg-indigo-600"
                        >
                            <Text className="text-center text-sm font-bold text-white">
                                Confirm
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

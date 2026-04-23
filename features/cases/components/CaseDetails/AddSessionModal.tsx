import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, Clock, MapPin, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform, Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';

interface AddSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (sessionDate: string, location?: string) => Promise<boolean>;
    isLoading: boolean;
}

export const AddSessionModal: React.FC<AddSessionModalProps> = ({
    isOpen, onClose, onSubmit, isLoading,
}) => {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';

    const [date, setDate] = useState<Date>(new Date());
    const [time, setTime] = useState<Date>(new Date());
    const [location, setLocation] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [errors, setErrors] = useState<{ date?: string }>({});

    const reset = () => {
        setDate(new Date());
        setTime(new Date());
        setLocation('');
        setErrors({});
    };

    const handleClose = () => {
        if (isLoading) return;
        reset();
        onClose();
    };

    const handleSubmit = async () => {
        const now = new Date();
        const combined = new Date(
            date.getFullYear(), date.getMonth(), date.getDate(),
            time.getHours(), time.getMinutes(), 0,
        );

        if (combined <= now) {
            setErrors({ date: 'Session date & time must be in the future.' });
            return;
        }
        setErrors({});

        const iso = combined.toISOString();
        const success = await onSubmit(iso, location.trim() || undefined);
        if (success) {
            reset();
        }
    };

    const dateLabel = date.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    const timeLabel = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    return (
        <Modal visible={isOpen} transparent animationType="none" onRequestClose={handleClose}>
            <View className="flex-1">
                <Pressable className="flex-1 bg-black/60" onPress={handleClose} />
                <Animated.View
                    entering={SlideInDown.springify().damping(18)}
                    exiting={SlideOutDown}
                    className={`absolute bottom-0 left-0 right-0 rounded-t-[36px] p-6 pb-12 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
                >
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                        {/* Header */}
                        <View className="flex-row justify-between items-center mb-8">
                            <View>
                                <Text className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Schedule Session</Text>
                                <Text className={`text-xs font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Pick a date and time for the session</Text>
                            </View>
                            <TouchableOpacity
                                onPress={handleClose}
                                disabled={isLoading}
                                className={`w-10 h-10 rounded-full items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}
                            >
                                <X size={18} color={isDark ? '#fff' : '#000'} />
                            </TouchableOpacity>
                        </View>

                        {/* Date Picker */}
                        <Text className={`text-[10px] font-black uppercase tracking-widest mb-3 ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Session Date</Text>
                        <TouchableOpacity
                            onPress={() => setShowDatePicker(true)}
                            className={`flex-row items-center gap-3 p-4 rounded-2xl mb-6 border-2 ${errors.date ? 'border-red-400' : (isDark ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50')}`}
                        >
                            <Calendar size={18} color={isDark ? '#818cf8' : '#4f46e5'} />
                            <Text className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{dateLabel}</Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                minimumDate={new Date()}
                                display="default"
                                onChange={(_, d) => { setShowDatePicker(false); if (d) setDate(d); }}
                            />
                        )}

                        {/* Time Picker */}
                        <Text className={`text-[10px] font-black uppercase tracking-widest mb-3 ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Session Time</Text>
                        <TouchableOpacity
                            onPress={() => setShowTimePicker(true)}
                            className={`flex-row items-center gap-3 p-4 rounded-2xl mb-6 border-2 ${isDark ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}
                        >

                            <Clock size={18} color={isDark ? '#818cf8' : '#4f46e5'} />
                            <Text className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{timeLabel}</Text>
                        </TouchableOpacity>
                        {showTimePicker && (
                            <DateTimePicker
                                value={time}
                                mode="time"
                                is24Hour={false}
                                display="default"
                                onChange={(_, t) => { setShowTimePicker(false); if (t) setTime(t); }}
                            />
                        )}
                        {errors.date && <Text className="text-xs text-red-500 font-bold mt-1 ml-1 mb-4">{errors.date}</Text>}

                        {/* Location */}
                        <Text className={`text-[10px] font-black uppercase tracking-widest mb-3 ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Location (Optional)</Text>
                        <View className={`flex-row items-center gap-3 px-4 rounded-2xl mb-8 border-2 ${isDark ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
                            <MapPin size={18} color={isDark ? '#64748b' : '#94a3b8'} />
                            <TextInput
                                placeholder="e.g. Clinic Room 3"
                                placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
                                className={`flex-1 py-4 text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}
                                value={location}
                                onChangeText={setLocation}
                                editable={!isLoading}
                            />
                        </View>


                        {/* Submit */}
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={isLoading}
                            className={`w-full py-4 rounded-[20px] items-center justify-center ${isLoading ? 'opacity-60' : ''} bg-indigo-600 shadow-lg shadow-indigo-500/30`}
                        >
                            {isLoading
                                ? <ActivityIndicator color="white" />
                                : <Text className="text-white font-black text-base tracking-wide">Confirm Session</Text>
                            }
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </Animated.View>
            </View>
        </Modal>
    );
};

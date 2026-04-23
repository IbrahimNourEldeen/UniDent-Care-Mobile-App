import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, ActivityIndicator, Pressable, TextInput } from 'react-native';
import { ChevronDown, Stethoscope, Check, X, Search } from 'lucide-react-native';
import { doctorDashboardService, DoctorListDto } from '@/features/dashboard/services/doctorDashboardService';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { useTranslation } from 'react-i18next';

interface DoctorPickerProps {
    value: string; // This will be the doctor's username
    onSelect: (doctor: DoctorListDto) => void;
    error?: string;
}

export const DoctorPicker: React.FC<DoctorPickerProps> = ({ value, onSelect, error }) => {
    const { t } = useTranslation();
    const { theme } = useThemeLanguage();
    const isDark = theme === "dark";
    const [modalVisible, setModalVisible] = useState(false);
    const [doctors, setDoctors] = useState<DoctorListDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<DoctorListDto | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchDoctors = async (query = '') => {
        setLoading(true);
        try {
            const response = await doctorDashboardService.searchDoctors({
                name: query,
                pageSize: 20
            });
            setDoctors(response.items);
            
            // If we have a value and no selected doctor, find it
            if (value && !selectedDoctor) {
                const found = response.items.find(d => d.username === value);
                if (found) setSelectedDoctor(found);
            }
        } catch (err) {
            console.error("Failed to fetch doctors", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (modalVisible) {
            fetchDoctors(searchQuery);
        }
    }, [modalVisible, searchQuery]);

    // Initial fetch to resolve value to name if needed
    useEffect(() => {
        if (value && !selectedDoctor) {
            fetchDoctors();
        }
    }, [value]);

    return (
        <View className="mb-4">
            <Text className={`text-xs font-black uppercase tracking-widest mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {t('select_doctor')}
            </Text>
            <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => setModalVisible(true)}
                className={`flex-row items-center bg-slate-50 dark:bg-slate-950 border ${error ? 'border-red-400' : (isDark ? 'border-slate-800' : 'border-slate-200')} rounded-[28px] px-5 py-4 shadow-sm`}
            >
                <Stethoscope color={isDark ? "#818cf8" : "#4f46e5"} size={20} />
                <Text className={`flex-1 ml-3 font-bold ${selectedDoctor ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'}`} numberOfLines={1}>
                    {selectedDoctor ? selectedDoctor.fullName : t('choose_doctor')}
                </Text>
                <ChevronDown color={isDark ? "#64748b" : "#94a3b8"} size={20} />
            </TouchableOpacity>
            {error && (
                <View className="flex-row items-center gap-1.5 mt-2 ml-2">
                    <Text className="text-xs text-red-500 font-bold">{error}</Text>
                </View>
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable 
                    className="flex-1 bg-black/60 justify-end"
                    onPress={() => setModalVisible(false)}
                >
                    <View className={`rounded-t-[40px] ${isDark ? 'bg-slate-900' : 'bg-white'} h-[80%] p-6`}>
                        {/* Handle */}
                        <View className={`w-12 h-1.5 self-center rounded-full mb-6 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />

                        <View className="flex-row justify-between items-center mb-6">
                            <Text className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('doctors')}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} className={`p-2 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                <X size={20} color={isDark ? "#fff" : "#000"} />
                            </TouchableOpacity>
                        </View>

                        {/* Search Input */}
                        <View className={`flex-row items-center px-4 py-3 rounded-2xl mb-6 border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                            <Search size={18} color={isDark ? "#475569" : "#94a3b8"} />
                            <TextInput
                                className={`flex-1 ml-3 font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}
                                placeholder={t('search_doctors_placeholder')}
                                placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoFocus={false}
                            />
                        </View>

                        {loading && doctors.length === 0 ? (
                            <View className="flex-1 justify-center items-center">
                                <ActivityIndicator size="large" color="#4f46e5" />
                                <Text className={`mt-4 font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t('searching_doctors')}</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={doctors}
                                keyExtractor={(item) => item.publicId}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <TouchableOpacity 
                                        activeOpacity={0.6}
                                        onPress={() => {
                                            onSelect(item);
                                            setSelectedDoctor(item);
                                            setModalVisible(false);
                                        }}
                                        className={`p-4 mb-3 border rounded-[24px] flex-row items-center ${selectedDoctor?.publicId === item.publicId ? (isDark ? 'border-indigo-500 bg-indigo-500/10' : 'border-indigo-600 bg-indigo-50') : (isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50')}`}
                                    >
                                        <View className={`w-12 h-12 rounded-[18px] items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-white shadow-sm'}`}>
                                            <Stethoscope size={22} color="#4f46e5" />
                                        </View>
                                        <View className="ml-4 flex-1">
                                            <Text className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.fullName}</Text>
                                            <Text className={`text-xs font-medium mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.specialty || t('general_doctor')}</Text>
                                        </View>
                                        {selectedDoctor?.publicId === item.publicId && (
                                            <View className="bg-indigo-600 rounded-full p-1.5">
                                                <Check size={14} color="white" strokeWidth={3} />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={() => (
                                    <View className="py-12 items-center">
                                        <Text className={`font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t('no_doctors_found')}</Text>
                                    </View>
                                )}
                            />
                        )}
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

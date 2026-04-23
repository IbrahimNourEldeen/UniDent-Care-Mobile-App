import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { ChevronDown, GraduationCap, User, Check, X, Search } from 'lucide-react-native';
import { authService } from '../../features/auth/services/authService';
import { UniversityLookup } from '../../types/types';
import { useThemeLanguage } from '../../store/ThemeLanguageContext';

interface UniversityPickerProps {
    value: string;
    onSelect: (university: UniversityLookup) => void;
    error?: string;
}

export const UniversityPicker: React.FC<UniversityPickerProps> = ({ value, onSelect, error }) => {
    const { theme } = useThemeLanguage();
    const isDark = theme === "dark";
    const [modalVisible, setModalVisible] = useState(false);
    const [universities, setUniversities] = useState<UniversityLookup[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedUniversity, setSelectedUniversity] = useState<UniversityLookup | null>(null);

    useEffect(() => {
        const fetchUniversities = async () => {
            setLoading(true);
            try {
                const response = await authService.getUniversitiesLookup();
                if (response.success) {
                    setUniversities(response.data);
                    // Find selected university if value exists
                    if (value) {
                        const found = response.data.find(u => u.id === value);
                        if (found) setSelectedUniversity(found);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch universities", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUniversities();
    }, [value]);

    return (
        <View className="mb-4">
            <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                Select University
            </Text>
            <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => setModalVisible(true)}
                className={`flex-row items-center bg-white dark:bg-slate-900 border-2 ${error ? 'border-red-400' : 'border-slate-100 dark:border-slate-800'} rounded-2xl px-4 py-4 shadow-sm`}
            >
                <GraduationCap color={isDark ? "#64748b" : "#4f46e5"} size={20} />
                <Text className={`flex-1 ml-3 font-bold ${selectedUniversity ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'}`} numberOfLines={1}>
                    {selectedUniversity ? selectedUniversity.name : "Choose university..."}
                </Text>
                <ChevronDown color={isDark ? "#64748b" : "#94a3b8"} size={20} />
            </TouchableOpacity>
            {error && <Text className="text-xs text-red-500 font-bold mt-1 ml-1">{error}</Text>}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable 
                    className="flex-1 bg-black/50 justify-end"
                    onPress={() => setModalVisible(false)}
                >
                    <View className="bg-white dark:bg-slate-900 rounded-t-[40px] h-[70%] p-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-black text-slate-900 dark:text-white">Universities</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                                <X size={20} color={isDark ? "#fff" : "#000"} />
                            </TouchableOpacity>
                        </View>

                        {loading ? (
                            <View className="flex-1 justify-center items-center">
                                <ActivityIndicator size="large" color="#4f46e5" />
                                <Text className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Loading universities...</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={universities}
                                keyExtractor={(item) => item.id}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <TouchableOpacity 
                                        activeOpacity={0.6}
                                        onPress={() => {
                                            onSelect(item);
                                            setSelectedUniversity(item);
                                            setModalVisible(false);
                                        }}
                                        className={`p-4 mb-3 border-2 rounded-2xl flex-row items-center ${selectedUniversity?.id === item.id ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'}`}
                                    >
                                        <View className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full items-center justify-center shadow-sm">
                                            <GraduationCap size={20} color="#4f46e5" />
                                        </View>
                                        <View className="ml-3 flex-1">
                                            <Text className="text-slate-900 dark:text-white font-bold">{item.name}</Text>
                                            <Text className="text-slate-500 dark:text-slate-400 text-xs" numberOfLines={1}>{item.id}</Text>
                                        </View>
                                        {selectedUniversity?.id === item.id && (
                                            <View className="bg-indigo-500 rounded-full p-1">
                                                <Check size={14} color="white" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={() => (
                                    <View className="p-10 items-center">
                                        <Text className="text-slate-400 text-center font-medium">No universities found.</Text>
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

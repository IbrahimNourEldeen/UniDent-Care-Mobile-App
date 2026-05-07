import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, ActivityIndicator, Pressable, TextInput } from 'react-native';
import { ChevronDown, MapPin, Check, X, Search } from 'lucide-react-native';
import { authService } from '../../features/auth/services/authService';
import { City } from '../../types/types';
import { useThemeLanguage } from '../../store/ThemeLanguageContext';

interface CityPickerProps {
    value: number;
    onSelect: (city: City) => void;
    error?: string;
}

export const CityPicker: React.FC<CityPickerProps> = ({ value, onSelect, error }) => {
    const { theme } = useThemeLanguage();
    const isDark = theme === "dark";
    const [modalVisible, setModalVisible] = useState(false);
    const [cities, setCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCity, setSelectedCity] = useState<City | null>(null);

    useEffect(() => {
        const fetchCities = async () => {
            setLoading(true);
            try {
                const data = await authService.getCitiesLookup();
                setCities(data);
                
                if (value) {
                    const found = data.find(c => c.id === value);
                    if (found) setSelectedCity(found);
                }
            } catch (err) {
                console.error("Failed to fetch cities", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCities();
    }, [value]);

    const filteredCities = useMemo(() => {
        if (!searchQuery) return cities;
        const query = searchQuery.toLowerCase();
        return cities.filter(city => 
            city.name_en.toLowerCase().includes(query) || 
            city.name_ar.includes(query)
        );
    }, [cities, searchQuery]);

    return (
        <View className="flex-1">
            <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                Select City
            </Text>
            <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => setModalVisible(true)}
                className={`flex-row items-center bg-white dark:bg-slate-900 border-2 ${error ? 'border-red-400' : 'border-slate-100 dark:border-slate-800'} rounded-2xl px-4 py-3 shadow-sm dark:shadow-none`}
            >
                <MapPin color={isDark ? "#64748b" : "#94a3b8"} size={20} />
                <Text className={`flex-1 ml-3 font-medium ${selectedCity ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'}`} numberOfLines={1}>
                    {selectedCity ? selectedCity.name_en : "Choose city..."}
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
                    <View className="bg-white dark:bg-slate-900 rounded-t-[40px] h-[80%] p-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-black text-slate-900 dark:text-white">Select City</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                                <X size={20} color={isDark ? "#fff" : "#000"} />
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row items-center bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-2 mb-6">
                            <Search size={18} color={isDark ? "#64748b" : "#94a3b8"} />
                            <TextInput
                                className="flex-1 ml-3 text-slate-900 dark:text-white font-medium h-10"
                                placeholder="Search city (English or Arabic)..."
                                placeholderTextColor={isDark ? "#475569" : "#cbd5e1"}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoCorrect={false}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery("")}>
                                    <X size={16} color={isDark ? "#64748b" : "#94a3b8"} />
                                </TouchableOpacity>
                            )}
                        </View>

                        {loading ? (
                            <View className="flex-1 justify-center items-center">
                                <ActivityIndicator size="large" color="#4f46e5" />
                                <Text className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Loading cities...</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={filteredCities}
                                keyExtractor={(item) => item.id}
                                showsVerticalScrollIndicator={false}
                                initialNumToRender={20}
                                maxToRenderPerBatch={20}
                                renderItem={({ item }) => (
                                    <TouchableOpacity 
                                        activeOpacity={0.6}
                                        onPress={() => {
                                            onSelect(item);
                                            setSelectedCity(item);
                                            setModalVisible(false);
                                        }}
                                        className={`p-4 mb-3 border-2 rounded-2xl flex-row items-center ${selectedCity?.id === item.id ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'}`}
                                    >
                                        <View className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full items-center justify-center shadow-sm">
                                            <MapPin size={20} color="#4f46e5" />
                                        </View>
                                        <View className="ml-3 flex-1">
                                            <Text className="text-slate-900 dark:text-white font-bold">{item.name_en}</Text>
                                        </View>
                                        {selectedCity?.id === item.id && (
                                            <View className="bg-indigo-500 rounded-full p-1">
                                                <Check size={14} color="white" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={() => (
                                    <View className="p-10 items-center">
                                        <Text className="text-slate-400 text-center font-medium">No cities found matching "{searchQuery}"</Text>
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

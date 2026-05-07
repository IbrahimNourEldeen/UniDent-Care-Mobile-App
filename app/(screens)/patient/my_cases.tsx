import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, Filter } from 'lucide-react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { usePatientCasesQuery } from '@/features/patient/hooks/usePatientCasesQuery';
import PatientCaseCard from '@/features/dashboard/components/patient/PatientCaseCard';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

const STATUS_FILTERS = ['all', 'pending', 'inprogress', 'approved', 'completed'];

export default function MyCasesPatientScreen() {
    const user = useSelector((state: RootState) => state.auth.user);
    const patientId = user?.publicId;
    const { theme, language } = useThemeLanguage();
    const isDark = theme === "dark";
    const isRtl = language === "ar";
    const { t } = useTranslation();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const { cases, isLoading, refetch } = usePatientCasesQuery(patientId || "");
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

    const getStatusText = (status: any) => {
        if (status === 0) return "Pending";
        if (status === 1) return "In Progress";
        if (status === 2) return "Completed";
        if (status === 3) return "Cancelled";
        if (status === 4) return "Under Review";
        if (status === 5) return "Rejected";
        if (typeof status === 'string') {
            if (status.toLowerCase() === 'inprogress') return "In Progress";
            if (status.toLowerCase() === 'underreview') return "Under Review";
        }
        return status?.toString() || "";
    };

    const filteredCases = useMemo(() => {
        return cases.filter((c: any) => {
            const diagnosisArray = c.diagnosisdto || c.diagnoses || c.diagnosisDto;
            const diagnosis = Array.isArray(diagnosisArray) ? diagnosisArray[0] : diagnosisArray;
            const caseTypeStr = diagnosis?.caseTypeName || diagnosis?.caseType || c.caseType?.name || c.title || "General Case";
            
            const title = caseTypeStr.toLowerCase();
            const query = searchQuery.toLowerCase();
            const university = (c.universityName || "").toLowerCase();
            const caseId = (c.id || "").toLowerCase();

            const matchesSearch = title.includes(query) || 
                                 university.includes(query) || 
                                 caseId.includes(query);
            
            const pStatus = getStatusText(c.processStatus).toLowerCase().replace(/\s/g, '');
            const cStatus = getStatusText(c.status).toLowerCase().replace(/\s/g, '');
            const filterLower = activeFilter.toLowerCase().replace(/\s/g, '');
            
            const matchesFilter = activeFilter === 'all' || 
                                 pStatus === filterLower || 
                                 cStatus === filterLower;
                                 
            return matchesSearch && matchesFilter;
        });
    }, [cases, searchQuery, activeFilter]);

    if (!patientId || (isLoading && cases.length === 0)) {
        return (
            <View className="flex-1 justify-center items-center bg-slate-50 dark:bg-slate-950">
                <ActivityIndicator size="large" color={isDark ? "#818cf8" : "#4f46e5"} />
                {isLoading && <Text className="mt-4 text-slate-500 font-bold">{t("sync_data")}</Text>}
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50 dark:bg-slate-950">
            <StatusBar barStyle="light-content" />

            {/* Fixed Header Background */}
            <View className="absolute top-0 left-0 right-0 h-[280px]">
                <LinearGradient
                    colors={isDark ? ['#1e1b4b', '#0f172a'] : ['#3b82f6', '#4f46e5']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="w-full h-full rounded-b-[48px] shadow-2xl shadow-indigo-500/20"
                />
            </View>

            <FlatList
                data={filteredCases}
                keyExtractor={(item) => item.id || Math.random().toString()}
                contentContainerStyle={{ paddingBottom: 110 }}
                showsVerticalScrollIndicator={false}
                onRefresh={refetch}
                refreshing={isLoading}
                ListHeaderComponent={
                    <Animated.View entering={FadeInUp.duration(600)} style={{ paddingTop: insets.top + 20 }} className="px-5 pb-6">
                        <Text className={`text-3xl font-black text-white mb-6 ${isRtl ? 'text-right' : ''}`}>
                            {t("my_cases")}
                        </Text>

                        {/* Search Bar */}
                        <View className={`flex-row items-center bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-sm mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <Search color="white" size={20} className={isRtl ? "ml-2" : "mr-2"} />
                            <TextInput 
                                className={`flex-1 text-white font-medium ${isRtl ? 'text-right' : ''}`}
                                placeholder={t("search_placeholder_cases")}
                                placeholderTextColor="rgba(255,255,255,0.6)"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            <TouchableOpacity className={`bg-white/20 p-2 rounded-xl ${isRtl ? 'mr-2' : 'ml-2'}`}>
                                <Filter size={16} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Filters */}
                        <View className="mb-2">
                            <FlatList
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                data={STATUS_FILTERS}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => {
                                    const isActive = activeFilter === item;
                                    return (
                                        <TouchableOpacity 
                                            onPress={() => setActiveFilter(item)}
                                            className={`px-4 py-2 rounded-full border ${isRtl ? 'ml-2' : 'mr-2'} ${isActive ? 'bg-white border-white' : 'bg-white/10 border-white/20'}`}
                                        >
                                            <Text className={`font-bold text-xs ${isActive ? 'text-indigo-600' : 'text-white'}`}>
                                                {item === 'all' ? t('filter_all') : t(`status_${item}`)}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        </View>
                    </Animated.View>
                }
                renderItem={({ item, index }) => (
                    <Animated.View entering={FadeInDown.delay(index * 100).duration(500)} className="px-5">
                        <PatientCaseCard 
                            item={item} 
                            index={index} 
                            onPress={() => router.push(`/case-details/${item.id}`)} 
                        />
                    </Animated.View>
                )}
                ListEmptyComponent={
                    !isLoading ? (
                        <View className="items-center justify-center py-20">
                            <Text className="text-slate-400 dark:text-slate-500 font-bold">{t("no_cases_found")}</Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
}
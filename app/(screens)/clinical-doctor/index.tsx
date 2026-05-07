import React, { useCallback, useRef, useState, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Search, X, FolderOpen, Stethoscope, Calendar, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { fetchCasesForClinicalDoctor } from '@/features/cases/services/clinicalDoctorCases.service';

const PAGE_SIZE = 30;

function CaseCard({
    item,
    isDark,
    onPress,
}: {
    item: any;
    isDark: boolean;
    onPress: () => void;
}) {
    const initials = (item.patientName ?? 'P')
        .split(' ')
        .slice(0, 2)
        .map((n: string) => n[0])
        .join('')
        .toUpperCase();

    const caseType =
        item.diagnosisdto?.caseType ||
        item.caseType?.name ||
        item.caseName ||
        'General Dentistry';

    const date = new Date(item.createAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

    const statusColor =
        item.status?.toLowerCase() === 'completed'
            ? { bg: isDark ? 'rgba(6,78,59,0.3)' : '#f0fdf4', text: isDark ? '#34d399' : '#059669' }
            : item.status?.toLowerCase() === 'pending'
            ? { bg: isDark ? 'rgba(120,53,15,0.3)' : '#fffbeb', text: isDark ? '#fbbf24' : '#92400e' }
            : { bg: isDark ? '#1e293b' : '#f8fafc', text: isDark ? '#94a3b8' : '#64748b' };

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
            style={{
                marginBottom: 16,
                borderRadius: 28,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: isDark ? '#1e293b' : '#f1f5f9',
                backgroundColor: isDark ? '#0f172a' : '#fff',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0 : 0.06,
                shadowRadius: 12,
                elevation: 3,
            }}
        >
            {/* Status stripe */}
            <View
                style={{
                    height: 3,
                    backgroundColor:
                        item.status?.toLowerCase() === 'completed'
                            ? '#10b981'
                            : item.status?.toLowerCase() === 'pending'
                            ? '#f59e0b'
                            : '#6366f1',
                }}
            />

            <View style={{ padding: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
                    {/* Avatar */}
                    <LinearGradient
                        colors={isDark ? ['#1e1b4b', '#312e81'] : ['#6366f1', '#4f46e5']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 16,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>{initials}</Text>
                    </LinearGradient>

                    {/* Info */}
                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                fontWeight: '900',
                                fontSize: 15,
                                color: isDark ? '#f1f5f9' : '#0f172a',
                            }}
                            numberOfLines={1}
                        >
                            {item.patientName}
                        </Text>

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                            <Stethoscope size={11} color={isDark ? '#64748b' : '#94a3b8'} />
                            <Text
                                style={{ fontSize: 12, fontWeight: '700', color: isDark ? '#64748b' : '#94a3b8' }}
                                numberOfLines={1}
                            >
                                {caseType}
                            </Text>
                        </View>

                        {/* Status badge */}
                        <View
                            style={{
                                marginTop: 8,
                                alignSelf: 'flex-start',
                                paddingHorizontal: 10,
                                paddingVertical: 2,
                                borderRadius: 20,
                                backgroundColor: statusColor.bg,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 10,
                                    fontWeight: '900',
                                    textTransform: 'uppercase',
                                    letterSpacing: 0.5,
                                    color: statusColor.text,
                                }}
                            >
                                {item.status}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Divider */}
                <View
                    style={{
                        height: 1,
                        backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                        marginVertical: 16,
                    }}
                />

                {/* Meta row */}
                <View style={{ flexDirection: 'row', gap: 20 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <User size={12} color={isDark ? '#64748b' : '#94a3b8'} />
                        <Text style={{ fontSize: 12, fontWeight: '700', color: isDark ? '#64748b' : '#94a3b8' }}>
                            {item.patientAge ? `${item.patientAge}y` : '—'}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Calendar size={12} color={isDark ? '#64748b' : '#94a3b8'} />
                        <Text style={{ fontSize: 12, fontWeight: '700', color: isDark ? '#64748b' : '#94a3b8' }}>
                            {date}
                        </Text>
                    </View>
                    {item.universityName ? (
                        <Text
                            style={{ fontSize: 12, fontWeight: '700', color: '#818cf8' }}
                            numberOfLines={1}
                        >
                            {item.universityName}
                        </Text>
                    ) : null}
                </View>
            </View>
        </TouchableOpacity>
    );
}

export default function ClinicalDoctorCasesScreen() {
    const router = useRouter();
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [refreshing, setRefreshing] = useState(false);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['clinical-doctor-cases'],
        queryFn: () =>
            fetchCasesForClinicalDoctor({
                page: 1,
                pageSize: 100, // Fetch more for frontend filtering
            }),
        staleTime: 30_000,
    });

    const cases: any[] = data?.items ?? data?.data?.items ?? [];
    
    const filteredCases = useMemo(() => {
        return cases.filter((item: any) => {
            const matchesSearch = item.patientName?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
            return matchesSearch && matchesStatus;
        });
    }, [cases, searchQuery, selectedStatus]);

    const totalCount: number = filteredCases.length;

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    const bgColor = isDark ? '#020617' : '#f8fafc';
    const cardBg = isDark ? '#0f172a' : '#fff';
    const borderColor = isDark ? '#1e293b' : '#e2e8f0';
    const textColor = isDark ? '#f1f5f9' : '#0f172a';
    const subColor = isDark ? '#94a3b8' : '#64748b';

    const statuses = ['All', 'Pending', 'UnderReview', 'InProgress', 'Completed'];

    return (
        <View style={{ flex: 1, backgroundColor: bgColor }}>
            {/* Gradient Header */}
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200 }}>
                <LinearGradient
                    colors={isDark ? ['#1e1b4b', '#0f172a'] : ['#6366f1', '#4f46e5']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ flex: 1, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }}
                />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={isDark ? '#818cf8' : '#fff'}
                    />
                }
            >
                {/* Header */}
                <View style={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 32 }}>
                    <Text
                        style={{
                            fontSize: 11,
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: 2,
                            color: 'rgba(255,255,255,0.6)',
                            marginBottom: 4,
                        }}
                    >
                        Clinical Doctor Panel
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 30, fontWeight: '900', color: '#fff' }}>Cases</Text>
                        <View
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                                borderRadius: 16,
                            }}
                        >
                            <Text style={{ fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>
                                Total
                            </Text>
                            <Text style={{ fontSize: 22, fontWeight: '900', color: '#fff', textAlign: 'center' }}>
                                {totalCount}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Content */}
                <View style={{ paddingHorizontal: 20 }}>
                    {/* Search bar */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 16,
                            height: 56,
                            marginBottom: 16,
                            borderRadius: 24,
                            borderWidth: 1,
                            borderColor,
                            backgroundColor: cardBg,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: isDark ? 0 : 0.04,
                            shadowRadius: 8,
                            elevation: 2,
                        }}
                    >
                        <Search size={20} color={subColor} />
                        <TextInput
                            placeholder="Search by patient name…"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor={subColor}
                            style={{
                                flex: 1,
                                marginLeft: 12,
                                fontSize: 14,
                                fontWeight: '600',
                                color: textColor,
                            }}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <X size={18} color={subColor} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Status Filter */}
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 8, paddingBottom: 24 }}
                    >
                        {statuses.map((s) => (
                            <TouchableOpacity
                                key={s}
                                onPress={() => setSelectedStatus(s)}
                                activeOpacity={0.7}
                                style={{
                                    paddingHorizontal: 16,
                                    paddingVertical: 8,
                                    borderRadius: 16,
                                    backgroundColor: selectedStatus === s 
                                        ? (isDark ? '#4f46e5' : '#6366f1')
                                        : (isDark ? '#1e293b' : '#fff'),
                                    borderWidth: 1,
                                    borderColor: selectedStatus === s 
                                        ? (isDark ? '#6366f1' : '#4f46e5')
                                        : borderColor,
                                }}
                            >
                                <Text style={{
                                    fontSize: 12,
                                    fontWeight: '700',
                                    color: selectedStatus === s ? '#fff' : subColor
                                }}>
                                    {s}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Cases list */}
                    {isLoading && !refreshing ? (
                        <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                            <ActivityIndicator size="large" color="#6366f1" />
                        </View>
                    ) : filteredCases.length === 0 ? (
                        <View
                            style={{
                                alignItems: 'center',
                                paddingVertical: 80,
                                borderRadius: 32,
                                borderWidth: 1,
                                borderColor,
                                backgroundColor: cardBg,
                            }}
                        >
                            <View
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 28,
                                    backgroundColor: isDark ? 'rgba(99,102,241,0.1)' : '#eef2ff',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 20,
                                }}
                            >
                                <FolderOpen size={36} color={isDark ? '#4f46e5' : '#6366f1'} />
                            </View>
                            <Text style={{ fontSize: 18, fontWeight: '900', color: textColor, marginBottom: 8 }}>
                                No Cases Found
                            </Text>
                            <Text
                                style={{
                                    fontSize: 14,
                                    color: subColor,
                                    textAlign: 'center',
                                    paddingHorizontal: 32,
                                    lineHeight: 22,
                                }}
                            >
                                {searchQuery || selectedStatus !== 'All'
                                    ? 'No cases matched your search or filter.'
                                    : 'No cases are available at this time.'}
                            </Text>
                        </View>
                    ) : (
                        filteredCases.map((item: any) => (
                            <CaseCard
                                key={item.id}
                                item={item}
                                isDark={isDark}
                                onPress={() =>
                                    router.push(`/(screens)/case-details/${item.id}` as any)
                                }
                            />
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { ToothData } from '../../../types/caseTypes';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { Info, X } from 'lucide-react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';

// Basic color mapping
export function getToothStatusColor(status: string) {
    switch (status) {
        case "healthy": return { fill: "#f8fafc", stroke: "#cbd5e1", label: "Healthy" };
        case "needs-treatment": return { fill: "#fef2f2", stroke: "#ef4444", label: "Needs Treatment" };
        case "in-progress": return { fill: "#fefce8", stroke: "#eab308", label: "In Progress" };
        case "treated": return { fill: "#f0fdf4", stroke: "#22c55e", label: "Treated" };
        default: return { fill: "#f8fafc", stroke: "#cbd5e1", label: "Healthy" };
    }
}

const TOP_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const TOP_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
const BOTTOM_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];
const BOTTOM_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];

interface NativeOdontogramProps {
    initialTeeth: ToothData[];
    readonly?: boolean;
    status?: string;
}

export default function NativeOdontogram({ initialTeeth, readonly = false, status }: NativeOdontogramProps) {
    const { theme } = useThemeLanguage();
    const isDark = theme === "dark";

    const [teeth, setTeeth] = useState<ToothData[]>(initialTeeth);
    const [selectedToothNum, setSelectedToothNum] = useState<number | null>(null);

    const isDiagnosisActive = status === "diagnosis" && !readonly;

    const handleUpdateTooth = (num: number, updates: Partial<ToothData>) => {
        if (!isDiagnosisActive) return;
        setTeeth((prev) => {
            const exists = prev.find((t) => t.number === num);
            if (exists) {
                return prev.map((t) => t.number === num ? { ...t, ...updates } : t);
            }
            return [...prev, { number: num, status: "needs-treatment", ...updates } as ToothData];
        });
    };

    const renderToothGrid = (numbers: number[]) => {
        return (
            <View className="flex-row flex-wrap justify-center gap-2">
                {numbers.map((num) => {
                    const tooth = teeth.find(t => t.number === num) || { number: num, status: 'healthy' };
                    const isSelected = selectedToothNum === num;
                    const colors = getToothStatusColor(tooth.status);

                    return (
                        <TouchableOpacity
                            key={num}
                            onPress={() => setSelectedToothNum(isSelected ? null : num)}
                            style={{
                                width: 30,
                                alignItems: 'center',
                                gap: 4,
                                paddingVertical: 2,
                                opacity: isSelected ? 1 : 0.85
                            }}
                        >
                            <View style={{ width: 26, height: 26, justifyContent: 'center', alignItems: 'center' }}>
                                <MaterialCommunityIcons 
                                    name="tooth" 
                                    size={28} 
                                    color={isDark && tooth.status === 'healthy' ? '#1e293b' : colors.fill} 
                                    style={{ position: 'absolute' }} 
                                />
                                <MaterialCommunityIcons 
                                    name="tooth-outline" 
                                    size={28} 
                                    color={isSelected ? '#4f46e5' : isDark && tooth.status === 'healthy' ? '#475569' : colors.stroke} 
                                    style={{ position: 'absolute' }} 
                                />
                            </View>
                            <Text style={{
                                fontSize: 10,
                                fontWeight: isSelected ? '800' : '600',
                                color: isSelected ? '#4f46e5' : isDark && tooth.status === 'healthy' ? '#94a3b8' : colors.stroke
                            }}>
                                {num}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    const selectedTooth = selectedToothNum ? teeth.find(t => t.number === selectedToothNum) || { number: selectedToothNum, status: 'healthy' } : null;

    return (
        <View className="flex-1">
            {/* Header / Legend */}
            <View className="flex-row items-center justify-between flex-wrap gap-3 mb-6">
                <View className="flex-row items-center gap-2.5">
                    <View className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 items-center justify-center">
                        <Info size={20} color={isDark ? '#818cf8' : '#4f46e5'} />
                    </View>
                    <View>
                        <Text className="text-sm font-bold text-slate-800 dark:text-white">
                            {readonly ? "Diagnosis Chart" : "Interactive Chart"}
                        </Text>
                        <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {readonly ? "View-only mode" : "Select a tooth to edit"}
                        </Text>
                    </View>
                </View>

                {/* Legend */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                    {(['healthy', 'needs-treatment', 'in-progress', 'treated'] as const).map(s => {
                        const c = getToothStatusColor(s);
                        return (
                            <View key={s} className="flex-row items-center gap-2">
                                <View style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: isDark && s==='healthy' ? '#1e293b' : c.fill, borderWidth: 1, borderColor: isDark && s==='healthy' ? '#334155' : c.stroke }} />
                                <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">{c.label}</Text>
                            </View>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Arches */}
            <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-6">
                <View className="mb-6">
                    <Text className="text-center text-xs font-bold text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest">Maxillary (Upper)</Text>
                    <View className="flex-row justify-center gap-3">
                        <View className="flex-1 items-end">{renderToothGrid(TOP_RIGHT)}</View>
                        <View className="w-px bg-slate-200 dark:bg-slate-800" />
                        <View className="flex-1 items-start">{renderToothGrid(TOP_LEFT)}</View>
                    </View>
                </View>

                <View>
                    <View className="flex-row justify-center gap-3 mb-3">
                        <View className="flex-1 items-end">{renderToothGrid(BOTTOM_RIGHT)}</View>
                        <View className="w-px bg-slate-200 dark:bg-slate-800" />
                        <View className="flex-1 items-start">{renderToothGrid(BOTTOM_LEFT)}</View>
                    </View>
                    <Text className="text-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Mandibular (Lower)</Text>
                </View>
            </View>

            {/* Diagnostic Details / Edit Panel */}
            {selectedTooth && (
                <View className="bg-indigo-50 dark:bg-slate-900/50 border border-indigo-100 dark:border-slate-800 rounded-2xl p-5 mb-8">
                    <View className="flex-row justify-between items-center mb-4">
                        <View className="flex-row items-center gap-3">
                            <View style={{
                                width: 36, height: 36, borderRadius: 10,
                                backgroundColor: getToothStatusColor(selectedTooth.status).fill,
                                borderColor: getToothStatusColor(selectedTooth.status).stroke,
                                borderWidth: 1, justifyContent: 'center', alignItems: 'center'
                            }}>
                                <Text style={{ fontSize: 14, fontWeight: 'bold', color: getToothStatusColor(selectedTooth.status).stroke }}>{selectedTooth.number}</Text>
                            </View>
                            <Text className="text-base font-bold text-slate-800 dark:text-white">Tooth #{selectedTooth.number}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setSelectedToothNum(null)} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 items-center justify-center">
                            <X size={16} color={isDark ? '#94a3b8' : '#64748b'} />
                        </TouchableOpacity>
                    </View>

                    {isDiagnosisActive ? (
                        <View className="space-y-4">
                            {/* Status Radios */}
                            <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Status</Text>
                            <View className="flex-row flex-wrap gap-2 mb-4">
                                {(['healthy', 'needs-treatment', 'in-progress', 'treated'] as const).map(s => {
                                    const isSel = selectedTooth.status === s;
                                    const c = getToothStatusColor(s);
                                    return (
                                        <TouchableOpacity
                                            key={s}
                                            onPress={() => handleUpdateTooth(selectedTooth.number, { status: s })}
                                            style={{
                                                paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
                                                backgroundColor: isSel ? c.fill : isDark ? '#1e293b' : '#ffffff',
                                                borderColor: isSel ? c.stroke : isDark ? '#334155' : '#e2e8f0',
                                                borderWidth: 1,
                                            }}
                                        >
                                            <Text style={{ fontSize: 12, fontWeight: isSel ? '700' : '500', color: isSel ? c.stroke : isDark ? '#cbd5e1' : '#64748b' }}>
                                                {c.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {selectedTooth.status !== 'healthy' && (
                                <>
                                    <View>
                                        <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Treatment Type</Text>
                                        <TextInput
                                            placeholder="e.g. Root Canal, Extraction..."
                                            placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
                                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white"
                                            value={selectedTooth.treatmentType || ''}
                                            onChangeText={(t) => handleUpdateTooth(selectedTooth.number, { treatmentType: t })}
                                        />
                                    </View>
                                    <View>
                                        <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 mt-4">Notes</Text>
                                        <TextInput
                                            placeholder="Add specific details or surfaces..."
                                            placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
                                            multiline
                                            numberOfLines={3}
                                            textAlignVertical="top"
                                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white min-h-[80px]"
                                            value={selectedTooth.notes || ''}
                                            onChangeText={(t) => handleUpdateTooth(selectedTooth.number, { notes: t })}
                                        />
                                    </View>
                                </>
                            )}
                        </View>
                    ) : (
                        <View className="bg-white dark:bg-slate-800/80 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                            <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Status: {getToothStatusColor(selectedTooth.status).label}</Text>
                            {selectedTooth.treatmentType && <Text className="text-xs text-slate-600 dark:text-slate-400 mt-2"><Text className="font-bold">Treatment:</Text> {selectedTooth.treatmentType}</Text>}
                            {selectedTooth.notes && <Text className="text-xs text-slate-600 dark:text-slate-400 mt-2"><Text className="font-bold">Notes:</Text> {selectedTooth.notes}</Text>}
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}

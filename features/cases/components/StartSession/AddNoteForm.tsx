import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Send, Lock, Globe, ImageIcon, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useDispatch } from 'react-redux';
import { showToast } from '@/store/slices/uiSlice';

interface AddNoteFormProps {
    onSubmit: (note: string, isPrivate: boolean, imageUrl?: string) => Promise<void>;
    isLoading: boolean;
    isDark?: boolean;
}

export default function AddNoteForm({ onSubmit, isLoading, isDark = false }: AddNoteFormProps) {
    const [note, setNote] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [showImageField, setShowImageField] = useState(false);
    const dispatch = useDispatch();

    const canSubmit = note.trim().length > 0 && !isLoading;

    const handleSubmit = async () => {
        if (!canSubmit) return;
        try {
            await onSubmit(note.trim(), isPrivate, imageUrl.trim() || undefined);
            setNote("");
            setImageUrl("");
            setShowImageField(false);
            dispatch(showToast({ message: "Note added successfully", type: "success" }));
        } catch (error: any) {
            console.error("Failed to add note:", error);
            const msg = error.response?.data?.message || error.message || "Failed to add session note";
            dispatch(showToast({ message: msg, type: "error" }));
        }
    };

    return (
        <View className={`rounded-2xl border p-4 sm:p-5 shadow-sm space-y-4 ${
            isDark ? 'bg-slate-800/70 border-slate-700/60' : 'bg-white border-slate-200'
        }`}>
            {/* Label */}
            <View className="flex-row items-center gap-2 mb-3">
                <Send size={14} color="#6366f1" />
                <Text className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    Add Clinical Note
                </Text>
            </View>

            {/* Textarea */}
            <TextInput
                placeholder="Write your clinical observations, treatment notes, or findings..."
                placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className={`text-sm min-h-[80px] rounded-xl border p-3 ${
                    isDark 
                        ? 'bg-slate-900/50 border-slate-700 text-slate-200 focus:border-indigo-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-400'
                }`}
            />

            {/* Options Row */}
            <View className="flex-row items-center justify-between mt-3 mb-1">
                <View className="flex-row items-center gap-3">
                    {/* Privacy Toggle */}
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setIsPrivate(!isPrivate)}
                        className={`flex-row items-center gap-2 px-3 py-2 rounded-xl border ${
                            isPrivate
                                ? (isDark ? 'bg-rose-900/20 border-rose-800/40' : 'bg-rose-50 border-rose-200')
                                : (isDark ? 'bg-emerald-900/20 border-emerald-800/40' : 'bg-emerald-50 border-emerald-200')
                        }`}
                    >
                        {isPrivate ? (
                            <Lock size={12} color={isDark ? '#fb7185' : '#e11d48'} />
                        ) : (
                            <Globe size={12} color={isDark ? '#34d399' : '#059669'} />
                        )}
                        <Text className={`text-xs font-semibold ${
                            isPrivate
                                ? (isDark ? 'text-rose-400' : 'text-rose-600')
                                : (isDark ? 'text-emerald-400' : 'text-emerald-600')
                        }`}>
                            {isPrivate ? "Private Note" : "Public Note"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Image toggle */}
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setShowImageField(!showImageField)}
                    className="flex-row items-center gap-1.5 px-2 py-2"
                >
                    <ImageIcon size={13} color={isDark ? '#94a3b8' : '#64748b'} />
                    <Text className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Attach Image
                    </Text>
                    {showImageField ? (
                        <ChevronUp size={12} color={isDark ? '#94a3b8' : '#64748b'} />
                    ) : (
                        <ChevronDown size={12} color={isDark ? '#94a3b8' : '#64748b'} />
                    )}
                </TouchableOpacity>
            </View>

            {/* Image URL Field */}
            {showImageField && (
                <View className="mt-2 mb-2">
                    <TextInput
                        placeholder="Paste image URL here..."
                        placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                        value={imageUrl}
                        onChangeText={setImageUrl}
                        className={`text-sm px-3 py-2.5 rounded-xl border ${
                            isDark
                                ? 'bg-slate-900/50 border-slate-700 text-slate-300'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
                activeOpacity={0.8}
                disabled={!canSubmit}
                onPress={handleSubmit}
                className={`w-full flex-row items-center justify-center gap-2 py-3 mt-2 rounded-xl shadow-md ${
                    canSubmit ? 'bg-indigo-600 shadow-indigo-500/30' : (isDark ? 'bg-indigo-900/50 shadow-none' : 'bg-indigo-300 shadow-none')
                }`}
            >
                {isLoading ? (
                    <>
                        <ActivityIndicator size="small" color="#ffffff" />
                        <Text className="text-sm font-semibold text-white">Saving Note...</Text>
                    </>
                ) : (
                    <>
                        <Send size={15} color="#ffffff" />
                        <Text className="text-sm font-semibold text-white">Add Note</Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
}

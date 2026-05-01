import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { Lock, Globe, ImageIcon } from 'lucide-react-native';

interface SessionNoteItem {
    id: string;
    note: string;
    isPrivate: boolean;
    imageUrl?: string;
    createAt: string;
}

interface NoteCardProps {
    note: SessionNoteItem;
    index: number;
    isDark?: boolean;
}

export default function NoteCard({ note, index, isDark = false }: NoteCardProps) {
    const time = new Date(note.createAt).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    return (
        <View className="relative">
            <View className="flex-row gap-3">
                {/* Timeline dot */}
                <View className="relative z-10 mt-1">
                    <View className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                        note.isPrivate
                            ? (isDark ? "bg-rose-900" : "bg-rose-500")
                            : (isDark ? "bg-indigo-900" : "bg-indigo-500")
                    }`}>
                        <Text className="text-white text-xs font-bold">{index + 1}</Text>
                    </View>
                </View>

                {/* Note content */}
                <View className="flex-1 pb-5">
                    <View className={`rounded-2xl border p-4 shadow-sm ${
                        isDark ? 'bg-slate-800/70 border-slate-700/60' : 'bg-white border-slate-100'
                    }`}>
                        {/* Header */}
                        <View className="flex-row items-center justify-between mb-2.5">
                            <View className="flex-row items-center gap-2">
                                <View className={`flex-row items-center gap-1 px-2 py-0.5 rounded-md ${
                                    note.isPrivate
                                        ? "bg-rose-50 dark:bg-rose-900/20"
                                        : "bg-emerald-50 dark:bg-emerald-900/20"
                                }`}>
                                    {note.isPrivate ? (
                                        <Lock size={9} color={isDark ? '#fb7185' : '#e11d48'} />
                                    ) : (
                                        <Globe size={9} color={isDark ? '#34d399' : '#059669'} />
                                    )}
                                    <Text className={`text-[10px] font-bold uppercase tracking-wider ${
                                        note.isPrivate
                                            ? (isDark ? "text-rose-400" : "text-rose-600")
                                            : (isDark ? "text-emerald-400" : "text-emerald-600")
                                    }`}>
                                        {note.isPrivate ? "Private" : "Public"}
                                    </Text>
                                </View>
                            </View>
                            <Text className={`text-[11px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                {time}
                            </Text>
                        </View>

                        {/* Body */}
                        <Text className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {note.note}
                        </Text>

                        {/* Image */}
                        {note.imageUrl && (
                            <TouchableOpacity 
                                activeOpacity={0.7}
                                onPress={() => Linking.openURL(note.imageUrl!)}
                                className={`mt-3 flex-row items-center gap-2 rounded-lg px-3 py-2 border ${
                                    isDark ? 'bg-indigo-900/10 border-indigo-800/30' : 'bg-indigo-50 border-indigo-100'
                                }`}
                            >
                                <ImageIcon size={13} color={isDark ? '#818cf8' : '#6366f1'} />
                                <Text className={`text-xs font-medium ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`} numberOfLines={1}>
                                    View attached image
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
}

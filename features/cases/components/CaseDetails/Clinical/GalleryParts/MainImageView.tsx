import React from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import { ChevronLeft, ChevronRight, ImageIcon, Expand } from 'lucide-react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

interface MainImageViewProps {
    images: string[];
    activeIndex: number;
    compact: boolean;
    onIndexChange: (index: number) => void;
    onFullscreenOpen: () => void;
}

export default function MainImageView({ images, activeIndex, compact, onIndexChange, onFullscreenOpen }: MainImageViewProps) {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';

    return (
        <View className={`w-full rounded-2xl overflow-hidden border relative ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'} ${compact ? 'aspect-[4/3]' : 'aspect-square'}`}>
            <Image
                source={{ uri: images[activeIndex] }}
                className="w-full h-full"
                resizeMode="cover"
            />

            {/* Fullscreen Button */}
            <TouchableOpacity
                onPress={onFullscreenOpen}
                activeOpacity={0.8}
                className={`absolute top-3 right-3 w-9 h-9 rounded-xl border items-center justify-center shadow-lg ${isDark ? 'bg-slate-800/90 border-slate-700/50' : 'bg-white/90 border-white/50'}`}
            >
                <Expand size={14} color={isDark ? '#cbd5e1' : '#334155'} />
            </TouchableOpacity>

            {/* Nav Arrows */}
            {images.length > 1 && (
                <>
                    <TouchableOpacity
                        onPress={() => onIndexChange((activeIndex - 1 + images.length) % images.length)}
                        activeOpacity={0.8}
                        className={`absolute left-3 top-1/2 -mt-4 w-8 h-8 rounded-xl border items-center justify-center shadow-md ${isDark ? 'bg-slate-800/80 border-slate-700/40' : 'bg-white/80 border-white/40'}`}
                    >
                        <ChevronLeft size={14} color={isDark ? '#cbd5e1' : '#334155'} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        onPress={() => onIndexChange((activeIndex + 1) % images.length)}
                        activeOpacity={0.8}
                        className={`absolute right-3 top-1/2 -mt-4 w-8 h-8 rounded-xl border items-center justify-center shadow-md ${isDark ? 'bg-slate-800/80 border-slate-700/40' : 'bg-white/80 border-white/40'}`}
                    >
                        <ChevronRight size={14} color={isDark ? '#cbd5e1' : '#334155'} />
                    </TouchableOpacity>
                </>
            )}

            {/* Counter pill */}
            <View className="absolute bottom-3 left-3 flex-row items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg">
                <ImageIcon size={11} color="#ffffff" />
                <Text className="text-white text-[11px] font-semibold">
                    {activeIndex + 1} / {images.length}
                </Text>
            </View>
        </View>
    );
}

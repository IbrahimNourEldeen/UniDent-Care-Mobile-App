import React from 'react';
import { ScrollView, TouchableOpacity, Image } from 'react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

interface ThumbnailStripProps {
    images: string[];
    activeIndex: number;
    onIndexChange: (index: number) => void;
}

export default function ThumbnailStrip({ images, activeIndex, onIndexChange }: ThumbnailStripProps) {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';

    if (images.length <= 1) return null;

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 4, gap: 8 }}>
            {images.map((src, i) => {
                const isActive = i === activeIndex;
                
                return (
                    <TouchableOpacity
                        key={i}
                        activeOpacity={0.7}
                        onPress={() => onIndexChange(i)}
                        className={`w-[60px] h-[60px] sm:w-[68px] sm:h-[68px] rounded-xl overflow-hidden border-2 
                        ${isActive 
                            ? (isDark ? 'border-indigo-400' : 'border-indigo-500') 
                            : (isDark ? 'border-slate-700 opacity-60' : 'border-slate-200/80 opacity-60')
                        }`}
                    >
                        <Image source={{ uri: src }} className="w-full h-full" resizeMode="cover" />
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}

import React from 'react';
import { Modal, View, TouchableOpacity, Image, Dimensions } from 'react-native';
import { X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';

interface FullscreenImageModalProps {
    isOpen: boolean;
    images: string[];
    activeIndex: number;
    onClose: () => void;
    onIndexChange: (index: number) => void;
}

export default function FullscreenImageModal({ isOpen, images, activeIndex, onClose, onIndexChange }: FullscreenImageModalProps) {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';
    const { width, height } = Dimensions.get('window');

    if (!isOpen) return null;

    return (
        <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
            <View className="flex-1 bg-black/90 items-center justify-center">
                {/* Close Button */}
                <TouchableOpacity
                    onPress={onClose}
                    className="absolute top-10 right-5 z-50 w-10 h-10 rounded-full bg-white/10 items-center justify-center"
                >
                    <X size={20} color="#ffffff" />
                </TouchableOpacity>

                {/* Left Arrow */}
                {images.length > 1 && (
                    <TouchableOpacity
                        onPress={() => onIndexChange((activeIndex - 1 + images.length) % images.length)}
                        className="absolute left-4 z-50 w-11 h-11 rounded-full bg-white/10 items-center justify-center"
                    >
                        <ChevronLeft size={24} color="#ffffff" />
                    </TouchableOpacity>
                )}

                {/* Right Arrow */}
                {images.length > 1 && (
                    <TouchableOpacity
                        onPress={() => onIndexChange((activeIndex + 1) % images.length)}
                        className="absolute right-4 z-50 w-11 h-11 rounded-full bg-white/10 items-center justify-center"
                    >
                        <ChevronRight size={24} color="#ffffff" />
                    </TouchableOpacity>
                )}

                {/* Image */}
                <Image
                    source={{ uri: images[activeIndex] }}
                    style={{ width: width * 0.9, height: height * 0.8 }}
                    resizeMode="contain"
                />

                {/* Indicators */}
                <View className="absolute bottom-10 flex-row items-center justify-center gap-2">
                    {images.map((_, i) => (
                        <TouchableOpacity
                            key={i}
                            onPress={() => onIndexChange(i)}
                            className={`rounded-full h-2 ${i === activeIndex ? 'w-5 bg-white' : 'w-2 bg-white/40'}`}
                        />
                    ))}
                </View>
            </View>
        </Modal>
    );
}

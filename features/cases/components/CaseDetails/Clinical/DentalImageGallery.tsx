import { Layers } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface DentalImageGalleryProps {
    images: string[];
    isDark?: boolean;
}

export default function DentalImageGallery({ images, isDark = false }: DentalImageGalleryProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const textClass = isDark ? 'text-white' : 'text-slate-900';
    const subTextClass = isDark ? 'text-slate-400' : 'text-slate-500';

    if (!images || images.length === 0) {
        return (
            <View className={`rounded-3xl p-8 items-center justify-center border border-dashed ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-300 bg-white/50'} mb-8`}>
                <Layers size={36} color={isDark ? '#475569' : '#cbd5e1'} />
                <Text className={`mt-4 font-bold ${textClass}`}>No Images</Text>
                <Text className={`mt-1 text-xs text-center ${subTextClass}`}>There are no clinical images attached to this case yet.</Text>
            </View>
        );
    }

    return (
        <View className="mb-8 px-5">
            <View className="flex-row items-center justify-between mb-4">
                <Text className={`font-black text-lg tracking-tight ${textClass}`}>Clinical Images</Text>
                <View className={`px-2.5 py-1 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                    <Text className={`text-[10px] font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {images.length} Files
                    </Text>
                </View>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 20 }}>
                {images.map((url, i) => (
                    <TouchableOpacity key={i} onPress={() => setSelectedImage(url)} activeOpacity={0.8}>
                        <View className={`w-36 h-36 rounded-3xl overflow-hidden border-2 ${isDark ? 'border-slate-800' : 'border-white'} shadow-sm bg-slate-200 dark:bg-slate-800`}>
                            <Image source={{ uri: url }} className="w-full h-full" resizeMode="cover" />
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Modal visible={!!selectedImage} transparent animationType="fade" onRequestClose={() => setSelectedImage(null)}>
                <Pressable className="flex-1 bg-black/95 justify-center items-center" onPress={() => setSelectedImage(null)}>
                    {selectedImage && <Image source={{ uri: selectedImage }} className="w-full h-4/5" resizeMode="contain" />}
                    <View className="absolute bottom-10 py-3 px-6 bg-white/10 rounded-full border border-white/20">
                        <Text className="text-white text-xs font-bold tracking-widest uppercase">Tap anywhere to close</Text>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

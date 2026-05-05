import React, { useState } from 'react';
import { View } from 'react-native';
import EmptyGalleryState from './GalleryParts/EmptyGalleryState';
import MainImageView from './GalleryParts/MainImageView';
import ThumbnailStrip from './GalleryParts/ThumbnailStrip';
import FullscreenImageModal from './GalleryParts/FullscreenImageModal';

interface DentalImageGalleryProps {
    images: string[];
    compact?: boolean;
}

export default function DentalImageGallery({ images, compact = false }: DentalImageGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    if (!images || images.length === 0) {
        return <EmptyGalleryState />;
    }

    return (
        <View>
            <View className="space-y-3">
                <MainImageView
                    images={images}
                    activeIndex={activeIndex}
                    compact={compact}
                    onIndexChange={setActiveIndex}
                    onFullscreenOpen={() => setIsFullscreen(true)}
                />

                <ThumbnailStrip
                    images={images}
                    activeIndex={activeIndex}
                    onIndexChange={setActiveIndex}
                />
            </View>

            <FullscreenImageModal
                isOpen={isFullscreen}
                images={images}
                activeIndex={activeIndex}
                onClose={() => setIsFullscreen(false)}
                onIndexChange={setActiveIndex}
            />
        </View>
    );
}

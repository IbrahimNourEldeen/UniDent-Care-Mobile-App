import React from 'react';
import { View } from 'react-native';
import { Star } from 'lucide-react-native';

interface StarRowProps {
    grade: number; // 0–20
    size?: number;
}

/**
 * Displays 1–5 filled/empty stars based on a grade out of 20.
 * Mirrors the web project's StarRow component.
 */
export default function StarRow({ grade, size = 12 }: StarRowProps) {
    const filled = Math.round((grade / 20) * 5);

    return (
        <View style={{ flexDirection: 'row', gap: 2, alignItems: 'center' }}>
            {Array.from({ length: 5 }, (_, i) => (
                <Star
                    key={i}
                    size={size}
                    color={i < filled ? '#f59e0b' : '#cbd5e1'}
                    fill={i < filled ? '#f59e0b' : 'transparent'}
                />
            ))}
        </View>
    );
}

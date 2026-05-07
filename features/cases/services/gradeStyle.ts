/**
 * Returns colour/label tokens for a session grade (0–20).
 * Mirrors the same logic used in the web project.
 */
export function gradeStyle(grade: number) {
    const pct = (grade / 20) * 100;

    if (pct >= 85)
        return {
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            bar: 'bg-emerald-400',
            // Native colours
            colorHex: '#059669',
            bgHex: '#d1fae5',
            borderHex: '#6ee7b7',
            label: 'Excellent',
        };
    if (pct >= 70)
        return {
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            bar: 'bg-blue-400',
            colorHex: '#2563eb',
            bgHex: '#dbeafe',
            borderHex: '#93c5fd',
            label: 'Good',
        };
    if (pct >= 50)
        return {
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            bar: 'bg-amber-400',
            colorHex: '#d97706',
            bgHex: '#fef3c7',
            borderHex: '#fcd34d',
            label: 'Satisfactory',
        };
    return {
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        bar: 'bg-red-400',
        colorHex: '#dc2626',
        bgHex: '#fee2e2',
        borderHex: '#fca5a5',
        label: 'Needs Work',
    };
}

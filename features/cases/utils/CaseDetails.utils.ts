

export function formatTimestamp(ts: string) {
    const d = new Date(ts);
    return {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
    };
}

type TabDef = { key: string; label: string };
export function getTabsForStatus(status: string): TabDef[] {
    switch (status) {
        case "Pending":
            return [
                { key: "odontogram", label: "Odontogram" },
                { key: "medical", label: "Medical Info" },
            ];
        case "Diagnosis":
            return [
                { key: "odontogram", label: "Odontogram" },
                { key: "medical", label: "Medical Info" },
            ];
        case "InProgress":
            return [
                { key: "odontogram", label: "Odontogram" },
                { key: "medical", label: "Medical Info" },
                { key: "timeline", label: "Timeline" },
            ];
        case "Completed":
            return [
                { key: "odontogram", label: "Odontogram" },
                { key: "medical", label: "Medical Info" },
                { key: "timeline", label: "Timeline" },
            ];
        default:
            return [
                { key: "odontogram", label: "Odontogram" },
                { key: "medical", label: "Medical Info" },
            ];
    }
}

export function getPatientStatusConfig(status: string | null | undefined) {
    switch (status) {
        case 'Pending':
            return {
                label: 'Unassigned',
                bg: 'bg-gray-100 dark:bg-gray-800',
                text: 'text-gray-600 dark:text-gray-300',
                dot: 'bg-gray-400 dark:bg-gray-500',
                border: 'border-gray-200 dark:border-gray-700',
                gradient: 'from-gray-400 to-gray-500',
            };
        case 'Diagnosis':
            return {
                label: 'Diagnosis',
                bg: 'bg-blue-50 dark:bg-blue-900/30',
                text: 'text-blue-600 dark:text-blue-400',
                dot: 'bg-blue-400 dark:bg-blue-500',
                border: 'border-blue-200 dark:border-blue-800',
                gradient: 'from-blue-400 to-blue-600',
            };
        case 'InProgress':
            return {
                label: 'In Progress',
                bg: 'bg-amber-50 dark:bg-amber-900/30',
                text: 'text-amber-600 dark:text-amber-400',
                dot: 'bg-amber-400 dark:bg-amber-500',
                border: 'border-amber-200 dark:border-amber-800',
                gradient: 'from-amber-400 to-orange-500',
            };
        case 'Completed':
            return {
                label: 'Completed',
                bg: 'bg-emerald-50 dark:bg-emerald-900/30',
                text: 'text-emerald-600 dark:text-emerald-400',
                dot: 'bg-emerald-400 dark:bg-emerald-500',
                border: 'border-emerald-200 dark:border-emerald-800',
                gradient: 'from-emerald-400 to-emerald-600',
            };
        case 'UnderReview':
            return {
                label: 'Under Review',
                bg: 'bg-purple-50 dark:bg-purple-900/30',
                text: 'text-purple-600 dark:text-purple-400',
                dot: 'bg-purple-400 dark:bg-purple-500',
                border: 'border-purple-200 dark:border-purple-800',
                gradient: 'from-purple-400 to-purple-600',
            };
        default:
            return {
                label: status as string,
                bg: 'bg-gray-100 dark:bg-gray-800',
                text: 'text-gray-600 dark:text-gray-300',
                dot: 'bg-gray-400 dark:bg-gray-500',
                border: 'border-gray-200 dark:border-gray-700',
                gradient: 'from-gray-400 to-gray-500',
            };
    }
}

export function getToothStatusColor(status: string) {
    switch (status) {
        case 'healthy': return { fill: '#e2e8f0', stroke: '#94a3b8', label: 'Healthy' };
        case 'needs-treatment': return { fill: '#fecaca', stroke: '#ef4444', label: 'Needs Treatment' };
        case 'in-progress': return { fill: '#fef08a', stroke: '#eab308', label: 'In Progress' };
        case 'treated': return { fill: '#bbf7d0', stroke: '#22c55e', label: 'Treated' };
    }
}

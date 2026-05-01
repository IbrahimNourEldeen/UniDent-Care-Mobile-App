import { Activity, FileText, MessageSquare, Stethoscope } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { formatTimestamp } from '../../../utils/CaseDetails.utils';

// We map event types to their colors and icons
function getEventConfig(type: string) {
    switch (type) {
        case "diagnosis":
            return { icon: Stethoscope, bgClass: "bg-violet-500", iconColor: "#ffffff" };
        case "treatment":
            return { icon: Activity, bgClass: "bg-blue-500", iconColor: "#ffffff" };
        case "note":
            return { icon: MessageSquare, bgClass: "bg-amber-500", iconColor: "#ffffff" };
        default:
            return { icon: FileText, bgClass: "bg-slate-400", iconColor: "#ffffff" };
    }
}

interface TimelineEvent {
    id: string;
    type: string;
    description: string;
    timestamp: string;
}

interface ActivityTimelineProps {
    events?: TimelineEvent[];
}

export default function ActivityTimeline({ events = [] }: ActivityTimelineProps) {
    const sorted = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <View className="space-y-4">
            <View className="mb-4">
                <Text className="text-sm font-semibold text-slate-800 dark:text-white">Activity Timeline</Text>
                <Text className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{events.length} events recorded</Text>
            </View>

            <ScrollView className="max-h-[400px]" showsVerticalScrollIndicator={false}>
                <View className="relative">
                    {/* Vertical line */}
                    {sorted.length > 0 && (
                        <View className="absolute left-[13px] top-4 bottom-4 w-0.5 bg-indigo-200 dark:bg-indigo-900/50" />
                    )}

                    <View className="space-y-0.5">
                        {sorted.map((event, i) => {
                            const cfg = getEventConfig(event.type);
                            const { date, time } = formatTimestamp(event.timestamp);
                            const Icon = cfg.icon;

                            return (
                                <View key={event.id} className="relative flex-row items-start gap-3.5 py-3">
                                    {/* Node */}
                                    <View className={`relative z-10 w-7 h-7 rounded-lg ${cfg.bgClass} items-center justify-center shadow-sm`}>
                                        <Icon size={13} color={cfg.iconColor} />
                                    </View>

                                    {/* Content */}
                                    <View className="flex-1 pt-0.5">
                                        <Text className="text-[13px] text-slate-700 dark:text-slate-300 leading-snug font-medium">
                                            {event.description}
                                        </Text>
                                        <Text className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                                            {date} · {time}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                        {sorted.length === 0 && (
                            <View className="py-8 items-center justify-center">
                                <Text className="text-sm text-slate-500 dark:text-slate-400">No activity recorded yet.</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

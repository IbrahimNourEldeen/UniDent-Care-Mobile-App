import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { 
  Activity, 
  Calendar, 
  CheckCircle2, 
  CalendarDays, 
  Clock, 
  User, 
  Filter, 
  SearchX, 
  History, 
  ClipboardList, 
  ChevronRight,
  AlertCircle
} from "lucide-react-native";

import api from "@/utils/api";
import { RootState } from "@/store/store";
import { useThemeLanguage } from "@/store/ThemeLanguageContext";

const { width } = Dimensions.get("window");

const StatsCards = ({ patientId }: { patientId: string }) => {
  const { theme } = useThemeLanguage();
  const isDark = theme === "dark";
  const [stats, setStats] = useState({ activeCases: 0, upcomingSessions: 0, completedTreatments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [sessionsRes, casesRes] = await Promise.all([
          api.get(`/Sessions/patient/${patientId}`, { params: { page: 1, pageSize: 100 } }),
          api.get(`/Cases/patient/${patientId}`)
        ]);
        const sessionsData = sessionsRes.data.data?.items || sessionsRes.data.data || [];
        const casesData = casesRes.data.data?.items || casesRes.data.data || [];

        setStats({
          upcomingSessions: sessionsData.filter((s: any) => s.status === "Scheduled").length,
          activeCases: casesData.filter((c: any) => c.status === "In Progress").length,
          completedTreatments: casesData.filter((c: any) => c.status === "Completed").length,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [patientId]);

  const items = [
    { label: "Active", value: stats.activeCases, icon: Activity, color: isDark ? "#60a5fa" : "#2563eb", bg: isDark ? "bg-blue-900/40" : "bg-blue-50" },
    { label: "Upcoming", value: stats.upcomingSessions, icon: Calendar, color: isDark ? "#c084fc" : "#9333ea", bg: isDark ? "bg-purple-900/40" : "bg-purple-50" },
    { label: "Completed", value: stats.completedTreatments, icon: CheckCircle2, color: isDark ? "#4ade80" : "#16a34a", bg: isDark ? "bg-green-900/40" : "bg-green-50" },
  ];

  return (
    <View className="flex-row justify-between mb-6">
      {items.map((item, i) => (
        <View key={i} className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none items-center`} style={{ width: width * 0.28 }}>
          <View className={`p-2 rounded-xl ${item.bg} mb-2`}>
            <item.icon size={20} color={item.color} />
          </View>
          <Text className="text-lg font-black text-slate-900 dark:text-white">{loading ? "..." : item.value}</Text>
          <Text className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{item.label}</Text>
        </View>
      ))}
    </View>
  );
};

// --- 2. مكون UpcomingAppointments ---
const UpcomingAppointments = ({ patientId }: { patientId: string }) => {
  const { theme } = useThemeLanguage();
  const isDark = theme === "dark";
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState("3");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get(`/Sessions/patient/${patientId}`);
        const data = res.data.data?.items || res.data.data || [];
        const scheduled = data.filter((s: any) => s.status === "Scheduled")
          .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
        setSessions(scheduled);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [patientId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
      time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  return (
    <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none mb-6">
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-lg font-black text-slate-900 dark:text-white">Upcoming</Text>
          <Text className="text-xs text-slate-500 dark:text-slate-400">Your next sessions</Text>
        </View>
        <View className="flex-row items-center bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-700">
          <Filter size={14} color={isDark ? "#94a3b8" : "#64748b"} />
          <TextInput 
            className="ml-1 text-xs font-bold w-6 text-slate-900 dark:text-white" 
            keyboardType="numeric" 
            value={limit} 
            onChangeText={setLimit}
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={isDark ? "#60a5fa" : "#2563eb"} />
      ) : sessions.length > 0 ? (
        sessions.slice(0, parseInt(limit) || 3).map((s) => {
          const { day, time } = formatDate(s.scheduledAt);
          return (
            <TouchableOpacity key={s.id} className="flex-row items-center bg-slate-50/50 dark:bg-slate-800 p-4 rounded-2xl mb-3 border border-slate-100 dark:border-slate-700">
              <View className="bg-blue-600 dark:bg-indigo-600 p-2 rounded-xl items-center justify-center mr-4 w-12 h-12">
                <Text className="text-white font-black text-xs text-center leading-3">{day.split(' ')[0]}{'\n'}{day.split(' ')[1]}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-bold text-slate-900 dark:text-white">{s.treatmentType}</Text>
                <View className="flex-row items-center mt-1">
                  <Clock size={12} color={isDark ? "#94a3b8" : "#64748b"} />
                  <Text className="text-xs text-slate-500 dark:text-slate-400 ml-1">{time}</Text>
                </View>
              </View>
              <ChevronRight size={18} color={isDark ? "#475569" : "#cbd5e1"} />
            </TouchableOpacity>
          );
        })
      ) : (
        <View className="items-center py-6">
          <SearchX color={isDark ? "#334155" : "#cbd5e1"} size={32} />
          <Text className="text-slate-400 dark:text-slate-500 text-xs mt-2">No appointments</Text>
        </View>
      )}
    </View>
  );
};

// --- 3. مكون RecentCases ---
const RecentCases = ({ patientId }: { patientId: string }) => {
  const { theme } = useThemeLanguage();
  const isDark = theme === "dark";
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await api.get(`/Cases/patient/${patientId}`);
        const data = res.data.data?.items || res.data.data || [];
        setCases(data.sort((a: any, b: any) => new Date(b.createAt).getTime() - new Date(a.createAt).getTime()));
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, [patientId]);

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed": return { bg: isDark ? "bg-green-900/40" : "bg-green-100", text: isDark ? "text-green-400" : "text-green-700", icon: <CheckCircle2 size={12} color={isDark ? "#4ade80" : "#15803d"} /> };
      case "in progress": return { bg: isDark ? "bg-blue-900/40" : "bg-blue-100", text: isDark ? "text-blue-400" : "text-blue-700", icon: <Clock size={12} color={isDark ? "#60a5fa" : "#1d4ed8"} /> };
      default: return { bg: isDark ? "bg-slate-800" : "bg-slate-100", text: isDark ? "text-slate-300" : "text-slate-700", icon: <AlertCircle size={12} color={isDark ? "#cbd5e1" : "#334155"} /> };
    }
  };

  return (
    <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none">
      <View className="flex-row items-center gap-3 mb-5">
        <View className="p-2 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl">
          <History size={20} color={isDark ? "#818cf8" : "#4f46e5"} />
        </View>
        <Text className="text-lg font-black text-slate-900 dark:text-white">Recent History</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={isDark ? "#818cf8" : "#4f46e5"} />
      ) : cases.length > 0 ? (
        cases.slice(0, 5).map((c) => {
          const style = getStatusStyles(c.status);
          return (
            <View key={c.id} className="flex-row items-center justify-between mb-4 pb-4 border-b border-slate-50 dark:border-slate-800/50">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 items-center justify-center mr-3">
                  <ClipboardList size={18} color={isDark ? "#64748b" : "#94a3b8"} />
                </View>
                <View>
                  <Text className="font-bold text-slate-800 dark:text-slate-200 text-sm" numberOfLines={1}>General Case #{c.id.slice(-4)}</Text>
                  <Text className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(c.createAt).toLocaleDateString()}</Text>
                </View>
              </View>
              <View className={`${style.bg} px-3 py-1 rounded-full flex-row items-center gap-1`}>
                {style.icon}
                <Text className={`text-[10px] font-black uppercase ${style.text}`}>{c.status}</Text>
              </View>
            </View>
          );
        })
      ) : (
        <Text className="text-center text-slate-400 dark:text-slate-500 py-4">No history found</Text>
      )}
    </View>
  );
};

export default function PatientDashboardScreen() {
  const patientId = useSelector((state: RootState) => state.auth.user?.publicId);
  const { theme } = useThemeLanguage();
  const isDark = theme === "dark";

  if (!patientId) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 dark:bg-slate-950">
        <ActivityIndicator size="large" color={isDark ? "#60a5fa" : "#2563eb"} />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="mb-8">
          <Text className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-widest">Dashboard</Text>
          <Text className="text-3xl font-black text-slate-900 dark:text-white">Health Overview</Text>
        </View>

        {/* Stats Section */}
        <StatsCards patientId={patientId} />

        {/* Appointments Section */}
        <UpcomingAppointments patientId={patientId} />

        {/* History Section */}
        <RecentCases patientId={patientId} />

      </ScrollView>
    </SafeAreaView>
  );
}
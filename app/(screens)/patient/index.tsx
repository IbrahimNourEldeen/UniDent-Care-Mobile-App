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

const { width } = Dimensions.get("window");

const StatsCards = ({ patientId }: { patientId: string }) => {
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
    { label: "Active", value: stats.activeCases, icon: Activity, color: "#2563eb", bg: "bg-blue-50" },
    { label: "Upcoming", value: stats.upcomingSessions, icon: Calendar, color: "#9333ea", bg: "bg-purple-50" },
    { label: "Completed", value: stats.completedTreatments, icon: CheckCircle2, color: "#16a34a", bg: "bg-green-50" },
  ];

  return (
    <View className="flex-row justify-between mb-6">
      {items.map((item, i) => (
        <View key={i} className={`p-4 rounded-2xl bg-white border border-slate-100 shadow-sm items-center`} style={{ width: width * 0.28 }}>
          <View className={`p-2 rounded-xl ${item.bg} mb-2`}>
            <item.icon size={20} color={item.color} />
          </View>
          <Text className="text-lg font-black text-slate-900">{loading ? "..." : item.value}</Text>
          <Text className="text-[10px] font-bold text-slate-500 uppercase">{item.label}</Text>
        </View>
      ))}
    </View>
  );
};

// --- 2. مكون UpcomingAppointments ---
const UpcomingAppointments = ({ patientId }: { patientId: string }) => {
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
    <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-6">
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-lg font-black text-slate-900">Upcoming</Text>
          <Text className="text-xs text-slate-500">Your next sessions</Text>
        </View>
        <View className="flex-row items-center bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
          <Filter size={14} color="#64748b" />
          <TextInput 
            className="ml-1 text-xs font-bold w-6" 
            keyboardType="numeric" 
            value={limit} 
            onChangeText={setLimit}
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color="#2563eb" />
      ) : sessions.length > 0 ? (
        sessions.slice(0, parseInt(limit) || 3).map((s) => {
          const { day, time } = formatDate(s.scheduledAt);
          return (
            <TouchableOpacity key={s.id} className="flex-row items-center bg-slate-50/50 p-4 rounded-2xl mb-3 border border-slate-100">
              <View className="bg-blue-600 p-2 rounded-xl items-center justify-center mr-4 w-12 h-12">
                <Text className="text-white font-black text-xs text-center leading-3">{day.split(' ')[0]}{'\n'}{day.split(' ')[1]}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-bold text-slate-900">{s.treatmentType}</Text>
                <View className="flex-row items-center mt-1">
                  <Clock size={12} color="#64748b" />
                  <Text className="text-xs text-slate-500 ml-1">{time}</Text>
                </View>
              </View>
              <ChevronRight size={18} color="#cbd5e1" />
            </TouchableOpacity>
          );
        })
      ) : (
        <View className="items-center py-6">
          <SearchX color="#cbd5e1" size={32} />
          <Text className="text-slate-400 text-xs mt-2">No appointments</Text>
        </View>
      )}
    </View>
  );
};

// --- 3. مكون RecentCases ---
const RecentCases = ({ patientId }: { patientId: string }) => {
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
      case "completed": return { bg: "bg-green-100", text: "text-green-700", icon: <CheckCircle2 size={12} color="#15803d" /> };
      case "in progress": return { bg: "bg-blue-100", text: "text-blue-700", icon: <Clock size={12} color="#1d4ed8" /> };
      default: return { bg: "bg-slate-100", text: "text-slate-700", icon: <AlertCircle size={12} color="#334155" /> };
    }
  };

  return (
    <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
      <View className="flex-row items-center gap-3 mb-5">
        <View className="p-2 bg-indigo-50 rounded-xl">
          <History size={20} color="#4f46e5" />
        </View>
        <Text className="text-lg font-black text-slate-900">Recent History</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#4f46e5" />
      ) : cases.length > 0 ? (
        cases.slice(0, 5).map((c) => {
          const style = getStatusStyles(c.status);
          return (
            <View key={c.id} className="flex-row items-center justify-between mb-4 pb-4 border-b border-slate-50">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center mr-3">
                  <ClipboardList size={18} color="#94a3b8" />
                </View>
                <View>
                  <Text className="font-bold text-slate-800 text-sm" numberOfLines={1}>General Case #{c.id.slice(-4)}</Text>
                  <Text className="text-[10px] text-slate-400">{new Date(c.createAt).toLocaleDateString()}</Text>
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
        <Text className="text-center text-slate-400 py-4">No history found</Text>
      )}
    </View>
  );
};

export default function PatientDashboardScreen() {
  const patientId = useSelector((state: RootState) => state.auth.user?.publicId);

  if (!patientId) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="mb-8">
          <Text className="text-slate-500 font-bold text-sm uppercase tracking-widest">Dashboard</Text>
          <Text className="text-3xl font-black text-slate-900">Health Overview</Text>
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
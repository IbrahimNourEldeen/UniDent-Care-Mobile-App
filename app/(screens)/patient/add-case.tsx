import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  Dimensions,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Plus,
  Calendar,
  Clock,
  ArrowRight,
  MessageSquare,
  Sparkles
} from "lucide-react-native";

import { RootState } from "@/store/store";
import { useThemeLanguage } from "@/store/ThemeLanguageContext";
import { getConversations, getConversationDetails } from "@/features/chat/services/chatService";

const { width } = Dimensions.get('window');

interface Conversation {
  id: string;
  lastMessage: string;
  createdAt: string;
  patientId: string;
}

interface ConversationDetail {
  id: string;
  messages: {
    sender: string;
    content: string;
    createdAt: string;
  }[];
}

export default function PatientConversationsScreen() {
  const { theme, language } = useThemeLanguage();
  const insets = useSafeAreaInsets();
  const isDark = theme === "dark";
  const isRtl = language === "ar";
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<ConversationDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const res = await getConversations();
      setConversations(res.data || res || []);
    } catch (err) {
      console.error("Fetch conversations error", err);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [])
  );

  const handleSelectConversation = async (id: string) => {
    setIsDetailLoading(true);
    try {
      const res = await getConversationDetails(id);
      const data = res.data || res;
      if (Array.isArray(data)) {
        setSelectedConversation({ id, messages: data });
      } else {
        setSelectedConversation(data);
      }
    } catch (err) {
      console.error("Fetch conversation details error", err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const renderConversationCard = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      onPress={() => handleSelectConversation(item.id)}
      activeOpacity={0.8}
      className={`mb-4 mx-5 rounded-[28px] p-5 shadow-lg ${
        isDark 
          ? 'bg-slate-900 shadow-black/40 border border-slate-800' 
          : 'bg-white shadow-indigo-900/10 border border-slate-100'
      }`}
    >
      <View className={`flex-row justify-between items-start mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <View className={`flex-row items-center gap-3.5 flex-1 min-w-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <View className={`w-12 h-12 rounded-[18px] items-center justify-center ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-50'}`}>
            <Bot size={24} color={isDark ? '#818cf8' : '#4f46e5'} />
          </View>
          <View className={`flex-1 min-w-0 ${isRtl ? 'items-end' : 'items-start'}`}>
            <Text className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`} numberOfLines={1}>
              {isRtl ? "استشارة ذكية" : "AI Consultation"}
            </Text>
            <View className={`flex-row items-center gap-1.5 mt-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <Calendar size={12} color={isDark ? '#64748b' : '#94a3b8'} />
              <Text className={`text-[11px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {new Date(item.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}
              </Text>
            </View>
          </View>
        </View>
        
        <View className={`px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30`}>
          <Text className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            {isRtl ? "مكتمل" : "COMPLETED"}
          </Text>
        </View>
      </View>

      {/* Removed message preview for cleaner UI */}

      <View className={`mt-3 flex-row items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
        <View className={`flex-row items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <Clock size={12} color={isDark ? '#64748b' : '#94a3b8'} />
          <Text className={`text-[10px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <ArrowRight size={16} color={isDark ? '#4f46e5' : '#6366f1'} style={{ transform: [{ rotate: isRtl ? '180deg' : '0deg' }] }} />
      </View>
    </TouchableOpacity>
  );

  const renderMessage = ({ item }: { item: any }) => (
    <View className={`flex-row mb-4 ${item.sender === "User" ? "justify-end" : "justify-start"}`}>
      <View className={`max-w-[85%] p-4 rounded-[24px] ${
        item.sender === "User" 
          ? "bg-indigo-600 rounded-br-none" 
          : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-bl-none shadow-sm"
      }`}>
        <Text className={`text-[15px] leading-6 ${item.sender === "User" ? "text-white" : "text-slate-800 dark:text-slate-200"}`}>
          {item.content}
        </Text>
        <Text className={`text-[10px] mt-2 opacity-60 ${item.sender === "User" ? "text-white text-right" : "text-slate-500"}`}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  return (
    <View className={`flex-1 ${isDark ? 'bg-[#020617]' : 'bg-slate-50'}`}>
      {/* Hero Background */}
      <View 
        className="bg-indigo-600 dark:bg-indigo-900 absolute top-0 left-0 right-0" 
        style={{ height: 240 + insets.top, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }} 
      />

      <View style={{ paddingTop: insets.top + 20 }} className="flex-1">
        {/* Header */}
        <View className={`px-6 flex-row items-center justify-between mb-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <View className={isRtl ? 'items-end' : 'items-start'}>
            <Text className="text-3xl font-black text-white tracking-tight">
              {isRtl ? "محادثاتك" : "Consultations"}
            </Text>
            <Text className="text-sm font-medium text-indigo-100 mt-1 opacity-90">
              {isRtl ? "تاريخ استشاراتك مع المساعد الذكي" : "Your AI assistant history"}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
          >
            {isRtl ? <ChevronRight size={24} color="white" /> : <ChevronLeft size={24} color="white" />}
          </TouchableOpacity>
        </View>

        {selectedConversation ? (
          <View className="flex-1 bg-slate-50 dark:bg-[#020617] rounded-t-[40px] mt-2 overflow-hidden shadow-2xl">
            <View className={`px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex-row items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
              <TouchableOpacity 
                onPress={() => setSelectedConversation(null)}
                className={`w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center`}
              >
                {isRtl ? <ChevronRight size={20} color={isDark ? '#cbd5e1' : '#475569'} /> : <ChevronLeft size={20} color={isDark ? '#cbd5e1' : '#475569'} />}
              </TouchableOpacity>
              <Text className="text-lg font-black text-slate-800 dark:text-white">
                {isRtl ? "تفاصيل الاستشارة" : "Consultation Details"}
              </Text>
              <View className="w-10" />
            </View>
            
            <FlatList
              data={selectedConversation.messages}
              keyExtractor={(_, idx) => idx.toString()}
              renderItem={renderMessage}
              contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        ) : (
          <View className="flex-1">
            <FlatList
              data={conversations}
              keyExtractor={(item) => item.id}
              renderItem={renderConversationCard}
              onRefresh={fetchConversations}
              refreshing={isLoading}
              contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
              ListEmptyComponent={() => (
                <View className="px-5 mt-10">
                  <View className={`py-12 px-6 rounded-[32px] items-center justify-center border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100 shadow-sm shadow-slate-200/50'}`}>
                    <View className={`w-20 h-20 rounded-full items-center justify-center mb-5 shadow-sm ${isDark ? 'bg-slate-800' : 'bg-indigo-50'}`}>
                      <MessageSquare size={30} color={isDark ? '#4f46e5' : '#6366f1'} />
                    </View>
                    <Text className={`text-lg font-black text-center mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {isRtl ? "لا توجد محادثات" : "No conversations yet"}
                    </Text>
                    <Text className={`text-xs text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {isRtl ? "ابدأ محادثة جديدة مع المساعد الذكي الآن" : "Start a new conversation with the AI assistant"}
                    </Text>
                  </View>
                </View>
              )}
            />
          </View>
        )}
      </View>

      {/* Floating Action Button */}
      {!selectedConversation && (
        <TouchableOpacity
          onPress={() => router.push("/(screens)/patient/ai-chatbot")}
          activeOpacity={0.9}
          className="absolute bottom-8 right-8 w-16 h-16 bg-indigo-600 rounded-full items-center justify-center shadow-2xl shadow-indigo-500/50"
          style={{ elevation: 8 }}
        >
          <Plus size={32} color="white" />
        </TouchableOpacity>
      )}

      {/* Detail Loading Overlay */}
      {isDetailLoading && (
        <View className="absolute inset-0 bg-black/20 items-center justify-center z-50">
          <View className="bg-white dark:bg-slate-900 p-6 rounded-3xl items-center shadow-xl">
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text className="mt-3 font-bold text-slate-800 dark:text-white">
              {isRtl ? "جاري التحميل..." : "Loading details..."}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

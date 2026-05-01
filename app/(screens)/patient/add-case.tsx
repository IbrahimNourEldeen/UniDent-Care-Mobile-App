import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import {
  Bot,
  Check,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Send,
  Sparkles,
  X,
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";

import { getCaseTypes } from "@/features/cases/server/caseTypes.action";
import { createCase } from "@/features/cases/services/caseService";
import { RootState } from "@/store/store";
import { useThemeLanguage } from "@/store/ThemeLanguageContext";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type MessageRole = "USER" | "MODEL";
interface Message {
  id: string;
  role: MessageRole;
  content: string;
  isTyping?: boolean;
  isError?: boolean;
}

// Chatbot API URL
const AI_API_BASE_URL = "https://omarhany-chat-ai-dental.hf.space";

export default function AddCaseScreen() {
  const patientId = useSelector(
    (state: RootState) => (state?.auth.user as any)?.publicId,
  );
  const { theme, language } = useThemeLanguage();
  const isDark = theme === "dark";
  const isRtl = language === "ar";
  const router = useRouter();

  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [step, setStep] = useState<"chat" | "images">("chat");
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [caseTypes, setCaseTypes] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadTypes = async () => {
      try {
        const res = await getCaseTypes(1, 100, "");
        const items = (res as any).data?.items || (res as any).items || [];
        setCaseTypes(items.map((i: any) => ({ id: i.publicId, name: i.name })));
      } catch (e) {
        console.error("Failed to load case types", e);
      }
    };
    loadTypes();
  }, []);

  const addMessage = (msg: Message) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMessages((prev) => [...prev, msg]);
  };

  const fetchAIReply = async (history: { role: string; content: string }[]) => {
    console.log(">>> AI Chat Request Payload:", JSON.stringify({ history }, null, 2));
    try {
      const res = await axios.post(`${AI_API_BASE_URL}/chat`, { history });
      console.log("<<< AI Chat Response Data:", JSON.stringify(res.data, null, 2));
      return { 
        content: res.data?.reply || "لا يوجد رد من الذكاء الاصطناعي", 
        fullData: res.data,
        isError: false 
      };
    } catch (e: any) {
      console.warn("AI Chat API Error:", e.response?.data || e.message);
      return { content: "عذراً، أواجه مشكلة في الاتصال بالخادم. يرجى المحاولة مرة أخرى.", isError: true };
    }
  };

  const fetchAIDiagnosis = async (
    history: { role: string; content: string }[],
  ) => {
    try {
      // Uncomment and use when API is ready:
      // const res = await axios.post(`${AI_API_BASE_URL}/diagnose`, { history });
      // return res.data.diagnosis;

      // Mock Diagnosis
      return new Promise<any>((resolve) => {
        setTimeout(() => {
          resolve({
            title: "Suspected Dental Caries (Cavity)",
            description:
              "Based on the symptoms described (sensitivity, localized pain), it is highly probable to be dental caries. Further clinical examination is required.",
            caseTypeName: "General Dentistry",
          });
        }, 2000);
      });
    } catch (e) {
      console.warn("AI Diagnosis API Error:", e);
      return {
        title: "Undetermined Condition",
        description:
          "Could not determine a specific condition. Please submit the case for a doctor to review.",
        caseTypeName: "General Dentistry",
      };
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchInitial = async () => {
        // Reset all states
        setMessages([
          { id: "init-user", role: "USER", content: "" },
          { id: "typing", role: "MODEL", content: "", isTyping: true }
        ]);
        setDiagnosis(null);
        setImages([]);
        setStep("chat");
        setInputText("");

        const reply = await fetchAIReply([{ role: "USER", content: "" }]);
        setMessages((prev) => {
          const filtered = prev.filter((m) => !m.isTyping);
          return [
            ...filtered,
            { id: Date.now().toString(), role: "MODEL", content: reply.content, isError: reply.isError },
          ];
        });
      };

      fetchInitial();

      return () => {
        // Optional cleanup when leaving the screen
      };
    }, [])
  );

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "USER",
      content: inputText.trim(),
    };
    addMessage(userMsg);
    setInputText("");

    addMessage({ id: "typing", role: "MODEL", content: "", isTyping: true });

    const historyForApi = messages
      .filter((m) => !m.isTyping)
      .map((m) => ({ role: m.role, content: m.content }));
    historyForApi.push({ role: "USER", content: userMsg.content });

    const reply = await fetchAIReply(historyForApi);

    setMessages((prev) => {
      const filtered = prev.filter((m) => !m.isTyping);
      return [
        ...filtered,
        { id: Date.now().toString(), role: "MODEL", content: reply.content, isError: reply.isError },
      ];
    });

    // Handle diagnosis if provided by the API
    if (reply.fullData?.diagnosis_status === "completed" && reply.fullData?.diagnosis) {
      const diag = reply.fullData.diagnosis[0]; // Take the first diagnosis for now
      setDiagnosis({
        title: diag.note || "تشخيص الذكاء الاصطناعي",
        description: `تم تحديد الحالة بناءً على المحادثة. (نوع الحالة: ${diag.CaseTypeId})`,
        caseTypeName: diag.CaseTypeId,
      });
      setStep("images");
    }
  };

  const retryMessage = async (errorMsgId: string) => {
    setMessages((prev) => {
      const filtered = prev.filter((m) => m.id !== errorMsgId);
      return [...filtered, { id: "typing", role: "MODEL", content: "", isTyping: true }];
    });

    const historyForApi = messages
      .filter((m) => m.id !== errorMsgId && !m.isTyping)
      .map((m) => ({ role: m.role, content: m.content }));

    const reply = await fetchAIReply(historyForApi);

    setMessages((prev) => {
      const filtered = prev.filter((m) => !m.isTyping && m.id !== errorMsgId);
      return [
        ...filtered,
        { id: Date.now().toString(), role: "MODEL", content: reply.content, isError: reply.isError },
      ];
    });

    // Handle diagnosis if provided by the API
    if (reply.fullData?.diagnosis_status === "completed" && reply.fullData?.diagnosis) {
      const diag = reply.fullData.diagnosis[0];
      setDiagnosis({
        title: diag.note || "تشخيص الذكاء الاصطناعي",
        description: `تم تحديد الحالة بناءً على المحادثة. (نوع الحالة: ${diag.CaseTypeId})`,
        caseTypeName: diag.CaseTypeId,
      });
      setStep("images");
    }
  };

  const handleGetDiagnosis = async () => {
    setIsDiagnosing(true);
    const history = messages
      .filter((m) => !m.isTyping)
      .map((m) => ({ role: m.role, content: m.content }));

    const result = await fetchAIDiagnosis(history);

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDiagnosis(result);
    setIsDiagnosing(false);
    setStep("images");
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.fileName || `img_${Date.now()}.jpg`,
        type: "image/jpeg",
      }));
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const submitCase = async () => {
    setIsSubmitting(true);
    try {
      const matchedType =
        caseTypes.find((t) =>
          t.name
            .toLowerCase()
            .includes(diagnosis?.caseTypeName?.toLowerCase() || ""),
        ) || caseTypes[0];

      const caseTypeId = matchedType
        ? matchedType.id
        : "00000000-0000-0000-0000-000000000000";

      const payload = {
        PatientId: patientId,
        Title: diagnosis.title,
        Description: diagnosis.description,
        CaseTypeId: caseTypeId,
        Images: images as any,
      };

      const res = await createCase(payload);
      if (res.data?.success || res.status === 200 || res.status === 201) {
        Alert.alert(
          "تم بنجاح 🎉",
          "تم إنشاء حالتك بناءً على تشخيص الذكاء الاصطناعي!",
        );
        setMessages([]);
        setDiagnosis(null);
        setImages([]);
        setStep("chat");
      } else {
        Alert.alert("خطأ", res.data?.message || "فشل إنشاء الحالة");
      }
    } catch (e) {
      Alert.alert("خطأ", "حدث خطأ غير متوقع");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.role === "USER" && item.content === "") return null;

    if (item.role === "MODEL") {
      return (
        <View className="flex-row items-end mb-5 ml-2">
          <View className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 items-center justify-center mr-2 shadow-sm">
            <Bot size={16} color={isDark ? "#818cf8" : "#4f46e5"} />
          </View>
          <View className="bg-white dark:bg-slate-800 p-4 rounded-3xl rounded-bl-sm shadow-sm max-w-[80%] border border-slate-100 dark:border-slate-700">
            {item.isTyping ? (
              <ActivityIndicator size="small" color="#4f46e5" />
            ) : (
              <View>
                <Text className="text-slate-800 dark:text-slate-200 leading-5">
                  {item.content}
                </Text>
                {item.isError && (
                  <TouchableOpacity
                    onPress={() => retryMessage(item.id)}
                    className="mt-3 bg-red-100 dark:bg-red-900/30 py-2.5 px-4 rounded-xl flex-row items-center justify-center border border-red-200 dark:border-red-800/50"
                  >
                    <Text className="text-red-600 dark:text-red-400 font-bold text-sm">
                      إعادة المحاولة
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      );
    }

    return (
      <View className="flex-row justify-end mb-5 mr-2">
        <View className="bg-indigo-600 dark:bg-indigo-500 p-4 rounded-3xl rounded-br-sm shadow-md shadow-indigo-200 dark:shadow-none max-w-[80%]">
          <Text className="text-white leading-5">{item.content}</Text>
        </View>
      </View>
    );
  };


  return (
    <SafeAreaView
      className="flex-1 bg-slate-50 dark:bg-slate-950 relative"
      edges={["top", "bottom"]}
    >
      {/* Background Blurs */}
      <View
        className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden"
        pointerEvents="none"
      >
        <View
          className="absolute top-[-50px] left-[-50px] w-72 h-72 bg-indigo-500 opacity-20 dark:opacity-10 rounded-full"
          style={{ transform: [{ scale: 1.5 }] }}
        />
        <View
          className="absolute bottom-[20%] right-[-50px] w-80 h-80 bg-purple-500 opacity-20 dark:opacity-10 rounded-full"
          style={{ transform: [{ scale: 1.5 }] }}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        {/* Header */}
        <View className={`px-5 pt-4 pb-4 flex-row items-center border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md ${isRtl ? 'flex-row-reverse' : ''}`}>
          {/* Chatbot Info */}
          <View className={`flex-row items-center ${isRtl ? 'flex-row-reverse' : ''}`}>
            <View className={`w-11 h-11 bg-indigo-100 dark:bg-indigo-900/50 rounded-full items-center justify-center ${isRtl ? 'ml-3' : 'mr-3'}`}>
              <Bot size={22} color={isDark ? "#818cf8" : "#4f46e5"} />
            </View>
            <View className={isRtl ? 'items-end' : 'items-start'}>
              <Text className="text-lg font-black text-slate-800 dark:text-white leading-tight">
                UniDent AI
              </Text>
              <View className={`flex-row items-center mt-0.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <View className={`w-2 h-2 bg-emerald-500 rounded-full ${isRtl ? 'ml-1.5' : 'mr-1.5'}`} />
                <Text className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
                  {isRtl ? "متصل" : "Online"}
                </Text>
              </View>
            </View>
          </View>

          {/* Spacer to push items apart */}
          <View className="flex-1" />

          {/* Chic Back Button */}
          <TouchableOpacity 
            onPress={() => router.back()} 
            activeOpacity={0.7}
            className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 items-center justify-center shadow-sm"
          >
            {isRtl ? <ChevronLeft size={20} color={isDark ? "#818cf8" : "#4f46e5"} /> : <ChevronRight size={20} color={isDark ? "#818cf8" : "#4f46e5"} />}
          </TouchableOpacity>
        </View>

        {/* Chat Area */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => (
            <View>
              {diagnosis && (
                <View className="bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-400 dark:border-emerald-600 rounded-3xl p-5 mt-2 mx-2 mb-6 shadow-sm">
                  <View className="flex-row items-center mb-4">
                    <Sparkles size={24} color="#10b981" />
                    <Text className="text-xl font-black text-emerald-800 dark:text-emerald-400 ml-2">
                      نتائج تشخيص الذكاء الاصطناعي
                    </Text>
                  </View>
                  <Text className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
                    {diagnosis.title}
                  </Text>
                  <Text className="text-sm text-slate-600 dark:text-slate-400 mb-5 leading-5">
                    {diagnosis.description}
                  </Text>

                  <View className="bg-emerald-100 dark:bg-emerald-800/50 rounded-xl py-2 px-4 self-start">
                    <Text className="text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                      {diagnosis.caseTypeName || "Specialty"}
                    </Text>
                  </View>
                </View>
              )}

              {step === "images" && (
                <View className="mx-2 mb-10">
                  <Text className="text-xs font-black text-slate-500 dark:text-slate-400 ml-1 mb-3 uppercase tracking-widest">
                    إرفاق صور طبية
                  </Text>
                  <TouchableOpacity
                    onPress={pickImage}
                    className="border-2 border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-3xl p-8 items-center"
                  >
                    <ImageIcon
                      size={36}
                      color={isDark ? "#818cf8" : "#4f46e5"}
                    />
                    <Text className="text-indigo-600 dark:text-indigo-400 font-bold mt-3 text-base">
                      رفع من المعرض
                    </Text>
                    <Text className="text-slate-400 text-xs mt-1">
                      الصور الواضحة تساعد الأطباء
                    </Text>
                  </TouchableOpacity>

                  {images.length > 0 && (
                    <View className="flex-row flex-wrap mt-5 gap-3">
                      {images.map((img, idx) => (
                        <View key={idx} className="relative">
                          <Image
                            source={{ uri: img.uri }}
                            className="w-24 h-24 rounded-2xl bg-slate-200 dark:bg-slate-800"
                          />
                          <TouchableOpacity
                            onPress={() => removeImage(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1.5 shadow-sm"
                          >
                            <X size={12} color="white" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}

                  {images.length > 0 && (
                    <TouchableOpacity
                      onPress={submitCase}
                      disabled={isSubmitting}
                      className="bg-indigo-600 dark:bg-indigo-500 h-16 rounded-2xl mt-8 flex-row items-center justify-center shadow-lg shadow-indigo-300 dark:shadow-none"
                    >
                      {isSubmitting ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <>
                          <Text className="text-white font-black text-lg mr-2">
                            إنشاء الحالة
                          </Text>
                          <Check size={22} color="white" />
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          )}
        />

        {/* Input Area */}
        {step === "chat" && (
          <View className="px-4 py-3 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800/50">
            <View className="flex-row items-end pb-2 pt-1">
              <View className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-3xl px-5 py-3 min-h-[52px] max-h-[120px] justify-center">
                <TextInput
                  className="text-slate-800 dark:text-white font-medium text-[15px] pt-0 pb-0"
                  placeholder="اكتب الأعراض التي تشعر بها..."
                  placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                  multiline
                  value={inputText}
                  onChangeText={setInputText}
                />
              </View>
              <TouchableOpacity
                onPress={sendMessage}
                disabled={!inputText.trim()}
                className={`ml-3 w-12 h-12 rounded-full items-center justify-center shadow-sm ${
                  inputText.trim()
                    ? "bg-indigo-600 dark:bg-indigo-500 shadow-indigo-200 dark:shadow-none"
                    : "bg-slate-200 dark:bg-slate-800"
                }`}
              >
                <Send
                  size={18}
                  color={
                    inputText.trim() ? "white" : isDark ? "#475569" : "#94a3b8"
                  }
                  style={{ marginLeft: 3, marginTop: 1 }}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

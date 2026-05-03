import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import {
  Bot,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Send,
  Sparkles,
  User,
  X,
  RefreshCcw,
  Paperclip
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
import { createCaseAI, createDiagnosisAI } from "@/features/cases/services/caseService";
import { RootState } from "@/store/store";
import { useThemeLanguage } from "@/store/ThemeLanguageContext";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AI_API_BASE_URL = "https://omarhany-chat-ai-dental.hf.space";

interface Localized { en: string; ar: string; }

interface DisplayMessage {
  id: string;
  sender: "bot" | "user";
  content: string;
  isDiagnosis?: boolean;
  canRetry?: boolean;
  isEndConversationBtn?: boolean;
  diagnosisData?: any;
}

interface ChatMessage {
  role: "USER" | "MODEL";
  content: string;
}

export default function AddCaseScreen() {
  const patientId = useSelector((s: RootState) => (s.auth.user as any)?.publicId || "");
  const { theme, language } = useThemeLanguage();
  const isDark = theme === "dark";
  const isRtl = language === "ar";
  const router = useRouter();

  const tUI = {
    title:       { en: "AI Case Assistant", ar: "مساعد الحالات الذكي" },
    desc:        { en: "Smart interactive case creation", ar: "إنشاء حالة تفاعلي ذكي" },
    submitting:  { en: "Submitting your case...", ar: "جاري إرسال الحالة..." },
    success:     { en: "Case submitted successfully!", ar: "تم إرسال الحالة بنجاح!" },
    error:       { en: "Something went wrong. Please try again.", ar: "حدث خطأ. يرجى المحاولة مرة أخرى." },
    retry:       { en: "Retry", ar: "إعادة المحاولة" },
    redirecting: { en: "Redirecting...", ar: "جاري التحويل..." },
    placeholder: { en: "Describe your dental symptoms...", ar: "صف أعراض أسنانك..." },
    send:        { en: "Send", ar: "إرسال" },
    diagTitle:   { en: "AI Diagnosis Result", ar: "نتيجة التشخيص الذكي" },
    attachPhotos:{ en: "Attach Photos", ar: "إرفاق صور" },
    skip:        { en: "Skip", ar: "تخطي" },
    createCase:  { en: "Create Case", ar: "إنشاء حالة" },
    endConv:     { en: "End Conversation", ar: "إنهاء المحادثة" },
    endingConv:  { en: "Ending...", ar: "جاري الإنهاء..." },
  };
  const t = (obj: Localized) => obj[language as keyof Localized] || obj.ar;

  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [diagnosisData, setDiagnosisData] = useState<any>(null);
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [collectingImages, setCollectingImages] = useState(false);

  useEffect(() => {
    // Scroll to end when messages change
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isTyping]);

  const chatWithAI = async (history: ChatMessage[]) => {
    console.log(">>> AI Chat Request Payload:", JSON.stringify({ history }, null, 2));
    const res = await axios.post(`${AI_API_BASE_URL}/chat`, { history });
    console.log("<<< AI Chat Response Data:", JSON.stringify(res.data, null, 2));
    return res.data;
  };

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        setIsTyping(true);
        try {
          const initHistory: ChatMessage[] = [{ role: "USER", content: "أهلاً، أريد استشارة طبية بخصوص أسناني" }];
          const firstMsgObj = await chatWithAI(initHistory);
          const firstMsgText = typeof firstMsgObj === "string" ? firstMsgObj : (firstMsgObj.reply || JSON.stringify(firstMsgObj));
          const history: ChatMessage[] = [...initHistory, { role: "MODEL", content: firstMsgText }];
          
          setChatHistory(history);
          setMessages([{ id: "init", sender: "bot", content: firstMsgText }]);
        } catch (err: any) {
          console.error("AI init error", err);
          Alert.alert("خطأ", t(tUI.error));
        } finally {
          setIsTyping(false);
        }
      };
      
      // Only initialize if we haven't already
      if (chatHistory.length === 0) {
        init();
      }
    }, [])
  );

  const handleSend = async (retryText?: string) => {
    const isRetry = typeof retryText === 'string';
    const textToSend = isRetry ? retryText : inputText.trim();
    
    if ((!isRetry && !textToSend) || isTyping || isSubmitting || completed) {
      return;
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    let historyForAI: ChatMessage[] = [...chatHistory];
    
    if (isRetry) {
      if (historyForAI.length > 0 && historyForAI[historyForAI.length - 1].role === "MODEL") {
        historyForAI.pop();
      }
    } else {
      setInputText("");
      setMessages(prev => [...prev, { id: Date.now() + "_u", sender: "user", content: textToSend }]);
      
      const userMsg: ChatMessage = { role: "USER", content: textToSend };
      historyForAI.push(userMsg);
      setChatHistory(historyForAI);
    }

    setIsTyping(true);
    try {
      const aiResponse = await chatWithAI(historyForAI);
      
      let responseString = "";
      let isCompleted = false;
      let aiDiagnosis: any = null;
      let shouldCollectImages = false;

      if (typeof aiResponse === "string") {
        responseString = aiResponse;
      } else if (aiResponse && typeof aiResponse === "object") {
        const data = aiResponse as any;
        responseString = data.reply || JSON.stringify(data);
        if (data.diagnosis_status === "completed" && data.show_side_panel) {
          isCompleted = true;
          aiDiagnosis = data.diagnosis;
        } else if (data.diagnosis && Array.isArray(data.diagnosis) && data.diagnosis.length > 0) {
          aiDiagnosis = data.diagnosis;
          shouldCollectImages = true;
          setDiagnosisData(aiDiagnosis);
          setCollectingImages(true);
        }
      }

      const isServerBusy = responseString.includes("ضغط") || 
                           responseString.includes("السيرفر") || 
                           responseString.includes("دقيقة");

      const updatedHistory: ChatMessage[] = [...historyForAI, { role: "MODEL", content: responseString }];
      setChatHistory(updatedHistory);
      
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setMessages(prev => {
        let newMessages = [...prev];
        if (isRetry && prev.length > 0 && prev[prev.length - 1].sender === "bot") {
          newMessages[newMessages.length - 1] = {
            id: Date.now() + "_b",
            sender: "bot",
            content: responseString,
            canRetry: isServerBusy,
            isEndConversationBtn: isCompleted,
            diagnosisData: aiDiagnosis
          };
        } else {
          newMessages.push({ 
            id: Date.now() + "_b", 
            sender: "bot", 
            content: responseString,
            canRetry: isServerBusy,
            isEndConversationBtn: isCompleted,
            diagnosisData: aiDiagnosis
          });
        }
        
        if (shouldCollectImages) {
          newMessages.push({
            id: Date.now() + "_img",
            sender: "bot",
            content: isRtl ? "من فضلك ارسل صور الاسنان" : "Please send pictures of the teeth",
          });
        }

        return newMessages;
      });
    } catch (err: any) {
      Alert.alert("خطأ", err.message || t(tUI.error));
    } finally {
      setIsTyping(false);
    }
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
      setFiles((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateCase = async () => {
    if (isSubmitting || completed) return;
    setIsSubmitting(true);
    try {
      const description = chatHistory
        .filter(m => m.role === "USER")
        .map(m => m.content)
        .join("\n");

      let availableCaseTypes: any[] = [];
      let caseTypeId = "";
      try {
        const res = await getCaseTypes(1, 40, "");
        availableCaseTypes = (res as any).data?.items || (res as any).items || [];
        if (availableCaseTypes.length > 0) {
          const general = availableCaseTypes.find((i: any) =>
            (i.name || "").toLowerCase().includes("general")
          );
          caseTypeId = general?.publicId || availableCaseTypes[0]?.publicId || "";
        }
      } catch { /* fallback: empty */ }

      const title = isRtl ? "حالة جديدة" : "New Case";

      const caseRes = await createCaseAI({
        PatientId: patientId,
        Title: title,
        Description: description,
        CaseTypeId: caseTypeId,
        Images: files.length > 0 ? files : undefined,
      });

      const newCaseId = caseRes.data?.data?.publicId || caseRes.data?.publicId || caseRes.data?.data?.id || caseRes.data?.id || caseRes.data?.data || caseRes.data;

      if (diagnosisData && Array.isArray(diagnosisData)) {
        for (const diag of diagnosisData) {
          let diagCaseTypeId = caseTypeId;
          if (diag.CaseTypeId) {
             const matchedType = availableCaseTypes.find((t: any) => t.key === diag.CaseTypeId || t.name === diag.CaseTypeId);
             if (matchedType) {
                 diagCaseTypeId = matchedType.publicId;
             }
          }

          await createDiagnosisAI({
             patientCaseId: newCaseId,
             caseTypeId: diagCaseTypeId,
             note: diag.note || diag.description || "",
          });
        }
      }

      setCompleted(true);
      setMessages(prev => [...prev, {
        id: "final",
        sender: "bot",
        content: t(tUI.success),
      }]);
      Alert.alert("نجاح", t(tUI.success));
      setTimeout(() => router.push("/(screens)/patient/my_cases"), 2000);
    } catch (err: any) {
      Alert.alert("خطأ", err.message || t(tUI.error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndConversation = async (diagnosisArray: any[]) => {
    if (isSubmitting || completed) return;
    setIsSubmitting(true);
    try {
      const description = chatHistory
        .filter(m => m.role === "USER")
        .map(m => m.content)
        .join("\n");

      let availableCaseTypes: any[] = [];
      let caseTypeId = "";
      try {
        const res = await getCaseTypes(1, 40, "");
        availableCaseTypes = (res as any).data?.items || (res as any).items || [];
        if (availableCaseTypes.length > 0) {
          const general = availableCaseTypes.find((i: any) =>
            (i.name || "").toLowerCase().includes("general")
          );
          caseTypeId = general?.publicId || availableCaseTypes[0]?.publicId || "";
        }
      } catch { /* fallback */ }

      const title = isRtl ? "حالة جديدة" : "New Case";

      const caseRes = await createCaseAI({
        PatientId: patientId,
        Title: title,
        Description: description,
        CaseTypeId: caseTypeId,
      });

      const newCaseId = caseRes.data?.data?.publicId || caseRes.data?.publicId || caseRes.data?.data?.id || caseRes.data?.id || caseRes.data?.data || caseRes.data;

      if (diagnosisArray && Array.isArray(diagnosisArray)) {
        for (const diag of diagnosisArray) {
          let diagCaseTypeId = caseTypeId;
          if (diag.CaseTypeId) {
             const matchedType = availableCaseTypes.find((t: any) => t.key === diag.CaseTypeId || t.name === diag.CaseTypeId);
             if (matchedType) {
                 diagCaseTypeId = matchedType.publicId;
             }
          }

          await createDiagnosisAI({
             patientCaseId: newCaseId,
             caseTypeId: diagCaseTypeId,
             note: diag.note || diag.description || "",
          });
        }
      }

      setCompleted(true);
      setMessages(prev => [...prev, {
        id: "final",
        sender: "bot",
        content: t(tUI.success),
      }]);
      Alert.alert("نجاح", t(tUI.success));
      setTimeout(() => router.push("/(screens)/patient/my_cases"), 2000);
    } catch (err: any) {
      Alert.alert("خطأ", err.message || t(tUI.error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMessage = ({ item }: { item: DisplayMessage }) => {
    if (item.sender === "bot") {
      return (
        <View className="flex-row items-end mb-5 ml-2">
          <View className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 items-center justify-center mr-2 shadow-sm">
            <Bot size={16} color={isDark ? "#818cf8" : "#4f46e5"} />
          </View>
          <View className={`p-4 rounded-3xl rounded-bl-sm shadow-sm max-w-[80%] border ${
            item.isDiagnosis 
              ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800" 
              : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700"
          }`}>
            {item.isDiagnosis && (
              <View className="flex-row items-center mb-2">
                <Sparkles size={16} color="#10b981" />
                <Text className="font-bold text-emerald-700 dark:text-emerald-400 ml-1 text-sm">
                  {t(tUI.diagTitle)}
                </Text>
              </View>
            )}
            
            <Text className={`text-sm leading-5 ${
              item.isDiagnosis ? "text-emerald-800 dark:text-emerald-200" : "text-slate-800 dark:text-slate-200"
            }`}>
              {item.content}
            </Text>

            {(item.canRetry || item.content.includes("ضغط") || item.content.includes("السيرفر") || item.content.includes("دقيقة")) && (
              <TouchableOpacity
                onPress={() => {
                  let msgToRetry = [...chatHistory]
                    .reverse()
                    .find(h => h.role === "USER" && h.content?.trim())?.content;
                  
                  if (!msgToRetry) {
                    msgToRetry = [...messages]
                      .reverse()
                      .find(m => m.sender === "user" && m.content?.trim())?.content;
                  }
                  if (!msgToRetry) msgToRetry = inputText.trim();

                  if (msgToRetry) {
                    handleSend(msgToRetry);
                  } else {
                    handleSend("");
                  }
                }}
                className="mt-3 bg-indigo-600 px-4 py-2 rounded-xl flex-row items-center justify-center shadow-sm"
              >
                <RefreshCcw size={14} color="white" />
                <Text className="text-white font-bold text-xs ml-2">
                  {t(tUI.retry)}
                </Text>
              </TouchableOpacity>
            )}

            {item.isEndConversationBtn && !completed && (
              <TouchableOpacity
                onPress={() => handleEndConversation(item.diagnosisData)}
                disabled={isSubmitting}
                className={`mt-3 px-4 py-2 rounded-xl flex-row items-center justify-center shadow-sm ${
                  isSubmitting ? "bg-emerald-400" : "bg-emerald-600"
                }`}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <CheckCircle size={14} color="white" />
                )}
                <Text className="text-white font-bold text-xs ml-2">
                  {isSubmitting ? t(tUI.endingConv) : t(tUI.endConv)}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }

    return (
      <View className="flex-row justify-end mb-5 mr-2">
        <View className="bg-indigo-600 dark:bg-indigo-500 p-4 rounded-3xl rounded-br-sm shadow-md max-w-[80%] flex-row items-center">
          <Text className="text-white leading-5 text-sm">{item.content}</Text>
        </View>
        <View className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 items-center justify-center ml-2 shadow-sm mt-auto">
          <User size={16} color={isDark ? "#cbd5e1" : "#475569"} />
        </View>
      </View>
    );
  };

  const canChat = !isTyping && !isSubmitting && !completed && !collectingImages;

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
                {t(tUI.title)}
              </Text>
              <View className={`flex-row items-center mt-0.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <View className={`w-2 h-2 bg-emerald-500 rounded-full ${isRtl ? 'ml-1.5' : 'mr-1.5'}`} />
                <Text className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
                  {isRtl ? "متصل" : "Online"}
                </Text>
              </View>
            </View>
          </View>

          {/* Spacer */}
          <View className="flex-1" />

          {/* Back Button */}
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
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => (
            <View>
              {isTyping && (
                <View className="flex-row items-end mb-5 ml-2">
                  <View className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 items-center justify-center mr-2 shadow-sm">
                    <Bot size={16} color={isDark ? "#818cf8" : "#4f46e5"} />
                  </View>
                  <View className="bg-white dark:bg-slate-800 p-4 rounded-3xl rounded-bl-sm shadow-sm border border-slate-100 dark:border-slate-700">
                    <ActivityIndicator size="small" color="#4f46e5" />
                  </View>
                </View>
              )}

              {isSubmitting && (
                <View className="flex-row justify-center my-6">
                  <View className="bg-indigo-50 dark:bg-indigo-900/30 px-6 py-3 rounded-full border border-indigo-100 dark:border-indigo-800 flex-row items-center gap-2">
                    <ActivityIndicator size="small" color="#4f46e5" />
                    <Text className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                      {t(tUI.submitting)}
                    </Text>
                  </View>
                </View>
              )}

              {completed && (
                <View className="flex-row justify-center my-6">
                  <View className="bg-emerald-50 dark:bg-emerald-900/30 px-6 py-3 rounded-full border border-emerald-100 dark:border-emerald-800 flex-row items-center gap-2">
                    <CheckCircle size={18} color="#10b981" />
                    <Text className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                      {t(tUI.redirecting)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
        />

        {/* Input Area */}
        <View className="px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/60">
          {collectingImages && !completed && !isSubmitting && (
            <View className="flex-col gap-3">
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={pickImage}
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 border-dashed rounded-xl px-5 py-3 items-center justify-center flex-row gap-2"
                >
                  <Paperclip size={18} color={isDark ? "#94a3b8" : "#475569"} />
                  <Text className="text-slate-600 dark:text-slate-400 font-bold text-sm">
                    {t(tUI.attachPhotos)} ({files.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCreateCase}
                  className="px-6 h-12 bg-indigo-600 rounded-xl items-center justify-center flex-row gap-2"
                >
                  <Text className="text-white font-bold text-sm">
                    {t(tUI.createCase)}
                  </Text>
                  <Send size={16} color="white" />
                </TouchableOpacity>
              </View>

              {files.length > 0 && (
                <View className="flex-row flex-wrap gap-2 pt-2">
                  {files.map((file, idx) => (
                    <View key={idx} className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg flex-row items-center gap-2 border border-slate-200 dark:border-slate-700">
                      <Text className="text-xs font-bold text-slate-600 dark:text-slate-300 max-w-[100px]" numberOfLines={1}>
                        {file.name}
                      </Text>
                      <TouchableOpacity onPress={() => removeImage(idx)}>
                        <X size={14} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {canChat && (
            <View className="flex-row items-end pb-2 pt-1">
              <View className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-xl px-5 py-3 min-h-[52px] max-h-[120px] justify-center border border-slate-200 dark:border-slate-800">
                <TextInput
                  className="text-slate-800 dark:text-white font-medium text-[15px] pt-0 pb-0"
                  placeholder={t(tUI.placeholder)}
                  placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                  multiline
                  value={inputText}
                  onChangeText={setInputText}
                />
              </View>
              <TouchableOpacity
                onPress={() => handleSend()}
                disabled={!inputText.trim()}
                className={`ml-3 w-14 h-[52px] rounded-xl items-center justify-center ${
                  inputText.trim()
                    ? "bg-indigo-600"
                    : "bg-indigo-400 dark:bg-indigo-800"
                }`}
              >
                <Send
                  size={18}
                  color="white"
                  style={{ marginLeft: isRtl ? -2 : 2 }}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

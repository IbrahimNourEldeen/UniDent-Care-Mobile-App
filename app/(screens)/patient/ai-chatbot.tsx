import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
    Bot,
    ChevronLeft,
    ChevronRight,
    Paperclip,
    RefreshCcw,
    Send,
    Sparkles,
    User,
    X
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import { getCaseTypes } from "@/features/cases/server/caseTypes.action";
import { createCaseAI, createDiagnosisAI } from "@/features/cases/services/caseService";
import { showToast } from "@/store/slices/uiSlice";
import { RootState } from "@/store/store";
import { useThemeLanguage } from "@/store/ThemeLanguageContext";

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

export default function AIChatbotScreen() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const patientId = useSelector((s: RootState) => (s.auth.user as any)?.publicId || "");
  const role = useSelector((s: RootState) => (s.auth.user as any)?.role || "Patient");
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
  const [files, setFiles] = useState<any[]>([]);
  const [collectingImages, setCollectingImages] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isTyping]);

  const chatWithAI = async (history: ChatMessage[], retryCount = 0): Promise<any> => {
    try {
      const res = await axios.post(`${AI_API_BASE_URL}/chat`, { history }, {
        timeout: 30000, // 30 seconds timeout
      });
      return res.data;
    } catch (error: any) {
      // If server error (500) and haven't retried too many times, retry
      if (error.response?.status === 500 && retryCount < 2) {
        console.log(`AI server error, retrying... (${retryCount + 1}/2)`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        return chatWithAI(history, retryCount + 1);
      }
      throw error;
    }
  };

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        // Reset all states when screen is focused
        setMessages([]);
        setChatHistory([]);
        setInputText("");
        setIsTyping(true);
        setIsSubmitting(false);
        setCompleted(false);
        setDiagnosisData(null);
        setFiles([]);
        setCollectingImages(false);
        
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
      
      // Always initialize on focus
      init();
      
      // Cleanup function when screen loses focus
      return () => {
        setMessages([]);
        setChatHistory([]);
        setInputText("");
        setFiles([]);
        setCollectingImages(false);
        setCompleted(false);
        setDiagnosisData(null);
      };
    }, [])
  );

  const handleSend = async (retryText?: string) => {
    const isRetry = typeof retryText === 'string';
    const textToSend = isRetry ? retryText : inputText.trim();
    console.log("handleSend triggered with:", { textToSend, retryText, isTyping, isSubmitting, completed });
    
    if ((!isRetry && !textToSend) || isTyping || isSubmitting || completed) {
      console.log("handleSend returned early due to condition");
      return;
    }

    // Prepare history for AI
    let historyForAI: ChatMessage[] = [...chatHistory];
    
    if (isRetry) {
      // If it's a retry, we use the history as it was BEFORE the failure
      // (The failure bot message is usually the last one, we remove it to retry the user message)
      if (historyForAI.length > 0 && historyForAI[historyForAI.length - 1].role === "MODEL") {
        historyForAI.pop();
      }
    } else {
      // Normal send: update display and history
      setInputText("");
      setMessages(prev => [...prev, { id: Date.now() + "_u", sender: "user", content: textToSend }]);
      
      const userMsg: ChatMessage = { role: "USER", content: textToSend };
      historyForAI.push(userMsg);
      setChatHistory(historyForAI);
    }

    // Call AI
    console.log("Calling AI with history:", historyForAI);
    setIsTyping(true);
    try {
      const aiResponse = await chatWithAI(historyForAI);
      
      let responseString = "";
      let aiDiagnosis: any = null;
      let shouldCollectImages = false;

      if (typeof aiResponse === "string") {
        responseString = aiResponse;
      } else if (aiResponse && typeof aiResponse === "object") {
        const data = aiResponse as any;
        responseString = data.reply || data.message || JSON.stringify(data);
        
        // Check if diagnosis is available
        if (data.diagnosis && Array.isArray(data.diagnosis) && data.diagnosis.length > 0) {
          // Diagnosis available, collect images
          aiDiagnosis = data.diagnosis;
          shouldCollectImages = true;
          setDiagnosisData(aiDiagnosis);
          setCollectingImages(true);
        }
      }

      const isServerBusy = responseString.includes("ضغط") || responseString.includes("السيرفر") || responseString.includes("busy");

      const updatedHistory: ChatMessage[] = [...historyForAI, { role: "MODEL", content: responseString }];
      setChatHistory(updatedHistory);
      
      setMessages(prev => {
        let newMessages = [...prev];
        const botMsg = { 
          id: Date.now() + "_b", 
          sender: "bot" as const, 
          content: responseString,
          canRetry: isServerBusy,
          diagnosisData: aiDiagnosis
        };
        newMessages.push(botMsg);
        
        if (shouldCollectImages) {
          newMessages.push({
            id: Date.now() + "_img",
            sender: "bot",
            content: isRtl ? "من فضلك أرفق صور الأسنان (اختياري)" : "Please attach pictures of the teeth (optional)",
          });
        }
        return newMessages;
      });
    } catch (err: any) {
      console.error("AI chat error:", err);
      
      let errorMsg = t(tUI.error);
      let canRetry = false;
      
      if (err.response?.status === 500) {
        errorMsg = isRtl 
          ? "عذراً، السيرفر مشغول حالياً. يرجى المحاولة مرة أخرى" 
          : "Sorry, the server is busy. Please try again";
        canRetry = true;
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        errorMsg = isRtl 
          ? "انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى" 
          : "Connection timeout. Please try again";
        canRetry = true;
      } else if (err.message === "Network Error") {
        errorMsg = isRtl 
          ? "خطأ في الاتصال. تحقق من الإنترنت" 
          : "Network error. Check your internet";
        canRetry = true;
      }
      
      // Add error message with retry option
      setMessages(prev => [...prev, { 
        id: Date.now() + "_err", 
        sender: "bot", 
        content: errorMsg,
        canRetry: canRetry
      }]);
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
      const newImages = result.assets.map((asset, index) => {
        // Extract file extension from URI or use jpg as default
        const uriParts = asset.uri.split('.');
        const fileExtension = uriParts[uriParts.length - 1].toLowerCase();
        const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';
        
        return {
          uri: asset.uri,
          name: asset.fileName || `dental_image_${Date.now()}_${index}.${fileExtension}`,
          type: mimeType,
        };
      });
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
      const description = chatHistory.filter(m => m.role === "USER").map(m => m.content).join("\n");
      let caseTypeId = "";
      try {
        const res = await getCaseTypes(1, 40, "");
        const available = (res as any).data?.items || (res as any).items || [];
        const general = available.find((i: any) => (i.name || "").toLowerCase().includes("general"));
        caseTypeId = general?.publicId || available[0]?.publicId || "";
      } catch (err) {
        console.error("Error fetching case types:", err);
      }

      const title = isRtl ? "حالة جديدة من الشات بوت" : "New Case from Chatbot";
      
      // Prepare images for FormData
      const imagesToSend = files.length > 0 ? files.map(file => ({
        uri: file.uri,
        name: file.name,
        type: file.type,
      })) : undefined;

      const caseRes = await createCaseAI({
        PatientId: patientId,
        Title: title,
        Description: description,
        CaseTypeId: caseTypeId,
        Images: imagesToSend,
        CreatedById: patientId,
        CreatedByRole: role,
        IsPublic: false,
      });

      const newCaseId = caseRes.data?.data?.publicId || caseRes.data?.publicId || caseRes.data?.data?.id || caseRes.data?.data;

      if (!newCaseId) {
        throw new Error("Failed to get case ID from response");
      }

      // Create diagnoses if available
      if (diagnosisData && Array.isArray(diagnosisData) && diagnosisData.length > 0) {
        for (const diag of diagnosisData) {
          try {
            await createDiagnosisAI({
              patientCaseId: newCaseId,
              stage: 1,
              caseTypeId: caseTypeId,
              notes: diag.note || diag.description || diag.notes || "",
              createdById: patientId,
              role: role,
              teethNumbers: diag.teethNumbers || diag.teeth_numbers || [],
            });
          } catch (diagErr) {
            console.error("Error creating diagnosis:", diagErr);
          }
        }
      }

      setCompleted(true);
      setMessages(prev => [...prev, { id: "final", sender: "bot", content: t(tUI.success) }]);
      
      // Invalidate patient cases query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['patient', 'cases', patientId] });
      
      // Show toast and navigate directly
      dispatch(showToast({ 
        message: t(tUI.success), 
        type: "success" 
      }));
      
      // Navigate to my cases after a short delay
      setTimeout(() => {
        router.push("/(screens)/patient/my_cases");
      }, 500);
    } catch (err: any) {
      console.error("Error creating case:", err);
      const errorMessage = err.response?.data?.message || err.message || t(tUI.error);
      Alert.alert(isRtl ? "خطأ" : "Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMessage = ({ item }: { item: DisplayMessage }) => {
    if (item.sender === "bot") {
      return (
        <View className={`flex-row items-center mb-5 ${isRtl ? 'flex-row-reverse ml-0 mr-2' : 'ml-2 mr-0'}`}>
          <View className={`w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/60 items-center justify-center shadow-sm ${isRtl ? 'ml-3' : 'mr-3'}`}>
            <Bot size={18} color={isDark ? "#818cf8" : "#4f46e5"} />
          </View>
          <View className={`p-4 rounded-3xl shadow-sm max-w-[82%] border flex-col justify-center ${
            isRtl ? 'rounded-br-sm' : 'rounded-bl-sm'
          } ${
            item.isDiagnosis ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700"
          }`}>
            {item.isDiagnosis && (
              <View className={`flex-row items-center mb-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <Sparkles size={16} color="#10b981" />
                <Text className={`font-bold text-emerald-700 dark:text-emerald-400 text-sm ${isRtl ? 'mr-1' : 'ml-1'}`}>{t(tUI.diagTitle)}</Text>
              </View>
            )}
            
            <View className="justify-center">
              <Text className={`text-[15px] leading-6 ${isRtl ? 'text-right' : 'text-left'} ${item.isDiagnosis ? "text-emerald-800" : "text-slate-800 dark:text-slate-200"}`}>
                {item.content}
              </Text>
            </View>
            
            {(item.canRetry || item.content.includes("ضغط") || item.content.includes("السيرفر")) && (
              <View className="mt-3 gap-2">
                <TouchableOpacity
                  onPress={() => {
                    console.log("Attempting retry. History:", chatHistory, "Messages:", messages);
                    
                    // 1. Try to find in chatHistory
                    let msgToRetry = [...chatHistory]
                      .reverse()
                      .find(h => h.role?.toUpperCase() === "USER" && h.content?.trim())?.content;
                    
                    // 2. Fallback to messages state if history is empty
                    if (!msgToRetry) {
                      msgToRetry = [...messages]
                        .reverse()
                        .find(m => m.sender === "user" && m.content?.trim())?.content;
                    }

                    // 3. Fallback to current input if nothing else found
                    if (!msgToRetry) {
                      msgToRetry = inputText.trim();
                    }

                    console.log("Final message selected for retry:", msgToRetry);
                    
                    if (msgToRetry) {
                      // Remove error message first
                      setMessages(prev => prev.filter(m => m.id !== item.id));
                      setIsTyping(false);
                      setTimeout(() => handleSend(msgToRetry), 50);
                    } else {
                      console.log("No message found to retry");
                      setIsTyping(false);
                    }
                  }}
                  activeOpacity={0.8}
                  className={`flex-row items-center justify-center gap-2 bg-indigo-600 px-4 py-2.5 rounded-xl`}
                >
                  <RefreshCcw size={14} color="white" />
                  <Text className="text-white text-xs font-bold">{t(tUI.retry)}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      );
    }
    return (
      <View className={`flex-row justify-end items-center mb-5 ${isRtl ? 'flex-row-reverse mr-0 ml-2' : 'mr-2 ml-0'}`}>
        <View className={`bg-indigo-600 p-4 rounded-3xl shadow-md max-w-[82%] justify-center ${isRtl ? 'rounded-bl-sm' : 'rounded-br-sm'}`}>
          <Text className={`text-white leading-6 text-[15px] ${isRtl ? 'text-right' : 'text-left'}`}>{item.content}</Text>
        </View>
        <View className={`w-9 h-9 rounded-full bg-slate-200 items-center justify-center shadow-sm ${isRtl ? 'mr-3' : 'ml-3'}`}>
          <User size={18} color="#475569" />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={["top", "bottom"]}>
      {/* Background Blurs */}
      <View className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden" pointerEvents="none">
        <View className="absolute top-[-50px] left-[-50px] w-72 h-72 bg-indigo-500 opacity-20 dark:opacity-10 rounded-full" style={{ transform: [{ scale: 1.5 }] }} />
        <View className="absolute bottom-[20%] right-[-50px] w-80 h-80 bg-purple-500 opacity-20 dark:opacity-10 rounded-full" style={{ transform: [{ scale: 1.5 }] }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
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

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => (
            <View>
              {isTyping && (
                <View className={`flex-row items-end mb-5 ${isRtl ? 'flex-row-reverse ml-0 mr-2' : 'ml-2 mr-0'}`}>
                  <View className={`w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 items-center justify-center shadow-sm ${isRtl ? 'ml-2' : 'mr-2'}`}>
                    <Bot size={16} color={isDark ? "#818cf8" : "#4f46e5"} />
                  </View>
                  <View className="bg-white dark:bg-slate-800 p-4 rounded-3xl rounded-bl-sm shadow-sm border border-slate-100 dark:border-slate-700">
                    <ActivityIndicator size="small" color="#4f46e5" />
                  </View>
                </View>
              )}
            </View>
          )}
        />

        <View className="px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          {/* Display attached images */}
          {files.length > 0 && (
            <View className="mb-3">
              <View className={`flex-row flex-wrap gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                {files.map((file, index) => (
                  <View key={index} className="relative">
                    <Image 
                      source={{ uri: file.uri }} 
                      className="w-16 h-16 rounded-lg"
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      onPress={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center shadow-md"
                      activeOpacity={0.8}
                    >
                      <X size={14} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {collectingImages && !completed && (
            <View className={`flex-row gap-2 mb-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <TouchableOpacity onPress={pickImage} className={`flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 rounded-xl px-5 py-3 items-center justify-center flex-row gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <Paperclip size={18} color="#475569" />
                <Text className="text-slate-600 font-bold text-sm">{t(tUI.attachPhotos)} ({files.length})</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleCreateCase} 
                disabled={isSubmitting}
                className="px-6 h-12 bg-indigo-600 rounded-xl items-center justify-center"
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Send size={16} color="white" />
                )}
              </TouchableOpacity>
            </View>
          )}
          {!completed && !collectingImages && (
            <View className={`flex-row items-end gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <View className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-xl px-5 py-3 border border-slate-200">
                <TextInput
                  className={`text-slate-800 dark:text-white min-h-[40px] ${isRtl ? 'text-right' : 'text-left'}`}
                  placeholder={t(tUI.placeholder)}
                  placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                  multiline
                  value={inputText}
                  onChangeText={setInputText}
                  editable={!isTyping && !isSubmitting}
                />
              </View>
              <TouchableOpacity 
                onPress={() => handleSend()} 
                disabled={!inputText.trim() || isTyping || isSubmitting} 
                className={`w-12 h-12 rounded-xl items-center justify-center ${
                  !inputText.trim() || isTyping || isSubmitting ? 'bg-slate-300 dark:bg-slate-700' : 'bg-indigo-600'
                }`}
              >
                <Send size={18} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient"; 
import {
  AlertCircle,
  ArrowRight,
  AtSign,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  Eye,
  EyeOff,
  GraduationCap,
  Hash,
  Lock,
  Mail,
  Phone,
  Sparkles,
  User,
  XCircle,
} from "lucide-react-native";

import { studentSignupSchema, StudentSignupValues } from "../../features/auth/schemas/studentSignupSchema";
import { authService } from "../../features/auth/services/authService";
import { useThemeLanguage } from "../../store/ThemeLanguageContext";
import { UniversityPicker } from "../../components/auth/UniversityPicker";
import { UniversityLookup } from "@/types/types";
import BrandLogo from "@/components/common/BrandLogo";

export default function StudentSignupScreen() {
  const router = useRouter();
  const { theme } = useThemeLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isDark = theme === "dark";

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<StudentSignupValues>({
    resolver: zodResolver(studentSignupSchema),
    defaultValues: { fullName: "", username: "", email: "", phone: "", universityId: "", level: 1, password: "" },
  });

  const signupMutation = useMutation({
    mutationFn: authService.registerStudent,
    onSuccess: (res) => {
      if (res.success) {
        setErrorMessage(null);
        setSuccessMessage(res.message || "Registration successful! Redirecting...");
        setTimeout(() => {
          router.push("/(auth)/login");
        }, 2000);
      } else {
        setErrorMessage(res.message || "Registration failed. Please try again.");
      }
    },
    onError: (err: any) => {
      const serverErrors = err?.response?.data?.error?.errors;
      const msg = Array.isArray(serverErrors)
        ? serverErrors.join("\n")
        : err?.response?.data?.message || "Registration failed. Please check your data.";
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 5000);
    },
  });

  return (
    <SafeAreaView className="flex-1 bg-[#F1F5F9] dark:bg-slate-950">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} className="px-5">
          
          {/* Header Section */}
          <View className="mt-8 mb-6 flex-row justify-between items-center">
            <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white dark:bg-slate-900 rounded-full items-center justify-center shadow-sm dark:border dark:border-slate-800">
              <ChevronLeft color={isDark ? "#cbd5e1" : "#1e293b"} size={24} />
            </TouchableOpacity>
            <View className="flex-row items-center bg-white dark:bg-slate-900 px-4 py-2 rounded-full shadow-sm border border-slate-50 dark:border-slate-800">
              <BrandLogo size={20} isDark={isDark} />
              <Text className="ml-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest">Student Portal</Text>
            </View>
          </View>

          <View className="mb-8">
            <Text className="text-3xl font-black text-slate-900 dark:text-white leading-tight">Create your{"\n"}Academic Account</Text>
            <View className="h-1.5 w-12 bg-indigo-600 dark:bg-indigo-500 rounded-full mt-3" />
          </View>

          {errorMessage && (
            <View className="mb-6 flex-row items-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 p-4 rounded-2xl shadow-sm">
              <AlertCircle color="#ef4444" size={20} />
              <Text className="flex-1 ml-3 text-red-600 dark:text-red-400 font-bold text-sm">
                {errorMessage}
              </Text>
              <TouchableOpacity onPress={() => setErrorMessage(null)}>
                <XCircle color={isDark ? "#f87171" : "#fca5a5"} size={18} />
              </TouchableOpacity>
            </View>
          )}

          {successMessage && (
            <View className="mb-6 flex-row items-center bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/50 p-4 rounded-2xl shadow-sm">
              <CheckCircle2 color="#10b981" size={20} />
              <Text className="flex-1 ml-3 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                {successMessage}
              </Text>
              <TouchableOpacity onPress={() => setSuccessMessage(null)}>
                <XCircle color={isDark ? "#34d399" : "#6ee7b7"} size={18} />
              </TouchableOpacity>
            </View>
          )}

          <Controller
            control={control}
            name="universityId"
            render={({ field: { value, onChange } }) => (
              <UniversityPicker 
                value={value}
                error={errors.universityId?.message}
                onSelect={(uni: UniversityLookup) => {
                  onChange(uni.id);
                }} 
              />
            )}
          />

          {/* Form Card 1: Personal Info */}
          <View className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-xl shadow-slate-200 dark:shadow-none mb-5 border border-slate-50 dark:border-slate-800">
            <View className="flex-row items-center mb-5 gap-2">
               <Sparkles size={18} color={isDark ? "#818cf8" : "#4f46e5"} />
               <Text className="font-black text-slate-800 dark:text-slate-200 uppercase text-[11px] tracking-widest">Personal Information</Text>
            </View>

            <View className="space-y-4">
              {/* Full Name */}
              <View className="bg-slate-50 dark:bg-slate-950 rounded-2xl px-4 py-3 border border-slate-100 dark:border-slate-800">
                <Text className="text-[10px] font-bold text-slate-400 py-1 uppercase mb-1">Full Name</Text>
                <View className="flex-row items-center">
                  <User color={isDark ? "#64748b" : "#4f46e5"} size={18} />
                  <Controller control={control} name="fullName" render={({ field: { onChange, value } }) => (
                    <TextInput className="flex-1 ml-3 text-slate-900 dark:text-white font-bold text-[15px]" placeholder="Ahmed Mohamed" placeholderTextColor={isDark ? "#475569" : "#cbd5e1"} onChangeText={onChange} value={value} />
                  )} />
                </View>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-2xl px-4 py-3 border border-slate-100 dark:border-slate-800">
                  <Text className="text-[10px] font-bold text-slate-400 py-1 uppercase mb-1">Username</Text>
                  <Controller control={control} name="username" render={({ field: { onChange, value } }) => (
                    <TextInput className="text-slate-900 dark:text-white font-bold" placeholder="@user" placeholderTextColor={isDark ? "#475569" : "#cbd5e1"} autoCapitalize="none" onChangeText={onChange} value={value} />
                  )} />
                </View>
                <View className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-2xl px-4 py-3 border border-slate-100 dark:border-slate-800">
                  <Text className="text-[10px] font-bold text-slate-400 py-1 uppercase mb-1">Phone</Text>
                  <Controller control={control} name="phone" render={({ field: { onChange, value } }) => (
                    <TextInput className="text-slate-900 dark:text-white font-bold" placeholder="01..." placeholderTextColor={isDark ? "#475569" : "#cbd5e1"} keyboardType="phone-pad" onChangeText={onChange} value={value} />
                  )} />
                </View>
              </View>

              <View className="bg-slate-50 dark:bg-slate-950 rounded-2xl px-4 py-3 border border-slate-100 dark:border-slate-800">
                <Text className="text-[10px] font-bold text-slate-400 py-1 uppercase mb-1">Email Address</Text>
                <View className="flex-row items-center">
                  <Mail color={isDark ? "#64748b" : "#4f46e5"} size={18} />
                  <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
                    <TextInput className="flex-1 ml-3 text-slate-900 dark:text-white font-bold" placeholder="name@uni.edu" placeholderTextColor={isDark ? "#475569" : "#cbd5e1"} autoCapitalize="none" onChangeText={onChange} value={value} />
                  )} />
                </View>
              </View>
            </View>
          </View>

          {/* Form Card 2: Academic & Security */}
          <View className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-xl shadow-slate-200 dark:shadow-none mb-8 border border-slate-50 dark:border-slate-800">
            <View className="flex-row items-center mb-5 gap-2">
               <GraduationCap size={18} color={isDark ? "#818cf8" : "#4f46e5"} />
               <Text className="font-black text-slate-800 dark:text-slate-200 uppercase text-[11px] tracking-widest">Academic & Security</Text>
            </View>

            <View className="space-y-4">
              <View className="flex-row gap-3">
                <View className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-2xl px-4 py-3 border border-slate-100 dark:border-slate-800">
                  <Text className="text-[10px] font-bold text-slate-400 py-1 uppercase mb-1">Level</Text>
                  <Controller control={control} name="level" render={({ field: { onChange, value } }) => (
                    <TextInput className="text-slate-900 dark:text-white font-bold" keyboardType="numeric" placeholderTextColor={isDark ? "#475569" : "#cbd5e1"} onChangeText={(t) => onChange(Number(t))} value={value?.toString()} />
                  )} />
                </View>
              </View>

              <View className="bg-slate-50 dark:bg-slate-950 rounded-2xl px-4 py-3 border border-slate-100 dark:border-slate-800">
                <Text className="text-[10px] font-bold text-slate-400 py-1 uppercase mb-1">Password</Text>
                <View className="flex-row items-center py-1">
                  <Lock color={isDark ? "#64748b" : "#4f46e5"} size={18} />
                  <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
                    <TextInput className="flex-1 ml-3 text-slate-900 dark:text-white font-bold" placeholder="••••••••" placeholderTextColor={isDark ? "#475569" : "#cbd5e1"} secureTextEntry={!showPassword} onChangeText={onChange} value={value} />
                  )} />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff color={isDark ? "#64748b" : "#94a3b8"} size={18} /> : <Eye color={isDark ? "#64748b" : "#94a3b8"} size={18} />}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity onPress={handleSubmit((d) => signupMutation.mutate(d))} disabled={signupMutation.isPending} activeOpacity={0.9}>
            <LinearGradient colors={isDark ? ['#4f46e5', '#4338ca'] : ['#4f46e5', '#3b82f6']} start={{x:0, y:0}} end={{x:1, y:0}} className="h-16 rounded-2xl flex-row items-center justify-center shadow-lg shadow-blue-300 dark:shadow-none">
              {signupMutation.isPending ? <ActivityIndicator color="white" /> : (
                <View className="flex-row items-center">
                  <Text className="text-white text-lg font-black mr-2">Create Account</Text>
                  <ArrowRight color="white" size={20} />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View className="py-8 flex-row justify-center">
            <Text className="text-slate-400 font-bold">Already a student? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}><Text className="text-indigo-600 dark:text-indigo-400 font-black">Sign In</Text></TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
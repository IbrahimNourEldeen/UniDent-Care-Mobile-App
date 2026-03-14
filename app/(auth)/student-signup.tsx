import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient"; 
import { User, Mail, Lock, GraduationCap, Eye, EyeOff, ArrowRight, ChevronLeft, BookOpen, Phone, AtSign, Hash, Sparkles } from "lucide-react-native";

import { studentSignupSchema, StudentSignupValues } from "../../features/auth/schemas/studentSignupSchema";
import { authService } from "../../features/auth/services/authService";

export default function StudentSignupScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<StudentSignupValues>({
    resolver: zodResolver(studentSignupSchema),
    defaultValues: { fullName: "", username: "", email: "", phone: "", universityId: "", level: 1, password: "" },
  });

  const signupMutation = useMutation({
    mutationFn: authService.registerStudent,
    onSuccess: () => {
      Alert.alert("Success! 🎓", "Academic account created.");
      router.push("/(auth)/login");
    },
    onError: (err: any) => Alert.alert("Error", err?.response?.data?.message || "Registration failed"),
  });

  return (
    <SafeAreaView className="flex-1 bg-[#F1F5F9]">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} className="px-5">
          
          {/* Header Section */}
          <View className="mt-8 mb-6 flex-row justify-between items-center">
            <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm">
              <ChevronLeft color="#1e293b" size={24} />
            </TouchableOpacity>
            <View className="bg-indigo-100 px-4 py-1.5 rounded-full">
              <Text className="text-indigo-600 font-bold text-xs uppercase tracking-widest">Student Portal</Text>
            </View>
          </View>

          <View className="mb-8">
            <Text className="text-3xl font-black text-slate-900 leading-tight">Create your{"\n"}Academic Account</Text>
            <View className="h-1.5 w-12 bg-indigo-600 rounded-full mt-3" />
          </View>

          {/* Form Card 1: Personal Info */}
          <View className="bg-white rounded-[32px] p-6 shadow-xl shadow-slate-200 mb-5 border border-slate-50">
            <View className="flex-row items-center mb-5 gap-2">
               <Sparkles size={18} color="#4f46e5" />
               <Text className="font-black text-slate-800 uppercase text-[11px] tracking-widest">Personal Information</Text>
            </View>

            <View className="space-y-4">
              {/* Full Name */}
              <View className="bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
                <Text className="text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name</Text>
                <View className="flex-row items-center">
                  <User color="#4f46e5" size={18} />
                  <Controller control={control} name="fullName" render={({ field: { onChange, value } }) => (
                    <TextInput className="flex-1 ml-3 text-slate-900 font-bold text-[15px]" placeholder="Ahmed Mohamed" onChangeText={onChange} value={value} />
                  )} />
                </View>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1 bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
                  <Text className="text-[10px] font-bold text-slate-400 uppercase mb-1">Username</Text>
                  <Controller control={control} name="username" render={({ field: { onChange, value } }) => (
                    <TextInput className="text-slate-900 font-bold" placeholder="@user" autoCapitalize="none" onChangeText={onChange} value={value} />
                  )} />
                </View>
                <View className="flex-1 bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
                  <Text className="text-[10px] font-bold text-slate-400 uppercase mb-1">Phone</Text>
                  <Controller control={control} name="phone" render={({ field: { onChange, value } }) => (
                    <TextInput className="text-slate-900 font-bold" placeholder="01..." keyboardType="phone-pad" onChangeText={onChange} value={value} />
                  )} />
                </View>
              </View>

              <View className="bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
                <Text className="text-[10px] font-bold text-slate-400 uppercase mb-1">Email Address</Text>
                <View className="flex-row items-center">
                  <Mail color="#4f46e5" size={18} />
                  <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
                    <TextInput className="flex-1 ml-3 text-slate-900 font-bold" placeholder="name@uni.edu" autoCapitalize="none" onChangeText={onChange} value={value} />
                  )} />
                </View>
              </View>
            </View>
          </View>

          {/* Form Card 2: Academic & Security */}
          <View className="bg-white rounded-[32px] p-6 shadow-xl shadow-slate-200 mb-8 border border-slate-50">
            <View className="flex-row items-center mb-5 gap-2">
               <GraduationCap size={18} color="#4f46e5" />
               <Text className="font-black text-slate-800 uppercase text-[11px] tracking-widest">Academic & Security</Text>
            </View>

            <View className="space-y-4">
              <View className="flex-row gap-3">
                <View className="flex-[2] bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
                  <Text className="text-[10px] font-bold text-slate-400 uppercase mb-1">University ID</Text>
                  <Controller control={control} name="universityId" render={({ field: { onChange, value } }) => (
                    <TextInput className="text-slate-900 font-bold text-xs" placeholder="UUID Code" onChangeText={onChange} value={value} />
                  )} />
                </View>
                <View className="flex-1 bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
                  <Text className="text-[10px] font-bold text-slate-400 uppercase mb-1">Level</Text>
                  <Controller control={control} name="level" render={({ field: { onChange, value } }) => (
                    <TextInput className="text-slate-900 font-bold" keyboardType="numeric" onChangeText={(t) => onChange(Number(t))} value={value?.toString()} />
                  )} />
                </View>
              </View>

              <View className="bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
                <Text className="text-[10px] font-bold text-slate-400 uppercase mb-1">Password</Text>
                <View className="flex-row items-center">
                  <Lock color="#4f46e5" size={18} />
                  <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
                    <TextInput className="flex-1 ml-3 text-slate-900 font-bold" placeholder="••••••••" secureTextEntry={!showPassword} onChangeText={onChange} value={value} />
                  )} />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff color="#94a3b8" size={18} /> : <Eye color="#94a3b8" size={18} />}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity onPress={handleSubmit((d) => signupMutation.mutate(d))} disabled={signupMutation.isPending} activeOpacity={0.9}>
            <LinearGradient colors={['#4f46e5', '#3b82f6']} start={{x:0, y:0}} end={{x:1, y:0}} className="h-16 rounded-2xl flex-row items-center justify-center shadow-lg shadow-blue-300">
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
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}><Text className="text-indigo-600 font-black">Sign In</Text></TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
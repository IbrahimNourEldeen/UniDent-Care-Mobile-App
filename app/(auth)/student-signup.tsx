import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  User,
  Mail,
  Lock,
  GraduationCap,
  Eye,
  EyeOff,
  ArrowRight,
  ChevronLeft,
  BookOpen,
  Phone,
  AtSign,
  Building2,
  Hash,
} from "lucide-react-native";

import {
  studentSignupSchema,
  StudentSignupValues,
} from "../../features/auth/schemas/studentSignupSchema";
import { authService } from "../../features/auth/services/authService";

export default function StudentSignupScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentSignupValues>({
    resolver: zodResolver(studentSignupSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      phone: "",
      universityId: "",
      university: "",
      level: 1, // Default level
      password: "",
    },
  });

  const signupMutation = useMutation({
    mutationFn: authService.registerStudent,
    onSuccess: (res) => {
      if (res.success) {
        Alert.alert("Success! 🎓", "Academic account created successfully.");
        router.push("/(auth)/login");
      }
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Registration failed. Check your data.";
      Alert.alert("Error", msg);
    },
  });

  const onSubmit = (data: StudentSignupValues) => signupMutation.mutate(data);

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFF]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          className="px-6 py-4"
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center mb-6 self-start p-2 -ml-2"
          >
            <ChevronLeft color="#4f46e5" size={24} />
            <Text className="text-indigo-600 font-bold text-lg ml-1">Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-indigo-600 rounded-2xl items-center justify-center shadow-lg shadow-indigo-200">
              <BookOpen color="white" size={30} />
            </View>
            <Text className="text-3xl font-black text-slate-900 mt-4 text-center">
              Student Portal
            </Text>
            <Text className="text-slate-500 font-medium text-center mt-1">
              Create your account to start learning
            </Text>
          </View>

          {/* Form Fields */}
          <View className="space-y-4">
            
            {/* Full Name & Username */}
            <View>
              <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Full Name</Text>
              <View className={`flex-row items-center bg-white border-2 ${errors.fullName ? "border-red-400" : "border-indigo-50/50"} rounded-2xl px-4 py-3.5 shadow-sm`}>
                <User color="#94a3b8" size={20} />
                <Controller
                  control={control}
                  name="fullName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput className="flex-1 ml-3 text-slate-900 font-medium" placeholder="Ahmed Ali" onBlur={onBlur} onChangeText={onChange} value={value} />
                  )}
                />
              </View>
              {errors.fullName && <Text className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.fullName.message}</Text>}
            </View>

            <View>
              <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Username</Text>
              <View className={`flex-row items-center bg-white border-2 ${errors.username ? "border-red-400" : "border-indigo-50/50"} rounded-2xl px-4 py-3.5 shadow-sm`}>
                <AtSign color="#94a3b8" size={20} />
                <Controller
                  control={control}
                  name="username"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput className="flex-1 ml-3 text-slate-900 font-medium" placeholder="ahmed_99" autoCapitalize="none" onBlur={onBlur} onChangeText={onChange} value={value} />
                  )}
                />
              </View>
              {errors.username && <Text className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.username.message}</Text>}
            </View>

            {/* Email & Phone */}
            <View>
              <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Email Address</Text>
              <View className={`flex-row items-center bg-white border-2 ${errors.email ? "border-red-400" : "border-indigo-50/50"} rounded-2xl px-4 py-3.5 shadow-sm`}>
                <Mail color="#94a3b8" size={20} />
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput className="flex-1 ml-3 text-slate-900 font-medium" placeholder="student@uni.edu" keyboardType="email-address" autoCapitalize="none" onBlur={onBlur} onChangeText={onChange} value={value} />
                  )}
                />
              </View>
              {errors.email && <Text className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.email.message}</Text>}
            </View>

            <View>
              <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Phone Number</Text>
              <View className={`flex-row items-center bg-white border-2 ${errors.phone ? "border-red-400" : "border-indigo-50/50"} rounded-2xl px-4 py-3.5 shadow-sm`}>
                <Phone color="#94a3b8" size={20} />
                <Controller
                  control={control}
                  name="phone"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput className="flex-1 ml-3 text-slate-900 font-medium" placeholder="01012345678" keyboardType="phone-pad" onBlur={onBlur} onChangeText={onChange} value={value} />
                  )}
                />
              </View>
              {errors.phone && <Text className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.phone.message}</Text>}
            </View>

            {/* University & University ID */}
            <View>
              <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">University Name</Text>
              <View className={`flex-row items-center bg-white border-2 ${errors.university ? "border-red-400" : "border-indigo-50/50"} rounded-2xl px-4 py-3.5 shadow-sm`}>
                <Building2 color="#94a3b8" size={20} />
                <Controller
                  control={control}
                  name="university"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput className="flex-1 ml-3 text-slate-900 font-medium" placeholder="Cairo University" onBlur={onBlur} onChangeText={onChange} value={value} />
                  )}
                />
              </View>
              {errors.university && <Text className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.university.message}</Text>}
            </View>

            <View className="flex-row space-x-4">
              <View className="flex-[2]">
                <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Student ID</Text>
                <View className={`flex-row items-center bg-white border-2 ${errors.universityId ? "border-red-400" : "border-indigo-50/50"} rounded-2xl px-4 py-3.5 shadow-sm`}>
                  <Hash color="#94a3b8" size={18} />
                  <Controller
                    control={control}
                    name="universityId"
                    render={({ field: { onChange, value } }) => (
                      <TextInput className="flex-1 ml-2 text-slate-900 font-medium" placeholder="ID Number" keyboardType="numeric" onChangeText={onChange} value={value} />
                    )}
                  />
                </View>
              </View>

              <View className="flex-1">
                <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Level</Text>
                <View className={`flex-row items-center bg-white border-2 ${errors.level ? "border-red-400" : "border-indigo-50/50"} rounded-2xl px-4 py-3.5 shadow-sm`}>
                  <GraduationCap color="#94a3b8" size={18} />
                  <Controller
                    control={control}
                    name="level"
                    render={({ field: { onChange, value } }) => (
                      <TextInput 
                        className="flex-1 ml-2 text-slate-900 font-medium" 
                        placeholder="1-7" 
                        keyboardType="numeric" 
                        maxLength={1} 
                        onChangeText={(text) => onChange(parseInt(text) || 0)} 
                        value={value?.toString()} 
                      />
                    )}
                  />
                </View>
              </View>
            </View>

            {/* Password */}
            <View>
              <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Password</Text>
              <View className={`flex-row items-center bg-white border-2 ${errors.password ? "border-red-400" : "border-indigo-50/50"} rounded-2xl px-4 py-3.5 shadow-sm`}>
                <Lock color="#94a3b8" size={20} />
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, value } }) => (
                    <TextInput className="flex-1 ml-3 text-slate-900 font-medium" placeholder="••••••••" secureTextEntry={!showPassword} onChangeText={onChange} value={value} />
                  )}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff color="#94a3b8" size={20} /> : <Eye color="#94a3b8" size={20} />}
                </TouchableOpacity>
              </View>
              {errors.password && <Text className="text-[10px] text-red-500 font-bold mt-1 ml-1 leading-4">{errors.password.message}</Text>}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={signupMutation.isPending}
              activeOpacity={0.8}
              className={`mt-6 bg-slate-900 h-16 rounded-2xl flex-row items-center justify-center shadow-xl shadow-indigo-100 ${signupMutation.isPending ? "opacity-70" : ""}`}
            >
              {signupMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white text-lg font-bold mr-2">Create Account</Text>
                  <ArrowRight color="white" size={20} />
                </>
              )}
            </TouchableOpacity>

            {/* Footer */}
            <View className="mt-4 mb-10 flex-row justify-center">
              <Text className="text-slate-500 font-medium">Already a member? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text className="text-indigo-600 font-bold">Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
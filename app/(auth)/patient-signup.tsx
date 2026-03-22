import { FontAwesome5 } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  Eye,
  EyeOff,
  Fingerprint,
  Lock,
  MapPin,
  Phone,
  User,
} from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  patientSignupSchema,
  PatientSignupValues,
} from "../../features/auth/schemas/patientSignupSchema";
import { authService } from "../../features/auth/services/authService";
import { useThemeLanguage } from "../../store/ThemeLanguageContext";

export default function PatientSignupScreen() {
  const router = useRouter();
  const { theme } = useThemeLanguage();
  const [showPassword, setShowPassword] = useState(false);

  const isDark = theme === "dark";

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientSignupValues>({
    resolver: zodResolver(patientSignupSchema),
    defaultValues: {
      fullName: "",
      password: "",
      phoneNumber: "",
      nationalId: "",
      birthDate: new Date().toISOString(),
      gender: 0,
      city: 0,
    },
  });

  const signupMutation = useMutation({
    mutationFn: authService.registerPatient,
    onSuccess: (res) => {
      if (res.success) {
        Alert.alert("Welcome! 🎉", "Your account is ready.");
        router.push("/(auth)/login");
      }
    },
    onError: (err: any) => {
      const errorMsg = err?.response?.data?.message || "Registration failed";
      Alert.alert("Signup Failed", errorMsg);
    },
  });

  const onSubmit = (data: PatientSignupValues) => signupMutation.mutate(data);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          className="px-6 py-4"
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center mb-6"
          >
            <ChevronLeft color={isDark ? "#818cf8" : "#2563eb"} size={24} />
            <Text className="text-blue-600 dark:text-indigo-400 font-bold text-lg ml-1">Back</Text>
          </TouchableOpacity>

          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-blue-600 dark:bg-indigo-600 rounded-2xl items-center justify-center shadow-lg shadow-blue-200 dark:shadow-indigo-900/50">
              <FontAwesome5 name="tooth" size={28} color="white" />
            </View>
            <Text className="text-3xl font-black text-slate-900 dark:text-white mt-4 text-center">
              Patient Registration
            </Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                Full Name
              </Text>
              <View
                className={`flex-row items-center bg-white dark:bg-slate-900 border-2 ${errors.fullName ? "border-red-400 dark:border-red-500" : "border-slate-100 dark:border-slate-800"} rounded-2xl px-4 py-3 shadow-sm dark:shadow-none`}
              >
                <User color={isDark ? "#64748b" : "#94a3b8"} size={20} />
                <Controller
                  control={control}
                  name="fullName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="flex-1 ml-3 text-slate-900 dark:text-white font-medium"
                      placeholder="Ahmed Salem"
                      placeholderTextColor={isDark ? "#475569" : "#cbd5e1"}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>
              {errors.fullName && (
                <Text className="text-xs text-red-500 font-bold mt-1 ml-1">
                  {errors.fullName.message}
                </Text>
              )}
            </View>

            <View className="mt-4">
              <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                Phone Number
              </Text>
              <View
                className={`flex-row items-center bg-white dark:bg-slate-900 border-2 ${errors.phoneNumber ? "border-red-400 dark:border-red-500" : "border-slate-100 dark:border-slate-800"} rounded-2xl px-4 py-3 shadow-sm dark:shadow-none`}
              >
                <Phone color={isDark ? "#64748b" : "#94a3b8"} size={20} />
                <Controller
                  control={control}
                  name="phoneNumber"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="flex-1 ml-3 text-slate-900 dark:text-white font-medium"
                      placeholder="01xxxxxxxxx"
                      placeholderTextColor={isDark ? "#475569" : "#cbd5e1"}
                      keyboardType="phone-pad"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>
              {errors.phoneNumber && (
                <Text className="text-xs text-red-500 font-bold mt-1 ml-1">
                  {errors.phoneNumber.message}
                </Text>
              )}
            </View>

            <View className="mt-4">
              <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                National ID
              </Text>
              <View
                className={`flex-row items-center bg-white dark:bg-slate-900 border-2 ${errors.nationalId ? "border-red-400 dark:border-red-500" : "border-slate-100 dark:border-slate-800"} rounded-2xl px-4 py-3 shadow-sm dark:shadow-none`}
              >
                <Fingerprint color={isDark ? "#64748b" : "#94a3b8"} size={20} />
                <Controller
                  control={control}
                  name="nationalId"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="flex-1 ml-3 text-slate-900 dark:text-white font-medium"
                      placeholder="14-digit national ID"
                      placeholderTextColor={isDark ? "#475569" : "#cbd5e1"}
                      keyboardType="numeric"
                      maxLength={14}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>
              {errors.nationalId && (
                <Text className="text-xs text-red-500 font-bold mt-1 ml-1">
                  {errors.nationalId.message}
                </Text>
              )}
            </View>

            <View className="mt-4">
              <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                Date of Birth
              </Text>
              <View
                className={`flex-row items-center bg-white dark:bg-slate-900 border-2 ${errors.birthDate ? "border-red-400 dark:border-red-500" : "border-slate-100 dark:border-slate-800"} rounded-2xl px-4 py-3 shadow-sm dark:shadow-none`}
              >
                <Calendar color={isDark ? "#64748b" : "#94a3b8"} size={20} />
                <Controller
                  control={control}
                  name="birthDate"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="flex-1 ml-3 text-slate-900 dark:text-white font-medium"
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={isDark ? "#475569" : "#cbd5e1"}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>
            </View>

            <View className="flex-row space-x-3 mt-4">
              <View className="flex-1">
                <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                  City ID
                </Text>
                <View
                  className={`flex-row items-center bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-sm dark:shadow-none`}
                >
                  <MapPin color={isDark ? "#64748b" : "#94a3b8"} size={18} />
                  <Controller
                    control={control}
                    name="city"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        className="flex-1 ml-2 text-slate-900 dark:text-white font-medium"
                        placeholder="0"
                        placeholderTextColor={isDark ? "#475569" : "#cbd5e1"}
                        keyboardType="numeric"
                        onChangeText={(val) => onChange(Number(val))}
                        value={value.toString()}
                      />
                    )}
                  />
                </View>
              </View>

              <View className="flex-1">
                <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                  Gender
                </Text>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field: { onChange, value } }) => (
                    <View className="flex-row bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                      <TouchableOpacity
                        onPress={() => onChange(0)}
                        className={`flex-1 py-2 rounded-xl items-center ${value === 0 ? "bg-white dark:bg-slate-700 shadow-sm dark:shadow-none" : ""}`}
                      >
                        <Text
                          className={`font-bold ${value === 0 ? "text-blue-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`}
                        >
                          M
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => onChange(1)}
                        className={`flex-1 py-2 rounded-xl items-center ${value === 1 ? "bg-white dark:bg-slate-700 shadow-sm dark:shadow-none" : ""}`}
                      >
                        <Text
                          className={`font-bold ${value === 1 ? "text-blue-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`}
                        >
                          F
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
              </View>
            </View>

            <View className="mt-4">
              <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                Password
              </Text>
              <View
                className={`flex-row items-center bg-white dark:bg-slate-900 border-2 ${errors.password ? "border-red-400 dark:border-red-500" : "border-slate-100 dark:border-slate-800"} rounded-2xl px-4 py-3 shadow-sm dark:shadow-none`}
              >
                <Lock color={isDark ? "#64748b" : "#94a3b8"} size={20} />
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      className="flex-1 ml-3 text-slate-900 dark:text-white font-medium"
                      placeholder="••••••••"
                      placeholderTextColor={isDark ? "#475569" : "#cbd5e1"}
                      secureTextEntry={!showPassword}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff color={isDark ? "#64748b" : "#94a3b8"} size={20} />
                  ) : (
                    <Eye color={isDark ? "#64748b" : "#94a3b8"} size={20} />
                  )}
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text className="text-[10px] text-red-500 font-bold mt-1 ml-1">
                  {errors.password.message}
                </Text>
              )}
            </View>

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={signupMutation.isPending}
              activeOpacity={0.8}
              className={`mt-10 ${isDark ? "bg-indigo-600" : "bg-slate-900"} h-16 rounded-3xl flex-row items-center justify-center shadow-xl dark:shadow-none ${signupMutation.isPending ? "opacity-70" : ""}`}
            >
              {signupMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white text-lg font-bold mr-2">
                    Create Account
                  </Text>
                  <ArrowRight color="white" size={20} />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View className="mt-6 mb-10 flex-row justify-center">
            <Text className="text-slate-500 dark:text-slate-400 font-medium">
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text className="text-blue-600 dark:text-indigo-400 font-bold">Log in here</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

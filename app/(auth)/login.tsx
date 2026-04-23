import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    ChevronLeft,
    Eye,
    EyeOff,
    Lock,
    Mail,
    ShieldCheck,
    XCircle,
} from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppDispatch } from "../../store/hooks";

import {
    LoginFormValues,
    loginSchema,
} from "../../features/auth/schemas/loginSchema";
import { authService } from "../../features/auth/services/authService";

import * as SecureStore from "expo-secure-store";
import { useThemeLanguage } from "../../store/ThemeLanguageContext";
import BrandLogo from "@/components/common/BrandLogo";

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { theme } = useThemeLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isDark = theme === "dark";

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: async (response) => {
      if (response.success && response.data.token) {
        setErrorMessage(null);
        setSuccessMessage(response.message || "Login successful! Redirecting...");
        await SecureStore.setItemAsync("token", response.data.token);
        
        if (response.data.publicId) {
          await SecureStore.setItemAsync("publicId", response.data.publicId);
        }
        
        if (response.data.uinversalId) {
          await SecureStore.setItemAsync("universityId", response.data.uinversalId);
        }
        
        if (response.data.roles && response.data.roles.length > 0) {
          await SecureStore.setItemAsync("role", response.data.roles[0]);
        }
        
        // Delay redirect to show success message
        setTimeout(() => {
          router.replace("/(screens)");
        }, 1500);
      } else {
        setErrorMessage(response.message || "Login failed. Please try again.");
      }
    },
    onError: (error: any) => {
      const responseData = error?.response?.data;
      let msg = "Invalid credentials. Please try again.";

      if (responseData) {
        if (responseData.error?.errors && Array.isArray(responseData.error.errors) && responseData.error.errors.length > 0) {
          msg = responseData.error.errors.join("\n");
        } else if (responseData.message) {
          msg = responseData.message;
        }
      }
      
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 5000);
    },
  });

  const onSubmit = (data: LoginFormValues) => loginMutation.mutate(data);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity onPress={() => router.push("/")} className="absolute top-2 left-4 z-10">
          <View className="flex-row items-center p-2">
            <ChevronLeft color={isDark ? "#818cf8" : "#4f46e5"} size={24} />
            <Text className="text-blue-600 dark:text-indigo-400 font-bold text-lg ml-1">Home</Text>
          </View>
        </TouchableOpacity>

        <View className="flex-1 justify-center px-6 py-10">
            <View className="items-center mb-10">
              <View className="w-24 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl items-center justify-center shadow-xl shadow-slate-200 dark:shadow-none">
                <BrandLogo size={64} isDark={isDark} />
              </View>
            <Text className="text-3xl font-black text-slate-900 dark:text-white mt-4">
              UniDent <Text className="text-blue-600 dark:text-indigo-400">Care</Text>
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 font-medium italic mt-1">
              Your Smile, Our Passion
            </Text>
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

          <View className="space-y-4">
            <View>
              <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                Email Address
              </Text>
              <View
                className={`flex-row items-center bg-white dark:bg-slate-900 border-2 ${errors.email ? "border-red-400" : "border-slate-100 dark:border-slate-800"} rounded-2xl px-4 py-3 shadow-sm`}
              >
                <Mail color={isDark ? "#64748b" : "#94a3b8"} size={20} />
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="flex-1 ml-3 text-slate-900 dark:text-white font-medium"
                      placeholder="Email or Phone number"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      keyboardType="default"
                      autoCapitalize="none"
                      placeholderTextColor={isDark ? "#475569" : "#cbd5e1"}
                    />
                  )}
                />
              </View>
              {errors.email && (
                <Text className="text-xs text-red-500 font-bold mt-1 ml-1">
                  {errors.email.message}
                </Text>
              )}
            </View>

            <View className="mt-4">
              <View className="flex-row justify-between items-center mb-2 ml-1">
                <Text className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Password
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push("/(auth)/forget-password")}
                >
                  <Text className="text-xs font-bold text-blue-600 dark:text-indigo-400">
                    Forgot?
                  </Text>
                </TouchableOpacity>
              </View>
              <View
                className={`flex-row items-center bg-white dark:bg-slate-900 border-2 ${errors.password ? "border-red-400" : "border-slate-100 dark:border-slate-800"} rounded-2xl px-4 py-3 shadow-sm`}
              >
                <Lock color={isDark ? "#64748b" : "#94a3b8"} size={20} />
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="flex-1 ml-3 text-slate-900 dark:text-white font-medium"
                      placeholder="••••••••"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry={!showPassword}
                      placeholderTextColor={isDark ? "#475569" : "#cbd5e1"}
                    />
                  )}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="p-1"
                >
                  {showPassword ? (
                    <EyeOff color={isDark ? "#64748b" : "#94a3b8"} size={20} />
                  ) : (
                    <Eye color={isDark ? "#64748b" : "#94a3b8"} size={20} />
                  )}
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text className="text-xs text-red-500 font-bold mt-1 ml-1">
                  {errors.password.message}
                </Text>
              )}
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={loginMutation.isPending}
              activeOpacity={0.8}
              className={`mt-8 ${isDark ? "bg-indigo-600" : "bg-slate-900"} h-16 rounded-2xl flex-row items-center justify-center shadow-lg shadow-slate-300 dark:shadow-none ${loginMutation.isPending ? "opacity-70" : ""}`}
            >
              {loginMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white text-lg font-bold mr-2">
                    Sign In
                  </Text>
                  <ArrowRight color="white" size={20} />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="mt-10 flex-row justify-center">
            <Text className="text-slate-500 dark:text-slate-400 font-medium">
              Don't have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/patient-signup")}>
              <Text className="text-blue-600 dark:text-indigo-400 font-bold">Create one</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

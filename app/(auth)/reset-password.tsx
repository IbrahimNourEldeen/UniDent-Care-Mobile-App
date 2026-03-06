import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
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
  resetPasswordSchema,
  ResetPasswordValues,
} from "../../features/auth/schemas/resetPasswordSchema";
import { authService } from "../../features/auth/services/authService";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token, email } = useLocalSearchParams<{
    token: string;
    email: string;
  }>();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const resetMutation = useMutation({
    mutationFn: (data: ResetPasswordValues) =>
      authService.resetPassword({
        email: email as string,
        token: token as string,
        newPassword: data.password,
      }),
    onSuccess: (response) => {
      if (response.success) {
        Alert.alert(
          "Success 🎉",
          "Password reset successfully! You can login now.",
        );
        router.replace("/(auth)/login");
      }
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Failed to reset password";
      Alert.alert("Error", msg);
    },
  });

  const onSubmit = (data: ResetPasswordValues) => {
    if (!token || !email) {
      Alert.alert("Invalid Link", "The reset link is missing or expired.");
      return;
    }
    resetMutation.mutate(data);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          className="px-6 py-6"
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center mb-10"
          >
            <ChevronLeft color="#2563eb" size={24} />
            <Text className="text-blue-600 font-bold text-lg ml-1">Back</Text>
          </TouchableOpacity>

          <View className="items-center mb-12">
            <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4">
              <ShieldCheck color="#2563eb" size={45} />
            </View>
            <Text className="text-3xl font-black text-slate-900">
              New Password
            </Text>
            <Text className="text-slate-500 font-medium text-center mt-2 px-4">
              Enter your new password below to secure your account.
            </Text>
          </View>

          <View className="space-y-5">
            <View>
              <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">
                New Password
              </Text>
              <View
                className={`flex-row items-center bg-white border-2 ${errors.password ? "border-red-400" : "border-slate-100"} rounded-2xl px-4 py-4 shadow-sm shadow-slate-100`}
              >
                <Lock color="#94a3b8" size={20} />
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="flex-1 ml-3 text-slate-900 font-semibold"
                      placeholder="••••••••"
                      secureTextEntry={!showPassword}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff color="#94a3b8" size={20} />
                  ) : (
                    <Eye color="#94a3b8" size={20} />
                  )}
                </TouchableOpacity>
              </View>
              {errors.password && (
                <View className="flex-row items-center mt-1 ml-1">
                  <AlertCircle color="#ef4444" size={12} />
                  <Text className="text-xs text-red-500 font-bold ml-1">
                    {errors.password.message}
                  </Text>
                </View>
              )}
            </View>

            <View className="mt-4">
              <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">
                Confirm New Password
              </Text>
              <View
                className={`flex-row items-center bg-white border-2 ${errors.confirmPassword ? "border-red-400" : "border-slate-100"} rounded-2xl px-4 py-4 shadow-sm shadow-slate-100`}
              >
                <Lock color="#94a3b8" size={20} />
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="flex-1 ml-3 text-slate-900 font-semibold"
                      placeholder="••••••••"
                      secureTextEntry={!showConfirmPassword}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff color="#94a3b8" size={20} />
                  ) : (
                    <Eye color="#94a3b8" size={20} />
                  )}
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <View className="flex-row items-center mt-1 ml-1">
                  <AlertCircle color="#ef4444" size={12} />
                  <Text className="text-xs text-red-500 font-bold ml-1">
                    {errors.confirmPassword.message}
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={resetMutation.isPending}
              activeOpacity={0.8}
              className={`mt-10 bg-blue-600 h-16 rounded-2xl flex-row items-center justify-center shadow-lg shadow-blue-200 ${resetMutation.isPending ? "opacity-70" : ""}`}
            >
              {resetMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white text-lg font-bold mr-2">
                    Update Password
                  </Text>
                  <ArrowRight color="white" size={20} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

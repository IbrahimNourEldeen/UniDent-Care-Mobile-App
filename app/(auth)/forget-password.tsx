import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Mail, ArrowLeft } from "lucide-react-native";

import { authService } from "../../features/auth/services/authService";
import {
  forgetPasswordSchema,
  ForgetPasswordValues,
} from "../../features/auth/schemas/forgetPasswordSchema";

export default function ForgetPasswordScreen() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgetPasswordValues>({
    resolver: zodResolver(forgetPasswordSchema),
  });

  const forgetMutation = useMutation({
    mutationFn: (data: ForgetPasswordValues) =>
      authService.forgotPassword(data.email),
    onSuccess: (response) => {
      if (response.success) {
        Alert.alert("Check your email", response.message || "Reset link sent!");
        router.back();
      } else {
        Alert.alert("Error", response.message || "Something went wrong");
      }
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Error sending email";
      Alert.alert("Failed", msg);
    },
  });

  const onSubmit = (data: ForgetPasswordValues) => forgetMutation.mutate(data);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-10">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-8 w-10 h-10 items-center justify-center rounded-full bg-slate-50"
        >
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>

        <View className="mb-10">
          <Text className="text-3xl font-black text-slate-900">
            Forgot Password? 🔑
          </Text>
          <Text className="mt-2 text-slate-500 font-medium leading-6">
            Enter your email and we'll send you a link to reset your password.
          </Text>
        </View>

        <View className="space-y-6">
          <View>
            <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">
              Email Address
            </Text>
            <View
              className={`flex-row items-center bg-slate-50 border-2 ${errors.email ? "border-red-400" : "border-slate-100"} rounded-2xl px-4 py-4`}
            >
              <Mail color="#94a3b8" size={20} />
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="flex-1 ml-3 text-slate-900 font-medium"
                    placeholder="name@example.com"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                )}
              />
            </View>
            {errors.email && (
              <Text className="text-xs text-red-500 font-bold mt-2 ml-1">
                {errors.email.message}
              </Text>
            )}
          </View>

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={forgetMutation.isPending}
            className={`mt-6 h-16 rounded-2xl items-center justify-center bg-blue-600 ${forgetMutation.isPending ? "opacity-70" : ""}`}
          >
            {forgetMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-bold">
                Send Reset Link
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from "lucide-react-native";
import { useAppDispatch } from "../../store/hooks";

import {
  loginSchema,
  LoginFormValues,
} from "../../features/auth/schemas/loginSchema";
import {
  authService,
  getProfileByRole,
} from "../../features/auth/services/authService";

import * as SecureStore from 'expo-secure-store';
import { login, setUserFromReload } from "@/store/slices/authSlice";
import { getDecodedToken } from "@/utils/decodeToken";

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);

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
        await SecureStore.setItemAsync("token", response.data.token);
        await SecureStore.setItemAsync("user_role", response.data.roles[0]);

        dispatch(login(response.data));

        const decoded = getDecodedToken(response.data.token);
        if (!decoded) return;

        try {
          const user = await getProfileByRole(decoded.role, decoded.userId);
          dispatch(setUserFromReload({ user, role: decoded.role }));
          router.replace("/(tabs)/");
        } catch (err) {
          Alert.alert("Success", "Logged in, but failed to load profile.");
          router.replace("/(tabs)");
        }
      }
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Invalid credentials";
      Alert.alert("Login Failed", msg);
    },
  });

  const onSubmit = (data: LoginFormValues) => loginMutation.mutate(data);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-10">
          <View className="items-center mb-10">
            <View className="w-20 h-20 bg-blue-600 rounded-3xl items-center justify-center shadow-xl shadow-blue-500/50">
              <ShieldCheck color="white" size={40} />
            </View>
            <Text className="text-3xl font-black text-slate-900 mt-4">
              UniDent <Text className="text-blue-600">Care</Text>
            </Text>
            <Text className="text-slate-500 font-medium italic mt-1">
              Your Smile, Our Passion
            </Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">
                Email Address
              </Text>
              <View
                className={`flex-row items-center bg-white border-2 ${errors.email ? "border-red-400" : "border-slate-100"} rounded-2xl px-4 py-3`}
              >
                <Mail color="#94a3b8" size={20} />
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="flex-1 ml-3 text-slate-900 font-medium"
                      placeholder="name@unident.com"
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
                <Text className="text-xs text-red-500 font-bold mt-1 ml-1">
                  {errors.email.message}
                </Text>
              )}
            </View>

            <View className="mt-4">
              <View className="flex-row justify-between items-center mb-2 ml-1">
                <Text className="text-sm font-bold text-slate-700">
                  Password
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push("/(auth)/forget-password")}
                >
                  <Text className="text-xs font-bold text-blue-600">
                    Forgot?
                  </Text>
                </TouchableOpacity>
              </View>
              <View
                className={`flex-row items-center bg-white border-2 ${errors.password ? "border-red-400" : "border-slate-100"} rounded-2xl px-4 py-3`}
              >
                <Lock color="#94a3b8" size={20} />
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="flex-1 ml-3 text-slate-900 font-medium"
                      placeholder="••••••••"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry={!showPassword}
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
                <Text className="text-xs text-red-500 font-bold mt-1 ml-1">
                  {errors.password.message}
                </Text>
              )}
            </View>

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={loginMutation.isPending}
              activeOpacity={0.8}
              className={`mt-8 bg-slate-900 h-16 rounded-2xl flex-row items-center justify-center ${loginMutation.isPending ? "opacity-70" : ""}`}
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

          <View className="mt-10 flex-row justify-center">
            <Text className="text-slate-500 font-medium">
              Don't have an account?{" "}
            </Text>
            <TouchableOpacity 
              onPress={() => router.push("/patient-signup")}
              >
              <Text className="text-blue-600 font-bold">Create one</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
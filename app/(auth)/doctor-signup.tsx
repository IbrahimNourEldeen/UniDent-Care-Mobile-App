import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  Activity,
  ArrowRight,
  AtSign,
  ChevronLeft,
  Eye,
  EyeOff,
  Hash,
  Lock,
  Mail,
  Phone,
  Stethoscope,
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
  doctorSignupSchema,
  DoctorSignupValues,
} from "../../features/auth/schemas/doctorSignupSchema";
import { authService } from "../../features/auth/services/authService";

export default function DoctorSignupScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DoctorSignupValues>({
    resolver: zodResolver(doctorSignupSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      phone: "",
      password: "",
      specialty: "",
      universityId: "",
    },
  });

  const signupMutation = useMutation({
    mutationFn: authService.registerDoctor,
    onSuccess: (res) => {
      if (res.success) {
        Alert.alert("Success 🎉", "Doctor account created successfully!");
        router.push("/(auth)/login");
      }
    },
    onError: (err: any) => {
      const serverErrors = err?.response?.data?.error?.errors;
      const msg = Array.isArray(serverErrors)
        ? serverErrors.join("\n")
        : "Registration failed. Please check your data.";
      Alert.alert("Registration Error", msg);
    },
  });

  const onSubmit = (data: DoctorSignupValues) => signupMutation.mutate(data);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
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
            <ChevronLeft stroke="#0d9488" size={24} />
            <Text className="text-teal-600 font-bold text-lg ml-1">Back</Text>
          </TouchableOpacity>

          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-teal-600 rounded-2xl items-center justify-center shadow-lg shadow-teal-200">
              <Activity stroke="white" size={32} />
            </View>
            <Text className="text-3xl font-black text-slate-900 mt-4 text-center">
              Join UniDent
            </Text>
            <Text className="text-slate-500 font-medium text-center mt-1">
              Step into a world of digital dental care
            </Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">
                Full Name
              </Text>
              <View
                className={`flex-row items-center bg-white border-2 ${errors.fullName ? "border-red-400" : "border-slate-100"} rounded-2xl px-4 py-3`}
              >
                <User stroke="#94a3b8" size={20} />
                <Controller
                  control={control}
                  name="fullName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="flex-1 ml-3 text-slate-900 font-medium"
                      placeholder="Dr. Ahmed Ali"
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
              <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">
                Username
              </Text>
              <View
                className={`flex-row items-center bg-white border-2 ${errors.username ? "border-red-400" : "border-slate-100"} rounded-2xl px-4 py-3`}
              >
                <AtSign stroke="#94a3b8" size={20} />
                <Controller
                  control={control}
                  name="username"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="flex-1 ml-3 text-slate-900 font-medium"
                      placeholder="dr_ahmed99"
                      autoCapitalize="none"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>
              {errors.username && (
                <Text className="text-xs text-red-500 font-bold mt-1 ml-1">
                  {errors.username.message}
                </Text>
              )}
            </View>

            <View className="mt-4">
              <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">
                Email Address
              </Text>
              <View
                className={`flex-row items-center bg-white border-2 ${errors.email ? "border-red-400" : "border-slate-100"} rounded-2xl px-4 py-3`}
              >
                <Mail stroke="#94a3b8" size={20} />
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="flex-1 ml-3 text-slate-900 font-medium"
                      placeholder="doctor@example.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
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
              <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">
                Phone Number
              </Text>
              <View
                className={`flex-row items-center bg-white border-2 ${errors.phone ? "border-red-400" : "border-slate-100"} rounded-2xl px-4 py-3`}
              >
                <Phone stroke="#94a3b8" size={20} />
                <Controller
                  control={control}
                  name="phone"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="flex-1 ml-3 text-slate-900 font-medium"
                      placeholder="+201234567890"
                      keyboardType="phone-pad"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>
              {errors.phone && (
                <Text className="text-xs text-red-500 font-bold mt-1 ml-1">
                  {errors.phone.message}
                </Text>
              )}
            </View>

            <View className="mt-4">
              <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">
                Specialty
              </Text>
              <View
                className={`flex-row items-center bg-white border-2 ${errors.specialty ? "border-red-400" : "border-slate-100"} rounded-2xl px-4 py-3`}
              >
                <Stethoscope stroke="#94a3b8" size={20} />
                <Controller
                  control={control}
                  name="specialty"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="flex-1 ml-3 text-slate-900 font-medium"
                      placeholder="e.g. Endodontics"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>
              {errors.specialty && (
                <Text className="text-xs text-red-500 font-bold mt-1 ml-1">
                  {errors.specialty.message}
                </Text>
              )}
            </View>

            <View className="mt-4">
              <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">
                University ID
              </Text>
              <View
                className={`flex-row items-center bg-white border-2 ${errors.universityId ? "border-red-400" : "border-slate-100"} rounded-2xl px-4 py-3`}
              >
                <Hash stroke="#94a3b8" size={20} />
                <Controller
                  control={control}
                  name="universityId"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="flex-1 ml-3 text-slate-900 font-medium"
                      placeholder="7+ digits required"
                      keyboardType="numeric"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>
              {errors.universityId && (
                <Text className="text-xs text-red-500 font-bold mt-1 ml-1">
                  {errors.universityId.message}
                </Text>
              )}
            </View>

            <View className="mt-4">
              <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">
                Password
              </Text>
              <View
                className={`flex-row items-center bg-white border-2 ${errors.password ? "border-red-400" : "border-slate-100"} rounded-2xl px-4 py-3`}
              >
                <Lock stroke="#94a3b8" size={20} />
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="flex-1 ml-3 text-slate-900 font-medium"
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
                    <EyeOff stroke="#94a3b8" size={20} />
                  ) : (
                    <Eye stroke="#94a3b8" size={20} />
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
              disabled={signupMutation.isPending}
              activeOpacity={0.8}
              className={`mt-10 bg-slate-900 h-16 rounded-2xl flex-row items-center justify-center shadow-lg ${signupMutation.isPending ? "opacity-70" : ""}`}
            >
              {signupMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white text-lg font-bold mr-2">
                    Complete Registration
                  </Text>
                  <ArrowRight stroke="white" size={20} />
                </>
              )}
            </TouchableOpacity>

            <View className="mt-6 mb-10 flex-row justify-center">
              <Text className="text-slate-500 font-medium">
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text className="text-teal-600 font-bold">Log in here</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
  Phone,
  Fingerprint,
  Calendar,
  Eye,
  EyeOff,
  ArrowRight,
  ChevronLeft,
} from "lucide-react-native";
import { FontAwesome5 } from "@expo/vector-icons";

import {
  patientSignupSchema,
  PatientSignupValues,
} from "../../features/auth/schemas/patientSignupSchema";
import { authService } from "../../features/auth/services/authService";

export default function PatientSignupScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(patientSignupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      phoneNumber: "",
      nationalId: "",
      birthDate: "",
      gender: 0,
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
      const errorMsg = err?.response?.data?.message || "Something went wrong";
      Alert.alert("Signup Failed", errorMsg);
    },
  });

  const onSubmit = (data: PatientSignupValues) => signupMutation.mutate(data);

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
            <ChevronLeft color="#2563eb" size={24} />
            <Text className="text-blue-600 font-bold text-lg ml-1">Back</Text>
          </TouchableOpacity>

          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-blue-600 rounded-2xl items-center justify-center shadow-lg shadow-blue-200">
              <FontAwesome5 name="tooth" size={28} color="white" />
            </View>
            <Text className="text-3xl font-black text-slate-900 mt-4 text-center">
              Patient Registration
            </Text>
            <Text className="text-slate-500 font-medium text-center mt-1 italic">
              Your dental health journey starts here
            </Text>
          </View>

          <View className="space-y-4">
            
            <View>
              <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Full Name</Text>
              <View className={`flex-row items-center bg-white border-2 ${errors.fullName ? 'border-red-400' : 'border-slate-100'} rounded-2xl px-4 py-3 shadow-sm`}>
                <User color="#94a3b8" size={20} />
                <Controller
                  control={control}
                  name="fullName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="flex-1 ml-3 text-slate-900 font-medium"
                      placeholder="Ahmed Salem"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>
              {errors.fullName && <Text className="text-xs text-red-500 font-bold mt-1 ml-1">{errors.fullName.message as string}</Text>}
            </View>

            <View className="mt-4">
              <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Email Address</Text>
              <View className={`flex-row items-center bg-white border-2 ${errors.email ? 'border-red-400' : 'border-slate-100'} rounded-2xl px-4 py-3 shadow-sm`}>
                <Mail color="#94a3b8" size={20} />
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="flex-1 ml-3 text-slate-900 font-medium"
                      placeholder="ahmed@example.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>
              {errors.email && <Text className="text-xs text-red-500 font-bold mt-1 ml-1">{errors.email.message as string}</Text>}
            </View>

            <View className="mt-4">
              <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Phone Number</Text>
              <View className={`flex-row items-center bg-white border-2 ${errors.phoneNumber ? 'border-red-400' : 'border-slate-100'} rounded-2xl px-4 py-3 shadow-sm`}>
                <Phone color="#94a3b8" size={20} />
                <Controller
                  control={control}
                  name="phoneNumber"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="flex-1 ml-3 text-slate-900 font-medium"
                      placeholder="+20 123..."
                      keyboardType="phone-pad"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>
            </View>

            <View className="mt-4">
              <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">National ID</Text>
              <View className={`flex-row items-center bg-white border-2 ${errors.nationalId ? 'border-red-400' : 'border-slate-100'} rounded-2xl px-4 py-3 shadow-sm`}>
                <Fingerprint color="#94a3b8" size={20} />
                <Controller
                  control={control}
                  name="nationalId"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="flex-1 ml-3 text-slate-900 font-medium"
                      placeholder="14-digit number"
                      keyboardType="numeric"
                      maxLength={14}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>
              {errors.nationalId && <Text className="text-xs text-red-500 font-bold mt-1 ml-1">{errors.nationalId.message as string}</Text>}
            </View>

            <View className="mt-4">
              <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Gender</Text>
              <Controller
                control={control}
                name="gender"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row space-x-4">
                    <TouchableOpacity 
                      onPress={() => onChange(0)}
                      className={`flex-1 flex-row items-center justify-center p-4 rounded-2xl border-2 ${value === 0 ? 'border-blue-600 bg-blue-50' : 'border-slate-100 bg-white'}`}
                    >
                      <Text className={`font-bold ${value === 0 ? 'text-blue-600' : 'text-slate-400'}`}>Male</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => onChange(1)}
                      className={`flex-1 flex-row items-center justify-center p-4 rounded-2xl border-2 ${value === 1 ? 'border-blue-600 bg-blue-50' : 'border-slate-100 bg-white'}`}
                    >
                      <Text className={`font-bold ${value === 1 ? 'text-blue-600' : 'text-slate-400'}`}>Female</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>

            <View className="mt-4">
              <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Secure Password</Text>
              <View className={`flex-row items-center bg-white border-2 ${errors.password ? 'border-red-400' : 'border-slate-100'} rounded-2xl px-4 py-3 shadow-sm`}>
                <Lock color="#94a3b8" size={20} />
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
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff color="#94a3b8" size={20} /> : <Eye color="#94a3b8" size={20} />}
                </TouchableOpacity>
              </View>
              {errors.password && <Text className="text-xs text-red-500 font-bold mt-1 ml-1">{errors.password.message as string}</Text>}
            </View>

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={signupMutation.isPending}
              activeOpacity={0.8}
              className={`mt-10 bg-slate-900 h-16 rounded-2xl flex-row items-center justify-center shadow-xl shadow-slate-200 ${signupMutation.isPending ? 'opacity-70' : ''}`}
            >
              {signupMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white text-lg font-bold mr-2">Create My Account</Text>
                  <ArrowRight color="white" size={20} />
                </>
              )}
            </TouchableOpacity>

            <View className="mt-6 mb-10 flex-row justify-center">
              <Text className="text-slate-500 font-medium">Already registered? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text className="text-blue-600 font-bold">Sign in</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
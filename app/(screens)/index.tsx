import { getProfileByRole } from "@/features/auth/services/authService";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUserFromReload } from "@/store/slices/authSlice";
import { getDecodedToken } from "@/utils/decodeToken";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useThemeLanguage } from "@/store/ThemeLanguageContext";
import BrandLogo from "@/components/common/BrandLogo";

export default function AuthBoundary() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { theme } = useThemeLanguage();
  const isDark = theme === "dark";

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");

      if (!token) {
        router.replace("/(auth)/login");
        return;
      }

      const decoded = getDecodedToken(token) as any;
      if (!decoded) {
        router.replace("/(auth)/login");
        return;
      }

      if (!user && decoded.role !== "ClinicalDoctor") {
        const userData = await getProfileByRole(decoded.role, decoded.publicId);
        dispatch(setUserFromReload({ user: userData, role: decoded.role, token: token }));
      } else if (!user && decoded.role === "ClinicalDoctor") {
        dispatch(setUserFromReload({ user: null, role: decoded.role, token: token }));
      }

      const role = (decoded as any).role.toLowerCase();
      if (role === 'doctor') router.replace('/(screens)/doctor');
      else if (role === 'student') router.replace('/(screens)/student');
      else if (role === 'patient') router.replace('/(screens)/patient');
      else if (role === 'clinicaldoctor' || role === 'clinical-doctor' || role === 'clinical doctor')
        router.replace('/(screens)/clinical-doctor');
      else router.replace('/(auth)/login');

    } catch (error) {
      console.error("Auth Boundary Error:", error);
      router.replace("/(auth)/login");
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-slate-950 items-center justify-center">
      <View className="items-center">
        <View className="w-24 h-24 bg-blue-50 dark:bg-indigo-900/40 rounded-full items-center justify-center mb-4">
          <BrandLogo size={64} isDark={isDark} />
        </View>
        <ActivityIndicator size="large" color={isDark ? "#818cf8" : "#2563eb"} />
        <Text className="mt-4 text-slate-400 dark:text-slate-500 font-bold tracking-widest uppercase text-[10px]">
          UniDent Care
        </Text>
      </View>
    </View>
  );
}

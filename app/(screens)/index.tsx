import { getProfileByRole } from "@/features/auth/services/authService";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUserFromReload } from "@/store/slices/authSlice";
import { getDecodedToken } from "@/utils/decodeToken";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function AuthBoundary() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

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

      const decoded = getDecodedToken(token);
      if (!decoded) {
        router.replace("/(auth)/login");
        return;
      }

      if (!user) {
        const userData = await getProfileByRole(decoded.role, decoded.userId);
        dispatch(setUserFromReload({ user: userData, role: decoded.role }));
      }

      const role = decoded.role.toLowerCase();
      if (role === "doctor") router.replace("/doctor");
      else if (role === "student") router.replace("/student");
      else if (role === "patient") router.replace("/patient");
      else router.replace("/login");
    } catch (error) {
      console.error("Auth Boundary Error:", error);
      router.replace("/login");
    }
  };

  return (
    <View className="flex-1 bg-white items-center justify-center">
      <View className="items-center">
        <View className="w-24 h-24 bg-blue-50 rounded-full items-center justify-center mb-4">
          <FontAwesome5 name="tooth" size={40} color="#2563eb" />
        </View>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-slate-400 font-bold tracking-widest uppercase text-[10px]">
          UniDent Care
        </Text>
      </View>
    </View>
  );
}

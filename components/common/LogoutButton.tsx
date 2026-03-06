import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { AlertCircle, LogOut, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { authService } from "@/features/auth/services/authService";
import { useAppDispatch } from "@/store/hooks";
import { logout as logoutAction } from "@/store/slices/authSlice";

interface LogoutButtonProps {
  variant?: "minimal" | "full";
  className?: string;
}

export default function LogoutButton({
  variant = "full",
  className = "",
}: LogoutButtonProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const performCleanup = async () => {
    try {
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("user_role");
      dispatch(logoutAction());
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  };

  const executeLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setShowConfirmModal(false);

    try {
      await authService.logout().catch(() => {
        console.log("Server session already expired.");
      });
    } catch (error) {
      console.warn("Logout API warning:", error);
    } finally {
      await performCleanup();
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {variant === "minimal" ? (
        <TouchableOpacity
          onPress={() => setShowConfirmModal(true)}
          disabled={isLoggingOut}
          className={`p-3 bg-red-50 rounded-2xl items-center justify-center ${className}`}
          activeOpacity={0.7}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color="#ef4444" />
          ) : (
            <LogOut size={22} color="#ef4444" />
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => setShowConfirmModal(true)}
          disabled={isLoggingOut}
          activeOpacity={0.8}
          className={`w-full flex-row items-center justify-between px-5 py-4 rounded-[28px] bg-red-50/50 border border-red-100 ${className}`}
        >
          <View className="flex-row items-center">
            <View className="p-3 rounded-2xl bg-white shadow-sm">
              {isLoggingOut ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <LogOut size={20} color="#ef4444" />
              )}
            </View>
            <View className="ml-4">
              <Text className="text-base font-bold text-red-600">Sign Out</Text>
              <Text className="text-[11px] text-red-400 font-medium">
                Securely end your session
              </Text>
            </View>
          </View>
          <View className="bg-red-100/30 p-2 rounded-full">
            <X size={14} color="#ef4444" opacity={0.4} />
          </View>
        </TouchableOpacity>
      )}

      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View className="flex-1 bg-black/60 justify-center items-center p-6">
          <View className="bg-white w-full rounded-[35px] p-8 items-center shadow-2xl">
            <View className="bg-red-50 p-5 rounded-full mb-5">
              <AlertCircle size={40} color="#ef4444" strokeWidth={1.5} />
            </View>

            <Text className="text-xl font-black text-slate-800 text-center">
              Logging Out?
            </Text>

            <Text className="text-slate-500 text-center mt-2 mb-8 leading-5 px-4">
              Are you sure you want to end your current session? You'll need to
              login again to access your account.
            </Text>

            <View className="flex-row space-x-4 w-full">
              <TouchableOpacity
                onPress={() => setShowConfirmModal(false)}
                className="flex-1 py-4 rounded-2xl bg-slate-100 items-center"
              >
                <Text className="text-slate-600 font-bold text-base">Stay</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={executeLogout}
                className="flex-1 py-4 rounded-2xl bg-red-500 items-center shadow-lg shadow-red-200"
              >
                <Text className="text-white font-bold text-base">Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

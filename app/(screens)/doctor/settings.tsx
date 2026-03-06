import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";

import LogoutButton from "@/components/common/LogoutButton";
import {
  changePassword,
  deleteAccount,
} from "@/features/settings/services/settingsService";
import { logout } from "@/store/slices/authSlice";
import { RootState } from "@/store/store";
import * as SecureStore from "expo-secure-store";

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password cannot be the same as old password",
    path: ["newPassword"],
  });

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export default function SettingsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  const auth = useSelector((state: RootState) => state.auth);
  const user = auth.user as any;
  const role = auth.role;

  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onChangePassword = async (values: ChangePasswordForm) => {
    try {
      const res = await changePassword(values);
      if (res.data.success) {
        Alert.alert("Success", "Password updated successfully!");
        reset();
      } else {
        Alert.alert("Error", res.data.message || "Failed to update password");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.errors?.[0] || "Something went wrong";
      Alert.alert("Error", msg);
    }
  };

  const onDeleteAccount = async () => {
    if (!user?.publicId || !role) {
      Alert.alert("Error", "User information is missing.");
      return;
    }
    setIsDeleting(true);
    try {
      const apiRole =
        role === "Patient"
          ? "Patients"
          : role === "Doctor"
            ? "Doctors"
            : "Students";
      const res = await deleteAccount(apiRole, user.publicId);
      if (res.data.success) {
        await SecureStore.deleteItemAsync("token");
        dispatch(logout());
        setIsDeleteModalOpen(false);
        router.replace("/login");
      } else {
        Alert.alert("Error", res.data.message || "Deletion failed");
        setIsDeleting(false);
      }
    } catch (err) {
      Alert.alert("Error", "Could not delete account. Try again later.");
      setIsDeleting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-slate-50"
    >
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <View className="mb-8 items-center">
          <View className="bg-indigo-50 p-3 rounded-2xl mb-3">
            <Ionicons name="shield-checkmark" size={24} color="#4f46e5" />
          </View>
          <Text className="text-2xl font-extrabold text-slate-800">
            Account Security
          </Text>
          <Text className="text-sm text-slate-500 mt-1 text-center">
            Manage your password and preferences
          </Text>
        </View>

        <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <View className="flex-row items-center mb-5">
            <Ionicons name="key-outline" size={20} color="#64748b" />
            <Text className="text-base font-bold text-slate-700 ml-2">
              Change Password
            </Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-xs font-semibold text-slate-500 mb-2 ml-1">
                Current Password
              </Text>
              <View className="flex-row items-center bg-slate-50 rounded-xl border border-slate-200 px-4">
                <Controller
                  control={control}
                  name="oldPassword"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      className="flex-1 py-3 text-slate-800 text-base"
                      placeholder="••••••••"
                      secureTextEntry={!showOldPass}
                      value={value || ""}
                      onChangeText={onChange}
                      placeholderTextColor="#94a3b8"
                    />
                  )}
                />
                <TouchableOpacity
                  onPress={() => setShowOldPass(!showOldPass)}
                  className="p-2"
                >
                  <Ionicons
                    name={showOldPass ? "eye-off" : "eye"}
                    size={20}
                    color="#94a3b8"
                  />
                </TouchableOpacity>
              </View>
              {errors.oldPassword && (
                <Text className="text-red-500 text-[11px] mt-1 ml-1 font-medium">
                  {errors.oldPassword.message}
                </Text>
              )}
            </View>

            <View className="mt-4">
              <Text className="text-xs font-semibold text-slate-500 mb-2 ml-1">
                New Password
              </Text>
              <View className="flex-row items-center bg-slate-50 rounded-xl border border-slate-200 px-4">
                <Controller
                  control={control}
                  name="newPassword"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      className="flex-1 py-3 text-slate-800 text-base"
                      placeholder="••••••••"
                      secureTextEntry={!showNewPass}
                      value={value || ""}
                      onChangeText={onChange}
                      placeholderTextColor="#94a3b8"
                    />
                  )}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPass(!showNewPass)}
                  className="p-2"
                >
                  <Ionicons
                    name={showNewPass ? "eye-off" : "eye"}
                    size={20}
                    color="#94a3b8"
                  />
                </TouchableOpacity>
              </View>
              {errors.newPassword && (
                <Text className="text-red-500 text-[11px] mt-1 ml-1 font-medium">
                  {errors.newPassword.message}
                </Text>
              )}
            </View>

            <TouchableOpacity
              onPress={handleSubmit(onChangePassword)}
              disabled={isSubmitting}
              className={`bg-slate-800 rounded-xl p-4 flex-row justify-center items-center mt-6 ${isSubmitting ? "opacity-70" : ""}`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="lock-closed" size={18} color="white" />
                  <Text className="text-white font-bold text-base ml-2">
                    Update Password
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-6 bg-red-50 rounded-3xl p-5 border border-red-100">
          <View>
            <Text className="text-red-800 font-extrabold text-base">
              Danger Zone
            </Text>
            <Text className="text-red-600 text-xs mt-1 leading-4">
              Permanently delete your account and all content. This cannot be
              undone.
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsDeleteModalOpen(true)}
            className="bg-white mt-4 py-3 rounded-xl items-center border border-red-200"
          >
            <Text className="text-red-600 font-bold">Delete Account</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={isDeleteModalOpen} transparent animationType="fade">
          <View className="flex-1 bg-black/50 justify-center p-6">
            <View className="bg-white rounded-[32px] p-6 shadow-2xl">
              <Text className="text-xl font-black text-slate-800 mb-2">
                Delete Account?
              </Text>
              <Text className="text-slate-500 text-sm leading-5 mb-5">
                This action is irreversible. Type{" "}
                <Text className="font-bold text-red-600">DELETE</Text> below to
                confirm:
              </Text>

              <TextInput
                className="bg-slate-50 p-4 rounded-xl text-lg font-bold text-center border border-slate-200 mb-6"
                value={deleteConfirmationText}
                onChangeText={setDeleteConfirmationText}
                placeholder="DELETE"
                autoCapitalize="characters"
                placeholderTextColor="#cbd5e1"
              />

              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-4 items-center"
                >
                  <Text className="text-slate-500 font-bold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onDeleteAccount}
                  disabled={deleteConfirmationText !== "DELETE" || isDeleting}
                  className={`flex-1 bg-red-600 py-4 rounded-2xl items-center shadow-lg shadow-red-200 ${deleteConfirmationText !== "DELETE" ? "opacity-50" : ""}`}
                >
                  {isDeleting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold">Confirm</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <View className="mt-8 border-t border-slate-100 pt-6">
          <LogoutButton />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

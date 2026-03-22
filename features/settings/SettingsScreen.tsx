import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, Alert, ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useThemeLanguage } from "../../store/ThemeLanguageContext";
import {
  ShieldCheck,
  Trash2,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  X,
  Palette,
  Monitor,
  Moon,
  Sun,
  Globe,
  LogOut,
} from "lucide-react-native";
import { logout } from "../../store/slices/authSlice";
import { changePassword, deleteAccount } from "./services/settingsService";

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password cannot be the same as old password",
    path: ["newPassword"],
  });

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const role = useAppSelector((state) => state.auth.role);
  const { theme, toggleTheme, language, toggleLanguage } = useThemeLanguage();

  const isDark = theme === "dark";

  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ChangePasswordForm>({
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
      const msg = err?.response?.data?.error?.errors?.[0];
      Alert.alert("Error", msg || "Something went wrong");
    }
  };

  const onDeleteAccount = async () => {
    if (!user?.publicId || !role) return;

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
        Alert.alert("Success", "Account deleted. We are sorry to see you go.");
        await SecureStore.deleteItemAsync("token");
        dispatch(logout());
        router.replace("/(auth)/login");
      } else {
        Alert.alert("Error", res.data.message || "Deletion failed");
        setIsDeleting(false);
      }
    } catch (err: any) {
      Alert.alert("Error", "Could not delete account. Try again later.");
      setIsDeleting(false);
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("token");
    dispatch(logout());
    router.replace("/(auth)/login");
  };

  const indigoColor = isDark ? "#818cf8" : "#4f46e5";
  const slateColor = isDark ? "#94a3b8" : "#64748b";
  const textColor = isDark ? "#f1f5f9" : "#1e293b";

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        {/* APPEARANCE & LANGUAGE PREFERENCES */}
        <View className="mb-6 mt-4">
        <View className="flex-row items-center mb-1">
          <Palette color={indigoColor} size={24} />
          <Text className="text-2xl font-bold text-slate-800 dark:text-slate-100 ml-2">
            {t('appearanceTitle')} & {t('languageTitle')}
          </Text>
        </View>
        <Text className="text-slate-500 dark:text-slate-400 text-sm">
          {t('appearanceDesc')} {t('languageDesc')}
        </Text>
      </View>

      <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5 mb-5">
        <View className="flex-row items-center mb-4">
          <Monitor size={20} color={slateColor} />
          <Text className="text-lg font-semibold text-slate-800 dark:text-slate-100 ml-2">
            {t('appearanceTitle')}
          </Text>
        </View>
        <View className="flex-row justify-between mb-4">
          <TouchableOpacity
            onPress={theme === 'dark' ? toggleTheme : undefined}
            activeOpacity={0.7}
            className={`flex-1 py-3 items-center justify-center rounded-xl border-2 mr-2 ${!isDark ? "border-indigo-600 bg-indigo-50" : "border-slate-200 dark:border-slate-800 bg-transparent"}`}
          >
            <Sun size={20} color={!isDark ? "#4f46e5" : slateColor} />
            <Text className={`text-sm font-semibold mt-1 ${!isDark ? "text-indigo-700" : "text-slate-600 dark:text-slate-400"}`}>
              {t('themeLight')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={theme === 'light' ? toggleTheme : undefined}
            activeOpacity={0.7}
            className={`flex-1 py-3 items-center justify-center rounded-xl border-2 ml-2 ${isDark ? "border-indigo-400 bg-indigo-900/20" : "border-slate-200 dark:border-slate-800 bg-transparent"}`}
          >
            <Moon size={20} color={isDark ? "#818cf8" : slateColor} />
            <Text className={`text-sm font-semibold mt-1 ${isDark ? "text-indigo-300" : "text-slate-600 dark:text-slate-400"}`}>
              {t('themeDark')}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center mb-4 mt-2">
          <Globe size={20} color={slateColor} />
          <Text className="text-lg font-semibold text-slate-800 dark:text-slate-100 ml-2">
            {t('languageTitle')}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <TouchableOpacity
            onPress={language === 'ar' ? toggleLanguage : undefined}
            activeOpacity={0.7}
            className={`flex-row flex-1 py-3 px-4 items-center justify-between rounded-xl border-2 mr-2 ${language === "en" ? "border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20" : "border-slate-200 dark:border-slate-800 bg-transparent"}`}
          >
            <Text className={`font-semibold ${language === "en" ? "text-indigo-700 dark:text-indigo-300" : "text-slate-600 dark:text-slate-400"}`}>English</Text>
            {language === "en" && <View className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={language === 'en' ? toggleLanguage : undefined}
            activeOpacity={0.7}
            className={`flex-row flex-1 py-3 px-4 items-center justify-between rounded-xl border-2 ml-2 ${language === "ar" ? "border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20" : "border-slate-200 dark:border-slate-800 bg-transparent"}`}
          >
            <Text className={`font-semibold ${language === "ar" ? "text-indigo-700 dark:text-indigo-300" : "text-slate-600 dark:text-slate-400"}`}>العربية</Text>
            {language === "ar" && <View className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />}
          </TouchableOpacity>
        </View>
      </View>

      <View className="h-[1px] bg-slate-200 dark:bg-slate-800 my-5" />

      {/* ACCOUNT SECURITY */}
      <View className="mb-4">
        <View className="flex-row items-center mb-1">
          <ShieldCheck color={indigoColor} size={24} />
          <Text className="text-xl font-bold text-slate-800 dark:text-slate-100 ml-2">
            {t('settingsTitle')}
          </Text>
        </View>
        <Text className="text-slate-500 dark:text-slate-400 text-sm">
          {t('settingsSubtitle')}
        </Text>
      </View>

      <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm mb-6 overflow-hidden">
        <View className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
          <View className="flex-row items-center">
            <KeyRound size={20} color={slateColor} />
            <Text className="text-lg font-semibold text-slate-800 dark:text-slate-100 ml-2">
              {t('changePassword')}
            </Text>
          </View>
          <Text className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            {t('changePasswordDesc')}
          </Text>
        </View>

        <View className="p-5">
          <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('currentPassword')}</Text>
          <View className="relative justify-center mb-1">
            <Controller
              control={control}
              name="oldPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  secureTextEntry={!showOldPass}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  placeholder="••••••••"
                  placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              )}
            />
            <TouchableOpacity onPress={() => setShowOldPass(!showOldPass)} className="absolute right-4 p-2">
              {showOldPass ? <EyeOff size={18} color={slateColor} /> : <Eye size={18} color={slateColor} />}
            </TouchableOpacity>
          </View>
          {errors.oldPassword && <Text className="text-xs text-red-500 font-medium mb-3">{errors.oldPassword.message}</Text>}

          <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 mt-4">{t('newPassword')}</Text>
          <View className="relative justify-center mb-1">
            <Controller
              control={control}
              name="newPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  secureTextEntry={!showNewPass}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  placeholder="••••••••"
                  placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              )}
            />
            <TouchableOpacity onPress={() => setShowNewPass(!showNewPass)} className="absolute right-4 p-2">
              {showNewPass ? <EyeOff size={18} color={slateColor} /> : <Eye size={18} color={slateColor} />}
            </TouchableOpacity>
          </View>
          {errors.newPassword && <Text className="text-xs text-red-500 font-medium">{errors.newPassword.message}</Text>}

          <View className="flex-row justify-end mt-6">
            <TouchableOpacity
              onPress={handleSubmit(onChangePassword)}
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-xl flex-row items-center space-x-2 ${isSubmitting ? "bg-slate-400 dark:bg-slate-700" : "bg-slate-900 dark:bg-indigo-600"}`}
            >
              {isSubmitting ? <ActivityIndicator color="#fff" size="small" /> : <Lock size={16} color="#fff" />}
              <Text className="text-white text-sm font-bold ml-2">{isSubmitting ? t('updating') : t('updatePassword')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-6 mb-8 mt-2">
        <View className="mb-4">
          <View className="flex-row items-center mb-1">
            <AlertTriangle size={20} color="#ef4444" />
            <Text className="text-red-700 dark:text-red-400 font-bold ml-2 text-lg">
              {t('dangerZone')}
            </Text>
          </View>
          <Text className="text-red-600 dark:text-red-300 text-sm mt-1">
            {t('dangerZoneDesc')}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setIsDeleteModalOpen(true)}
          className="border border-red-200 dark:border-red-800 bg-white dark:bg-slate-900 py-3 rounded-xl items-center"
        >
          <Text className="text-red-600 dark:text-red-400 font-semibold">{t('deleteAccount')}</Text>
        </TouchableOpacity>
      </View>

      <View className="h-[1px] bg-slate-200 dark:bg-slate-800 mb-6" />

      <View className="mb-10 pb-6">
        <Text className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 ml-1">
          {t('sessionManagement')}
        </Text>
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center justify-between border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm"
        >
          <View className="flex-row items-center">
            <LogOut size={20} color={slateColor} />
            <Text className="text-base font-bold text-slate-700 dark:text-slate-300 ml-3">
              {t('logout')}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <Modal animationType="fade" transparent={true} visible={isDeleteModalOpen} onRequestClose={() => setIsDeleteModalOpen(false)}>
        <View className="flex-1 bg-slate-900/60 items-center justify-center p-5">
          <View className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[24px] overflow-hidden shadow-xl border border-slate-100 dark:border-slate-800">
            <View className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex-row justify-between items-center bg-red-50 dark:bg-red-900/10">
              <Text className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('deleteAccount')}?</Text>
              <TouchableOpacity onPress={() => setIsDeleteModalOpen(false)}>
                <X size={20} color={slateColor} />
              </TouchableOpacity>
            </View>

            <View className="p-6">
              <View className="flex-row items-start p-4 bg-red-50 dark:bg-red-900/20 rounded-xl mb-5 space-x-3">
                <View className="p-2 bg-red-100 dark:bg-red-500/20 rounded-full items-center justify-center mr-3">
                  <AlertTriangle size={24} color="#ef4444" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-red-800 dark:text-red-400 text-sm">This action is irreversible</Text>
                  <Text className="text-red-600 dark:text-red-300 text-xs mt-1 leading-snug">
                    Your personal data, medical history, and appointments will be permanently removed.
                  </Text>
                </View>
              </View>

              <Text className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-3">
                To confirm, type <Text className="font-bold text-slate-900 dark:text-slate-200 select-all">DELETE</Text> below:
              </Text>
              <TextInput
                value={deleteConfirmationText}
                onChangeText={setDeleteConfirmationText}
                placeholder="DELETE"
                placeholderTextColor={slateColor}
                autoCapitalize="characters"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
              />
            </View>

            <View className="px-6 py-4 bg-slate-50 dark:bg-slate-800 flex-row justify-end space-x-3 border-t border-slate-100 dark:border-slate-700">
              <TouchableOpacity onPress={() => setIsDeleteModalOpen(false)} className="px-4 py-2.5 rounded-lg justify-center mr-2">
                <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onDeleteAccount}
                disabled={deleteConfirmationText !== "DELETE" || isDeleting}
                className={`px-5 py-2.5 rounded-lg flex-row items-center space-x-2 ${deleteConfirmationText === "DELETE" && !isDeleting ? "bg-red-600" : "bg-slate-300 dark:bg-slate-700"}`}
              >
                {isDeleting ? <ActivityIndicator color="#fff" size="small" /> : <Trash2 size={16} color="#fff" />}
                <Text className="text-white text-sm font-bold ml-2">{isDeleting ? t('deleting') : t('permanentlyDelete')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Provider } from "react-redux";
import { store } from "../store/store";

import { setUserFromReload } from "@/store/slices/authSlice";
import { getDecodedToken } from "@/utils/decodeToken";
import { getProfileByRole } from "../features/auth/services/authService";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { ThemeLanguageProvider } from '../store/ThemeLanguageContext';
import { useThemeLanguage } from '../store/ThemeLanguageContext';

const queryClient = new QueryClient();

function InitialRootNavigation() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isReady, setIsReady] = useState(false);
  const { theme } = useThemeLanguage();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        if (token) {
          const decoded = getDecodedToken(token);
          if (decoded) {
            const user = await getProfileByRole(decoded.role, decoded.publicId);
            dispatch(setUserFromReload({ user, role: decoded.role }));
          }
        }
      } catch (error) {
        console.error("Failed to restore auth session:", error);
      } finally {
        setIsReady(true);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (
      !isAuthenticated &&
      !inAuthGroup &&
      segments[0] !== undefined &&
      segments[0] !== ""
    ) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(screens)");
    }
  }, [isAuthenticated, segments, isReady]);

  if (!isReady) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-slate-950">
        <ActivityIndicator size="large" color={theme === "dark" ? "#60a5fa" : "#2563eb"} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme === "dark" ? "#020617" : "#ffffff" } }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeLanguageProvider>
          <InitialRootNavigation />
        </ThemeLanguageProvider>
      </QueryClientProvider>
    </Provider>
  );
}

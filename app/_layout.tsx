import { Stack, useRouter, useSegments } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../store/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { View, ActivityIndicator } from "react-native";

import { useAppDispatch, useAppSelector } from "../store/hooks";
import { getProfileByRole } from "../features/auth/services/authService";
import { getDecodedToken } from "@/utils/decodeToken";
import { setUserFromReload } from "@/store/slices/authSlice";

const queryClient = new QueryClient();

function InitialRootNavigation() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        if (token) {
          const decoded = getDecodedToken(token);
          if (decoded) {
            const user = await getProfileByRole(decoded.role, decoded.userId);
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
    
    if (!isAuthenticated && !inAuthGroup && segments[0] !== undefined && segments[0] !== "") {
      router.replace("/(auth)/login");
    } 
    else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, segments, isReady]);

  if (!isReady) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <InitialRootNavigation />
      </QueryClientProvider>
    </Provider>
  );
}
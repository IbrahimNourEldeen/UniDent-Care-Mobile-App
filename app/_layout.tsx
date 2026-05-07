import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Provider } from "react-redux";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { store } from "../store/store";

import { logout, setUserFromReload } from "@/store/slices/authSlice";
import { getDecodedToken } from "@/utils/decodeToken";
import { getProfileByRole } from "../features/auth/services/authService";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { ThemeLanguageProvider, useThemeLanguage } from '../store/ThemeLanguageContext';
import Toast from "@/components/common/Toast";


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
        const storedPublicId = await SecureStore.getItemAsync("publicId");
        const storedRole = await SecureStore.getItemAsync("role");

        if (token) {
          let publicId = storedPublicId;
          let role = storedRole;

          if (!publicId || !role) {
            const decoded = getDecodedToken(token);
            if (decoded) {
              publicId = publicId || decoded.publicId;
              role = role || decoded.role;
            }
          }

          if (publicId && role) {
            try {
              if (role !== "ClinicalDoctor") {
                const user = await getProfileByRole(role, publicId);
                if (user) {
                  dispatch(setUserFromReload({ user, role, token }));
                } else {
                  throw new Error("User profile not found");
                }
              } else {
                dispatch(setUserFromReload({ user: null, role, token }));
              }
            } catch (apiError) {
              console.error("Failed to fetch profile during restoration:", apiError);
              await SecureStore.deleteItemAsync("token");
              await SecureStore.deleteItemAsync("publicId");
              await SecureStore.deleteItemAsync("role");
              dispatch(logout());
            }
          } else {
            console.warn("Could not determine publicId or role, clearing session");
            await SecureStore.deleteItemAsync("token");
            await SecureStore.deleteItemAsync("publicId");
            await SecureStore.deleteItemAsync("role");
            dispatch(logout());
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ThemeLanguageProvider>
            <Toast />
            <InitialRootNavigation />
          </ThemeLanguageProvider>
        </QueryClientProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

import { Stack } from "expo-router";
import { useThemeLanguage } from "../../store/ThemeLanguageContext";

export default function AuthLayout() {
  const { theme } = useThemeLanguage();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme === "dark" ? "#020617" : "#ffffff" },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="forget-password" />
    </Stack>
  );
}

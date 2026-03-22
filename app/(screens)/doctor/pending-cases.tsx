import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function pendingCases() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950 items-center justify-center">
      <Text className="text-slate-900 dark:text-white font-bold">pending-cases</Text>
    </SafeAreaView>
  );
}

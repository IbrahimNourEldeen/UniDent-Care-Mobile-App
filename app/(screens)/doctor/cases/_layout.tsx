import { Stack } from 'expo-router';

export default function CasesLayout() {
  return <Stack initialRouteName="list" screenOptions={{ headerShown: false }} />;
}

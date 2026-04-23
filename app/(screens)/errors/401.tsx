import React from 'react';
import { ErrorScreen } from '@/components/common/ErrorScreen';
import { useRouter } from 'expo-router';

/**
 * 401 Unauthorized — Session expired / not authenticated.
 * Redirect doctor to login on primary action.
 */
export default function UnauthorizedScreen() {
  const router = useRouter();

  const handleLogin = () => {
    router.replace('/(auth)/login' as any);
  };

  return (
    <ErrorScreen
      type={401}
      onPrimaryAction={handleLogin}
      primaryLabel="Sign In Again"
      showHome={false}
      showRetry={false}
    />
  );
}

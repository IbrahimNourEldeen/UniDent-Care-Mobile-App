import { useRouter } from 'expo-router';

type ErrorCode = 400 | 401 | 403 | 404;

/**
 * useErrorNavigation
 *
 * A utility hook for navigating to the appropriate error screen
 * based on an HTTP status code received from the DentalHub API.
 *
 * Usage:
 * ```tsx
 * const { navigateToError, handleApiError } = useErrorNavigation();
 *
 * try {
 *   const data = await someApiCall();
 * } catch (error: any) {
 *   handleApiError(error?.statusCode ?? error?.response?.status);
 * }
 * ```
 */
export function useErrorNavigation() {
  const router = useRouter();

  /**
   * Navigate to a specific error screen by HTTP status code.
   * Supports: 400, 401, 403, 404
   */
  const navigateToError = (statusCode: ErrorCode) => {
    router.push(`/(screens)/errors/${statusCode}` as any);
  };

  /**
   * Automatically handles common API error status codes.
   * Falls back to 400 for unknown error codes.
   */
  const handleApiError = (statusCode: number | undefined) => {
    if (!statusCode) return;

    const supported: ErrorCode[] = [400, 401, 403, 404];
    const code = supported.includes(statusCode as ErrorCode)
      ? (statusCode as ErrorCode)
      : 400;

    navigateToError(code);
  };

  return { navigateToError, handleApiError };
}

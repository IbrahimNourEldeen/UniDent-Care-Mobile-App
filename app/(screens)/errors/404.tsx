import React from 'react';
import { ErrorScreen } from '@/components/common/ErrorScreen';

/**
 * 404 Not Found — The requested resource does not exist.
 */
export default function NotFoundScreen() {
  return (
    <ErrorScreen
      type={404}
      showHome={true}
      showRetry={false}
      primaryLabel="Go Back"
    />
  );
}

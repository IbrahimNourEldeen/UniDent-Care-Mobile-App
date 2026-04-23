import React from 'react';
import { ErrorScreen } from '@/components/common/ErrorScreen';

/**
 * 400 Bad Request — Validation error or malformed request.
 */
export default function BadRequestScreen() {
  return (
    <ErrorScreen
      type={400}
      showHome={false}
      showRetry={true}
      primaryLabel="Go Back"
      onRetry={() => {
        // Retry is navigated back to attempt the action again
      }}
    />
  );
}

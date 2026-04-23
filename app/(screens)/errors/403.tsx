import React from 'react';
import { ErrorScreen } from '@/components/common/ErrorScreen';

/**
 * 403 Forbidden — Doctor does not have permission for this resource.
 */
export default function ForbiddenScreen() {
  return (
    <ErrorScreen
      type={403}
      showHome={true}
      showRetry={false}
      primaryLabel="Go Back"
    />
  );
}

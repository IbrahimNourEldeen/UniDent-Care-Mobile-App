/**
 * Central registry of React Query keys used across the Cases feature.
 * Use these constants to guarantee consistent cache keys and enable
 * automatic invalidation across all related hooks.
 */

export const caseKeys = {
  /** All cases list */
  all: ['cases'] as const,
  /** Single case details */
  detail: (caseId: string) => ['cases', 'detail', caseId] as const,
  /** Sessions for a specific case */
  sessions: (caseId: string) => ['cases', 'sessions', caseId] as const,
  /** Single session details */
  session: (sessionId: string) => ['session', sessionId] as const,
  /** Notes for a specific session */
  sessionNotes: (sessionId: string) => ['session-notes', sessionId] as const,
  /** Student dashboard statistics */
  studentStats: (studentId: string) => ['student-stats', studentId] as const,
};

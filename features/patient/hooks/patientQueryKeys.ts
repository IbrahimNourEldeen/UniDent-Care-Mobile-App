export const patientKeys = {
    /** All cases for patient */
    allCases: (patientId: string) => ['patient', 'cases', patientId] as const,
    /** All sessions for patient */
    allSessions: (patientId: string) => ['patient', 'sessions', patientId] as const,
    /** Upcoming sessions for patient */
    upcomingSessions: (patientId: string) => ['patient', 'upcomingSessions', patientId] as const,
    /** Dashboard statistics for patient */
    stats: (patientId: string) => ['patient', 'stats', patientId] as const,
    /** Diagnoses for cases */
    diagnoses: (patientId: string) => ['patient', 'diagnoses', patientId] as const,
};

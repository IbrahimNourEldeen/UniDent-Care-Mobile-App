export enum CaseStatus {
  Draft = 0,
  Pending = 1,
  Active = 2,
  InTreatment = 3,
  Review = 4,
  Completed = 5,
}

// ---------------------------------------------------------
// 1. Raw API Models (Matching Swagger/Mobile DTOs)
// ---------------------------------------------------------
export interface PatientCaseDto {
  id: string;
  patientId: string;
  patientName?: string | null;
  status?: number | string; // Handled as number in CaseStatus or string
  caseType?: string | null;
  caseTypeName?: string | null;
  description?: string | null;
  notes?: string | null;
  totalSessions: number;
  hasEvaluatedSession: boolean;
  pendingRequests: number;
  assignedStudentId?: string | null;
  assignedDoctorId?: string | null;
  createAt: string;
  imageUrls?: string[] | null;
  diagnosisdto?: DiagnosisDto | null; // Some responses have this nested
}

export interface SessionDto {
  id: string;
  caseId: string;
  treatmentType?: string | null;
  patientId: string;
  patientName?: string | null;
  studentId?: string | null;
  studentName?: string | null;
  scheduledAt: string;
  endAt?: string | null;
  status?: string | number | null; // e.g. "Completed", "Pending", "Scheduled"
  totalNotes: number;
  totalMedia: number;
  createAt: string;
}

export interface DiagnosisDto {
  id: string;
  patientCaseId: string;
  stage?: number;
  caseTypeId: string;
  caseTypeName?: string | null;
  caseType?: string | null;
  notes?: string | null;
  createdById?: string | null;
  role?: string | null;
  isAccepted?: boolean | null;
  teethNumbers?: number[] | null;
  createAt?: string;
}

// ---------------------------------------------------------
// 2. Output Dashboard Models
// ---------------------------------------------------------

export interface DashboardKpis {
  totalCases: number;
  activeCases: number;
  completedCases: number;
  activeCasesPercentage: number;
  completedCasesPercentage: number;
  totalSessions: number;
  completedSessions: number;
  pendingSessions: number;
}

export interface DashboardProgress {
  progressPercentage: number;
  completedSessions: number;
  totalSessions: number;
}

export interface UpcomingSessionWidget {
  id: string;
  date: string;
  caseId: string;
  doctorName: string;
  status: string;
  treatmentType: string;
}

export interface RecentActivityWidget {
  id: string;
  type: 'session' | 'diagnosis' | 'case';
  date: string;
  description: string;
}

export interface DashboardCharts {
  casesDistribution: {
    active: number;
    completed: number;
  };
  sessionsStatus: {
    completed: number;
    pending: number;
  };
}

export interface DashboardData {
  kpis: DashboardKpis;
  progress: DashboardProgress;
  upcomingSessions: UpcomingSessionWidget[];
  recentActivity: RecentActivityWidget[];
  diagnosesCount: number;
  charts: DashboardCharts;
}

// ---------------------------------------------------------
// 3. Transformation Service
// ---------------------------------------------------------

/**
 * Generates the full Patient Dashboard payload by aggregating raw API data.
 */
export function generatePatientDashboardData(
  cases: PatientCaseDto[],
  sessions: SessionDto[],
  upcomingSessions: SessionDto[],
  diagnoses: DiagnosisDto[]
): DashboardData {
  // --- 1. Cases KPIs ---
  const totalCases = cases.length;
  
  const completedCases = cases.filter(c => {
    const status = typeof c.status === 'string' ? parseInt(c.status) : c.status;
    return status === CaseStatus.Completed;
  }).length;
  
  const activeCases = totalCases - completedCases;
  
  const activeCasesPercentage = totalCases ? Math.round((activeCases / totalCases) * 100) : 0;
  const completedCasesPercentage = totalCases ? Math.round((completedCases / totalCases) * 100) : 0;

  // --- 2. Sessions KPIs & Progress ---
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => {
    const status = typeof s.status === 'string' ? s.status.toLowerCase() : s.status;
    return status === 'completed' || status === 2; // Assuming 2 is Completed for sessions
  }).length;
  const pendingSessions = totalSessions - completedSessions;

  const progressPercentage = totalSessions 
    ? Math.round((completedSessions / totalSessions) * 100) 
    : 0;

  // --- 3. Upcoming Sessions ---
  const upcomingSessionsWidget: UpcomingSessionWidget[] = upcomingSessions.map(s => ({
    id: s.id,
    date: s.scheduledAt,
    caseId: s.caseId,
    doctorName: s.studentName || 'Not Assigned', 
    status: typeof s.status === 'string' ? s.status : 'Scheduled',
    treatmentType: s.treatmentType || 'General Treatment'
  }));

  // --- 4. Recent Activity ---
  const activities: RecentActivityWidget[] = [];

  sessions.forEach(s => {
    activities.push({
      id: s.id,
      type: 'session',
      date: s.scheduledAt || s.createAt,
      description: s.status === 'Completed' || s.status === 2
        ? `Session completed: ${s.treatmentType || 'Treatment'}` 
        : `Session scheduled: ${s.treatmentType || 'Treatment'}`
    });
  });

  diagnoses.forEach(d => {
    activities.push({
      id: d.id,
      type: 'diagnosis',
      date: d.createAt || new Date().toISOString(), 
      description: `New Diagnosis: ${d.caseTypeName || d.caseType || 'General'}`
    });
  });

  cases.forEach(c => {
    activities.push({
      id: c.id,
      type: 'case',
      date: c.createAt,
      description: `Case Created: ${c.caseTypeName || 'New Dental Case'}`
    });
  });

  activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const recentActivity = activities.slice(0, 15); // Show more on mobile if scrollable

  // --- 5. Diagnoses Count ---
  const diagnosesCount = diagnoses.length;

  return {
    kpis: {
      totalCases,
      activeCases,
      completedCases,
      activeCasesPercentage,
      completedCasesPercentage,
      totalSessions,
      completedSessions,
      pendingSessions
    },
    progress: {
      progressPercentage,
      completedSessions,
      totalSessions
    },
    upcomingSessions: upcomingSessionsWidget,
    recentActivity,
    diagnosesCount,
    charts: {
      casesDistribution: {
        active: activeCases,
        completed: completedCases
      },
      sessionsStatus: {
        completed: completedSessions,
        pending: pendingSessions
      }
    }
  };
}

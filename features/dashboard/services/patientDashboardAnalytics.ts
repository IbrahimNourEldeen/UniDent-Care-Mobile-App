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
  status?: number | string; 
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
  diagnosisdto?: DiagnosisDto | null; 
}

export interface SessionDto {
  id: string;
  caseId: string;
  treatmentType?: string | null;
  patientId: string;
  patientName?: string | null;
  studentId?: string | null;
  studentName?: string | null;
  assignedDoctorId?: string | null;
  assignedDoctorName?: string | null;
  scheduledAt: string;
  endAt?: string | null;
  status?: string | number | null; 
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

export function generatePatientDashboardData(
  cases: PatientCaseDto[],
  sessions: SessionDto[],
  upcomingSessions: SessionDto[],
  diagnoses: DiagnosisDto[],
  userNamesMap: Record<string, string> = {}
): DashboardData {
  // --- 1. Cases KPIs ---
  const totalCases = cases.length;
  
  const completedCases = cases.filter(c => {
    const status = typeof c.status === 'string' ? (isNaN(parseInt(c.status)) ? c.status : parseInt(c.status)) : c.status;
    return status === CaseStatus.Completed || status === 'Completed';
  }).length;
  
  const activeCases = totalCases - completedCases;
  
  const activeCasesPercentage = totalCases ? Math.round((activeCases / totalCases) * 100) : 0;
  const completedCasesPercentage = totalCases ? Math.round((completedCases / totalCases) * 100) : 0;

  // --- 2. Sessions KPIs & Progress ---
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => {
    const status = typeof s.status === 'string' ? s.status.toLowerCase() : s.status;
    return status === 'completed' || status === 'done' || status === 2; 
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
    const isCompleted = s.status && (s.status.toString().toLowerCase() === 'completed' || s.status.toString().toLowerCase() === 'done' || s.status === 2);
    const doctorDisplay = s.studentName ? `with ${s.studentName}` : (s.assignedDoctorName ? `with Dr. ${s.assignedDoctorName}` : '');
    const activityDate = isCompleted ? (s.createAt || s.scheduledAt) : (s.scheduledAt || s.createAt);

    activities.push({
      id: s.id,
      type: 'session',
      date: activityDate,
      description: isCompleted
        ? `Session completed ${doctorDisplay}: ${s.treatmentType || 'Treatment'}` 
        : `Session scheduled ${doctorDisplay}: ${s.treatmentType || 'Treatment'}`
    });
  });

  diagnoses.forEach(d => {
    const relatedCase = cases.find(c => c.id === d.patientCaseId);
    let assignedInfo = '';
    if (relatedCase) {
      if (relatedCase.assignedStudentId && userNamesMap[relatedCase.assignedStudentId]) {
        assignedInfo = ` (Student: ${userNamesMap[relatedCase.assignedStudentId]})`;
      } else if (relatedCase.assignedDoctorId && userNamesMap[relatedCase.assignedDoctorId]) {
        assignedInfo = ` (Doctor: ${userNamesMap[relatedCase.assignedDoctorId]})`;
      }
    }

    activities.push({
      id: d.id,
      type: 'diagnosis',
      date: d.createAt || new Date().toISOString(), 
      description: `New Diagnosis: ${d.caseTypeName || d.caseType || 'General'}${assignedInfo}`
    });
  });

  cases.forEach(c => {
    let assignedName = '';
    if (c.assignedStudentId && userNamesMap[c.assignedStudentId]) {
      assignedName = ` (Assigned to: ${userNamesMap[c.assignedStudentId]})`;
    } else if (c.assignedDoctorId && userNamesMap[c.assignedDoctorId]) {
      assignedName = ` (Assigned to: Dr. ${userNamesMap[c.assignedDoctorId]})`;
    }

    activities.push({
      id: c.id,
      type: 'case',
      date: c.createAt,
      description: `Case Opened: New file created${assignedName}`
    });
  });

  activities.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (isNaN(dateA)) return 1;
    if (isNaN(dateB)) return -1;
    return dateB - dateA;
  });

  const recentActivity = activities.slice(0, 15);

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

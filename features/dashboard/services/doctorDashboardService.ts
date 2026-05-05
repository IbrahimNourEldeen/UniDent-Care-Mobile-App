import api from '@/utils/api';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DoctorStats {
  publicId: string;
  fullName: string;
  email: string;
  specialty: string;
  universityId: string;
  totalStudents: number;
  pendingRequests: number;
  approvedRequests: number;
  createAt: string;
}

export interface CaseRequest {
  id: string;
  patientCasePublicId: string;
  caseName: string;
  patientName: string;
  studentName: string;
  studentPublicId: string;
  university: string;
  level: number;
  doctorName: string;
  status: string; // 'Pending' | 'Approved' | 'Rejected'
  description?: string;
  createAt: string;
}

export interface PaginatedRequests {
  items: CaseRequest[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CaseTypeDto {
  publicId: string;
  name: string;
  description?: string;
}

export interface DiagnosisDto {
  id: string;
  patientCaseId: string;
  stage: number; // 0=Initial 1=Intermediate 2=Final
  caseTypeId: string;
  caseType: string;
  notes: string;
  createdById?: string;
  role: string;
  isAccepted: boolean | null;
  teethNumbers: number[];
}

export interface SessionDto {
  id: string;
  caseId: string;
  treatmentType: string;
  patientId: string;
  patientName: string;
  studentId: string;
  studentName: string;
  scheduledAt: string;
  endAt: string;
  status: string;
  totalNotes: number;
  totalMedia: number;
  createAt: string;
}

export interface PatientCaseDto {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  status: string;
  processStatus?: string;
  phone?: string;
  city?: string;
  nationalId?: string;
  isPublic: boolean;
  universityId?: string;
  universityName?: string;
  createAt: string;
  totalSessions: number;
  hasEvaluatedSession: boolean;
  pendingRequests: number;
  assignedStudentId?: string;
  assignedDoctorId?: string;
  diagnosisdto?: DiagnosisDto;
  diagnoses?: DiagnosisDto[];
  imageUrls?: string[];
  createdByRole?: string;
  gender?: number;
  caseType?: CaseTypeDto;
  userFlags?: {
    isOwner: boolean;
    role: string;
    isAssignedDoctor: boolean;
    isAssignedStudent: boolean;
    isAssignedToMe: boolean;
    hasRequest: boolean;
    requestId?: string;
    requestStatus?: string;
  };
  availableActions?: string[];
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const doctorDashboardService = {
  /** Get doctor profile + stats */
  getDoctorDetails: async (doctorId: string): Promise<DoctorStats> => {
    const res = await api.get(`/Doctors/${doctorId}`);
    return res.data.data ?? res.data;
  },

  /** Get student profile + stats */
  getStudentDetails: async (studentId: string): Promise<any> => {
    const res = await api.get(`/Students/${studentId}`);
    return res.data.data ?? res.data;
  },

  /** Update doctor profile */
  updateDoctorProfile: async (
    doctorId: string,
    data: { fullName?: string; specialty?: string; phone?: string },
  ): Promise<boolean> => {
    const res = await api.put(`/Doctors/${doctorId}`, data);
    return res.data.data ?? res.data;
  },

  /** Get paginated case requests assigned to a doctor (token-based) */
  getDoctorRequests: async (
    _doctorId: string,
    page: number,
    pageSize: number,
    status?: number,
  ): Promise<PagedResult<CaseRequest>> => {
    try {
      const res = await api.get('/Doctors/my-requests', {
        params: { page, pageSize, ...(status !== undefined ? { status } : {}) },
      });
      const data = res.data.data ?? res.data;
      if (data && !Array.isArray(data)) {
        return {
          items: data.items ?? [],
          totalCount: data.totalCount ?? 0,
          currentPage: data.currentPage ?? page,
          totalPages: data.totalPages ?? 1,
          hasPreviousPage: data.hasPreviousPage ?? false,
          hasNextPage: data.hasNextPage ?? false,
        };
      }
      if (Array.isArray(data)) {
        return { items: data, totalCount: data.length, currentPage: page, totalPages: 1, hasPreviousPage: false, hasNextPage: false };
      }
      return { items: [], totalCount: 0, currentPage: 1, totalPages: 1, hasPreviousPage: false, hasNextPage: false };
    } catch (error) {
      console.error('getDoctorRequests error:', error);
      return { items: [], totalCount: 0, currentPage: 1, totalPages: 1, hasPreviousPage: false, hasNextPage: false };
    }
  },

  /** Alias maintained for backward compatibility */
  getCaseRequestsByDoctor: async (doctorId: string, page: number, pageSize: number): Promise<PagedResult<CaseRequest>> => {
    return doctorDashboardService.getDoctorRequests(doctorId, page, pageSize);
  },

  /**
   * Efficiently get the count of requests for a given status.
   * Uses pageSize=1 so only totalCount is meaningful — no heavy payload.
   * RequestStatus enum: 0=Pending, 1=Approved, 2=Rejected, 3=Cancelled, 4=Taken, 5=Completed
   */
  getDoctorRequestsCount: async (status: number): Promise<number> => {
    try {
      const res = await api.get('/Doctors/my-requests', {
        params: { page: 1, pageSize: 1, status },
      });
      const data = res.data.data ?? res.data;
      return data?.totalCount ?? 0;
    } catch (error) {
      console.error('getDoctorRequestsCount error:', error);
      return 0;
    }
  },

  /** Get a single case request by its ID */
  getCaseRequestById: async (requestId: string): Promise<CaseRequest> => {
    const res = await api.get(`/CaseRequests/${requestId}`);
    return res.data.data ?? res.data;
  },

  /** Approve a pending case request via /api/CaseRequests/approve */
  approveRequest: async (requestId: string, doctorId: string): Promise<void> => {
    await api.post('/CaseRequests/approve', {
      requestId,
      doctorId,
      isApproved: true,
    });
  },

  /** Reject a pending case request via /api/CaseRequests/reject/{id}/{doctorId} */
  rejectRequest: async (requestId: string, doctorId: string): Promise<void> => {
    await api.post(`/CaseRequests/reject/${requestId}/${doctorId}`);
  },

  // ─── Cases ────────────────────────────────────────────────────────────────

  /** Browse all cases with filters + pagination */
  getCases: async (params: {
    PatientName?: string;
    CaseType?: string;
    Status?: string;
    Gender?: number;
    SortBy?: string;
    SortDirection?: string;
    Page?: number;
    PageSize?: number;
  }): Promise<PagedResult<PatientCaseDto>> => {
    const res = await api.get('/Cases', { params });
    const data = res.data.data ?? res.data;
    if (data && !Array.isArray(data)) {
      return {
        items: data.items ?? [],
        totalCount: data.totalCount ?? 0,
        currentPage: data.currentPage ?? 1,
        totalPages: data.totalPages ?? 1,
        hasPreviousPage: data.hasPreviousPage ?? false,
        hasNextPage: data.hasNextPage ?? false,
      };
    }
    return { items: Array.isArray(data) ? data : [], totalCount: 0, currentPage: 1, totalPages: 1, hasPreviousPage: false, hasNextPage: false };
  },

  /** Get cases associated with a doctor (e.g. supervised cases) via /api/Cases/doctor/{docId} */
  getCasesByDoctor: async (docId: string, status?: string, page = 1, pageSize = 10): Promise<PagedResult<PatientCaseDto>> => {
    try {
      const res = await api.get(`/Cases/doctor/${docId}`, { params: { status, page, pageSize } });
      const data = res.data.data ?? res.data;
      if (data && !Array.isArray(data)) {
        return {
          items: data.items ?? [],
          totalCount: data.totalCount ?? 0,
          currentPage: data.currentPage ?? 1,
          totalPages: data.totalPages ?? 1,
          hasPreviousPage: data.hasPreviousPage ?? false,
          hasNextPage: data.hasNextPage ?? false,
        };
      }
      return { items: Array.isArray(data) ? data : [], totalCount: 0, currentPage: 1, totalPages: 1, hasPreviousPage: false, hasNextPage: false };
    } catch (error) {
      console.error('getCasesByDoctor error:', error);
      return { items: [], totalCount: 0, currentPage: 1, totalPages: 1, hasPreviousPage: false, hasNextPage: false };
    }
  },

  /** Get a single case by ID */
  getCaseById: async (caseId: string): Promise<PatientCaseDto> => {
    const res = await api.get(`/Cases/${caseId}`);
    return res.data.data ?? res.data;
  },

  // ─── Diagnoses ────────────────────────────────────────────────────────────

  /** Get paginated diagnoses for a case */
  getDiagnosesForCase: async (caseId: string, page = 1, pageSize = 20): Promise<PagedResult<DiagnosisDto>> => {
    const res = await api.get(`/Diagnoses/case/${caseId}`, { params: { page, pageSize } });
    const data = res.data.data ?? res.data;
    if (data && !Array.isArray(data)) {
      return {
        items: data.items ?? [],
        totalCount: data.totalCount ?? 0,
        currentPage: data.currentPage ?? 1,
        totalPages: data.totalPages ?? 1,
        hasPreviousPage: data.hasPreviousPage ?? false,
        hasNextPage: data.hasNextPage ?? false,
      };
    }
    return { items: Array.isArray(data) ? data : [], totalCount: 0, currentPage: 1, totalPages: 1, hasPreviousPage: false, hasNextPage: false };
  },

  /** Create a new diagnosis */
  createDiagnosis: async (data: {
    patientCaseId: string;
    stage: number;
    caseTypeId: string;
    notes: string;
    createdById: string;
    role: string;
    teethNumbers: number[];
  }): Promise<DiagnosisDto> => {
    const res = await api.post('/Diagnoses', data);
    return res.data.data ?? res.data;
  },

  /** Accept a diagnosis (doctor-only) */
  acceptDiagnosis: async (diagnosisId: string): Promise<void> => {
    await api.post(`/Diagnoses/${diagnosisId}/accept`);
  },

  /** Get all available case types */
  getCaseTypes: async (page = 1, pageSize = 100): Promise<CaseTypeDto[]> => {
    const res = await api.get('/CaseTypes', { params: { page, pageSize } });
    const data = res.data.data ?? res.data;
    return Array.isArray(data) ? data : (data?.items ?? []);
  },

  // ─── Sessions ─────────────────────────────────────────────────────────────

  /** Get paginated sessions for a case */
  getSessionsForCase: async (caseId: string, page = 1, pageSize = 20): Promise<PagedResult<SessionDto>> => {
    const res = await api.get(`/Sessions/case/${caseId}`, { params: { page, pageSize } });
    const data = res.data.data ?? res.data;
    if (data && !Array.isArray(data)) {
      return {
        items: data.items ?? [],
        totalCount: data.totalCount ?? 0,
        currentPage: data.currentPage ?? 1,
        totalPages: data.totalPages ?? 1,
        hasPreviousPage: data.hasPreviousPage ?? false,
        hasNextPage: data.hasNextPage ?? false,
      };
    }
    return { items: Array.isArray(data) ? data : [], totalCount: 0, currentPage: 1, totalPages: 1, hasPreviousPage: false, hasNextPage: false };
  },

  /** Create a new session */
  createSession: async (payload: {
    studentId: string;
    patientCaseId: string;
    sessionDate: string;
    location?: string;
  }): Promise<string> => {
    const res = await api.post('/Sessions', payload);
    return res.data.data ?? res.data;
  },

  /** Update session status */
  updateSessionStatus: async (sessionId: string, status: string): Promise<boolean> => {
    const res = await api.patch(`/Sessions/${sessionId}/status`, { status });
    return res.data.data ?? res.data;
  },

  /** Add a note to a session */
  addSessionNote: async (sessionId: string, note: string, isPrivate = false): Promise<string> => {
    const res = await api.post(`/Sessions/${sessionId}/notes`, { sessionId, note, isPrivate });
    return res.data.data ?? res.data;
  },

  /** Get notes for a session */
  getSessionNotes: async (sessionId: string): Promise<any[]> => {
    const res = await api.get(`/Sessions/${sessionId}/notes`);
    const data = res.data.data ?? res.data;
    return Array.isArray(data) ? data : [];
  },

  searchDoctors: async (params: {
    name?: string;
    username?: string;
    spec?: string;
    universityId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PagedResult<DoctorListDto>> => {
    const res = await api.get('/Doctors', { params });
    const data = res.data.data ?? res.data;
    if (data && !Array.isArray(data)) {
      return {
        items: data.items ?? [],
        totalCount: data.totalCount ?? 0,
        currentPage: data.currentPage ?? 1,
        totalPages: data.totalPages ?? 1,
        hasPreviousPage: data.hasPreviousPage ?? false,
        hasNextPage: data.hasNextPage ?? false,
      };
    }
    return { items: Array.isArray(data) ? data : [], totalCount: 0, currentPage: 1, totalPages: 1, hasPreviousPage: false, hasNextPage: false };
  },

  /** Search Case Types */
  searchCaseTypes: async (search?: string, page = 1, pageSize = 100): Promise<PagedResult<CaseTypeDto>> => {
    const res = await api.get('/CaseTypes', { params: { search, page, pageSize } });
    const data = res.data.data ?? res.data;
    if (data && !Array.isArray(data)) {
      return {
        items: data.items ?? [],
        totalCount: data.totalCount ?? 0,
        currentPage: data.currentPage ?? 1,
        totalPages: data.totalPages ?? 1,
        hasPreviousPage: data.hasPreviousPage ?? false,
        hasNextPage: data.hasNextPage ?? false,
      };
    }
    return { items: Array.isArray(data) ? data : [], totalCount: 0, currentPage: 1, totalPages: 1, hasPreviousPage: false, hasNextPage: false };
  },

  /** Search Patients */
  searchPatients: async (name?: string, page = 1, pageSize = 50): Promise<PagedResult<any>> => {
    const res = await api.get('/Patients', { params: { Name: name, pageNumber: page, pageSize } });
    const data = res.data.data ?? res.data;
    if (data && !Array.isArray(data)) {
      return {
        items: data.items ?? [],
        totalCount: data.totalCount ?? 0,
        currentPage: data.currentPage ?? 1,
        totalPages: data.totalPages ?? 1,
        hasPreviousPage: data.hasPreviousPage ?? false,
        hasNextPage: data.hasNextPage ?? false,
      };
    }
    return { items: Array.isArray(data) ? data : [], totalCount: 0, currentPage: 1, totalPages: 1, hasPreviousPage: false, hasNextPage: false };
  },
};

export interface DoctorListDto {
  publicId: string;
  fullName: string;
  email: string;
  username: string;
  specialty?: string;
}

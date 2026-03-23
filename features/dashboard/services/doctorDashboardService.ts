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

// ─── Service ─────────────────────────────────────────────────────────────────

export const doctorDashboardService = {
  /** Get doctor profile + stats */
  getDoctorDetails: async (doctorId: string): Promise<DoctorStats> => {
    const res = await api.get(`/Doctors/${doctorId}`);
    return res.data.data ?? res.data;
  },

  /** Get paginated case requests assigned to a doctor (used for both general dashboard and pending cases) */
  getDoctorRequests: async (
    doctorId: string,
    page: number,
    pageSize: number,
  ): Promise<PaginatedRequests> => {
    try {
      const res = await api.get(`/CaseRequests/doctor/${doctorId}`, {
        params: { page, pageSize },
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
      // handle flat array
      if (Array.isArray(data)) {
        return {
          items: data,
          totalCount: data.length,
          currentPage: page,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        };
      }
      return { items: [], totalCount: 0, currentPage: 1, totalPages: 1, hasPreviousPage: false, hasNextPage: false };
    } catch (error) {
      console.error('getDoctorRequests error:', error);
      return { items: [], totalCount: 0, currentPage: 1, totalPages: 1, hasPreviousPage: false, hasNextPage: false };
    }
  },

  /** Alias for getDoctorRequests to maintain backward compatibility with screens */
  getCaseRequestsByDoctor: async (
    doctorId: string,
    page: number,
    pageSize: number,
  ): Promise<PaginatedRequests> => {
    return doctorDashboardService.getDoctorRequests(doctorId, page, pageSize);
  },

  /** Get a single case request by its ID */
  getCaseRequestById: async (requestId: string): Promise<CaseRequest> => {
    const res = await api.get(`/CaseRequests/${requestId}`);
    return res.data.data ?? res.data;
  },

  /** Approve a pending case request */
  approveRequest: async (requestId: string): Promise<void> => {
    await api.put(`/CaseRequests/${requestId}/approve`);
  },

  /** Reject a pending case request */
  rejectRequest: async (requestId: string): Promise<void> => {
    await api.put(`/CaseRequests/${requestId}/reject`);
  },
};

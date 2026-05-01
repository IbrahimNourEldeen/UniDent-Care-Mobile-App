import { authService } from '@/features/auth/services/authService';
import {
  setCompletedCasesCount,
  setDoctorProfile,
  setOngoingCasesCount,
} from '@/store/slices/doctorSlice';
import { useAppDispatch } from '@/store/hooks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { doctorDashboardService } from '../services/doctorDashboardService';

export const DOCTOR_QUERY_KEYS = {
  profile: (doctorId: string) => ['doctor', 'profile', doctorId],
  requests: (doctorId: string, page: number, pageSize: number, status?: number) => [
    'doctor',
    'requests',
    doctorId,
    page,
    pageSize,
    status,
  ],
  cases: (status?: string) => ['doctor', 'cases', status],
  universities: ['universities', 'lookup'],
  ongoingCount: ['doctor', 'count', 'ongoing'],
  completedCount: ['doctor', 'count', 'completed'],
};

/**
 * Hook for doctor profile and stats — also stores in Redux for cross-screen access
 */
export const useDoctorProfile = (doctorId: string) => {
  const dispatch = useAppDispatch();

  return useQuery({
    queryKey: DOCTOR_QUERY_KEYS.profile(doctorId),
    queryFn: async () => {
      const data = await doctorDashboardService.getDoctorDetails(doctorId);
      // Persist to Redux so Profile screen can read without re-fetching
      dispatch(setDoctorProfile({
        publicId: data.publicId,
        fullName: data.fullName,
        email: data.email,
        specialty: data.specialty,
        universityId: data.universityId,
        totalStudents: data.totalStudents ?? 0,
        pendingRequests: data.pendingRequests ?? 0,
        approvedRequests: data.approvedRequests ?? 0,
        createAt: data.createAt,
      }));
      return data;
    },
    enabled: !!doctorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for paginated doctor requests
 */
export const useDoctorRequests = (
  doctorId: string,
  page: number,
  pageSize: number,
  status?: number
) => {
  return useQuery({
    queryKey: DOCTOR_QUERY_KEYS.requests(doctorId, page, pageSize, status),
    queryFn: () => doctorDashboardService.getDoctorRequests(doctorId, page, pageSize, status),
    enabled: !!doctorId,
    staleTime: 1 * 60 * 1000,
  });
};

/**
 * Hook for fetching doctor cases
 */
export const useDoctorCases = (status?: string, page: number = 1, pageSize: number = 10) => {
  return useQuery({
    queryKey: [...DOCTOR_QUERY_KEYS.cases(status), page, pageSize],
    queryFn: () => doctorDashboardService.getCases({ Status: status, Page: page, PageSize: pageSize }),
    staleTime: 1 * 60 * 1000,
  });
};

/**
 * Hook for ongoing + completed case counts — dispatches to Redux for cross-screen access.
 * Uses pageSize=1 (efficient — only reads totalCount).
 * RequestStatus: 1=Approved (Ongoing), 5=Completed
 */
export const useDoctorCaseCounts = () => {
  const dispatch = useAppDispatch();

  const ongoingQuery = useQuery({
    queryKey: DOCTOR_QUERY_KEYS.ongoingCount,
    queryFn: async () => {
      const count = await doctorDashboardService.getDoctorRequestsCount(1); // Approved
      dispatch(setOngoingCasesCount(count));
      return count;
    },
    staleTime: 2 * 60 * 1000,
  });

  const completedQuery = useQuery({
    queryKey: DOCTOR_QUERY_KEYS.completedCount,
    queryFn: async () => {
      const count = await doctorDashboardService.getDoctorRequestsCount(5); // Completed
      dispatch(setCompletedCasesCount(count));
      return count;
    },
    staleTime: 2 * 60 * 1000,
  });

  return {
    ongoingCount: ongoingQuery.data ?? 0,
    completedCount: completedQuery.data ?? 0,
    isLoading: ongoingQuery.isLoading || completedQuery.isLoading,
  };
};

/**
 * Hook for universities lookup
 */
export const useUniversities = () => {
  return useQuery({
    queryKey: DOCTOR_QUERY_KEYS.universities,
    queryFn: async () => {
      const res = await authService.getUniversitiesLookup();
      return res.data || res;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

/**
 * Hook for request actions (approve/reject)
 */
export const useDoctorRequestActions = () => {
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: (requestId: string) => doctorDashboardService.approveRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: string) => doctorDashboardService.rejectRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor'] });
    },
  });

  return {
    approveRequest: approveMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    rejectRequest: rejectMutation.mutateAsync,
    isRejecting: rejectMutation.isPending,
  };
};

/**
 * Hook for profile updates
 */
export const useUpdateDoctorProfile = (doctorId: string) => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (data: { fullName?: string; specialty?: string; phone?: string }) =>
      doctorDashboardService.updateDoctorProfile(doctorId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: DOCTOR_QUERY_KEYS.profile(doctorId) });
      // Optimistically update Redux too
      if (variables.fullName !== undefined || variables.specialty !== undefined) {
        const { updateDoctorProfileField } = require('@/store/slices/doctorSlice');
        dispatch(updateDoctorProfileField({
          ...(variables.fullName ? { fullName: variables.fullName } : {}),
          ...(variables.specialty ? { specialty: variables.specialty } : {}),
        }));
      }
    },
  });
};

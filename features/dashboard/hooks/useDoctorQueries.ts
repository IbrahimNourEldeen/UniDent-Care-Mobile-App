import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorDashboardService } from '../services/doctorDashboardService';
import { authService } from '@/features/auth/services/authService';

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
  universities: ['universities', 'lookup'],
};

/**
 * Hook for doctor profile and stats
 */
export const useDoctorProfile = (doctorId: string) => {
  return useQuery({
    queryKey: DOCTOR_QUERY_KEYS.profile(doctorId),
    queryFn: () => doctorDashboardService.getDoctorDetails(doctorId),
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
    staleTime: 1 * 60 * 1000, // 1 minute
  });
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
      // Invalidate all doctor requests and profile (stats change)
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

  return useMutation({
    mutationFn: (data: { fullName?: string; specialty?: string; phone?: string }) =>
      doctorDashboardService.updateDoctorProfile(doctorId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCTOR_QUERY_KEYS.profile(doctorId) });
    },
  });
};

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studentDashboardService } from '../services/studentDashboardService';

export const STUDENT_QUERY_KEYS = {
  profile: (studentId: string) => ['student', 'profile', studentId],
  universities: ['universities', 'lookup'],
};

/**
 * Hook for student profile
 */
export const useStudentProfile = (studentId: string) => {
  return useQuery({
    queryKey: STUDENT_QUERY_KEYS.profile(studentId),
    queryFn: () => studentDashboardService.getStudentDetails(studentId),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for profile updates
 */
export const useUpdateStudentProfile = (studentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { fullName?: string; level?: number; phone?: string }) =>
      studentDashboardService.updateStudentProfile(studentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENT_QUERY_KEYS.profile(studentId) });
    },
  });
};

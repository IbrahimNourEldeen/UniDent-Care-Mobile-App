import { RootState } from '@/store/store';
import api from '@/utils/api';
import { caseKeys } from '@/features/cases/hooks/caseQueryKeys';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

// Kept for backward-compat with components that still import these types
export interface UpcomingSession {
  id: string;
  patientInitials: string;
  treatmentType: string;
  scheduledAt: string;
  status: 'Scheduled' | 'Done' | 'Cancelled';
}

export interface ActivityItem {
  id: string;
  type: 'case_approved' | 'session_completed' | 'new_request';
  title: string;
  timestamp: string;
}

export interface StudentStatsDto {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalSessions: number;
  completedSessions: number;
  totalCases: number;
}

async function fetchStudentStats(studentId: string): Promise<StudentStatsDto> {
  const res = await api.get<{ data: StudentStatsDto }>(`/Students/${studentId}/statistics`);
  return res.data.data;
}

export function useStudentStats() {
  const user = useSelector((state: RootState) => state.auth.user);
  const studentId = (user as any)?.publicId ?? '';

  const { data, isLoading, isError, refetch } = useQuery<StudentStatsDto>({
    queryKey: caseKeys.studentStats(studentId),
    queryFn: () => fetchStudentStats(studentId),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const stats: StudentStatsDto = data ?? {
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalSessions: 0,
    completedSessions: 0,
    totalCases: 0,
  };

  const requestApprovalRate =
    stats.totalRequests > 0
      ? Math.round((stats.approvedRequests / stats.totalRequests) * 100)
      : 0;

  const sessionProgress =
    stats.totalSessions > 0
      ? Math.round((stats.completedSessions / stats.totalSessions) * 100)
      : 0;

  // "Completed cases" = cases that are fully done (totalCases is the assigned ones;
  // we derive from completedSessions as a proxy – backend may expose this directly later)
  const completedCases = stats.totalCases;

  return {
    stats,
    loading: isLoading,
    isError,
    refetch,
    sessionProgress,
    requestApprovalRate,
    completedCases,
  };
}

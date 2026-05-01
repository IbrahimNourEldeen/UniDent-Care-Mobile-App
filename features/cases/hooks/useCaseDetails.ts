import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getCaseById, getCaseStatuses, updateCaseStatus } from '../services/caseService';
import { caseKeys } from './caseQueryKeys';

export function useCaseDetails(caseId: string) {
  const queryClient = useQueryClient();

  const { data: patient, isLoading, refetch } = useQuery({
    queryKey: caseKeys.detail(caseId),
    queryFn: async () => {
      const res = await getCaseById(caseId);
      if (res.success && res.data) return res.data;
      throw new Error(res.message ?? 'Failed to load case');
    },
    enabled: !!caseId,
  });



  const { data: statuses } = useQuery({
    queryKey: ['caseStatuses'],
    queryFn: getCaseStatuses,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const statusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      // Map string status to numeric Enum
      // First try to find in fetched statuses
      let numericStatus: string;
      
      const foundStatus = statuses?.find(s => 
        s.name.toLowerCase() === newStatus.toLowerCase() || 
        s.value.toString() === newStatus
      );

      if (foundStatus) {
        numericStatus = foundStatus.value.toString();
      } else {
        // Fallback to hardcoded map if API fails or status not found
        const statusMap: Record<string, string> = {
          'Pending': '0',
          'InProgress': '1',
          'Completed': '2',
          'Cancelled': '3',
          'UnderReview': '4',
          'Rejected': '5',
        };
        numericStatus = statusMap[newStatus] || newStatus;
      }
      console.log('--- Case Status Update Request ---');
      console.log('Case ID:', caseId);
      console.log('New Status (Name):', newStatus);
      console.log('Mapped Numeric Status:', numericStatus);
      console.log('Payload:', JSON.stringify({ status: numericStatus }, null, 2));

      const res = await updateCaseStatus(caseId, numericStatus);

      console.log('--- Case Status Update Response ---');
      console.log('Response Body:', JSON.stringify(res, null, 2));

      if (!res.success) {
        throw new Error(res.message || 'Status update failed');
      }
      return res;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: caseKeys.detail(caseId) }),
        queryClient.invalidateQueries({ queryKey: caseKeys.all }),
        queryClient.refetchQueries({ queryKey: caseKeys.detail(caseId) }),
      ]);
      refetch(); // Explicitly call refetch from useQuery
    },
  });

  return {
    patient: patient ?? null,
    isLoading,
    refetch,
    statuses: statuses ?? [],
    updateStatus: statusMutation.mutateAsync,
    isUpdatingStatus: statusMutation.isPending,
  };
}

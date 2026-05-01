import { StudentUser } from '@/types/types';
import api from '@/utils/api';

export const studentDashboardService = {
  /** Get student profile + stats */
  getStudentDetails: async (studentId: string): Promise<StudentUser> => {
    const res = await api.get(`/Students/${studentId}`);
    return res.data.data ?? res.data;
  },

  /** Update student profile */
  updateStudentProfile: async (
    studentId: string,
    data: { fullName?: string; level?: number; phone?: string },
  ): Promise<boolean> => {
    const res = await api.put(`/Students/${studentId}`, data);
    return res.data.data ?? res.data;
  },
};

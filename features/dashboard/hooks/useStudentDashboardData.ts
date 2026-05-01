import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { getStudentMyCases, getStudentMyRequests, getSessionsByStudent, getUpcomingSessions } from "@/features/cases/services/caseService";
import { studentDashboardService } from "../services/studentDashboardService";

export const useStudentDashboardData = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const studentId = (user as any)?.publicId ?? "";

  const profileQuery = useQuery({
    queryKey: ["student-profile", studentId],
    queryFn: () => studentDashboardService.getStudentDetails(studentId),
    enabled: !!studentId,
  });

  const sessionsQuery = useQuery({
    queryKey: ["student-sessions", studentId],
    queryFn: () => getSessionsByStudent(studentId, { pageSize: 100 }),
    enabled: !!studentId,
  });

  const upcomingSessionsQuery = useQuery({
    queryKey: ["student-upcoming-sessions", studentId],
    queryFn: () => getUpcomingSessions(studentId, { pageSize: 5 }),
    enabled: !!studentId,
  });

  const myCasesQuery = useQuery({
    queryKey: ["student-my-cases", studentId],
    queryFn: () => getStudentMyCases({ pageSize: 100 }),
    enabled: !!studentId,
  });

  const myRequestsQuery = useQuery({
    queryKey: ["student-my-requests", studentId],
    queryFn: () => getStudentMyRequests({ pageSize: 100 }),
    enabled: !!studentId,
  });

  return {
    profile: profileQuery,
    sessions: sessionsQuery,
    upcomingSessions: upcomingSessionsQuery,
    myCases: myCasesQuery,
    myRequests: myRequestsQuery,
  };
};

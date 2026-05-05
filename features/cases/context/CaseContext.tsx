import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { StudentCaseItem, SessionDto, CaseRequestData } from "../types/caseTypes";
import { doctorDashboardService } from "@/features/dashboard/services/doctorDashboardService";
import { getSessionsByCase } from "../services/caseService";
import { Alert } from "react-native";

interface CaseContextType {
  caseData: StudentCaseItem | null;
  caseId: string | undefined;
  isLoading: boolean;
  refetch: () => void;

  // Sessions
  sessions: SessionDto[];
  sessionsLoading: boolean;
  sessionsPage: number;
  setSessionsPage: (page: number) => void;
  sessionsTotalPages: number;
  sessionsTotalCount: number;
  refetchSessions: () => void;
  scheduledSession: SessionDto | null;
  getSessionById: (sessionId: string) => SessionDto | undefined;

  doctorRequests: CaseRequestData[];
  doctorRequestsLoading: boolean;
  refetchDoctorRequests: () => void;

  doctorOwnerData: any | null;
  studentOwnerData: any | null;
  creatorData: any | null;
  userDataLoading: boolean;
  refetchUserData: () => void;
}

const CaseContext = createContext<CaseContextType | undefined>(undefined);

interface CaseProviderProps {
  children: ReactNode;
  caseData: StudentCaseItem | null;
  caseId: string | undefined;
  isLoading: boolean;
  refetch: () => void;
}

export const CaseProvider = ({ children, caseData, caseId, isLoading, refetch }: CaseProviderProps) => {
  const role = useSelector((state: RootState) => state.auth.role);
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = (user as any)?.publicId;

  // ── Sessions state ──
  const [sessions, setSessions] = useState<SessionDto[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsPage, setSessionsPage] = useState(1);
  const [sessionsTotalPages, setSessionsTotalPages] = useState(1);
  const [sessionsTotalCount, setSessionsTotalCount] = useState(0);

  // ── Doctor requests state ──
  const [doctorRequests, setDoctorRequests] = useState<CaseRequestData[]>([]);
  const [doctorRequestsLoading, setDoctorRequestsLoading] = useState(false);

  // ── Info owner case data state ──
  const [doctorOwnerData, setDoctorOwnerData] = useState<any | null>(null);
  const [studentOwnerData, setStudentOwnerData] = useState<any | null>(null);
  const [creatorData, setCreatorData] = useState<any | null>(null);
  const [infoOwnerDataLoading, setInfoOwnerDataLoading] = useState(false);

  // ── Fetch sessions ──
  const fetchSessions = useCallback(async () => {
    if (!caseId) return;
    setSessionsLoading(true);
    try {
      const res = await getSessionsByCase(caseId, { page: sessionsPage, pageSize: 100 });
      if (res && res.data) {
        setSessions(res.data.items);
        setSessionsTotalPages(res.data.totalPages);
        setSessionsTotalCount(res.data.totalCount);
      }
    } catch (err) {
      console.error("[CaseContext] Failed to fetch sessions:", err);
    } finally {
      setSessionsLoading(false);
    }
  }, [caseId, sessionsPage]);

  // ── Derived: scheduled session ──
  const scheduledSession = sessions.find((s) => {
    const status = s.status?.toString().toLowerCase();
    return status === "scheduled" || status === "pending" || status === "3";
  }) || null;

  // ── Helper: find session by ID ──
  const getSessionById = useCallback(
    (sessionId: string) => sessions.find(
      (s) => s.id.toLowerCase() === sessionId.toLowerCase()
    ),
    [sessions]
  );

  const hasRequest = caseData?.userFlags?.hasRequest;

  // ── Fetch doctor requests ──
  const fetchDoctorRequests = useCallback(async () => {
    if (role !== "Doctor" || !hasRequest || !userId || !caseId) return;
    setDoctorRequestsLoading(true);
    try {
      const res = await doctorDashboardService.getDoctorRequests(userId, 1, 50, 0); // 0 = Pending
      if (res && res.items) {
        const filtered = res.items.filter(
          (r: any) => String(r.patientCasePublicId).toLowerCase() === String(caseId).toLowerCase()
        );
        setDoctorRequests(filtered as any);
      }
    } catch (err) {
      console.error("[CaseContext] Failed to fetch doctor requests:", err);
    } finally {
      setDoctorRequestsLoading(false);
    }
  }, [role, userId, caseId, hasRequest]);

  // ── Fetch info owner case data ──
  const fetchInfoOwnerCaseData = useCallback(async () => {
    if (!userId || !role || !caseId) return;
    setInfoOwnerDataLoading(true);
    try {
      const assignedDoctorId = caseData?.assignedDoctorId;
      const assignedStudentId = caseData?.assignedStudentId;
      const createdById = caseData?.createdById;
      const createdByRole = caseData?.createdByRole;

      const [doctorData, studentData] = await Promise.all([
        assignedDoctorId ? doctorDashboardService.getDoctorDetails(assignedDoctorId).catch(() => null) : Promise.resolve(null),
        assignedStudentId ? doctorDashboardService.getStudentDetails(assignedStudentId).catch(() => null) : Promise.resolve(null)
      ]);
      
      setDoctorOwnerData(doctorData);
      setStudentOwnerData(studentData);

      let createdUser = null;
      if (createdById) {
        if (createdByRole === "Doctor") {
          createdUser = await doctorDashboardService.getDoctorDetails(createdById).catch(() => null);
        } else if (createdByRole === "Student") {
          createdUser = await doctorDashboardService.getStudentDetails(createdById).catch(() => null);
        }
      }
      setCreatorData(createdUser);

    } catch (err) {
      console.error("[CaseContext] Failed to fetch user data:", err);
    } finally {
      setInfoOwnerDataLoading(false);
    }
  }, [userId, role, caseId, caseData]);

  useEffect(() => {
    if (caseId && !isLoading) {
      fetchSessions();
    }
  }, [fetchSessions, caseId, isLoading]);

  useEffect(() => {
    if (caseId && !isLoading && role === "Doctor") {
      fetchDoctorRequests();
    }
  }, [fetchDoctorRequests, caseId, isLoading, role]);

  useEffect(() => {
    if (caseId && !isLoading) {
      fetchInfoOwnerCaseData();
    }
  }, [fetchInfoOwnerCaseData, caseId, isLoading]);

  return (
    <CaseContext.Provider
      value={{
        caseData,
        caseId,
        isLoading,
        refetch,
        sessions,
        sessionsLoading,
        sessionsPage,
        setSessionsPage,
        sessionsTotalPages,
        sessionsTotalCount,
        refetchSessions: fetchSessions,
        scheduledSession,
        getSessionById,
        doctorRequests,
        doctorRequestsLoading,
        doctorOwnerData,
        studentOwnerData,
        creatorData,
        userDataLoading: infoOwnerDataLoading,
        refetchUserData: fetchInfoOwnerCaseData,
        refetchDoctorRequests: fetchDoctorRequests,
      }}
    >
      {children}
    </CaseContext.Provider>
  );
};

export const useCase = () => {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error("useCase must be used within a CaseProvider");
  }
  return context;
};

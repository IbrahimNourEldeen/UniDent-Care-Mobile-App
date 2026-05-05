import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { StudentCaseItem, DiagnosisDto } from "../types/caseTypes";
import { doctorDashboardService } from "@/features/dashboard/services/doctorDashboardService";
import { Alert } from "react-native";

export type CaseStatus = "Pending" | "InProgress" | "Completed" | "Cancelled" | "UnderReview" | "Rejected" | string;

interface UseCaseDetailsReturn {
    patient: StudentCaseItem | null;
    isLoading: boolean;
    status: CaseStatus;
    role: string | null;
    studentId: string | null;
    refetch: () => void;
}

export function useCaseDetails(caseId: string): UseCaseDetailsReturn {
    const role = useSelector((state: RootState) => state.auth.role);
    const user = useSelector((state: RootState) => state.auth.user);
    const studentId = (user as any)?.publicId ?? null;
    
    const [patient, setPatient] = useState<StudentCaseItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState<CaseStatus>("Pending");

    const fetchCaseData = useCallback(async () => { 
        if (!caseId) return;
        setIsLoading(true);
        try {
            const [caseData, diagnosesResponse] = await Promise.all([
                doctorDashboardService.getCaseById(caseId),
                doctorDashboardService.getDiagnosesForCase(caseId)
            ]);

            if (caseData) {
                // Adapt the data to StudentCaseItem interface
                let mappedStatus = caseData.status || "Pending";
                if (mappedStatus.toLowerCase() === 'inprogress') mappedStatus = 'InProgress';
                if (mappedStatus.toLowerCase() === 'underreview') mappedStatus = 'UnderReview';

                setStatus(mappedStatus);

                const diagnoses = diagnosesResponse?.items || [];

                const mappedPatient: StudentCaseItem = {
                    ...caseData,
                    status: mappedStatus,
                    diagnoses: diagnoses,
                    diagnosisdto: diagnoses.length > 0 ? diagnoses[0] : null,
                    // Ensure mandatory fields from StudentCaseItem are present
                    assignedStudentId: caseData.assignedStudentId || "",
                    assignedDoctorId: caseData.assignedDoctorId || "",
                    universityId: caseData.universityId || "",
                    universityName: caseData.universityName || "",
                    createdById: caseData.createdById || "",
                    createdByRole: caseData.createdByRole || "",
                    imageUrls: caseData.imageUrls || [],
                    userFlags: caseData.userFlags || {
                        isOwner: false,
                        role: "",
                        isAssignedDoctor: false,
                        isAssignedStudent: false,
                        isAssignedToMe: false,
                        hasRequest: false,
                        requestId: "",
                        requestStatus: ""
                    },
                    availableActions: caseData.availableActions || [],
                    totalSessions: caseData.totalSessions || 0,
                    hasEvaluatedSession: caseData.hasEvaluatedSession || false,
                    pendingRequests: caseData.pendingRequests || 0,
                    processStatus: caseData.processStatus || mappedStatus,
                } as StudentCaseItem;

                setPatient(mappedPatient);
            }
        } catch (err: any) {
            console.error('[useCaseDetails] Error:', err);
            Alert.alert("Error", err.message || "An error occurred while fetching case details.");
        } finally {
            setIsLoading(false);
        }
    }, [caseId]);

    useEffect(() => {
        fetchCaseData();
    }, [fetchCaseData]);

    return { patient, isLoading, status, role: role || null, studentId, refetch: fetchCaseData };
}

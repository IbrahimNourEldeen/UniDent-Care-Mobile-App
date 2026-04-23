import { useState, useEffect, useCallback } from "react";
import { getCaseById } from "../services/caseService";
import { StudentCaseItem } from "../types/caseTypes";

export function useCaseDetails(caseId: string) {
    const [patient, setPatient] = useState<StudentCaseItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCaseData = useCallback(async () => {
        if (!caseId) return;
        setIsLoading(true);
        try {
            const response = await getCaseById(caseId);
            if (response.success && response.data) {
                setPatient(response.data);
            }
        } catch (err: any) {
            console.error("Failed to fetch case details", err);
        } finally {
            setIsLoading(false);
        }
    }, [caseId]);

    useEffect(() => {
        fetchCaseData();
    }, [fetchCaseData]);

    return { patient, isLoading, refetch: fetchCaseData };
}

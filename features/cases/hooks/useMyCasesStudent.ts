import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { StudentCaseItem, StudentRequestItem } from '../types/caseTypes';
import { getStudentMyCases, getStudentMyRequests } from '../services/caseService';
import { getCaseDiagnoses } from '@/features/patient/services/patientService';

export type MyCasesTab = 'cases' | 'requests';

const PAGE_SIZE = 9;

export function useMyCasesStudent() {
    const [activeTab, setActiveTab] = useState<MyCasesTab>('cases');

    // ─── Cases state ─────────────────────────────────────────────────────────
    const [cases, setCases] = useState<StudentCaseItem[]>([]);
    const [casesLoading, setCasesLoading] = useState(true);
    const [caseType, setCaseType] = useState('');
    const [casesPage, setCasesPage] = useState(1);
    const [casesTotalPages, setCasesTotalPages] = useState(1);
    const [casesTotalCount, setCasesTotalCount] = useState(0);

    // ─── Requests state ───────────────────────────────────────────────────────
    const [requests, setRequests] = useState<StudentRequestItem[]>([]);
    const [requestsLoading, setRequestsLoading] = useState(true);
    const [requestStatus, setRequestStatus] = useState('');
    const [requestsPage, setRequestsPage] = useState(1);
    const [requestsTotalPages, setRequestsTotalPages] = useState(1);
    const [requestsTotalCount, setRequestsTotalCount] = useState(0);

    // ─── Fetch cases ─────────────────────────────────────────────────────────
    const fetchCases = useCallback(async () => {
        setCasesLoading(true);
        try {
            const res = await getStudentMyCases({
                caseType: caseType || undefined,
                page: casesPage,
                pageSize: PAGE_SIZE,
            });
            if (res.success && res.data) {
                // Fetch diagnoses for each case to ensure case type is available
                const casesWithDiagnoses = await Promise.all(res.data.items.map(async (c: any) => {
                    try {
                        const dxRes = await getCaseDiagnoses(c.id);
                        const dxData = dxRes?.data?.items || dxRes?.data || [];
                        return { ...c, diagnosisdto: Array.isArray(dxData) ? dxData : [dxData] };
                    } catch {
                        return c;
                    }
                }));
                setCases(casesWithDiagnoses);
                setCasesTotalPages(res.data.totalPages);
                setCasesTotalCount(res.data.totalCount);
            }
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to load cases');
        } finally {
            setCasesLoading(false);
        }
    }, [caseType, casesPage]);

    // ─── Fetch requests ───────────────────────────────────────────────────────
    const fetchRequests = useCallback(async () => {
        setRequestsLoading(true);
        try {
            const res = await getStudentMyRequests({
                status: requestStatus || undefined,
                page: requestsPage,
                pageSize: PAGE_SIZE,
            });
            if (res.success && res.data) {
                // Fetch diagnoses for each request to ensure case type is available
                const requestsWithDiagnoses = await Promise.all(res.data.items.map(async (r: any) => {
                    try {
                        const dxRes = await getCaseDiagnoses(r.patientCasePublicId || r.patientCaseId);
                        const dxData = dxRes?.data?.items || dxRes?.data || [];
                        return { ...r, diagnosisdto: Array.isArray(dxData) ? dxData : [dxData] };
                    } catch {
                        return r;
                    }
                }));
                setRequests(requestsWithDiagnoses);
                setRequestsTotalPages(res.data.totalPages);
                setRequestsTotalCount(res.data.totalCount);
            }
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to load requests');
        } finally {
            setRequestsLoading(false);
        }
    }, [requestStatus, requestsPage]);

    useEffect(() => { fetchCases(); }, [fetchCases]);
    useEffect(() => { fetchRequests(); }, [fetchRequests]);

    // Reset page when filter changes
    const handleSetCaseType = (value: string) => {
        setCaseType(value);
        setCasesPage(1);
    };

    const handleSetRequestStatus = (value: string) => {
        setRequestStatus(value);
        setRequestsPage(1);
    };

    return {
        activeTab, setActiveTab,
        // cases
        cases, casesLoading, caseType, setCaseType: handleSetCaseType,
        casesPage, setCasesPage, casesTotalPages, casesTotalCount,
        refetchCases: fetchCases,
        // requests
        requests, requestsLoading, requestStatus, setRequestStatus: handleSetRequestStatus,
        requestsPage, setRequestsPage, requestsTotalPages, requestsTotalCount,
    };
}

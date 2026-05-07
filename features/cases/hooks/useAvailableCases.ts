import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '@/utils/api';
import { CaseItem, CaseType } from '@/features/cases/types/caseTypes';

const PAGE_SIZE = 10;

export type ViewMode = 'cards' | 'list';
export type SortKey = 'patientName' | 'patientAge' | 'createAt';
export type SortDirection = 'asc' | 'desc';
export interface SortConfig { key: SortKey; direction: SortDirection; }

export function useAvailableCases() {
  const [allCases, setAllCases] = useState<CaseItem[]>([]);
  const [caseTypes, setCaseTypes] = useState<CaseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCaseType, setSelectedCaseType] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch a large enough set for front-end handling
      const res = await api.get('/Students/available-cases', { 
        params: { page: 1, pageSize: 200 } 
      });
      const data = res.data.data;
      const items: CaseItem[] = data?.items ?? data ?? [];
      setAllCases(items);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load cases');
      setAllCases([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  // Fetch case types
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await api.get('/CaseTypes', { params: { page: 1, pageSize: 100 } });
        const data = res.data.data;
        setCaseTypes(data?.items ?? []);
      } catch {}
    };
    fetchTypes();
  }, []);

  const filteredCases = useMemo(() => {
    let result = allCases;
    
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => {
        const ct = (c as any).diagnoses?.[0]?.caseType || 
                   (c as any).diagnoses?.[0]?.caseTypeName || 
                   (c as any).diagnosisdto?.[0]?.caseType || 
                   (c as any).diagnosisdto?.[0]?.caseTypeName || 
                   c.caseType?.name || 
                   '';
        return (c.patientName || '').toLowerCase().includes(q) ||
               ct.toLowerCase().includes(q);
      });
    }

    if (selectedCaseType) {
      const selectedType = caseTypes.find(t => t.publicId === selectedCaseType);
      const selectedName = selectedType?.name.toLowerCase();

      result = result.filter(c => {
        // 1. Try matching by ID
        const itemCaseTypeId = c.caseType?.publicId || (c as any).caseTypeId;
        const diagArray = (c as any).diagnoses || (c as any).diagnosisdto || (c as any).diagnosisDto;
        const diag = Array.isArray(diagArray) ? diagArray[0] : diagArray;
        const diagCaseTypeId = diag?.caseTypeId || (diag as any)?.caseTypePublicId;
        
        if (itemCaseTypeId === selectedCaseType || diagCaseTypeId === selectedCaseType) return true;

        // 2. Try matching by Name (Fallback like Web)
        if (selectedName) {
          const itemCaseName = (
            c.caseType?.name || 
            (c as any).caseTypeName || 
            (c as any).caseName || 
            diag?.caseTypeName || 
            diag?.caseType || 
            ''
          ).toLowerCase();
          return itemCaseName.includes(selectedName);
        }

        return false;
      });
    }

    return result;
  }, [allCases, search, selectedCaseType]);

  const sortedCases = useMemo(() => {
    let result = [...filteredCases];
    if (sortConfig) {
      result.sort((a, b) => {
        let aVal: any;
        let bVal: any;
        if (sortConfig.key === 'patientName') {
          aVal = (a.patientName || '').toLowerCase();
          bVal = (b.patientName || '').toLowerCase();
        } else if (sortConfig.key === 'patientAge') {
          aVal = a.patientAge || 0;
          bVal = b.patientAge || 0;
        } else {
          aVal = new Date(a.createAt).getTime();
          bVal = new Date(b.createAt).getTime();
        }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [filteredCases, sortConfig]);

  const totalCount = filteredCases.length;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;
  const paginatedCases = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedCases.slice(start, start + PAGE_SIZE);
  }, [sortedCases, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCaseType, sortConfig]);

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
  };

  return {
    cases: allCases,
    sortedCases: paginatedCases,
    caseTypes,
    loading,
    error,
    search,
    setSearch,
    selectedCaseType,
    setSelectedCaseType,
    viewMode,
    setViewMode,
    currentPage,
    totalPages,
    totalCount,
    pageSize: PAGE_SIZE,
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
    onPageChange: (page: number) => setCurrentPage(page),
    sortConfig,
    handleSort,
    refetch: fetchCases,
  };
}

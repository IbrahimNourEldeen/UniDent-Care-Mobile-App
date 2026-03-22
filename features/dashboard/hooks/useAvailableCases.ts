import { useState, useEffect, useCallback } from 'react';
import api from '@/utils/api';
import { CaseItem, CaseType } from '@/features/cases/types/caseTypes';

const PAGE_SIZE = 10;

export type ViewMode = 'cards' | 'list';

export function useAvailableCases() {
  const [allCases, setAllCases] = useState<CaseItem[]>([]);
  const [caseTypes, setCaseTypes] = useState<CaseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCaseType, setSelectedCaseType] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page: currentPage,
        pageSize: PAGE_SIZE,
      };
      if (search) params.search = search;
      if (selectedCaseType) params.caseTypeId = selectedCaseType;

      const res = await api.get('/Cases', { params });
      const data = res.data.data;
      const items: CaseItem[] = data?.items ?? data ?? [];

      setAllCases(items);
      setTotalPages(data?.totalPages ?? 1);
      setTotalCount(data?.totalCount ?? items.length);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load cases');
      setAllCases([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, selectedCaseType]);

  // Fetch case types once
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

  // Re-fetch whenever filters change, resetting to page 1
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCaseType]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const onPageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return {
    cases: allCases,
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
    onPageChange,
    refetch: fetchCases,
  };
}

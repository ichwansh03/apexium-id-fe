import { useState, useEffect, useCallback } from 'react';
import type { Log } from '../types';

export const useLogList = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [size] = useState<number>(10);
  const [selectedLogBody, setSelectedLogBody] = useState<string | null>(null);
  const [fetchingBody, setFetchingBody] = useState<boolean>(false);
  const [searchClass, setSearchClass] = useState<string>('');
  const [searchUser, setSearchUser] = useState<string>('');
  const [errorIds, setErrorIds] = useState<Set<string>>(new Set());
  const [filterMode, setFilterMode] = useState<'all' | 'errors'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState<boolean>(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/sfdc/logs/db?page=${page}&size=${size}`;
      if (searchClass) url += `&className=${encodeURIComponent(searchClass)}`;
      if (searchUser) url += `&author=${encodeURIComponent(searchUser)}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }
      const data = await response.json();
      setLogs(data as Log[]);
      
      // Reset error detection and selection for new page
      setErrorIds(new Set());
      setSelectedIds(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [page, size, searchClass, searchUser]);

  // Deep scan visible logs for errors in body
  useEffect(() => {
    if (logs.length === 0) return;

    const scanLogs = async () => {
      const newErrorIds = new Set<string>();
      
      // Parallel fetch and scan
      await Promise.all(logs.map(async (log) => {
        // Initial check via status
        if (log.status && log.status !== 'Success') {
          newErrorIds.add(log.sfdcId);
          return;
        }

        try {
          const response = await fetch(`/api/sfdc/logs/${log.sfdcId}/body`);
          if (response.ok) {
            const body = await response.text();
            const hasError = /FATAL_ERROR|EXCEPTION_THROWN|LIMIT_EXCEEDED|\|ERROR\|/.test(body);
            if (hasError) {
              newErrorIds.add(log.sfdcId);
            }
          }
        } catch (err) {
          console.error(`Failed to scan log ${log.sfdcId}:`, err);
        }
      }));

      setErrorIds(newErrorIds);
    };

    void scanLogs();
  }, [logs]);

  useEffect(() => {
    const shouldFetch = (searchClass.length === 0 && searchUser.length === 0) || 
                       (searchClass.length >= 3 || searchUser.length >= 3);
    
    if (!shouldFetch) return;

    const timer = setTimeout(() => {
      void fetchLogs();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchLogs, searchClass.length, searchUser.length]);

  const handleViewDetail = async (id: string) => {
    setFetchingBody(true);
    try {
      const response = await fetch(`/api/sfdc/logs/${id}/body`);
      const body = await response.text();
      setSelectedLogBody(body);
    } catch (err) {
      console.error('Failed to fetch log body:', err);
      alert('Failed to fetch log body');
    } finally {
      setFetchingBody(false);
    }
  };

  const handleDownload = (id: string, operation: string | undefined) => {
    const url = `/api/sfdc/logs/${id}/download?operation=${encodeURIComponent(operation || '')}`;
    window.location.href = url;
  };

  const handleDeleteLog = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this log from Salesforce?')) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/sfdc/logs/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchLogs();
      } else {
        throw new Error('Failed to delete log');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete log');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} selected logs from Salesforce?`)) return;
    
    setDeleting(true);
    try {
      const idsParam = Array.from(selectedIds).join(',');
      const response = await fetch(`/api/sfdc/logs?ids=${idsParam}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchLogs();
        setSelectedIds(new Set());
      } else {
        throw new Error('Failed to delete selected logs');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete logs');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('CRITICAL: Are you sure you want to delete ALL debug logs from Salesforce? This action cannot be undone.')) return;
    
    setDeleting(true);
    try {
      const response = await fetch('/api/sfdc/logs', { method: 'DELETE' });
      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'All logs deleted');
        await fetchLogs();
      } else {
        throw new Error('Failed to delete all logs');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete all logs');
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const displayedLogs = filterMode === 'errors' 
    ? logs.filter(log => errorIds.has(log.sfdcId))
    : logs;

  const toggleSelectAll = () => {
    if (selectedIds.size === displayedLogs.length && displayedLogs.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(displayedLogs.map(l => l.sfdcId)));
    }
  };

  const handleNextPage = () => setPage((prev) => prev + 1);
  const handlePrevPage = () => setPage((prev) => Math.max(0, prev - 1));

  const handleSearchClassChange = (value: string) => {
    setSearchClass(value);
    setPage(0);
  };

  const handleSearchUserChange = (value: string) => {
    setSearchUser(value);
    setPage(0);
  };

  return {
    logs: displayedLogs,
    loading,
    error,
    page,
    size,
    selectedLogBody,
    setSelectedLogBody,
    fetchingBody,
    searchClass,
    searchUser,
    errorIds,
    filterMode,
    setFilterMode,
    selectedIds,
    deleting,
    handleViewDetail,
    handleDownload,
    handleDeleteLog,
    handleDeleteSelected,
    handleDeleteAll,
    toggleSelect,
    toggleSelectAll,
    handleNextPage,
    handlePrevPage,
    handleSearchClassChange,
    handleSearchUserChange
  };
};

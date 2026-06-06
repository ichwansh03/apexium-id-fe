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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [page, size, searchClass, searchUser]);

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
    logs,
    loading,
    error,
    page,
    size,
    selectedLogBody,
    setSelectedLogBody,
    fetchingBody,
    searchClass,
    searchUser,
    handleViewDetail,
    handleDownload,
    handleNextPage,
    handlePrevPage,
    handleSearchClassChange,
    handleSearchUserChange
  };
};

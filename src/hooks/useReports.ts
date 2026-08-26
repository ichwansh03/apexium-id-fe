import { useState, useEffect, useCallback } from 'react';
import type { Report } from '../types';

export const useReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState<number>(0);
  const [size] = useState<number>(10);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/sfdc/metadata/reports/db?page=${page}&size=${size}`;
      if (searchTerm) {
        url += `&name=${encodeURIComponent(searchTerm)}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch reports');
      const data = await response.json();
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, size, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReports();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchReports]);

  const handleNextPage = () => setPage((prev) => prev + 1);
  const handlePrevPage = () => setPage((prev) => Math.max(0, prev - 1));

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(0);
  };

  return {
    reports,
    loading,
    searchTerm,
    page,
    size,
    handleNextPage,
    handlePrevPage,
    handleSearchChange
  };
};

import { useState, useEffect, useCallback } from 'react';
import type { DebugLevel } from '../types';

export const useActiveDebugLevels = () => {
  const [levels, setLevels] = useState<DebugLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState<number>(0);
  const [size] = useState<number>(10);

  const fetchLevels = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/sfdc/metadata/debug-levels/db?page=${page}&size=${size}`;
      if (searchTerm) {
        url += `&name=${encodeURIComponent(searchTerm)}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch debug levels');
      const data = await response.json();
      setLevels(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, size, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLevels();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchLevels]);

  const handleNextPage = () => setPage((prev) => prev + 1);
  const handlePrevPage = () => setPage((prev) => Math.max(0, prev - 1));

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(0);
  };

  return {
    levels,
    loading,
    searchTerm,
    page,
    size,
    handleNextPage,
    handlePrevPage,
    handleSearchChange
  };
};

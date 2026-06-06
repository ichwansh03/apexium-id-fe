import { useState, useEffect, useCallback } from 'react';
import type { ApexTrigger } from '../types';

export const useActiveTriggers = () => {
  const [triggers, setTriggers] = useState<ApexTrigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrigger, setSelectedTrigger] = useState<ApexTrigger | null>(null);
  const [page, setPage] = useState<number>(0);
  const [size] = useState<number>(10);

  const fetchTriggers = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/sfdc/metadata/triggers/db?page=${page}&size=${size}`;
      if (searchTerm) {
        url += `&name=${encodeURIComponent(searchTerm)}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch triggers');
      const data = await response.json();
      setTriggers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, size, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTriggers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchTriggers]);

  const handleNextPage = () => setPage((prev) => prev + 1);
  const handlePrevPage = () => setPage((prev) => Math.max(0, prev - 1));

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(0);
  };

  return {
    triggers,
    loading,
    searchTerm,
    selectedTrigger,
    setSelectedTrigger,
    page,
    size,
    handleNextPage,
    handlePrevPage,
    handleSearchChange
  };
};

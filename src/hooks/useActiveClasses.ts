import { useState, useEffect, useCallback } from 'react';
import type { ApexClass } from '../types';

export const useActiveClasses = () => {
  const [classes, setClasses] = useState<ApexClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<ApexClass | null>(null);
  const [page, setPage] = useState<number>(0);
  const [size] = useState<number>(10);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/sfdc/metadata/classes/db?page=${page}&size=${size}`;
      if (searchTerm) {
        url += `&name=${encodeURIComponent(searchTerm)}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch classes');
      const data = await response.json();
      setClasses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, size, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClasses();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchClasses]);

  const handleNextPage = () => setPage((prev) => prev + 1);
  const handlePrevPage = () => setPage((prev) => Math.max(0, prev - 1));

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(0);
  };

  return {
    classes,
    loading,
    searchTerm,
    selectedClass,
    setSelectedClass,
    page,
    size,
    handleNextPage,
    handlePrevPage,
    handleSearchChange
  };
};

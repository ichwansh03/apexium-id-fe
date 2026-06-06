import { useState, useEffect, useCallback } from 'react';
import type { User } from '../types';

export const useActiveUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [page, setPage] = useState<number>(0);
  const [size] = useState<number>(10);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/sfdc/users/db?page=${page}&size=${size}`;
      if (searchTerm) {
        url += `&name=${encodeURIComponent(searchTerm)}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, size, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleNextPage = () => setPage((prev) => prev + 1);
  const handlePrevPage = () => setPage((prev) => Math.max(0, prev - 1));

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(0);
  };

  return {
    users,
    loading,
    searchTerm,
    selectedUser,
    setSelectedUser,
    page,
    size,
    handleNextPage,
    handlePrevPage,
    handleSearchChange
  };
};

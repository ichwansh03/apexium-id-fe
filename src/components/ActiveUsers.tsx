import React, { useState, useEffect, useCallback } from 'react';
import './MetadataViews.css';
import AddTraceModal from './AddTraceModal';
import type { User } from '../types';

const ActiveUsers: React.FC = () => {
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

  if (loading && users.length === 0) return <div className="loading">Loading active users...</div>;

  return (
    <div className="page-container metadata-view-container">
      <div className="metadata-header">
        <h2>Active Users</h2>
      </div>

      <div className="search-container">
        <input 
          type="text" 
          placeholder="Search users by name..." 
          className="metadata-search-input"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
        />
      </div>

      <div className="table-wrapper">
        <table className="log-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.sfdcId}>
                <td className="entity-name">{user.name}</td>
                <td className="api-name">{user.username}</td>
                <td>{user.email}</td>
                <td>{user.profileName}</td>
                <td><span className="status-badge">Active</span></td>
                <td>
                  <button 
                    className="action-btn" 
                    onClick={() => setSelectedUser(user)}
                  >
                    Trace
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button className="pagination-btn" onClick={handlePrevPage} disabled={page === 0 || loading}>
          Previous
        </button>
        <span className="page-info">Page {page + 1}</span>
        <button className="pagination-btn" onClick={handleNextPage} disabled={users.length < size || loading}>
          Next
        </button>
      </div>

      {selectedUser && (
        <AddTraceModal 
          entityId={selectedUser.sfdcId}
          entityName={selectedUser.name}
          entityType="User"
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default ActiveUsers;

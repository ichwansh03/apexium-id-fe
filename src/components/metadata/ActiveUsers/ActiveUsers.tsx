import React from 'react';
import '../../shared/styles/MetadataViews.css';
import AddTraceModal from '../../trace/AddTraceModal/AddTraceModal';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import { useActiveUsers } from '../../../hooks/useActiveUsers';

const ActiveUsers: React.FC = () => {
  const {
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
  } = useActiveUsers();

  if (loading && users.length === 0) return (
    <LoadingSpinner 
      message="Searching users..." 
      description="Finding active users in your Salesforce organization." 
    />
  );

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
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        <table className="log-table">
          <thead>
            <tr>
              <th className="col-user-name">Name</th>
              <th className="col-user-username">Username</th>
              <th className="col-user-email">Email</th>
              <th className="col-user-role">Role</th>
              <th className="col-user-status">Status</th>
              <th className="col-user-actions">Actions</th>
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

      {loading && users.length > 0 && (
        <LoadingSpinner 
          type="overlay" 
          message="Searching users..." 
          description="Retrieving active user records from Salesforce."
        />
      )}

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

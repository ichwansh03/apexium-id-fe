import React from 'react';
import './MetadataViews.css';
import AddTraceModal from './AddTraceModal';
import LoadingSpinner from './LoadingSpinner';
import { useActiveClasses } from '../hooks/useActiveClasses';

const ActiveClasses: React.FC = () => {
  const {
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
  } = useActiveClasses();

  if (loading && classes.length === 0) return (
    <LoadingSpinner 
      message="Searching apex classes..." 
      description="Scanning Salesforce metadata for available Apex classes." 
    />
  );

  return (
    <div className="page-container metadata-view-container">
      <div className="metadata-header">
        <h2>Active Apex Classes</h2>
      </div>

      <div className="search-container">
        <input 
          type="text" 
          placeholder="Search classes by name..." 
          className="metadata-search-input"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        <table className="log-table">
          <thead>
            <tr>
              <th className="col-meta-name">Name</th>
              <th className="col-meta-api">API Version</th>
              <th className="col-meta-date">Last Modified</th>
              <th className="col-meta-status">Status</th>
              <th className="col-meta-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((cls) => (
              <tr key={cls.sfdcId}>
                <td className="entity-name">{cls.name}</td>
                <td>{cls.apiVersion}</td>
                <td>{new Date(cls.lastModifiedDate).toLocaleDateString()}</td>
                <td><span className="status-badge">{cls.status}</span></td>
                <td>
                  <button 
                    className="action-btn" 
                    onClick={() => setSelectedClass(cls)}
                  >
                    Trace
                  </button>
                </td>
              </tr>
            ))}
            {classes.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>No classes found</td>
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
        <button className="pagination-btn" onClick={handleNextPage} disabled={classes.length < size || loading}>
          Next
        </button>
      </div>

      {loading && classes.length > 0 && (
        <LoadingSpinner 
          type="overlay" 
          message="Searching classes..." 
          description="Refreshing metadata from Salesforce database."
        />
      )}

      {selectedClass && (
        <AddTraceModal 
          entityId={selectedClass.sfdcId}
          entityName={selectedClass.name}
          entityType="ApexClass"
          onClose={() => setSelectedClass(null)}
        />
      )}
    </div>
  );
};

export default ActiveClasses;


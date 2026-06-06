import React from 'react';
import './MetadataViews.css';
import AddTraceModal from './AddTraceModal';
import LoadingSpinner from './LoadingSpinner';
import { useActiveTriggers } from '../hooks/useActiveTriggers';

const ActiveTriggers: React.FC = () => {
  const {
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
  } = useActiveTriggers();

  if (loading && triggers.length === 0) return (
    <LoadingSpinner 
      message="Searching apex triggers..." 
      description="Scanning Salesforce metadata for available Apex triggers." 
    />
  );

  return (
    <div className="page-container metadata-view-container">
      <div className="metadata-header">
        <h2>Active Apex Triggers</h2>
      </div>

      <div className="search-container">
        <input 
          type="text" 
          placeholder="Search triggers by name or object..." 
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
              <th className="col-meta-sobject">SObject</th>
              <th className="col-meta-date">Last Modified</th>
              <th className="col-meta-status">Status</th>
              <th className="col-meta-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {triggers.map((trigger) => (
              <tr key={trigger.sfdcId}>
                <td className="entity-name">{trigger.name}</td>
                <td className="api-name">{trigger.sobject}</td>
                <td>{new Date(trigger.lastModifiedDate).toLocaleDateString()}</td>
                <td><span className="status-badge">{trigger.status}</span></td>
                <td>
                  <button 
                    className="action-btn" 
                    onClick={() => setSelectedTrigger(trigger)}
                  >
                    Trace
                  </button>
                </td>
              </tr>
            ))}
            {triggers.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>No triggers found</td>
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
        <button className="pagination-btn" onClick={handleNextPage} disabled={triggers.length < size || loading}>
          Next
        </button>
      </div>

      {loading && triggers.length > 0 && (
        <LoadingSpinner 
          type="overlay" 
          message="Searching triggers..." 
          description="Refreshing trigger metadata from Salesforce."
        />
      )}

      {selectedTrigger && (
        <AddTraceModal 
          entityId={selectedTrigger.sfdcId}
          entityName={`${selectedTrigger.name} on ${selectedTrigger.sobject}`}
          entityType="ApexTrigger"
          onClose={() => setSelectedTrigger(null)}
        />
      )}
    </div>
  );
};

export default ActiveTriggers;


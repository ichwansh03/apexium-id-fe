import React, { useState } from 'react';
import './MetadataViews.css';
import AddTraceModal from './AddTraceModal';
import MetadataDetailModal from './MetadataDetailModal';
import LoadingSpinner from './LoadingSpinner';
import { useActiveTriggers } from '../hooks/useActiveTriggers';
import type { ApexTrigger } from '../types';

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

  const [detailTrigger, setDetailTrigger] = useState<ApexTrigger | null>(null);
  const [compareMode, setCompareMode] = useState<boolean>(false);

  if (loading && triggers.length === 0) return (
    <LoadingSpinner 
      message="Searching apex triggers..." 
      description="Scanning Salesforce metadata for available Apex triggers." 
    />
  );

  const calculateCoverage = (covered?: number, uncovered?: number) => {
    if (covered === undefined || uncovered === undefined) return 'N/A';
    const total = covered + uncovered;
    if (total === 0) return '0%';
    return `${Math.round((covered / total) * 100)}%`;
  };

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
              <th className="col-meta-coverage">Coverage</th>
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
                <td className="coverage-cell">
                  <span className={`coverage-badge ${
                    Number.parseInt(calculateCoverage(trigger.numLinesCovered, trigger.numLinesUncovered)) >= 75 ? 'good' : 'poor'
                  }`}>
                    {calculateCoverage(trigger.numLinesCovered, trigger.numLinesUncovered)}
                  </span>
                </td>
                <td>{new Date(trigger.lastModifiedDate).toLocaleDateString()}</td>
                <td><span className="status-badge">{trigger.status}</span></td>
                <td className="actions-cell">
                  <button 
                    className="action-btn" 
                    onClick={() => setSelectedTrigger(trigger)}
                  >
                    Trace
                  </button>
                  <button 
                    className="action-btn view-btn" 
                    onClick={() => {
                      setDetailTrigger(trigger);
                      setCompareMode(false);
                    }}
                  >
                    Details
                  </button>
                  <button 
                    className="action-btn" 
                    onClick={() => {
                      setDetailTrigger(trigger);
                      setCompareMode(true);
                    }}
                  >
                    Compare
                  </button>
                </td>
              </tr>
            ))}
            {triggers.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>No triggers found</td>
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

      {detailTrigger && (
        <MetadataDetailModal 
          entityId={detailTrigger.sfdcId}
          entityType="ApexTrigger"
          onClose={() => setDetailTrigger(null)}
          initialShowDiff={compareMode}
        />
      )}
    </div>
  );
};

export default ActiveTriggers;


import React, { useState } from 'react';
import './MetadataViews.css';
import AddTraceModal from './AddTraceModal';
import MetadataDetailModal from './MetadataDetailModal';
import LoadingSpinner from './LoadingSpinner';
import { useActiveClasses } from '../hooks/useActiveClasses';
import type { ApexClass } from '../types';

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

  const [detailClass, setDetailClass] = useState<ApexClass | null>(null);

  if (loading && classes.length === 0) return (
    <LoadingSpinner 
      message="Searching apex classes..." 
      description="Scanning Salesforce metadata for available Apex classes." 
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
              <th className="col-meta-coverage">Coverage</th>
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
                <td className="coverage-cell">
                  <span className={`coverage-badge ${
                    parseInt(calculateCoverage(cls.numLinesCovered, cls.numLinesUncovered)) >= 75 ? 'good' : 'poor'
                  }`}>
                    {calculateCoverage(cls.numLinesCovered, cls.numLinesUncovered)}
                  </span>
                </td>
                <td>{new Date(cls.lastModifiedDate).toLocaleDateString()}</td>
                <td><span className="status-badge">{cls.status}</span></td>
                <td className="actions-cell">
                  <button 
                    className="action-btn" 
                    onClick={() => setSelectedClass(cls)}
                  >
                    Trace
                  </button>
                  <button 
                    className="action-btn view-btn" 
                    onClick={() => setDetailClass(cls)}
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
            {classes.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>No classes found</td>
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

      {detailClass && (
        <MetadataDetailModal 
          entityId={detailClass.sfdcId}
          entityType="ApexClass"
          onClose={() => setDetailClass(null)}
        />
      )}
    </div>
  );
};

export default ActiveClasses;


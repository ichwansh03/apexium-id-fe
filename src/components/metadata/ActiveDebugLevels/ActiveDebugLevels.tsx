import React from 'react';
import '../../shared/styles/MetadataViews.css';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import { useActiveDebugLevels } from '../../../hooks/useActiveDebugLevels';

const ActiveDebugLevels: React.FC = () => {
  const {
    levels,
    loading,
    searchTerm,
    page,
    size,
    handleNextPage,
    handlePrevPage,
    handleSearchChange
  } = useActiveDebugLevels();

  if (loading && levels.length === 0) return (
    <LoadingSpinner 
      message="Searching debug levels..." 
      description="Retrieving available logging configurations from Salesforce." 
    />
  );

  return (
    <div className="page-container metadata-view-container">
      <div className="metadata-header">
        <h2>Debug Levels</h2>
      </div>

      <div className="search-container">
        <input 
          type="text" 
          placeholder="Search debug levels..." 
          className="metadata-search-input"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        <table className="log-table">
          <thead>
            <tr>
              <th className="col-dl-name">Developer Name</th>
              <th className="col-dl-label">Master Label</th>
              <th className="col-dl-level">Apex Code</th>
              <th className="col-dl-level">Profiling</th>
              <th className="col-dl-level">Database</th>
              <th className="col-dl-level">System</th>
              <th className="col-dl-level">Workflow</th>
            </tr>
          </thead>
          <tbody>
            {levels.map((level) => (
              <tr key={level.sfdcId}>
                <td className="entity-name">{level.developerName}</td>
                <td>{level.masterLabel}</td>
                <td><span className="status-badge">{level.apexCode}</span></td>
                <td>{level.apexProfiling}</td>
                <td>{level.database}</td>
                <td>{level.system}</td>
                <td>{level.workflow}</td>
              </tr>
            ))}
            {levels.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>No debug levels found</td>
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
        <button className="pagination-btn" onClick={handleNextPage} disabled={levels.length < size || loading}>
          Next
        </button>
      </div>

      {loading && levels.length > 0 && (
        <LoadingSpinner 
          type="overlay" 
          message="Searching debug levels..." 
          description="Fetching available trace configurations."
        />
      )}
    </div>
  );
};

export default ActiveDebugLevels;

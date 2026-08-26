import React from 'react';
import '../../shared/styles/MetadataViews.css';
import './ActiveReports.css';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import { useReports } from '../../../hooks/useReports';

const ActiveReports: React.FC = () => {
  const {
    reports,
    loading,
    searchTerm,
    page,
    size,
    handleNextPage,
    handlePrevPage,
    handleSearchChange
  } = useReports();

  if (loading && reports.length === 0) return (
    <LoadingSpinner 
      message="Searching reports..." 
      description="Scanning Salesforce metadata for available reports." 
    />
  );

  return (
    <div className="page-container metadata-view-container">
      <div className="metadata-header">
        <h2>Reports</h2>
      </div>

      <div className="search-container">
        <input 
          type="text" 
          placeholder="Search reports by name..." 
          className="metadata-search-input"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        <table className="log-table">
          <thead>
            <tr>
              <th className="col-report-name">Name</th>
              <th className="col-report-desc">Description</th>
              <th className="col-report-folder">Folder</th>
              <th className="col-report-format">Format</th>
              <th className="col-report-type">Type</th>
              <th className="col-report-date">Last Modified</th>
              <th className="col-report-modifiedby">Modified By</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.sfdcId}>
                <td className="entity-name">{report.name}</td>
                <td className="report-description">{report.description || '—'}</td>
                <td>{report.folderName || '—'}</td>
                <td><span className="status-badge">{report.format || '—'}</span></td>
                <td>{report.reportType || '—'}</td>
                <td>{report.lastModifiedDate ? new Date(report.lastModifiedDate).toLocaleDateString() : '—'}</td>
                <td>{report.lastModifiedByName || '—'}</td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>No reports found</td>
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
        <button className="pagination-btn" onClick={handleNextPage} disabled={reports.length < size || loading}>
          Next
        </button>
      </div>

      {loading && reports.length > 0 && (
        <LoadingSpinner 
          type="overlay" 
          message="Searching reports..." 
          description="Refreshing metadata from Salesforce database."
        />
      )}
    </div>
  );
};

export default ActiveReports;

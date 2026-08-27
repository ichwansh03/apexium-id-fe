import React, { useState } from 'react';
import '../../shared/styles/MetadataViews.css';
import './ActiveReports.css';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import { useReports } from '../../../hooks/useReports';
import type { ReportSoqlDto } from '../../../types';

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

  const [soqlData, setSoqlData] = useState<ReportSoqlDto | null>(null);
  const [soqlLoading, setSoqlLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleViewSoql = async (reportId: string) => {
    setSoqlLoading(true);
    setSoqlData(null);
    try {
      const response = await fetch(`/api/sfdc/metadata/reports/${reportId}/soql`);
      if (!response.ok) throw new Error('Failed to fetch SOQL');
      const data = await response.json();
      setSoqlData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSoqlLoading(false);
    }
  };

  const handleCopy = () => {
    if (soqlData?.soql) {
      navigator.clipboard.writeText(soqlData.soql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

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
              <th className="col-report-folder">Folder</th>
              <th className="col-report-date">Last Modified</th>
              <th className="col-report-modifiedby">Modified By</th>
              <th className="col-report-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.sfdcId}>
                <td className="entity-name">{report.name}</td>
                <td>{report.folderName || '—'}</td>
                <td>{report.lastModifiedDate ? new Date(report.lastModifiedDate).toLocaleDateString() : '—'}</td>
                <td>{report.lastModifiedByName || '—'}</td>
                <td className="actions-cell">
                  <button 
                    className="action-btn view-btn"
                    onClick={() => handleViewSoql(report.sfdcId)}
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>No reports found</td>
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

      {soqlLoading && (
        <LoadingSpinner 
          type="overlay" 
          message="Loading report metadata..." 
          description="Fetching report filters from Salesforce."
        />
      )}

      {soqlData && (
        <div className="modal-overlay" onClick={() => setSoqlData(null)}>
          <div className="modal-content soql-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{soqlData.reportName}</h3>
              <button className="modal-close" onClick={() => setSoqlData(null)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Open in Salesforce */}
              {soqlData.reportUrl && (
                <div className="soql-section">
                  <a 
                    href={soqlData.reportUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="open-report-btn"
                  >
                    Open in Salesforce ↗
                  </a>
                </div>
              )}

              {/* Report Info */}
              <div className="soql-info-grid">
                <div className="soql-info-item">
                  <span className="soql-label">Report Type</span>
                  <span className="soql-value">{soqlData.reportType?.label || soqlData.reportType?.type || '—'}</span>
                </div>
                <div className="soql-info-item">
                  <span className="soql-label">Root Object</span>
                  <span className="soql-value">{soqlData.rootObject || '—'}</span>
                </div>
              </div>

              {/* Objects Impacted */}
              {soqlData.objects.length > 0 && (
                <div className="soql-section">
                  <span className="soql-section-title">Objects Impacted</span>
                  <div className="objects-tags">
                    {soqlData.objects.map((obj) => (
                      <span key={obj} className="object-tag">{obj}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* SOQL Generated */}
              <div className="soql-section">
                <div className="soql-code-header">
                  <span className="soql-section-title">Generated SOQL</span>
                  <button className="copy-btn" onClick={handleCopy}>
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="soql-code">{soqlData.soql}</pre>
              </div>

              {/* REST API Query */}
              {soqlData.instanceUrl && (
                <div className="soql-section">
                  <div className="soql-code-header">
                    <span className="soql-section-title">REST API Query</span>
                    <button className="copy-btn" onClick={() => handleCopyUrl(`${soqlData.instanceUrl}/services/data/v61.0/query?q=${encodeURIComponent(soqlData.soql).replace(/%20/g, '+')}`)}>
                      Copy URL
                    </button>
                  </div>
                  <pre className="soql-code rest-api-code">{soqlData.instanceUrl}/services/data/v61.0/query?q={encodeURIComponent(soqlData.soql).replace(/%20/g, '+')}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveReports;

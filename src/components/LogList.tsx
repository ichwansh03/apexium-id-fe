import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import { useLogList } from '../hooks/useLogList';

const LogList: React.FC = () => {
  const {
    logs,
    loading,
    error,
    page,
    size,
    selectedLogBody,
    setSelectedLogBody,
    fetchingBody,
    searchClass,
    searchUser,
    errorIds,
    filterMode,
    setFilterMode,
    selectedIds,
    deleting,
    handleViewDetail,
    handleDownload,
    handleDeleteSelected,
    handleDeleteAll,
    toggleSelect,
    toggleSelectAll,
    handleNextPage,
    handlePrevPage,
    handleSearchClassChange,
    handleSearchUserChange
  } = useLogList();

  if (loading && logs.length === 0) return (
    <LoadingSpinner 
      message="Fetching logs..." 
      description="Connecting to Salesforce to retrieve recent Apex logs. This may take a few seconds." 
    />
  );
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="log-list-container">
      <h2>Apex Logs (Database)</h2>
      
      <div className="search-bar">
        <input 
          type="text" 
          placeholder="Search by Class/Trigger..." 
          value={searchClass}
          onChange={(e) => handleSearchClassChange(e.target.value)}
          className="search-input"
        />
        <input 
          type="text" 
          placeholder="Search by User..." 
          value={searchUser}
          onChange={(e) => handleSearchUserChange(e.target.value)}
          className="search-input"
        />
        <select 
          className="search-input"
          value={filterMode}
          onChange={(e) => setFilterMode(e.target.value as 'all' | 'errors')}
          style={{ width: '180px' }}
        >
          <option value="all">All Logs</option>
          <option value="errors">Unsuccessful Logs</option>
        </select>
      </div>

      <div className="bulk-actions">
        <button 
          className="delete-btn-bulk" 
          onClick={handleDeleteSelected}
          disabled={selectedIds.size === 0 || deleting}
        >
          Delete Selected ({selectedIds.size})
        </button>
        <button 
          className="delete-btn-bulk delete-btn-all" 
          onClick={handleDeleteAll}
          disabled={deleting}
        >
          Delete All from SFDC
        </button>
      </div>

      <div className="table-wrapper">
        <table className="log-table">
          <thead>
            <tr>
              <th className="col-select">
                <input 
                  type="checkbox" 
                  className="select-checkbox"
                  checked={logs.length > 0 && selectedIds.size === logs.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="col-time">Time</th>
              <th className="col-class">Class/Trigger</th>
              <th className="col-op">Operation</th>
              <th className="col-user">User</th>
              <th className="col-status">Status</th>
              <th className="col-size">Size</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const isError = errorIds.has(log.sfdcId);
              const isSelected = selectedIds.has(log.sfdcId);
              return (
                <tr key={log.sfdcId} className={`${isError ? 'log-row-error' : ''} ${isSelected ? 'log-row-selected' : ''}`}>
                  <td className="col-select">
                    <input 
                      type="checkbox" 
                      className="select-checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(log.sfdcId)}
                    />
                  </td>
                  <td>{log.requestTime ? new Date(log.requestTime).toLocaleString() : 'N/A'}</td>
                  <td>{log.apexClassName || 'N/A'}</td>
                  <td>{log.operation}</td>
                  <td>{log.authorName || 'N/A'}</td>
                  <td>
                    <span className={isError ? 'status-text-error' : ''}>
                      {log.status}
                    </span>
                  </td>
                  <td>{log.logSize ? `${(log.logSize / 1024).toFixed(2)} KB` : '0 KB'}</td>
                  <td className="actions-cell">
                    <button className="action-btn view-btn" onClick={() => handleViewDetail(log.sfdcId)}>View</button>
                    <button className="action-btn download-btn" onClick={() => handleDownload(log.sfdcId, log.operation)}>Download</button>
                  </td>
                </tr>
              );
            })}
            {logs.length === 0 && (
              <tr>
                <td colSpan={8}>No logs found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {selectedLogBody !== null && (
        <div className="modal-overlay" onClick={() => setSelectedLogBody(null)} onKeyDown={(e) => { if (e.key === 'Escape') setSelectedLogBody(null); }} role="dialog" aria-modal="true" aria-labelledby="log-detail-title" tabIndex={-1}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} role="document">
            <div className="modal-header">
              <h3 id="log-detail-title">Log Detail</h3>
              <button className="close-btn" onClick={() => setSelectedLogBody(null)}>×</button>
            </div>
            <pre className="log-body-pre">{selectedLogBody || 'No content'}</pre>
          </div>
        </div>
      )}

      {loading && logs.length > 0 && (
        <LoadingSpinner 
          type="overlay" 
          message="Updating logs..." 
          description="Fetching latest data from background processes."
        />
      )}
      {deleting && (
        <LoadingSpinner 
          type="overlay" 
          message="Deleting logs..." 
          description="Removing debug logs from Salesforce Tooling API."
        />
      )}
      {fetchingBody && (
        <LoadingSpinner 
          type="overlay" 
          message="Fetching log body..." 
          description="Retrieving full trace detail from Salesforce."
        />
      )}

      <div className="pagination">
        <button className="pagination-btn" onClick={handlePrevPage} disabled={page === 0 || loading}>
          Previous
        </button>
        <span className="page-info">Page {page + 1}</span>
        <button className="pagination-btn" onClick={handleNextPage} disabled={logs.length < size || loading}>
          Next
        </button>
      </div>
    </div>
  );
};

export default LogList;


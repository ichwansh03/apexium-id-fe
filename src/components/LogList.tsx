import React, { useEffect, useState, useCallback } from 'react';
import type { Log } from '../types';
import LoadingSpinner from './LoadingSpinner';

const LogList: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [size] = useState<number>(10);
  const [selectedLogBody, setSelectedLogBody] = useState<string | null>(null);
  const [fetchingBody, setFetchingBody] = useState<boolean>(false);
  const [searchClass, setSearchClass] = useState<string>('');
  const [searchUser, setSearchUser] = useState<string>('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      // Using the /db endpoint for searching historical logs
      let url = `/api/sfdc/logs/db?page=${page}&size=${size}`;
      if (searchClass) url += `&className=${encodeURIComponent(searchClass)}`;
      if (searchUser) url += `&author=${encodeURIComponent(searchUser)}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }
      const data = await response.json();
      setLogs(data as Log[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [page, size, searchClass, searchUser]);

  useEffect(() => {
    // Only fetch if both are empty OR at least one has 3+ chars
    const shouldFetch = (searchClass.length === 0 && searchUser.length === 0) || 
                       (searchClass.length >= 3 || searchUser.length >= 3);
    
    if (!shouldFetch) return;

    const timer = setTimeout(() => {
      void fetchLogs();
    }, 500); // Increased debounce time for better UX
    return () => clearTimeout(timer);
  }, [fetchLogs, searchClass.length, searchUser.length]);

  const handleViewDetail = async (id: string) => {
    setFetchingBody(true);
    try {
      const response = await fetch(`/api/sfdc/logs/${id}/body`);
      const body = await response.text();
      setSelectedLogBody(body);
    } catch (err) {
      console.error('Failed to fetch log body:', err);
      alert('Failed to fetch log body');
    } finally {
      setFetchingBody(false);
    }
  };

  const handleDownload = (id: string, operation: string | undefined) => {
    // Direct link to the backend download endpoint
    const url = `/api/sfdc/logs/${id}/download?operation=${encodeURIComponent(operation || '')}`;
    window.location.href = url;
  };

  const handleNextPage = () => setPage((prev) => prev + 1);
  const handlePrevPage = () => setPage((prev) => Math.max(0, prev - 1));

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
          onChange={(e) => {
            setSearchClass(e.target.value);
            setPage(0);
          }}
          className="search-input"
        />
        <input 
          type="text" 
          placeholder="Search by User..." 
          value={searchUser}
          onChange={(e) => {
            setSearchUser(e.target.value);
            setPage(0);
          }}
          className="search-input"
        />
      </div>

      <div className="table-wrapper">
        <table className="log-table">
          <thead>
            <tr>
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
            {logs.map((log) => (
              <tr key={log.sfdcId}>
                <td>{log.requestTime ? new Date(log.requestTime).toLocaleString() : 'N/A'}</td>
                <td>{log.apexClassName || 'N/A'}</td>
                <td>{log.operation}</td>
                <td>{log.authorName || 'N/A'}</td>
                <td>{log.status}</td>
                <td>{log.logSize ? `${(log.logSize / 1024).toFixed(2)} KB` : '0 KB'}</td>
                <td className="actions-cell">
                  <button className="action-btn view-btn" onClick={() => handleViewDetail(log.sfdcId)}>View</button>
                  <button className="action-btn download-btn" onClick={() => handleDownload(log.sfdcId, log.operation)}>Download</button>
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={7}>No logs found</td>
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

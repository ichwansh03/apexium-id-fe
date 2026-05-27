import React, { useState, useEffect, useCallback } from 'react';
import './MetadataViews.css';
import LoadingSpinner from './LoadingSpinner';
import type { DebugLevel } from '../types';

const ActiveDebugLevels: React.FC = () => {
  const [levels, setLevels] = useState<DebugLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState<number>(0);
  const [size] = useState<number>(10);

  const fetchLevels = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/sfdc/metadata/debug-levels/db?page=${page}&size=${size}`;
      if (searchTerm) {
        url += `&name=${encodeURIComponent(searchTerm)}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch debug levels');
      const data = await response.json();
      setLevels(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, size, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLevels();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchLevels]);

  const handleNextPage = () => setPage((prev) => prev + 1);
  const handlePrevPage = () => setPage((prev) => Math.max(0, prev - 1));

  if (loading && levels.length === 0) return <LoadingSpinner message="Searching debug levels..." />;

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
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
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
    </div>
  );
};

export default ActiveDebugLevels;

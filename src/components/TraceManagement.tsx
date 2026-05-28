import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './TraceFlagManager.css'; // Reusing styles for consistency
import LoadingSpinner from './LoadingSpinner';
import type { TraceFlagDto } from '../types';

interface TraceJob {
  id: number;
  tracedEntityId: string;
  tracedEntityName: string | null;
  tracedEntityType: string;
  debugLevelName: string;
  startTime: string;
  endTime: string;
  status: string;
  sfdcTraceFlagId: string | null;
}

const TraceManagement: React.FC = () => {
  const [traces, setTraces] = useState<TraceFlagDto[]>([]);
  const [jobs, setJobs] = useState<TraceJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tracesRes, jobsRes] = await Promise.all([
        fetch('/api/sfdc/logs/trace-flags'),
        fetch('/api/sfdc/logs/trace-jobs')
      ]);

      if (!tracesRes.ok || !jobsRes.ok) throw new Error('Failed to fetch trace data');

      const [tracesData, jobsData] = await Promise.all([
        tracesRes.json(),
        jobsRes.json()
      ]);

      setTraces(tracesData);
      setJobs(jobsData);
    } catch (err) {
      setError('Failed to fetch trace management data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteTrace = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this active trace flag?')) return;
    
    // Immediate local removal for responsiveness
    setTraces(prev => prev.filter(t => t.Id !== id));
    
    try {
      const response = await fetch(`/api/sfdc/logs/trace-flags/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete');
      }
    } catch (err) {
      alert('Failed to delete trace flag');
      fetchData(); // Rollback/Refresh on error
    }
  };

  const handleDeleteJob = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this trace job?')) return;
    
    // Immediate local removal
    setJobs(prev => prev.filter(j => j.id !== id));
    
    try {
      const response = await fetch(`/api/sfdc/logs/trace-jobs/${id}`, { method: 'DELETE' });
      if (response.ok) {
        // Refresh SFDC traces as deleting a job might have cleaned up the underlying trace flag
        const tracesRes = await fetch('/api/sfdc/logs/trace-flags');
        if (tracesRes.ok) {
          setTraces(await tracesRes.json());
        }
      } else {
        throw new Error('Failed to delete job');
      }
    } catch (err) {
      alert('Failed to delete trace job');
      fetchData(); // Rollback/Refresh on error
    }
  };

  const combinedData = useMemo(() => {
    const sfdcIdsFromJobs = new Set(jobs.filter(j => j.status === 'ACTIVE').map(j => j.sfdcTraceFlagId).filter(Boolean));
    
    const formattedTraces = traces
      .filter(t => !sfdcIdsFromJobs.has(t.Id))
      .map(t => ({
        id: t.Id,
        sourceId: t.Id,
        name: t.TracedEntity?.Name || t.TracedEntityId || 'Unknown',
        type: t.TracedEntity?.attributes?.type || 'Unknown',
        level: t.DebugLevel?.DeveloperName || 'Unknown',
        startTime: t.StartDate || '',
        endTime: t.ExpirationDate || '',
        source: 'SFDC' as const,
        isRecurring: false
      }));

    const formattedJobs = jobs
      .filter(j => j.status === 'ACTIVE')
      .map(j => ({
        id: `job-${j.id}`,
        sourceId: j.id.toString(),
        name: j.tracedEntityName || j.tracedEntityId,
        type: j.tracedEntityType,
        level: j.debugLevelName,
        startTime: j.startTime,
        endTime: j.endTime,
        source: 'APP' as const,
        isRecurring: true
      }));

    return [...formattedTraces, ...formattedJobs].sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }, [traces, jobs]);

  if (loading && traces.length === 0 && jobs.length === 0) {
    return <LoadingSpinner message="Loading Trace Dashboard..." />;
  }

  return (
    <div className="page-container trace-manager-container">
      <div className="manager-header">
        <h2>Trace Management</h2>
        <button className="refresh-btn" onClick={fetchData}>Refresh All</button>
      </div>

      {error && <div className="error">{error}</div>}

      <section className="trace-section">
        <p style={{ marginBottom: '1.5rem', color: 'var(--text)' }}>
          Unified view of all active Salesforce tracing activities.
        </p>
        <div className="table-wrapper">
          <table className="log-table">
            <thead>
              <tr>
                <th className="col-trace-entity">Target Name</th>
                <th className="col-trace-type">Type</th>
                <th className="col-trace-level">Debug Level</th>
                <th className="col-trace-mode">Mode</th>
                <th className="col-trace-time">Starts</th>
                <th className="col-trace-time">Ends</th>
                <th className="col-trace-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {combinedData.map((item) => (
                <tr key={item.id}>
                  <td className="font-bold">{item.name}</td>
                  <td><span className="type-badge">{item.type}</span></td>
                  <td>{item.level}</td>
                  <td>
                    <span className={`status-badge ${item.isRecurring ? 'recurring' : 'standard'}`}>
                      {item.isRecurring ? 'Recurring' : 'Standard'}
                    </span>
                  </td>
                  <td>{item.startTime ? new Date(item.startTime).toLocaleString() : 'N/A'}</td>
                  <td>{item.endTime ? new Date(item.endTime).toLocaleString() : 'N/A'}</td>
                  <td>
                    <button 
                      className="action-btn delete-btn" 
                      onClick={() => item.source === 'SFDC' ? handleDeleteTrace(item.sourceId) : handleDeleteJob(parseInt(item.sourceId))}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {combinedData.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>No active traces found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default TraceManagement;

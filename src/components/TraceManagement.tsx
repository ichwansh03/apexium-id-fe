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
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const sfdcIdsFromJobs = new Set(jobs.filter(j => j.status === 'ACTIVE').map(j => j.sfdcTraceFlagId).filter(Boolean));
    
    const formattedTraces = traces
      .filter(t => !sfdcIdsFromJobs.has(t.Id))
      .map(t => {
        const start = t.StartDate ? new Date(t.StartDate).getTime() : 0;
        const end = t.ExpirationDate ? new Date(t.ExpirationDate).getTime() : 0;
        const durationHours = start && end ? (end - start) / (1000 * 60 * 60) : 0;
        
        return {
          id: t.Id,
          sourceId: t.Id,
          name: t.TracedEntity?.Name || t.TracedEntityId || 'Unknown',
          type: t.TracedEntity?.attributes?.type || 'Unknown',
          level: t.DebugLevel?.DeveloperName || 'Unknown',
          startTime: t.StartDate || '',
          endTime: t.ExpirationDate || '',
          source: 'SFDC' as const,
          isRecurring: durationHours > 24,
          status: 'ACTIVE'
        };
      });

    const formattedJobs = jobs
      .filter(j => {
        if (j.status === 'ACTIVE') return true;
        const startTime = new Date(j.startTime);
        return startTime >= oneWeekAgo;
      })
      .map(j => {
        const start = new Date(j.startTime).getTime();
        const end = new Date(j.endTime).getTime();
        const durationHours = (end - start) / (1000 * 60 * 60);

        return {
          id: `job-${j.id}`,
          sourceId: j.id.toString(),
          name: j.tracedEntityName || j.tracedEntityId,
          type: j.tracedEntityType,
          level: j.debugLevelName,
          startTime: j.startTime,
          endTime: j.endTime,
          source: 'APP' as const,
          isRecurring: durationHours > 24,
          status: j.status
        };
      });

    return [...formattedTraces, ...formattedJobs].sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }, [traces, jobs]);

  if (loading && traces.length === 0 && jobs.length === 0) {
    return (
      <LoadingSpinner 
        message="Loading Trace Dashboard..." 
        description="Consolidating active trace flags and background monitoring jobs." 
      />
    );
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
                <th className="col-trace-status">Status</th>
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
                  <td>
                    <span className={`status-badge ${item.status.toLowerCase()}`}>
                      {item.status}
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

      {loading && (traces.length > 0 || jobs.length > 0) && (
        <LoadingSpinner 
          type="overlay" 
          message="Updating trace dashboard..." 
          description="Syncing active trace flags and background jobs."
        />
      )}
    </div>
  );
};

export default TraceManagement;

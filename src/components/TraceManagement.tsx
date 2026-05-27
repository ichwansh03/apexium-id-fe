import React, { useState, useEffect, useCallback } from 'react';
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
    try {
      const response = await fetch(`/api/sfdc/logs/trace-flags/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setTraces(prev => prev.filter(t => t.Id !== id));
      } else {
        throw new Error('Failed to delete');
      }
    } catch (err) {
      alert('Failed to delete trace flag');
    }
  };

  const handleCancelJob = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled trace job?')) return;
    try {
      const response = await fetch(`/api/sfdc/logs/trace-jobs/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'CANCELLED' } : j));
      } else {
        throw new Error('Failed to cancel');
      }
    } catch (err) {
      alert('Failed to cancel trace job');
    }
  };

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
        <h3>Active Trace Flags (Salesforce)</h3>
        <p style={{ marginBottom: '1.5rem', color: 'var(--text)' }}>
          Standard 24-hour traces currently active in your Salesforce environment.
        </p>
        <div className="table-wrapper">
          <table className="log-table">
            <thead>
              <tr>
                <th className="col-trace-entity">Entity Name</th>
                <th className="col-trace-type">Type</th>
                <th className="col-trace-level">Debug Level</th>
                <th className="col-trace-time">Starts</th>
                <th className="col-trace-time">Expires</th>
                <th className="col-trace-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {traces.map((trace) => (
                <tr key={trace.Id}>
                  <td className="font-bold">{trace.TracedEntity?.Name || 'Unknown'}</td>
                  <td><span className="type-badge">{trace.TracedEntity?.attributes?.type || 'Unknown'}</span></td>
                  <td>{trace.DebugLevel?.DeveloperName || 'Unknown'}</td>
                  <td>{trace.StartDate ? new Date(trace.StartDate).toLocaleTimeString() : 'N/A'}</td>
                  <td>{trace.ExpirationDate ? new Date(trace.ExpirationDate).toLocaleTimeString() : 'N/A'}</td>
                  <td>
                    <button className="action-btn delete-btn" onClick={() => handleDeleteTrace(trace.Id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {traces.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>No active Salesforce trace flags.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="trace-section" style={{ marginTop: '40px' }}>
        <h3>Scheduled & Recurring Jobs</h3>
        <p style={{ marginBottom: '1.5rem', color: 'var(--text)' }}>
          Extended or recurring jobs managed by this application.
        </p>
        <div className="table-wrapper">
          <table className="log-table">
            <thead>
              <tr>
                <th className="col-trace-entity">Target ID / Name</th>
                <th className="col-trace-type">Type</th>
                <th className="col-trace-level">Level</th>
                <th className="col-trace-type">Status</th>
                <th className="col-trace-time">Ends</th>
                <th className="col-trace-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.sort((a, b) => b.id - a.id).map((job) => (
                <tr key={job.id}>
                  <td className="font-bold">{job.tracedEntityName || job.tracedEntityId}</td>
                  <td><span className="type-badge">{job.tracedEntityType}</span></td>
                  <td>{job.debugLevelName}</td>
                  <td>
                    <span className={`status-badge ${job.status.toLowerCase()}`}>
                      {job.status}
                    </span>
                  </td>
                  <td>{new Date(job.endTime).toLocaleString()}</td>
                  <td>
                    {job.status === 'ACTIVE' && (
                      <button className="action-btn delete-btn" onClick={() => handleCancelJob(job.id)}>Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>No scheduled trace jobs found.</td>
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

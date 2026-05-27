import React, { useState, useEffect } from 'react';
import './TraceFlagManager.css'; // Reusing styles
import LoadingSpinner from './LoadingSpinner';

interface TraceJob {
  id: number;
  tracedEntityId: String;
  tracedEntityName: string | null;
  tracedEntityType: string;
  debugLevelName: string;
  startTime: string;
  endTime: string;
  status: string;
  sfdcTraceFlagId: string | null;
}

const TraceJobManager: React.FC = () => {
  const [jobs, setJobs] = useState<TraceJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sfdc/logs/trace-jobs');
      if (!response.ok) throw new Error('Failed to fetch trace jobs');
      const data = await response.json();
      setJobs(data);
    } catch (err) {
      setError('Failed to fetch trace jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCancel = async (id: number) => {
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

  if (loading) return <LoadingSpinner message="Fetching trace jobs..." />;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="page-container trace-manager-container">
      <div className="manager-header">
        <h2>Scheduled Trace Jobs</h2>
        <button className="refresh-btn" onClick={fetchJobs}>Refresh</button>
      </div>

      <div className="table-wrapper">
        <table className="log-table">
          <thead>
            <tr>
              <th className="col-trace-entity">Target ID</th>
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
                <td className="font-bold">{job.tracedEntityId}</td>
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
                    <button 
                      className="action-btn delete-btn" 
                      onClick={() => handleCancel(job.id)}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                  No trace jobs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TraceJobManager;

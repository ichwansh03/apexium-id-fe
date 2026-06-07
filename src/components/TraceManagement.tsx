import React from 'react';
import './TraceFlagManager.css';
import LoadingSpinner from './LoadingSpinner';
import AddTraceModal from './AddTraceModal';
import { useTraceManagement } from '../hooks/useTraceManagement';

const TraceManagement: React.FC = () => {
  const {
    traces,
    jobs,
    loading,
    error,
    fetchData,
    handleDeleteTrace,
    handleDeleteJob,
    combinedData,
    selectedTrace,
    setSelectedTrace
  } = useTraceManagement();

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
                    {item.status === 'CANCELLED' ? (
                      <button 
                        className="action-btn reactivate-btn" 
                        onClick={() => setSelectedTrace({ id: item.tracedEntityId, name: item.name, type: item.type })}
                      >
                        Reactivate
                      </button>
                    ) : (
                      <button 
                        className="action-btn delete-btn" 
                        onClick={() => item.source === 'SFDC' ? handleDeleteTrace(item.sourceId) : handleDeleteJob(parseInt(item.sourceId))}
                      >
                        Delete
                      </button>
                    )}
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

      {selectedTrace && (
        <AddTraceModal 
          entityId={selectedTrace.id}
          entityName={selectedTrace.name}
          entityType={selectedTrace.type}
          onClose={() => {
            setSelectedTrace(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

export default TraceManagement;


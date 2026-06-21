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
    handleAdoptTrace,
    combinedData,
    sfdcFlagsData,
    selectedTrace,
    setSelectedTrace,
    viewMode,
    setViewMode,
    adoptingId
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

      {/* Tab Bar */}
      <div className="trace-tabs">
        <button 
          className={`trace-tab ${viewMode === 'managed' ? 'active' : ''}`}
          onClick={() => setViewMode('managed')}
        >
          <span className="tab-icon">⚙</span>
          Managed Traces
          {combinedData.length > 0 && (
            <span className="tab-badge">{combinedData.length}</span>
          )}
        </button>
        <button 
          className={`trace-tab ${viewMode === 'salesforce' ? 'active' : ''}`}
          onClick={() => setViewMode('salesforce')}
        >
          <span className="tab-icon">☁</span>
          Salesforce Trace Flags
          {sfdcFlagsData.length > 0 && (
            <span className="tab-badge sfdc">{sfdcFlagsData.length}</span>
          )}
        </button>
      </div>

      {/* Managed Traces Tab */}
      {viewMode === 'managed' && (
        <section className="trace-section">
          <p className="trace-section-desc">
            Unified view of all active Salesforce tracing activities managed by this application.
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
                    <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>No managed traces found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Salesforce Trace Flags Tab */}
      {viewMode === 'salesforce' && (
        <section className="trace-section">
          <p className="trace-section-desc">
            All trace flags from the Salesforce org. You can <strong>adopt</strong> any flag to bring it under managed control.
          </p>
          <div className="table-wrapper">
            <table className="log-table">
              <thead>
                <tr>
                  <th className="col-trace-entity">Target Name</th>
                  <th className="col-trace-type">Entity Type</th>
                  <th className="col-trace-level">Debug Level</th>
                  <th className="col-trace-level">Log Type</th>
                  <th className="col-trace-status">Status</th>
                  <th className="col-trace-time">Starts</th>
                  <th className="col-trace-time">Expires</th>
                  <th className="col-trace-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sfdcFlagsData.map((item) => (
                  <tr key={item.id} className={item.status === 'EXPIRED' ? 'row-expired' : ''}>
                    <td className="font-bold">{item.name}</td>
                    <td><span className="type-badge">{item.type}</span></td>
                    <td>{item.level}</td>
                    <td><span className="log-type-badge">{item.logType}</span></td>
                    <td>
                      <span className={`status-badge ${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{item.startTime ? new Date(item.startTime).toLocaleString() : 'N/A'}</td>
                    <td>{item.endTime ? new Date(item.endTime).toLocaleString() : 'N/A'}</td>
                    <td>
                      {item.isManaged ? (
                        <span className="managed-label">Managed</span>
                      ) : (
                        <div className="action-group">
                          <button 
                            className="action-btn adopt-btn"
                            onClick={() => handleAdoptTrace(item.raw)}
                            disabled={adoptingId === item.id}
                          >
                            {adoptingId === item.id ? 'Adopting...' : 'Adopt'}
                          </button>
                          <button 
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteTrace(item.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {sfdcFlagsData.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>No trace flags found in Salesforce.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

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

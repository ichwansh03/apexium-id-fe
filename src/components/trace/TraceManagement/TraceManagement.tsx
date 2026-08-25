import React, { useState, useMemo } from 'react';
import './TraceFlagManager.css';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import AddTraceModal from '../AddTraceModal/AddTraceModal';
import { useTraceManagement } from '../../../hooks/useTraceManagement';

const ITEMS_PER_PAGE = 10;

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

  // Managed Traces Tab State
  const [managedSearch, setManagedSearch] = useState('');
  const [managedSort, setManagedSort] = useState<'asc' | 'desc'>('asc');
  const [managedPage, setManagedPage] = useState(1);

  // SFDC Trace Flags Tab State
  const [sfdcSearch, setSfdcSearch] = useState('');
  const [sfdcSort, setSfdcSort] = useState<'asc' | 'desc'>('asc');
  const [sfdcPage, setSfdcPage] = useState(1);

  // Processing logic
  const processData = (
    data: any[], 
    search: string, 
    sort: 'asc' | 'desc', 
    page: number
  ) => {
    const filtered = data.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return sort === 'asc' 
        ? nameA.localeCompare(nameB) 
        : nameB.localeCompare(nameA);
    });

    const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
    const paginated = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    return { paginated, totalPages };
  };

  const { paginated: managedData, totalPages: managedTotalPages } = useMemo(() => 
    processData(combinedData, managedSearch, managedSort, managedPage),
    [combinedData, managedSearch, managedSort, managedPage]
  );

  const { paginated: sfdcData, totalPages: sfdcTotalPages } = useMemo(() => 
    processData(sfdcFlagsData, sfdcSearch, sfdcSort, sfdcPage),
    [sfdcFlagsData, sfdcSearch, sfdcSort, sfdcPage]
  );

  if (loading && traces.length === 0 && jobs.length === 0) {
    return (
      <LoadingSpinner 
        message="Loading Trace Dashboard..." 
        description="Consolidating active trace flags and background monitoring jobs." 
      />
    );
  }

  const renderToolbar = (
    search: string,
    setSearch: (s: string) => void,
    sort: 'asc' | 'desc',
    setSort: (s: 'asc' | 'desc') => void
  ) => (
    <div className="table-toolbar">
      <div className="search-box-wrapper">
        <svg className="search-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        <input 
          type="text" 
          className="search-input" 
          placeholder="Search by target name..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="clear-search-btn" onClick={() => setSearch('')}>✕</button>
        )}
      </div>
      <div className="sort-wrapper">
        <label className="sort-label">Sort:</label>
        <select 
          className="sort-select" 
          value={sort} 
          onChange={(e) => setSort(e.target.value as 'asc' | 'desc')}
        >
          <option value="asc">Name (A-Z)</option>
          <option value="desc">Name (Z-A)</option>
        </select>
      </div>
    </div>
  );

  const renderPagination = (page: number, totalPages: number, setPage: (p: number) => void) => (
    totalPages > 1 && (
      <div className="pagination-container">
        <div className="pagination-info">Page {page} of {totalPages}</div>
        <div className="pagination-controls">
          <button 
            className="pagination-btn" 
            disabled={page === 1} 
            onClick={() => setPage(page - 1)}
          >Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button 
              key={p} 
              className={`pagination-btn ${p === page ? 'active' : ''}`}
              onClick={() => setPage(p)}
            >{p}</button>
          ))}
          <button 
            className="pagination-btn" 
            disabled={page === totalPages} 
            onClick={() => setPage(page + 1)}
          >Next</button>
        </div>
      </div>
    )
  );

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
          onClick={() => { setViewMode('managed'); setManagedPage(1); }}
        >
          <span className="tab-icon">⚙</span>
          Managed Traces
          {combinedData.length > 0 && (
            <span className="tab-badge">{combinedData.length}</span>
          )}
        </button>
        <button 
          className={`trace-tab ${viewMode === 'salesforce' ? 'active' : ''}`}
          onClick={() => { setViewMode('salesforce'); setSfdcPage(1); }}
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
          {renderToolbar(managedSearch, setManagedSearch, managedSort, setManagedSort)}
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
                {managedData.map((item) => (
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
                {managedData.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>No managed traces found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {renderPagination(managedPage, managedTotalPages, setManagedPage)}
        </section>
      )}

      {/* Salesforce Trace Flags Tab */}
      {viewMode === 'salesforce' && (
        <section className="trace-section">
          <p className="trace-section-desc">
            All trace flags from the Salesforce org. You can <strong>adopt</strong> any flag to bring it under managed control.
          </p>
          {renderToolbar(sfdcSearch, setSfdcSearch, sfdcSort, setSfdcSort)}
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
                {sfdcData.map((item) => (
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
                {sfdcData.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>No trace flags found in Salesforce.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {renderPagination(sfdcPage, sfdcTotalPages, setSfdcPage)}
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

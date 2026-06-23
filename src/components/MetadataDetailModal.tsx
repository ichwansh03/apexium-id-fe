import React, { useEffect, useState } from 'react';
import './MetadataDetailModal.css';
import LoadingSpinner from './LoadingSpinner';
import type { MetadataDetailDto } from '../types';
import DiffViewer from './DiffViewer';

interface MetadataDetailModalProps {
  entityId: string;
  entityType: string;
  onClose: () => void;
}

const MetadataDetailModal: React.FC<MetadataDetailModalProps> = ({ entityId, entityType, onClose }) => {
  const [detail, setDetail] = useState<MetadataDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diff, setDiff] = useState<string[] | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/sfdc/metadata/details/${entityType}/${entityId}`);
        if (!response.ok) throw new Error('Failed to fetch metadata details');
        const data = await response.json();
        setDetail(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [entityId, entityType]);

  const handleCompare = async () => {
    try {
      const response = await fetch(`/api/sfdc/metadata/compare/${entityType}/${entityId}`);
      if (!response.ok) throw new Error('Failed to fetch comparison');
      const data = await response.json();
      setDiff(data);
      setShowDiff(true);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch comparison');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content metadata-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Metadata Details</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {loading && (
            <LoadingSpinner message="Fetching details..." description="Retrieving deep metadata from Salesforce Tooling API." />
          )}
          {error && (
            <div className="error-message">{error}</div>
          )}
          {showDiff && diff ? (
            <div className="detail-container">
                <button onClick={() => setShowDiff(false)}>Back to Details</button>
                <DiffViewer oldValue="" newValue={diff.join('\n')} />
            </div>
          ) : detail && (
            <div className="detail-container">
              <button onClick={handleCompare}>Compare with previous version</button>
              <div className="detail-grid">
                <div className="detail-item">
                  <label htmlFor="detail-name">Name</label>
                  <div id="detail-name" className="detail-value highlight">{detail.name}</div>
                </div>
                <div className="detail-item">
                  <label htmlFor="detail-type">Type</label>
                  <div id="detail-type" className="detail-value">{detail.type}</div>
                </div>
                <div className="detail-item">
                  <label htmlFor="detail-apiVersion">API Version</label>
                  <div id="detail-apiVersion" className="detail-value">{detail.apiVersion}</div>
                </div>
                <div className="detail-item">
                  <label htmlFor="detail-status">Status</label>
                  <div id="detail-status" className="detail-value">
                    <span className="status-badge">{detail.status}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <label htmlFor="detail-lastModifiedBy">Last Modified By</label>
                  <div id="detail-lastModifiedBy" className="detail-value">{detail.lastModifiedByName || 'N/A'}</div>
                </div>
                <div className="detail-item">
                  <label htmlFor="detail-lastModifiedDate">Last Modified Date</label>
                  <div id="detail-lastModifiedDate" className="detail-value">
                    {detail.lastModifiedDate ? new Date(detail.lastModifiedDate).toLocaleString() : 'N/A'}
                  </div>
                </div>
                {detail.targetObject && (
                  <div className="detail-item full-width">
                    <label htmlFor="detail-targetObject">Target SObject</label>
                    <div id="detail-targetObject" className="detail-value code">{detail.targetObject}</div>
                  </div>
                )}
              </div>

              {detail.coverage && (
                <div className="detail-section coverage-section">
                  <h4>Recent Code Coverage</h4>
                  <div className="coverage-info">
                    <div className="coverage-main">
                      {(() => {
                        const totalLines = detail.coverage.numLinesCovered + detail.coverage.numLinesUncovered;
                        const coveragePercentage = totalLines > 0 ? (detail.coverage.numLinesCovered / totalLines) : 0;
                        const coverageStatus = coveragePercentage >= 0.75 ? 'good' : 'poor';
                        const coveragePercent = totalLines > 0 ? Math.round(coveragePercentage * 100) : 0;
                        return (
                          <div className={`coverage-percent ${coverageStatus}`}>
                            {coveragePercent}%
                          </div>
                        );
                      })()}
                      <div className="coverage-label">Lines Covered</div>
                    </div>
                    <div className="coverage-stats">
                      <div className="stat-item">
                        <span className="stat-label">Covered Lines:</span>
                        <span className="stat-value good">{detail.coverage.numLinesCovered}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Uncovered Lines:</span>
                        <span className="stat-value poor">{detail.coverage.numLinesUncovered}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Total Lines:</span>
                        <span className="stat-value">
                          {detail.coverage.numLinesCovered + detail.coverage.numLinesUncovered}
                        </span>
                      </div>
                      <div className="coverage-label">Lines Covered</div>
                    </div>
                    <div className="coverage-stats">
                      <div className="stat-item">
                        <span className="stat-label">Covered Lines:</span>
                        <span className="stat-value good">{detail.coverage.numLinesCovered}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Uncovered Lines:</span>
                        <span className="stat-value poor">{detail.coverage.numLinesUncovered}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Total Lines:</span>
                        <span className="stat-value">
                          {detail.coverage.numLinesCovered + detail.coverage.numLinesUncovered}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {detail.triggerEvents.length > 0 && (
                <div className="detail-section">
                  <h4>Trigger Events</h4>
                  <div className="events-list">
                    {detail.triggerEvents.map(event => (
                      <span key={event} className="event-badge">{event}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="detail-section">
                <h4>Related Test Classes (Referenced in)</h4>
                {detail.testClasses.length > 0 ? (
                  <div className="test-classes-list">
                    {detail.testClasses.map(testCls => (
                      <div key={testCls.Id} className="test-class-item">
                        <span className="test-class-name">{testCls.Name}</span>
                        <span className="test-class-status">{testCls.Status}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No related test classes found via SOSL scan.</p>
                )}
              </div>
            </div>
          ) 
          }
        </div>

        <div className="modal-footer">
          <button className="action-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default MetadataDetailModal;

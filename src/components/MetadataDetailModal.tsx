import React, { useEffect, useState } from 'react';
import './MetadataDetailModal.css';
import LoadingSpinner from './LoadingSpinner';
import type { MetadataDetailDto } from '../types';

interface MetadataDetailModalProps {
  entityId: string;
  entityType: string;
  onClose: () => void;
}

const MetadataDetailModal: React.FC<MetadataDetailModalProps> = ({ entityId, entityType, onClose }) => {
  const [detail, setDetail] = useState<MetadataDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content metadata-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Metadata Details</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {loading ? (
            <LoadingSpinner message="Fetching details..." description="Retrieving deep metadata from Salesforce Tooling API." />
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : detail ? (
            <div className="detail-container">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Name</label>
                  <div className="detail-value highlight">{detail.name}</div>
                </div>
                <div className="detail-item">
                  <label>Type</label>
                  <div className="detail-value">{detail.type}</div>
                </div>
                <div className="detail-item">
                  <label>API Version</label>
                  <div className="detail-value">{detail.apiVersion}</div>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <div className="detail-value">
                    <span className="status-badge">{detail.status}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <label>Last Modified By</label>
                  <div className="detail-value">{detail.lastModifiedByName || 'N/A'}</div>
                </div>
                <div className="detail-item">
                  <label>Last Modified Date</label>
                  <div className="detail-value">
                    {detail.lastModifiedDate ? new Date(detail.lastModifiedDate).toLocaleString() : 'N/A'}
                  </div>
                </div>
                {detail.targetObject && (
                  <div className="detail-item full-width">
                    <label>Target SObject</label>
                    <div className="detail-value code">{detail.targetObject}</div>
                  </div>
                )}
              </div>

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
          ) : null}
        </div>

        <div className="modal-footer">
          <button className="action-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default MetadataDetailModal;

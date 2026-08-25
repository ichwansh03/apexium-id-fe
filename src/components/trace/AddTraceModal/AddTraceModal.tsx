import React from 'react';
import './AddTraceModal.css';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import { useAddTraceModal } from '../../../hooks/useAddTraceModal';

interface AddTraceModalProps {
  entityId: string;
  entityName: string;
  entityType: string;
  onClose: () => void;
}

const AddTraceModal: React.FC<AddTraceModalProps> = ({ entityId, entityName, entityType, onClose }) => {
  const {
    debugLevel,
    setDebugLevel,
    availableLevels,
    loadingLevels,
    durationMode,
    setDurationMode,
    customDays,
    setCustomDays,
    customHours,
    setCustomHours,
    customMinutes,
    setCustomMinutes,
    submitting,
    message,
    handleSubmit
  } = useAddTraceModal({ entityId, entityName, entityType, onClose });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-trace-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Setup Trace: {entityName}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="setup-form modal-form">
          <p className="entity-info">Target: <strong>{entityType}</strong></p>
          
          <div className="form-row">
            <div className="form-group">
              <label>Debug Level</label>
              {loadingLevels ? (
                <LoadingSpinner type="inline" message="Loading..." />
              ) : (
                <select 
                  value={debugLevel} 
                  onChange={(e) => setDebugLevel(e.target.value)}
                  className="form-select"
                >
                  {availableLevels.map(level => (
                    <option key={level.sfdcId} value={level.developerName}>
                      {level.developerName}
                    </option>
                  ))}
                  {availableLevels.length === 0 && (
                    <>
                      <option value="SFDC_DevConsole">SFDC_DevConsole</option>
                      <option value="SFDC_LogLevel">SFDC_LogLevel</option>
                    </>
                  )}
                </select>
              )}
            </div>

            <div className="form-group">
              <label>Duration Mode</label>
              <div className="mode-toggle">
                <button 
                  type="button"
                  className={`toggle-btn ${durationMode === '24h' ? 'active' : ''}`}
                  onClick={() => setDurationMode('24h')}
                >
                  24 Hours
                </button>
                <button 
                  type="button"
                  className={`toggle-btn ${durationMode === 'custom' ? 'active' : ''}`}
                  onClick={() => setDurationMode('custom')}
                >
                  Custom
                </button>
              </div>
            </div>
          </div>

          {durationMode === 'custom' && (
            <div className="form-row custom-duration-row">
              <div className="form-group mini">
                <label>Days</label>
                <input 
                  type="number" 
                  value={customDays} 
                  onChange={(e) => setCustomDays(e.target.value)}
                  min="0"
                  className="form-input"
                />
              </div>
              <div className="form-group mini">
                <label>Hours</label>
                <input 
                  type="number" 
                  value={customHours} 
                  onChange={(e) => setCustomHours(e.target.value)}
                  min="0"
                  max="23"
                  className="form-input"
                />
              </div>
              <div className="form-group mini">
                <label htmlFor="custom-minutes">Mins</label>
                <input 
                  id="custom-minutes"
                  type="number" 
                  value={customMinutes} 
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  min="0"
                  max="59"
                  className="form-input"
                />
              </div>
            </div>
          )}

          {message && (
            <div className={`form-message ${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="action-btn cancel-btn" onClick={onClose}>Cancel</button>
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Trace Flag'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTraceModal;

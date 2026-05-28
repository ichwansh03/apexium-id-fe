import React, { useState, useEffect } from 'react';
import './AddTraceModal.css';
import LoadingSpinner from './LoadingSpinner';
import type { DebugLevel as DebugLevelType } from '../types';

interface AddTraceModalProps {
  entityId: string;
  entityName: string;
  entityType: string;
  onClose: () => void;
}

const AddTraceModal: React.FC<AddTraceModalProps> = ({ entityId, entityName, entityType, onClose }) => {
  const [debugLevel, setDebugLevel] = useState('SFDC_DevConsole');
  const [availableLevels, setAvailableLevels] = useState<DebugLevelType[]>([]);
  const [loadingLevels, setLoadingLevels] = useState(true);
  const [durationMode, setDurationMode] = useState<'24h' | 'custom'>('24h');
  const [customDays, setCustomDays] = useState('0');
  const [customHours, setCustomHours] = useState('1');
  const [customMinutes, setCustomMinutes] = useState('0');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchDebugLevels = async () => {
      try {
        const response = await fetch('/api/sfdc/metadata/debug-levels/db');
        if (response.ok) {
          const data = await response.json();
          setAvailableLevels(data);
          // If our default is not in the list, pick the first one
          if (data.length > 0 && !data.find((l: any) => l.developerName === 'SFDC_DevConsole')) {
            setDebugLevel(data[0].developerName);
          }
        }
      } catch (err) {
        console.error('Failed to fetch debug levels:', err);
      } finally {
        setLoadingLevels(false);
      }
    };
    fetchDebugLevels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    let totalMinutes = 1440; // Default 24h
    if (durationMode === 'custom') {
      totalMinutes = (parseInt(customDays) * 1440) + (parseInt(customHours) * 60) + parseInt(customMinutes);
    }

    if (totalMinutes <= 0) {
      setMessage({ text: 'Duration must be greater than 0 minutes', type: 'error' });
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/sfdc/logs/trace-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracedEntityId: entityId,
          tracedEntityName: entityName,
          debugLevelName: debugLevel,
          durationMinutes: totalMinutes,
          entityType: entityType,
        }),
      });

      if (response.ok) {
        setMessage({ text: `Successfully scheduled trace for ${entityName}`, type: 'success' });
        setTimeout(() => onClose(), 1500);
      } else {
        throw new Error('Failed to schedule trace');
      }
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : 'Failed to schedule trace', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

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
                <label>Mins</label>
                <input 
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

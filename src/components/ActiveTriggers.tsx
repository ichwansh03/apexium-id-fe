import React, { useState, useEffect } from 'react';
import './MetadataViews.css';
import AddTraceModal from './AddTraceModal';
import type { ApexTrigger } from '../types';

const ActiveTriggers: React.FC = () => {
  const [triggers, setTriggers] = useState<ApexTrigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrigger, setSelectedTrigger] = useState<ApexTrigger | null>(null);

  const fetchTriggers = async () => {
    setLoading(true);
    try {
      const url = searchTerm 
        ? `/api/sfdc/metadata/triggers/db?name=${encodeURIComponent(searchTerm)}` 
        : '/api/sfdc/metadata/triggers/db';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch triggers');
      const data = await response.json();
      setTriggers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTriggers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (loading && triggers.length === 0) return <div className="loading">Loading apex triggers...</div>;

  return (
    <div className="page-container metadata-view-container">
      <div className="metadata-header">
        <h2>Active Apex Triggers</h2>
      </div>

      <div className="search-container">
        <input 
          type="text" 
          placeholder="Search triggers by name or object..." 
          className="metadata-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        <table className="log-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>SObject</th>
              <th>Last Modified</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {triggers.map((trigger) => (
              <tr key={trigger.sfdcId}>
                <td className="entity-name">{trigger.name}</td>
                <td className="api-name">{trigger.sobject}</td>
                <td>{new Date(trigger.lastModifiedDate).toLocaleDateString()}</td>
                <td><span className="status-badge">{trigger.status}</span></td>
                <td>
                  <button 
                    className="action-btn" 
                    onClick={() => setSelectedTrigger(trigger)}
                  >
                    Trace
                  </button>
                </td>
              </tr>
            ))}
            {triggers.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>No triggers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedTrigger && (
        <AddTraceModal 
          entityId={selectedTrigger.sfdcId}
          entityName={`${selectedTrigger.name} on ${selectedTrigger.sobject}`}
          entityType="ApexTrigger"
          onClose={() => setSelectedTrigger(null)}
        />
      )}
    </div>
  );
};

export default ActiveTriggers;

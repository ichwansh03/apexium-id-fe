import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  message?: string;
  description?: string;
  type?: 'full' | 'overlay' | 'inline';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  description,
  type = 'full' 
}) => {
  if (type === 'overlay') {
    return (
      <div className="overlay-spinner">
        <div className="spinner spinner-small"></div>
        <div className="loading-content">
          <span className="loading-text">{message}</span>
          {description && <span className="loading-description">{description}</span>}
        </div>
      </div>
    );
  }

  if (type === 'inline') {
    return (
      <div className="spinner-container" style={{ padding: '1rem' }}>
        <div className="spinner spinner-small"></div>
        <div className="loading-content">
          <span className="loading-text" style={{ fontSize: '0.9rem' }}>{message}</span>
          {description && <span className="loading-description">{description}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <span className="loading-text">{message}</span>
      {description && <span className="loading-description">{description}</span>}
    </div>
  );
};

export default LoadingSpinner;

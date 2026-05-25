import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  message?: string;
  type?: 'full' | 'overlay' | 'inline';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  type = 'full' 
}) => {
  if (type === 'overlay') {
    return (
      <div className="overlay-spinner">
        <div className="spinner spinner-small"></div>
        <span className="loading-text">{message}</span>
      </div>
    );
  }

  if (type === 'inline') {
    return (
      <div className="spinner-container" style={{ padding: '1rem' }}>
        <div className="spinner spinner-small"></div>
        <span className="loading-text" style={{ fontSize: '0.9rem' }}>{message}</span>
      </div>
    );
  }

  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <span className="loading-text">{message}</span>
    </div>
  );
};

export default LoadingSpinner;

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import logsIcon from '../assets/clue.png'; 
import traceIcon from '../assets/track.png';
import usersIcon from '../assets/user.png';
import metadataIcon from '../assets/programming.png';
import debugLevelsIcon from '../assets/cogwheel.png';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [metadataExpanded, setMetadataExpanded] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
      <div className="sidebar-header">
        <button className="toggle-btn" onClick={toggleSidebar}>
          {isOpen ? '◀' : '▶'}
        </button>
        {isOpen && <span className="sidebar-logo">Salesforce Obs</span>}
      </div>

      <nav className="sidebar-links">
        <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Logs">
          <span className="icon">
            <img src={logsIcon} alt="Logs" className="sidebar-custom-icon" />
          </span>
          {isOpen && <span className="label">Logs</span>}
        </NavLink>

        <NavLink to="/traces" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Trace Management">
          <span className="icon">
            <img src={traceIcon} alt="Trace Management" className="sidebar-custom-icon" />
          </span>
          {isOpen && <span className="label">Trace Management</span>}
        </NavLink>

        <NavLink to="/active-users" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Users">
          <span className="icon">
            <img src={usersIcon} alt="Users" className="sidebar-custom-icon" />
          </span>
          {isOpen && <span className="label">Users</span>}
        </NavLink>

        <div className={`submenu-container ${metadataExpanded ? 'expanded' : ''}`}>
          <div 
            className="sidebar-link submenu-trigger" 
            onClick={() => isOpen && setMetadataExpanded(!metadataExpanded)}
            title="Metadata"
          >
            <span className="icon">
              <img src={metadataIcon} alt="Metadata" className="sidebar-custom-icon" />
            </span>
            {isOpen && (
              <>
                <span className="label">Metadata</span>
                <span className="arrow">{metadataExpanded ? '▼' : '▶'}</span>
              </>
            )}
          </div>
          
          {(metadataExpanded && isOpen) && (
            <div className="submenu">
              <NavLink to="/active-classes" className={({ isActive }) => `submenu-link ${isActive ? 'active' : ''}`}>
                <span className="dot">•</span> Apex Classes
              </NavLink>
              <NavLink to="/active-triggers" className={({ isActive }) => `submenu-link ${isActive ? 'active' : ''}`}>
                <span className="dot">•</span> Triggers
              </NavLink>
            </div>
          )}
        </div>

        <NavLink to="/debug-levels" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Debug Levels">
          <span className="icon">
            <img src={debugLevelsIcon} alt="Debug Levels" className="sidebar-custom-icon" />
          </span>
          {isOpen && <span className="label">Debug Levels</span>}
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;

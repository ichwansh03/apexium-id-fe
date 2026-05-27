import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <NavLink to="/" className="navbar-logo">
          Salesforce Observability
        </NavLink>
      </div>
      <div className="navbar-links">
        <NavLink 
          to="/" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          Logs
        </NavLink>
        <NavLink 
          to="/active-traces" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          Active Traces
        </NavLink>
        <NavLink 
          to="/trace-jobs" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          Trace Jobs
        </NavLink>
        <NavLink 
          to="/active-users" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          Users
        </NavLink>
        <NavLink 
          to="/active-classes" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          Apex Classes
        </NavLink>
        <NavLink 
          to="/active-triggers" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          Triggers
        </NavLink>
        <NavLink 
          to="/debug-levels" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          Debug Levels
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;

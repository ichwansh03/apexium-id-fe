import { Routes, Route } from 'react-router-dom'
import './App.css'
import Sidebar from './components/Sidebar'
import LogList from './components/LogList'
import TraceManagement from './components/TraceManagement'
import ActiveUsers from './components/ActiveUsers'
import ActiveClasses from './components/ActiveClasses'
import ActiveTriggers from './components/ActiveTriggers'
import ActiveDebugLevels from './components/ActiveDebugLevels'
import DiffPage from './components/DiffPage'

function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-container">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<LogList />} />
            <Route path="/traces" element={<TraceManagement />} />
            <Route path="/active-users" element={<ActiveUsers />} />
            <Route path="/active-classes" element={<ActiveClasses />} />
            <Route path="/active-triggers" element={<ActiveTriggers />} />
            <Route path="/debug-levels" element={<ActiveDebugLevels />} />
            <Route path="/compare/:entityType/:entityId" element={<DiffPage />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <div className="ticks"></div>
          <p>© 2026 Ichwan Sholihin</p>
        </footer>
      </div>
    </div>
  )
}

export default App

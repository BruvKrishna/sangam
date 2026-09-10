import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import MaintenanceTasks from './pages/MaintenanceTasks';
import TaskDetail from './pages/TaskDetail';
import BlockPlanner from './pages/BlockPlanner';
import ScheduleTimeline from './pages/ScheduleTimeline';
import ConflictCenter from './pages/ConflictCenter';
import WhatIfAnalysis from './pages/WhatIfAnalysis';
import Departments from './pages/Departments';
import Assets from './pages/Assets';
import DataSources from './pages/DataSources';
import AIPriorityEngine from './pages/AIPriorityEngine';
import OptimizationEngine from './pages/OptimizationEngine';
import ReviewApproval from './pages/ReviewApproval';
import Reports from './pages/Reports';
import SystemAbout from './pages/SystemAbout';

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="tasks" element={<MaintenanceTasks />} />
        <Route path="tasks/:id" element={<TaskDetail />} />
        <Route path="planner" element={<BlockPlanner />} />
        <Route path="timeline" element={<ScheduleTimeline />} />
        <Route path="conflicts" element={<ConflictCenter />} />
        <Route path="what-if" element={<WhatIfAnalysis />} />
        <Route path="departments" element={<Departments />} />
        <Route path="assets" element={<Assets />} />
        <Route path="data-sources" element={<DataSources />} />
        <Route path="ai-priority" element={<AIPriorityEngine />} />
        <Route path="optimization" element={<OptimizationEngine />} />
        <Route path="review" element={<ReviewApproval />} />
        <Route path="reports" element={<Reports />} />
        <Route path="about" element={<SystemAbout />} />
      </Route>
    </Routes>
  );
}

export default App;

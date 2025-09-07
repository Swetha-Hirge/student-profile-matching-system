// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
import Layout from './components/Layout';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';        // Admin self-register only

import Dashboard from './pages/Dashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import CreateStudent from './pages/CreateStudent';
import StudentRecommendations from './pages/StudentRecommendations';

import StudentDashboard from './pages/StudentDashboard';
import SubmitFeedback from './pages/SubmitFeedback';

import AdminDashboard from './pages/admin/AdminDashboard';
import UserList from './pages/admin/UserList';
import TeacherManager from './pages/admin/TeacherManager';
import ActivityManager from './pages/admin/ActivityManager';
import CreateTeacher from './pages/admin/CreateTeacher'; // NEW: admin creates teacher

import { ProtectedRoute, RoleRoute } from './routes/guards';

function NotFound() {
  return (
    <div style={{ padding: 24 }}>
      <h2>404</h2>
      <p>Page not found.</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          {/* Org policy: this page creates ADMIN only (your RegisterPage enforces role: 'admin') */}
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected area */}
          <Route path="/app" element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* Common dashboard (for any authenticated role) */}
              <Route path="dashboard" element={<Dashboard />} />

              {/* Teacher-only */}
              <Route element={<RoleRoute allow="teacher" />}>
                <Route path="teacher/dashboard" element={<TeacherDashboard />} />
                <Route path="teacher/students/create" element={<CreateStudent />} />
                <Route path="teacher/students/:id/recommendations" element={<StudentRecommendations />} />
              </Route>

              {/* Student-only */}
              <Route element={<RoleRoute allow="student" />}>
                <Route path="student/dashboard" element={<StudentDashboard />} />
                <Route path="feedback/:recommendationId" element={<SubmitFeedback />} />
              </Route>

              {/* Admin-only */}
              <Route element={<RoleRoute allow="admin" />}>
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="admin/users" element={<UserList />} />
                <Route path="admin/teachers" element={<TeacherManager />} />
                <Route path="admin/teachers/create" element={<CreateTeacher />} /> {/* NEW */}
                <Route path="admin/activities" element={<ActivityManager />} />
              </Route>
            </Route>
          </Route>

          {/* Fallbacks */}
          {/* If someone hits a random /app/* path, send them to the unified dashboard */}
          <Route path="/app/*" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

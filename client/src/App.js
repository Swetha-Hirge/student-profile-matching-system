import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
import Layout from './components/Layout';

import LandingPage from './pages/LandingPage';     // ← add this import
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes grouped under /app */}
          <Route path="/app" element={<Layout />}>
            <Route path="dashboard" element={<Dashboard />} />

            {/* Teacher Routes */}
            <Route path="teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="teacher/students/create" element={<CreateStudent />} />
            <Route path="teacher/students/:id/recommendations" element={<StudentRecommendations />} />

            {/* Student Routes */}
            <Route path="student/dashboard" element={<StudentDashboard />} />
            <Route path="feedback/:recommendationId" element={<SubmitFeedback />} />

            {/* Admin Routes */}
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/users" element={<UserList />} />
            <Route path="admin/teachers" element={<TeacherManager />} />
            <Route path="admin/activities" element={<ActivityManager />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

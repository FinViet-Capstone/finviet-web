import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AppLayout } from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CategoryCorrectionsPage from './pages/CategoryCorrectionsPage';
import AnnouncementsPage from './pages/AnnouncementsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="category-corrections" element={<CategoryCorrectionsPage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

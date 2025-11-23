import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import Login from '@/pages/Login';
import AdminDashboard from '@/pages/AdminDashboard';
import TeacherDashboard from '@/pages/TeacherDashboard';
import StudentDashboard from '@/pages/StudentDashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

function AppRoutes() {
  return (
    <>
      <Helmet>
        <title>UTAS - University Timetable Automation System</title>
        <meta name="description" content="Complete university timetable automation system with role-based access for admins, teachers, and students" />
      </Helmet>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster />
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthPage } from './pages/AuthPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { FacultyDashboard } from './pages/FacultyDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import ProfilePage from './pages/ProfilePage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';

const AppContent = () => {
  type UserType = { id?: string | number; name?: string; email?: string; role?: string; };
  const { user, loading } = useAuth() as { user: UserType, loading: boolean };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4 animate-pulse">
            <span className="text-white text-2xl">LC</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          {/* Profile */}
          <Route path="/profile" element={<ProfilePage />} />
          {/* Dashboards */}
          <Route path="/" element={
            user.role === 'admin' ? <AdminDashboard /> :
            user.role === 'faculty' ? <FacultyDashboard /> :
            user.role === 'student' ? <StudentDashboard /> : null
          } />
          <Route path="/dashboard" element={
            user.role === 'admin' ? <AdminDashboard /> :
            user.role === 'faculty' ? <FacultyDashboard /> :
            user.role === 'student' ? <StudentDashboard /> : null
          } />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          {/* Auth */}
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </div>
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster position="top-right" />
    </AuthProvider>
  );
};

export default App;

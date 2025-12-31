import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Assessments from './pages/Assessments';
import AssessmentDetail from './pages/AssessmentDetail';
import LearningPath from './pages/LearningPath';
import Profile from './pages/Profile';
import useTimeTracker from './hooks/useTimeTracker';

import './App.css';

function AppContent() {
  useTimeTracker(); // Track time spent on website

  return (
    <>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <div className="main-container">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/assessments"
                  element={
                    <PrivateRoute>
                      <Assessments />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/assessments/:id"
                  element={
                    <PrivateRoute>
                      <AssessmentDetail />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/learning-path"
                  element={
                    <PrivateRoute>
                      <LearningPath />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;


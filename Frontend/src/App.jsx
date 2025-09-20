import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreatePage from './pages/CreatePage';
import NotesPage from './pages/NotesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import Layout from './pages/Layout';
import AuthLayout from './components/AuthLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';

const App = () => {
  return (
    <div className='relative min-h-screen w-full bg-base-200'>
      <div className="absolute inset-0 -z-10 h-full w-full bg-gradient-to-b from-base-300 to-base-200" />
      <Routes>
        <Route
          path='/'
          element={<ProtectedRoute><Layout /></ProtectedRoute>}
        >
          <Route index element={<HomePage />} />
          <Route path='/create' element={<CreatePage />} />
          <Route path='/notes/:id' element={<NotesPage />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
        </Route>
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;

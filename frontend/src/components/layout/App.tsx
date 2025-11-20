import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../../contexts';
import { ROUTES } from '../../config/constants';
import { Header } from './Header';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { Login } from '../auth/Login';
import { Register } from '../auth/Register';
import { Home } from '../routes/Home';

const AppContent: React.FC = () => {
  return (
    <main>
      <Routes>
        <Route
          path={ROUTES.LOGIN}
          element={
            <>
              <Header />
              <PublicRoute>
                <Login />
              </PublicRoute>
            </>
          }
        />
        <Route
          path={ROUTES.REGISTER}
          element={
            <>
              <Header />
              <PublicRoute>
                <Register />
              </PublicRoute>
            </>
          }
        />
        <Route
          path={ROUTES.HOME}
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </main>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};


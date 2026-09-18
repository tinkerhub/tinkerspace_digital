import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Login from './Login';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from './AdminLayout';
import ScreensPage from './ScreensPage';
import ScreenDetailPage from './ScreenDetailPage';
import SettingsPage from './SettingsPage';

function ProtectedPage({ children }) {
  return (
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}

export default function AdminApp() {
  if (!supabase) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50 dark:bg-gray-950 p-8 text-center text-sm text-gray-500 dark:text-gray-400">
        Supabase isn't configured — set REACT_APP_SUPABASE_URL and
        REACT_APP_SUPABASE_ANON_KEY in .env to use the admin dashboard.
      </div>
    );
  }

  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="" element={<ProtectedPage><ScreensPage /></ProtectedPage>} />
      <Route path="screens/:id" element={<ProtectedPage><ScreenDetailPage /></ProtectedPage>} />
      <Route path="settings" element={<ProtectedPage><SettingsPage /></ProtectedPage>} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
}

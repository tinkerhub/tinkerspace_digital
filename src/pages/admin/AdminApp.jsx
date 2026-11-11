import React from 'react';
import { Switch, Route } from 'wouter-preact';
import { supabase } from '../../lib/supabaseClient';
import Login from './Login';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from './AdminLayout';
import ConfigurePage from './ConfigurePage';

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
    <Switch>
      <Route path="/admin/login" component={Login} />
      <Route path="/admin/:rest*">
        <ProtectedRoute>
          <AdminLayout>
            <ConfigurePage />
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin">
        <ProtectedRoute>
          <AdminLayout>
            <ConfigurePage />
          </AdminLayout>
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}

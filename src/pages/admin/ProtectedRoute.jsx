import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export default function ProtectedRoute({ children }) {
  const [session, setSession] = useState(undefined); // undefined = still checking

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return null; // brief check, avoid a flash of the login screen
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

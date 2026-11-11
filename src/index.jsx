import React, { Suspense, lazy } from 'react';
import { render } from 'preact';
import { Switch, Route, Redirect } from 'wouter-preact';
import App from './App';
import './styles/index.css';

// Code-split: the admin dashboard (and its shadcn/Radix UI) is a separate
// chunk, never downloaded by the kiosk view at "/".
const AdminApp = lazy(() => import('./pages/admin/AdminApp'));

const RootComponent = () => {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Dotted grid overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: -1,
          backgroundImage: `
            linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
            linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px)
          `,
          backgroundSize: '96px 96px',
          backgroundColor: 'var(--bg-color)',
          transition: 'background-color 0.5s ease, background-image 0.5s ease',
        }}
      />

      {/* Main application */}
      <App />
    </div>
  );
};

render(
  <Switch>
    <Route path="/" component={RootComponent} />
    <Route path="/admin">
      <Suspense fallback={null}>
        <AdminApp />
      </Suspense>
    </Route>
    <Route path="/admin/:rest*">
      <Suspense fallback={null}>
        <AdminApp />
      </Suspense>
    </Route>
    <Route>
      <Redirect to="/" />
    </Route>
  </Switch>,
  document.getElementById('root')
);

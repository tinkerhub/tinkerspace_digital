import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from 'preact';
import { act } from 'preact/test-utils';
import { Router, Route, Switch } from 'wouter-preact';
import { memoryLocation } from 'wouter-preact/memory-location';

describe('Root Routing & Route Matching Regression Tests', () => {
  function renderWithLocation(path) {
    const { hook } = memoryLocation({ path });
    const container = document.createElement('div');
    act(() => {
      render(
        <Router hook={hook}>
          <Switch>
            <Route path="/" component={() => <div id="page">root</div>} />
            <Route path="/admin" component={() => <div id="page">admin</div>} />
            <Route path="/admin/:rest*" component={() => <div id="page">admin-sub</div>} />
            <Route component={() => <div id="page">not-found</div>} />
          </Switch>
        </Router>,
        container
      );
    });
    return container.querySelector('#page')?.textContent;
  }

  it('matches / against root route /', () => {
    expect(renderWithLocation('/')).toBe('root');
  });

  it('matches /admin against /admin route', () => {
    expect(renderWithLocation('/admin')).toBe('admin');
  });

  it('matches /admin/ against /admin route', () => {
    expect(renderWithLocation('/admin/')).toBe('admin');
  });

  it('matches /admin/login against /admin/:rest* route', () => {
    expect(renderWithLocation('/admin/login')).toBe('admin-sub');
  });

  it('matches /admin/configure against /admin/:rest* route', () => {
    expect(renderWithLocation('/admin/configure')).toBe('admin-sub');
  });

  it('routes unknown paths to fallback', () => {
    expect(renderWithLocation('/unknown')).toBe('not-found');
  });
});

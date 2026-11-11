import React from 'react';
import { render } from 'preact';
import { act } from 'preact/test-utils';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import TinkerHubMascot from './TinkerHubMascot';

vi.mock('../../utils/api/weatherService', () => ({
  getCurrentWeather: vi.fn(() => Promise.resolve(null)),
}));

describe('TinkerHubMascot fail-safe lifecycle', () => {
  let container;
  let originalImage;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
    originalImage = global.Image;

    global.Image = class {
      set src(_value) {
        setTimeout(() => this.onerror?.(), 0);
      }
    };
  });

  afterEach(() => {
    act(() => {
      render(null, container);
    });
    document.body.removeChild(container);
    global.Image = originalImage;
    vi.useRealTimers();
  });

  it('does not resume mascot scheduling after fail-safe activation', async () => {
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout');

    await act(async () => {
      render(
        <TinkerHubMascot
          makerCount={1}
          currentView="makers"
          isVisible
        />,
        container
      );
      await Promise.resolve();
    });

    await act(async () => {
      vi.runOnlyPendingTimers();
      await Promise.resolve();
    });

    expect(container.querySelector('.tinkerhub-mascot--fallback')).not.toBeNull();

    setTimeoutSpy.mockClear();

    await act(async () => {
      render(
        <TinkerHubMascot
          makerCount={2}
          currentView="makers"
          isVisible
        />,
        container
      );
      await Promise.resolve();
    });

    expect(container.querySelector('.tinkerhub-mascot--fallback')).not.toBeNull();
    expect(setTimeoutSpy).not.toHaveBeenCalled();

    setTimeoutSpy.mockRestore();
  });
});


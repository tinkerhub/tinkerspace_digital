import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render } from 'preact/compat';
import { act } from 'preact/test-utils';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './select';
import { Dialog, DialogContent, DialogTrigger } from './dialog';

describe('UI Primitives: Select', () => {
  it('renders native select with dynamic placeholder from SelectValue', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    await act(async () => {
      render(
        <Select value="" onValueChange={() => {}}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Choose a hub" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Kochi</SelectItem>
            <SelectItem value="2">Kozhikode</SelectItem>
          </SelectContent>
        </Select>,
        container
      );
    });

    const selectEl = container.querySelector('select');
    expect(selectEl).not.toBeNull();

    const options = container.querySelectorAll('option');
    expect(options.length).toBe(3);
    expect(options[0].textContent).toBe('Choose a hub');
    expect(options[1].textContent).toBe('Kochi');
    expect(options[2].textContent).toBe('Kozhikode');

    document.body.removeChild(container);
  });
});

describe('UI Primitives: Dialog', () => {
  let showModalSpy;
  let closeSpy;

  beforeEach(() => {
    showModalSpy = vi.fn(function () {
      this.open = true;
    });
    closeSpy = vi.fn(function () {
      this.open = false;
    });
    window.HTMLDialogElement.prototype.showModal = showModalSpy;
    window.HTMLDialogElement.prototype.close = closeSpy;
  });

  afterEach(() => {
    delete window.HTMLDialogElement.prototype.showModal;
    delete window.HTMLDialogElement.prototype.close;
  });

  it('renders dialog and calls showModal when open is true, and calls close when closed', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    await act(async () => {
      render(
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent>
            <p>Dialog body</p>
          </DialogContent>
        </Dialog>,
        container
      );
    });

    const dialogEl = container.querySelector('dialog');
    expect(dialogEl).not.toBeNull();
    expect(showModalSpy).toHaveBeenCalledTimes(1);

    await act(async () => {
      render(
        <Dialog open={false} onOpenChange={() => {}}>
          <DialogContent>
            <p>Dialog body</p>
          </DialogContent>
        </Dialog>,
        container
      );
    });

    expect(closeSpy).toHaveBeenCalledTimes(1);
    expect(container.querySelector('dialog')).toBeNull();

    document.body.removeChild(container);
  });
});


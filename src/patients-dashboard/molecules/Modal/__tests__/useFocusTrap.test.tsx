import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef } from 'react';
import { useFocusTrap } from '../useFocusTrap';

// ---------------------------------------------------------------------------
// Test harness — renders a panel with focusable elements + a trigger outside
// ---------------------------------------------------------------------------

function Harness({ open }: { open: boolean }) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { panelRef } = useFocusTrap({ open, triggerRef });

  return (
    <div>
      <button ref={triggerRef} data-testid="trigger">
        Open
      </button>
      {open && (
        <div ref={panelRef} role="dialog" data-testid="panel">
          <button data-testid="first">First</button>
          <button data-testid="middle">Middle</button>
          <button data-testid="last">Last</button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useFocusTrap', () => {
  it('keeps Tab focus within the panel — does NOT escape to trigger', async () => {
    const user = userEvent.setup();
    render(<Harness open />);

    const first = screen.getByTestId('first');
    const middle = screen.getByTestId('middle');
    const last = screen.getByTestId('last');

    first.focus();
    expect(document.activeElement).toBe(first);

    // Tab through all elements
    await user.tab();
    expect(document.activeElement).toBe(middle);

    await user.tab();
    expect(document.activeElement).toBe(last);

    // Tab on last element wraps to first (NOT to trigger)
    await user.tab();
    expect(document.activeElement).toBe(first);
  });

  it('keeps Shift+Tab focus within the panel — wraps from first to last', async () => {
    const user = userEvent.setup();
    render(<Harness open />);

    const first = screen.getByTestId('first');
    const last = screen.getByTestId('last');

    first.focus();

    // Shift+Tab on first wraps to last
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(last);
  });

  it('restores focus to triggerRef when open becomes false', async () => {
    const { rerender } = render(<Harness open />);

    const trigger = screen.getByTestId('trigger');
    const first = screen.getByTestId('first');

    // Focus something inside the panel
    first.focus();
    expect(document.activeElement).toBe(first);

    // Close the modal — focus should return to trigger
    rerender(<Harness open={false} />);
    expect(document.activeElement).toBe(trigger);
  });
});

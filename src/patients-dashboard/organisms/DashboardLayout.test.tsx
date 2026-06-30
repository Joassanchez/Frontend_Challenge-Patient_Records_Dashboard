import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardLayout from './DashboardLayout';
import type { ToastMessage } from '../store/toast.store';
import { makeToast } from '@/test/helpers/toast.helper';

// ---------------------------------------------------------------------------
// Toast store mock (stateful via vi.hoisted)
// ---------------------------------------------------------------------------

const { toastState } = vi.hoisted(() => {
  const dismissToast = vi.fn<(id: string) => void>();
  const toasts: ToastMessage[] = [];
  return { toastState: { toasts, dismissToast } };
});

vi.mock('@/patients-dashboard/store/toast.store', () => ({
  useToastStore: vi.fn(
    (selector?: (state: { toasts: ToastMessage[]; dismissToast: typeof toastState.dismissToast }) => unknown) => {
      const state = { toasts: toastState.toasts, dismissToast: toastState.dismissToast };
      if (typeof selector === 'function') return selector(state);
      return state;
    },
  ),
  selectToasts: (state: { toasts: ToastMessage[] }) => state.toasts,
}));

beforeEach(() => {
  vi.clearAllMocks();
  toastState.toasts = [];
  toastState.dismissToast = vi.fn<(id: string) => void>();
});

// ============================================================================
// ToastContainer mount integration (REQ-TW-05)
// ============================================================================

describe('ToastContainer mount integration', () => {
  it('renders active toasts through the mounted ToastContainer', () => {
    toastState.toasts = [
      makeToast({ id: 't1', type: 'success', message: 'Paciente creado correctamente' }),
    ];

    render(
      <DashboardLayout>
        <p>Dashboard content</p>
      </DashboardLayout>,
    );

    // The toast message proves ToastContainer is mounted and functional
    expect(
      screen.getByText('Paciente creado correctamente'),
    ).toBeInTheDocument();
  });

  it('preserves layout landmarks when toasts are active', () => {
    toastState.toasts = [
      makeToast({ id: 't1', type: 'info', message: 'System notification' }),
    ];

    render(
      <DashboardLayout>
        <p>Dashboard content</p>
      </DashboardLayout>,
    );

    // Layout landmarks still intact — banner, main, and children
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByText('Dashboard content')).toBeInTheDocument();
  });
});

describe('DashboardLayout', () => {
  it('renders children inside the layout', () => {
    render(
      <DashboardLayout>
        <p>Page content here</p>
      </DashboardLayout>,
    );

    expect(screen.getByText('Page content here')).toBeInTheDocument();
  });

  it('renders exactly one banner landmark (Header)', () => {
    render(
      <DashboardLayout>
        <span>Content</span>
      </DashboardLayout>,
    );

    const banners = screen.getAllByRole('banner');
    expect(banners).toHaveLength(1);
  });

  it('renders exactly one main landmark', () => {
    render(
      <DashboardLayout>
        <span>Content</span>
      </DashboardLayout>,
    );

    const mains = screen.getAllByRole('main');
    expect(mains).toHaveLength(1);
  });

  it('renders the Header with "Patient Records" title', () => {
    render(
      <DashboardLayout>
        <span>Content</span>
      </DashboardLayout>,
    );

    expect(
      screen.getByRole('heading', { name: /patient records/i }),
    ).toBeInTheDocument();
  });

  it('header appears above the main content in DOM order', () => {
    render(
      <DashboardLayout>
        <span>Content</span>
      </DashboardLayout>,
    );

    const banner = screen.getByRole('banner');
    const main = screen.getByRole('main');
    // banner should come before main in the document
    expect(
      banner.compareDocumentPosition(main) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});

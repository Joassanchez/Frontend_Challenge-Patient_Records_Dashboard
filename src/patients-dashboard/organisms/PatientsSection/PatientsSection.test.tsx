import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PatientsSection from '@/patients-dashboard/organisms/PatientsSection';
import { createPatient } from '../../../../test/fixtures/patient.fixture';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock PatientCard to keep section tests focused on orchestration.
vi.mock('@/patients-dashboard/organisms/PatientCard', () => ({
  default: vi.fn(
    ({ patient }: { patient: { id: string; name: string } }) => (
      <article data-testid={patient.id} data-name={patient.name}>
        {patient.name}
      </article>
    ),
  ),
}));

// Spy on the store actions.
const mockLoadPatients = vi.fn();
const mockLoadNextPatientsPage = vi.fn();

// Store state that PatientsSection reads via selectors.
let storeState: {
  patients: Array<{ id: string; name: string; description: string; website: string; avatar: string }>;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  searchQuery: string;
  totalLoadedCount: number;
  loadPatients: (search?: string) => Promise<void>;
  loadNextPatientsPage: () => Promise<void>;
} = {
  patients: [],
  isLoading: false,
  isLoadingMore: false,
  hasMore: true,
  error: null,
  searchQuery: '',
  totalLoadedCount: 0,
  loadPatients: mockLoadPatients,
  loadNextPatientsPage: mockLoadNextPatientsPage,
};

// Mock usePatientsStore: returns store state + actions.
vi.mock('@/patients-dashboard/store/patients.store', () => ({
  usePatientsStore: vi.fn((selector?: (state: typeof storeState) => unknown) => {
    if (typeof selector === 'function') return selector(storeState);
    return { ...storeState };
  }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setStoreState(partial: Partial<typeof storeState>) {
  storeState = { ...storeState, ...partial };
}

// ---------------------------------------------------------------------------
// IntersectionObserver mock
// ---------------------------------------------------------------------------

// Captures the callback passed to `new IntersectionObserver(callback, ...)`
// so tests can simulate intersection by invoking it directly.
type IOEntry = { isIntersecting: boolean };
let capturedIOCallback: ((entries: IOEntry[]) => void) | null = null;
const OriginalIntersectionObserver = globalThis.IntersectionObserver;

class MockIntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(callback: IntersectionObserverCallback) {
    // Wrap so tests can call with a plain { isIntersecting } array.
    capturedIOCallback = (entries: IOEntry[]) =>
      callback(entries as IntersectionObserverEntry[], this as unknown as IntersectionObserver);
  }

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  capturedIOCallback = null;
  storeState = {
    patients: [],
    isLoading: false,
    isLoadingMore: false,
    hasMore: true,
    error: null,
    searchQuery: '',
    totalLoadedCount: 0,
    loadPatients: mockLoadPatients,
    loadNextPatientsPage: mockLoadNextPatientsPage,
  };

  // Install the mock before every test so the useEffect path is exercisable.
  globalThis.IntersectionObserver =
    MockIntersectionObserver as unknown as typeof IntersectionObserver;
});

afterEach(() => {
  // Restore the real (or jsdom-provided) IntersectionObserver.
  globalThis.IntersectionObserver = OriginalIntersectionObserver;
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PatientsSection', () => {
  // ---- Store connection ----

  it('calls loadPatients exactly once on mount', async () => {
    render(<PatientsSection />);
    // The initial mount triggers loadPatients() immediately (no debounce).
    expect(mockLoadPatients).toHaveBeenCalledTimes(1);
    expect(mockLoadPatients).toHaveBeenCalledWith('');
  });

  it('calls loadPatients on mount and does not call it again after the debounce window', async () => {
    vi.useFakeTimers();
    try {
      render(<PatientsSection />);
      // The initial mount triggers loadPatients() immediately (no debounce).
      expect(mockLoadPatients).toHaveBeenCalledTimes(1);
      // Advance well past the 300ms debounce window — no additional calls should happen.
      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      expect(mockLoadPatients).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  // ---- Loading state ----

  it('renders skeleton cards while isLoading is true with no patients', () => {
    setStoreState({ isLoading: true, patients: [], error: null });
    render(<PatientsSection />);
    // Skeletons are rendered via PatientCardsGrid with isLoading prop
    // They render aria-hidden divs, not role="status" spinners
    const skeletonPlaceholders = document.querySelectorAll('[aria-hidden="true"]');
    expect(skeletonPlaceholders.length).toBeGreaterThan(0);
  });

  it('renders patient cards while loading (stale-while-revalidate)', () => {
    setStoreState({
      isLoading: true,
      patients: [createPatient({ id: '1', name: 'Ana' })],
      error: null,
    });
    render(<PatientsSection />);
    // Stale data is kept visible during loading
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  // ---- Error state ----

  it('renders the error message from the store as-is when error is set with no patients', () => {
    setStoreState({ isLoading: false, patients: [], error: 'Network error' });
    render(<PatientsSection />);
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('renders patient cards when error is set with cached data (stale-while-error)', () => {
    setStoreState({
      isLoading: false,
      patients: [createPatient({ id: '1', name: 'Ana' })],
      error: 'Network error',
    });
    render(<PatientsSection />);
    // Stale data remains visible + banner shown
    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders error with alert role for accessibility', () => {
    setStoreState({ isLoading: false, patients: [], error: 'Something broke' });
    render(<PatientsSection />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Something broke');
  });

  // ---- Empty state ----

  it('renders an empty state message when patients array is empty and not loading', () => {
    setStoreState({ isLoading: false, patients: [], error: null });
    render(<PatientsSection />);
    expect(screen.getByText(/no hay pacientes/i)).toBeInTheDocument();
  });

  it('does NOT render patient cards in empty state', () => {
    setStoreState({ isLoading: false, patients: [], error: null });
    render(<PatientsSection />);
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  // ---- Success state ----

  it('renders a PatientCard for each patient in the store', () => {
    setStoreState({
      isLoading: false,
      patients: [
        createPatient({ id: '1', name: 'Ana García' }),
        createPatient({ id: '2', name: 'Juan Pérez' }),
        createPatient({ id: '3', name: 'María López' }),
      ],
      error: null,
    });
    render(<PatientsSection />);
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(3);
  });

  it('renders patient name in each card', () => {
    setStoreState({
      isLoading: false,
      patients: [createPatient({ id: 'a', name: 'Ana García' })],
      error: null,
    });
    render(<PatientsSection />);
    expect(screen.getByText('Ana García')).toBeInTheDocument();
  });

  // ---- Infinite scroll / pagination ----

  it('renders all patients from the store (no client-side slicing)', () => {
    setStoreState({
      isLoading: false,
      patients: Array.from({ length: 7 }, (_, index) =>
        createPatient({
          id: `p${index + 1}`,
          name: `Patient ${index + 1}`,
        }),
      ),
      error: null,
      hasMore: false,
    });
    render(<PatientsSection />);

    // All 7 should be rendered — no client-side batching anymore.
    expect(screen.getAllByRole('article')).toHaveLength(7);
  });

  it('does NOT render a manual "Cargar más pacientes" button (infinite scroll is automatic)', () => {
    setStoreState({
      isLoading: false,
      patients: [createPatient({ id: '1', name: 'Ana' })],
      error: null,
      hasMore: true,
    });
    render(<PatientsSection />);
    expect(
      screen.queryByRole('button', { name: /cargar m.s pacientes/i }),
    ).not.toBeInTheDocument();
  });

  it('does NOT render a manual "Cargar más pacientes" button when hasMore is false', () => {
    setStoreState({
      isLoading: false,
      patients: [createPatient({ id: '1', name: 'Ana' })],
      error: null,
      hasMore: false,
    });
    render(<PatientsSection />);
    expect(
      screen.queryByRole('button', { name: /cargar m.s pacientes/i }),
    ).not.toBeInTheDocument();
  });

  it('calls loadNextPatientsPage when IntersectionObserver sentinel intersects', () => {
    setStoreState({
      isLoading: false,
      patients: [createPatient({ id: '1', name: 'Ana' })],
      error: null,
      hasMore: true,
      isLoadingMore: false,
    });
    render(<PatientsSection />);

    // The useEffect should have created an IntersectionObserver and captured
    // the callback via our mock.
    expect(capturedIOCallback).not.toBeNull();

    // Simulate the sentinel becoming visible.
    act(() => {
      capturedIOCallback!([{ isIntersecting: true }]);
    });

    expect(mockLoadNextPatientsPage).toHaveBeenCalledTimes(1);
  });

  it('does NOT call loadNextPatientsPage when sentinel is NOT intersecting', () => {
    setStoreState({
      isLoading: false,
      patients: [createPatient({ id: '1', name: 'Ana' })],
      error: null,
      hasMore: true,
      isLoadingMore: false,
    });
    render(<PatientsSection />);

    expect(capturedIOCallback).not.toBeNull();

    act(() => {
      capturedIOCallback!([{ isIntersecting: false }]);
    });

    expect(mockLoadNextPatientsPage).not.toHaveBeenCalled();
  });

  it('does NOT create an IntersectionObserver when hasMore is false', () => {
    setStoreState({
      isLoading: false,
      patients: [createPatient({ id: '1', name: 'Ana' })],
      error: null,
      hasMore: false,
    });
    render(<PatientsSection />);

    // The useEffect returns early when hasMore is false, so no observer
    // callback should have been captured by our mock.
    expect(capturedIOCallback).toBeNull();
  });

  it('shows a loading spinner at the bottom when isLoadingMore is true', () => {
    setStoreState({
      isLoading: false,
      isLoadingMore: true,
      patients: [createPatient({ id: '1', name: 'Ana' })],
      error: null,
      hasMore: true,
    });
    render(<PatientsSection />);

    // The "Cargar más" button should not be visible while loading more.
    expect(
      screen.queryByRole('button', { name: /cargar m.s pacientes/i }),
    ).not.toBeInTheDocument();
    // But a spinner should be present (the bottom one).
    const spinners = screen.getAllByRole('status', { name: 'Loading' });
    expect(spinners.length).toBeGreaterThanOrEqual(1);
  });

  // ---- Server-side search ----

  it('does NOT filter patients locally — renders exactly what the store has', () => {
    setStoreState({
      isLoading: false,
      patients: [
        createPatient({ id: '1', name: 'Álvaro Gómez', description: 'Cardiólogo' }),
        createPatient({ id: '2', name: 'Andrea Pérez', description: 'Neurología' }),
      ],
      error: null,
      searchQuery: 'alvaro',
    });
    render(<PatientsSection />);

    // Both patients are rendered — filtering is the server's job now.
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  it('calls loadPatients with the typed search term after debounce', async () => {
    vi.useFakeTimers();
    try {
      setStoreState({
        isLoading: false,
        patients: [createPatient({ id: '1', name: 'Ana' })],
        error: null,
      });
      render(<PatientsSection />);

      // The initial mount calls loadPatients('') immediately (no debounce).
      expect(mockLoadPatients).toHaveBeenCalledTimes(1);
      expect(mockLoadPatients).toHaveBeenCalledWith('');
      mockLoadPatients.mockClear();

      const searchInput = screen.getByPlaceholderText(/buscar por nombre/i);

      // Type into the search input using native setter (for precise timer control).
      await act(async () => {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value',
        )!.set!;
        nativeInputValueSetter.call(searchInput, 'alv');
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      });

      // Before debounce elapses, loadPatients should NOT have been called.
      expect(mockLoadPatients).not.toHaveBeenCalled();

      // Advance past the debounce window.
      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      expect(mockLoadPatients).toHaveBeenCalledWith('alv');
    } finally {
      vi.useRealTimers();
    }
  });

  it('debounces rapid keystrokes into a single loadPatients call', async () => {
    vi.useFakeTimers();
    try {
      setStoreState({
        isLoading: false,
        patients: [createPatient({ id: '1', name: 'Ana' })],
        error: null,
      });
      render(<PatientsSection />);

      // The initial mount calls loadPatients('') immediately (no debounce).
      expect(mockLoadPatients).toHaveBeenCalledTimes(1);
      mockLoadPatients.mockClear();

      const searchInput = screen.getByPlaceholderText(/buscar por nombre/i);

      // Type first character.
      await act(async () => {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value',
        )!.set!;
        nativeInputValueSetter.call(searchInput, 'a');
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        // Advance partially — not past debounce.
        vi.advanceTimersByTime(100);
      });

      // Type second character — resets debounce timer.
      await act(async () => {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value',
        )!.set!;
        nativeInputValueSetter.call(searchInput, 'ab');
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        vi.advanceTimersByTime(100);
      });

      // Type third character — resets debounce timer again.
      await act(async () => {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value',
        )!.set!;
        nativeInputValueSetter.call(searchInput, 'abc');
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        vi.advanceTimersByTime(100);
      });

      // No call yet because debounce hasn't elapsed since the last keystroke.
      expect(mockLoadPatients).not.toHaveBeenCalled();

      // Now advance past the full debounce window.
      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      // Only ONE call with the final value.
      expect(mockLoadPatients).toHaveBeenCalledTimes(1);
      expect(mockLoadPatients).toHaveBeenCalledWith('abc');
    } finally {
      vi.useRealTimers();
    }
  });

  it('shows the standard empty state when no patients are loaded and no search is active', () => {
    setStoreState({
      isLoading: false,
      patients: [],
      error: null,
    });
    render(<PatientsSection />);

    // With no local search input and no patients, the "no hay pacientes" state is shown.
    expect(screen.getByText(/no hay pacientes/i)).toBeInTheDocument();
  });

  // ---- Search input visibility in empty / no-results states ----

  it('renders the search input when the server returns empty results (no patients, no error)', () => {
    setStoreState({
      isLoading: false,
      patients: [],
      error: null,
    });
    render(<PatientsSection />);

    // The search input must be available so the user can start a search from
    // the initial empty state.
    expect(
      screen.getByPlaceholderText(/buscar por nombre/i),
    ).toBeInTheDocument();
  });

  it('renders the search input when a search yields no results', async () => {
    setStoreState({
      isLoading: false,
      patients: [],
      error: null,
    });
    render(<PatientsSection />);

    const user = userEvent.setup();
    const searchInput = screen.getByPlaceholderText(/buscar por nombre/i);

    await act(async () => {
      await user.type(searchInput, 'nonexistent');
    });

    // The "no results" empty state is shown...
    expect(screen.getByText(/no hay resultados/i)).toBeInTheDocument();
    // ...and the search input is still visible so the user can refine/clear.
    expect(
      screen.getByPlaceholderText(/buscar por nombre/i),
    ).toBeInTheDocument();
  });

  it('renders the search input while the initial load is in progress', () => {
    setStoreState({ isLoading: true, patients: [], error: null });
    render(<PatientsSection />);

    // Search input is visible even during loading so user can type ahead
    expect(
      screen.getByPlaceholderText(/buscar por nombre/i),
    ).toBeInTheDocument();
  });

  it('does NOT render the search input when an error is present with no patients', () => {
    setStoreState({
      isLoading: false,
      patients: [],
      error: 'Network error',
    });
    render(<PatientsSection />);

    expect(
      screen.queryByPlaceholderText(/buscar por nombre/i),
    ).not.toBeInTheDocument();
  });

  // ===========================================================================
  // REQ-CC-01, REQ-CC-02: Counter context
  // ===========================================================================
  describe('Counter context', () => {
    it('shows "N pacientes en total" when hasMore is true', () => {
      setStoreState({
        isLoading: false,
        patients: [
          createPatient({ id: '1', name: 'Ana' }),
          createPatient({ id: '2', name: 'Juan' }),
        ],
        totalLoadedCount: 2,
        error: null,
        hasMore: true,
      });
      render(<PatientsSection />);

      expect(screen.getByText('2 pacientes en total')).toBeInTheDocument();
    });

    it('shows "N pacientes en total" (no +) when hasMore is false', () => {
      setStoreState({
        isLoading: false,
        patients: [
          createPatient({ id: '1', name: 'Ana' }),
          createPatient({ id: '2', name: 'Juan' }),
        ],
        totalLoadedCount: 2,
        error: null,
        hasMore: false,
      });
      render(<PatientsSection />);

      expect(screen.getByText('2 pacientes en total')).toBeInTheDocument();
      expect(screen.queryByText(/2\+/)).not.toBeInTheDocument();
    });
  });
});

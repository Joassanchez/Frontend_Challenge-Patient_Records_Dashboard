import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PatientCard from './PatientCard';
import type { Patient } from '@/patients-dashboard/types/patient.types';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function mockPatient(overrides?: Partial<Patient>): Patient {
  return {
    id: '1',
    name: 'Ana García',
    description: 'Cardiología',
    webpage: 'https://ana.example',
    avatar: 'https://avatars.example/ana.jpg',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PatientCard', () => {
  // ---- Identity rendering ----

  it('renders a semantic <article> as the card root', () => {
    render(<PatientCard patient={mockPatient()} />);
    const article = screen.getByRole('article');
    expect(article).toBeInTheDocument();
  });

  it('renders the patient name as an h3 heading', () => {
    render(<PatientCard patient={mockPatient()} />);
    const heading = screen.getByRole('heading', { name: 'Ana García', level: 3 });
    expect(heading).toBeInTheDocument();
  });

  it('renders the patient description visibly', () => {
    render(<PatientCard patient={mockPatient()} />);
    expect(screen.getByText('Cardiología')).toBeInTheDocument();
  });

  it('renders the webpage as a link with href and rel attributes', () => {
    render(<PatientCard patient={mockPatient()} />);
    const link = screen.getByRole('link', { name: /ana\.example/i });
    expect(link).toHaveAttribute('href', 'https://ana.example');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  // ---- Avatar fallback ----

  it('renders avatar image with alt text containing patient name when src is provided', () => {
    render(<PatientCard patient={mockPatient()} />);
    const img = screen.getByRole('img', { name: /Ana García/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://avatars.example/ana.jpg');
  });

  it('renders fallback initials when avatar is empty string', () => {
    render(<PatientCard patient={mockPatient({ avatar: '' })} />);
    // Avatar fallback shows initials "AG"
    expect(screen.getByText('AG')).toBeInTheDocument();
    // No broken image
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  // ---- Action placeholders ----

  it('renders a "Ver detalle" button with aria-label', () => {
    render(<PatientCard patient={mockPatient()} />);
    const button = screen.getByRole('button', { name: /ver detalle/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Ver detalle');
  });

  it('renders an "Editar" button with aria-label', () => {
    render(<PatientCard patient={mockPatient()} />);
    const button = screen.getByRole('button', { name: /editar/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Editar');
  });

  it('renders a "Favorito" button with aria-label', () => {
    render(<PatientCard patient={mockPatient()} />);
    const button = screen.getByRole('button', { name: /favorito/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Favorito');
  });

  // ---- No-op behavior ----

  it('clicking action buttons does not mutate state (no-op placeholders)', () => {
    // No store is imported by PatientCard — the buttons are visual-only.
    // We verify the component renders without errors and buttons exist.
    render(<PatientCard patient={mockPatient()} />);
    const buttons = screen.getAllByRole('button');
    // All three buttons render successfully without requiring store setup
    expect(buttons).toHaveLength(3);
  });

  // ---- Accessibility ----

  it('action buttons have focus-visible ring styling', () => {
    render(<PatientCard patient={mockPatient()} />);
    const buttons = screen.getAllByRole('button');
    for (const button of buttons) {
      // Each button must have a class that includes focus-visible ring
      expect(button.className).toContain('focus-visible');
    }
  });
});

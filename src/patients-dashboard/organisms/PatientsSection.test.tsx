import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PatientsSection from './PatientsSection';

describe('PatientsSection', () => {
  it('renders an accessible section landmark with name "Pacientes"', () => {
    render(<PatientsSection />);

    const section = screen.getByRole('region', { name: 'Pacientes' });
    expect(section).toBeInTheDocument();

    const heading = screen.getByRole('heading', {
      name: 'Pacientes',
      level: 2,
    });
    expect(heading).toBeInTheDocument();
    expect(section.contains(heading)).toBe(true);
  });

  it('links aria-labelledby to its own h2 heading', () => {
    render(<PatientsSection />);

    const section = screen.getByRole('region', { name: 'Pacientes' });
    const heading = screen.getByRole('heading', {
      name: 'Pacientes',
      level: 2,
    });

    const labelledBy = section.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    expect(heading.id).toBe(labelledBy);
  });

  it('renders an empty state with user icon when there are no patients', () => {
    render(<PatientsSection />);

    // EmptyState title should be visible — descriptive message about no patients
    expect(
      screen.getByText(/no hay pacientes/i),
    ).toBeInTheDocument();

    // The user icon must be rendered inside the section with the correct SVG path
    const section = screen.getByRole('region', { name: /pacientes/i });
    const svg = section.querySelector('svg');
    expect(svg).toBeInTheDocument();

    const path = svg!.querySelector('path');
    expect(path).toBeInTheDocument();
    expect(path!.getAttribute('d')).toContain('M20 21v-2a4');
  });

  it('remains visible even when empty', () => {
    render(<PatientsSection />);

    const section = screen.getByRole('region', { name: /pacientes/i });
    expect(section).toBeInTheDocument();
  });

  it('applies optional className prop', () => {
    render(<PatientsSection className="test-extra" />);

    const section = screen.getByRole('region', { name: 'Pacientes' });
    expect(section.className).toContain('test-extra');
  });
});

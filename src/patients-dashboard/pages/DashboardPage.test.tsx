import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage';

describe('DashboardPage', () => {
  function renderDashboard() {
    return render(
      <MemoryRouter initialEntries={['/']}>
        <DashboardPage />
      </MemoryRouter>,
    );
  }

  it('delegates shell structure to DashboardLayout (banner + main landmarks are singular)', () => {
    renderDashboard();

    const banners = screen.getAllByRole('banner');
    expect(banners).toHaveLength(1);

    const mains = screen.getAllByRole('main');
    expect(mains).toHaveLength(1);
  });

  it('renders page header with h2 "Tus pacientes" inside <main>', () => {
    renderDashboard();

    const main = screen.getByRole('main');
    const heading = screen.getByRole('heading', {
      name: /tus pacientes/i,
      level: 2,
    });
    expect(heading).toBeInTheDocument();
    expect(main.contains(heading)).toBe(true);
  });

  it('does NOT render a second h1 — the only h1 is in the shell Header', () => {
    renderDashboard();

    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent('Patient Records');
  });

  it('renders subtitle "Gestión de historias clínicas" visible', () => {
    renderDashboard();

    expect(
      screen.getByText(/gestión de historias clínicas/i),
    ).toBeInTheDocument();
  });

  it('renders CTA button "Nuevo paciente" with plus icon', () => {
    renderDashboard();

    const button = screen.getByRole('button', {
      name: /nuevo paciente/i,
    });
    expect(button).toBeInTheDocument();

    // The plus icon should be inside the button and be decorative
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders FavoritesSection inside <main>', () => {
    renderDashboard();

    const main = screen.getByRole('main');
    const favoritesRegion = screen.getByRole('region', {
      name: /favoritos/i,
    });
    expect(favoritesRegion).toBeInTheDocument();
    expect(main.contains(favoritesRegion)).toBe(true);
  });

  it('renders PatientsSection inside <main>', () => {
    renderDashboard();

    const main = screen.getByRole('main');
    const patientsRegion = screen.getByRole('region', {
      name: /pacientes/i,
    });
    expect(patientsRegion).toBeInTheDocument();
    expect(main.contains(patientsRegion)).toBe(true);
  });

  it('page header uses flex-col on mobile and flex-row on sm+', () => {
    renderDashboard();

    // Navigate from h2 "Tus pacientes" up to the flex container that wraps
    // heading group + CTA button — h2 > div > flex container
    const heading = screen.getByRole('heading', {
      name: /tus pacientes/i,
      level: 2,
    });
    const flexContainer = heading.parentElement!.parentElement!;

    // Mobile-first: flex-col stacks vertically by default
    expect(flexContainer.className).toContain('flex-col');
    // sm+ breakpoint: switches to horizontal row layout
    expect(flexContainer.className).toContain('sm:flex-row');
    expect(flexContainer.className).toContain('sm:items-center');
    expect(flexContainer.className).toContain('sm:justify-between');
  });
});

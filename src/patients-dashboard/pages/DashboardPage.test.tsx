import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage';

describe('DashboardPage', () => {
  it('renders the dashboard page heading', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: /patient records dashboard/i }),
    ).toBeInTheDocument();
  });

  it('delegates shell structure to DashboardLayout (banner landmark present)', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <DashboardPage />
      </MemoryRouter>,
    );

    // The shell should provide exactly one banner (from Header)
    const banners = screen.getAllByRole('banner');
    expect(banners).toHaveLength(1);
  });

  it('delegates shell structure to DashboardLayout (main landmark present)', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <DashboardPage />
      </MemoryRouter>,
    );

    // The shell should provide exactly one main landmark
    const mains = screen.getAllByRole('main');
    expect(mains).toHaveLength(1);
  });

  it('renders the page heading inside the main landmark, not the banner', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <DashboardPage />
      </MemoryRouter>,
    );

    const main = screen.getByRole('main');
    const heading = screen.getByRole('heading', {
      name: /patient records dashboard/i,
    });
    expect(main.contains(heading)).toBe(true);
  });
});

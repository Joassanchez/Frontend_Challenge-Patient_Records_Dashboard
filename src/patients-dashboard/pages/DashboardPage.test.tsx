import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage';

describe('DashboardPage', () => {
  it('renders the dashboard title', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: /patient records dashboard/i }),
    ).toBeInTheDocument();
  });

  it('renders within a main landmark', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <DashboardPage />
      </MemoryRouter>,
    );

    const mainElements = screen.getAllByRole('main');
    expect(mainElements.length).toBeGreaterThanOrEqual(1);
  });
});

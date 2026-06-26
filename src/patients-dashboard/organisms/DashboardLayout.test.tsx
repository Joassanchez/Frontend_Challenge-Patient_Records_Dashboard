import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardLayout from './DashboardLayout';

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

  it('wraps children within the Container (max-w-7xl via main)', () => {
    render(
      <DashboardLayout>
        <span>Wrapped content</span>
      </DashboardLayout>,
    );

    // The main element should contain the Container classes
    const main = screen.getByRole('main');
    expect(main.className).toContain('flex-1');
  });

  it('applies a full-height layout with background', () => {
    render(
      <DashboardLayout>
        <span>Content</span>
      </DashboardLayout>,
    );

    // The outer wrapper should fill the viewport and set background
    const main = screen.getByRole('main');
    const outerDiv = main.parentElement!;
    expect(outerDiv.className).toContain('min-h-screen');
    expect(outerDiv.className).toContain('bg-slate-50');
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

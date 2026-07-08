import type { ReactNode } from 'react';
import Header from './Header';
import Container from '@/patients-dashboard/molecules/Container';
import { ToastContainer } from './ToastContainer';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <Container className="py-8 lg:py-10">{children}</Container>
      </main>
      <ToastContainer />
    </div>
  );
}

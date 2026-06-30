import type { ReactNode } from 'react';
import Header from './Header';
import Container from '@/patients-dashboard/molecules/Container';
import { ToastContainer } from './ToastContainer';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="flex-1">
        <Container className="py-6 lg:py-8">{children}</Container>
      </main>
      <ToastContainer />
    </div>
  );
}

import { cn } from '@/shared/utils/cn';

export default function Header() {
  return (
    <header
      role="banner"
      className={cn(
        'sticky top-0 z-10 border-b border-slate-200/80',
        'bg-white/85 backdrop-blur-md',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <h1 className="text-xl font-bold text-slate-900">Patient Records</h1>
      </div>
    </header>
  );
}

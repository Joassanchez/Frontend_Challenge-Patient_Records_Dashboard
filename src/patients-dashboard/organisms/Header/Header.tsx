import { cn } from '@/shared/utils/cn';
import { useTheme } from '@/shared/theme/useTheme';
import Icon from '@/patients-dashboard/atoms/Icon';

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      role="banner"
      className={cn(
        'sticky top-0 z-10 border-b border-slate-200/80',
        'bg-white/85 backdrop-blur-md',
        'dark:bg-slate-900/85 dark:border-slate-700/80',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Registros de pacientes
        </h1>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          className={cn(
            'rounded-lg p-2 text-slate-500 transition-colors',
            'hover:bg-slate-100 hover:text-slate-700',
            'dark:hover:bg-slate-800 dark:hover:text-slate-300',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          )}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size="md" />
        </button>
      </div>
    </header>
  );
}

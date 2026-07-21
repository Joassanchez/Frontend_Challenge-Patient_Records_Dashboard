import { cn } from '@/shared/utils/cn';

interface SkeletonCardProps {
  className?: string;
}

/** Placeholder de carga con shimmer. Decorativo, no transmite información. */
function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4',
        'shadow-sm shadow-slate-200/70',
        className,
      )}
    >
      {/* Gradiente shimmer */}
      <div
        className={cn(
          'absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent',
          'animate-[shimmer_1.5s_infinite] motion-reduce:animate-none',
        )}
      />

      {/* Barras de placeholder: avatar, texto, acciones */}
      <div className="h-12 w-12 rounded-full bg-slate-200" />
      <div className="h-4 w-3/4 rounded bg-slate-200" />
      <div className="flex gap-2 border-t border-slate-100 pt-3">
        <div className="h-7 w-16 rounded-full bg-slate-100" />
        <div className="h-7 w-20 rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

export default SkeletonCard;

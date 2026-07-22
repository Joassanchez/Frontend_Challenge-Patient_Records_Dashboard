import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { usePatientsStore } from '@/patients-dashboard/store/patients.store';

export function useInfiniteScroll(
  hasMore: boolean,
  isLoadingMore: boolean,
  loadMore: () => void,
): { loadMoreRef: RefObject<HTMLDivElement | null> } {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const isLoading = usePatientsStore((s) => s.isLoading);
  const error = usePatientsStore((s) => s.error);
  const patients = usePatientsStore((s) => s.patients);
  const showContent = !isLoading && !error;
  const hasPatients = patients.length > 0;

  useEffect(() => {
    if (!showContent || !hasPatients || !hasMore || isLoadingMore) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '160px' },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [showContent, hasPatients, hasMore, isLoadingMore, loadMore]);

  return { loadMoreRef };
}

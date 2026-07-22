import { useEffect, useRef, useState } from 'react';
import { usePatientsStore } from '@/patients-dashboard/store/patients.store';

const SEARCH_DEBOUNCE_MS = 300;

export function usePatientsSearch(): {
  searchInput: string;
  setSearchInput: (value: string) => void;
} {
  const isFirstRender = useRef(true);
  const loadPatients = usePatientsStore((s) => s.loadPatients);

  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const trimmed = searchInput.trim();

    if (isFirstRender.current) {
      isFirstRender.current = false;
      loadPatients(trimmed);
      return;
    }

    const timer = window.setTimeout(() => {
      loadPatients(trimmed);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [searchInput, loadPatients]);

  return { searchInput, setSearchInput };
}

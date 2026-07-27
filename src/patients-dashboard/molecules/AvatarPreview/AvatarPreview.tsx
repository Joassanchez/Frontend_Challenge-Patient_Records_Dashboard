import { useState, useEffect } from 'react';
import Avatar from '@/patients-dashboard/atoms/Avatar';

interface AvatarPreviewProps {
  src: string;
  name?: string;
  debounceMs?: number;
}

const DEBOUNCE_MS = 300;

/**
 * Debounced avatar preview — waits 300ms after the last src change
 * before rendering the Avatar, preventing flicker on fast typing.
 */
function AvatarPreview({ src, name = '', debounceMs = DEBOUNCE_MS }: AvatarPreviewProps) {
  const [debouncedSrc, setDebouncedSrc] = useState(src);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSrc(src);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [src, debounceMs]);

  return <Avatar name={name} src={debouncedSrc} size="lg" />;
}

export default AvatarPreview;

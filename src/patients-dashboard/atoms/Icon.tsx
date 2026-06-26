import type { SVGProps } from 'react';

export type IconName =
  | 'search'
  | 'alert-circle'
  | 'check'
  | 'close'
  | 'inbox'
  | 'user';

interface IconProps {
  name: IconName;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const SIZE_MAP: Record<NonNullable<IconProps['size']>, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

// Minimal SVG paths — one distinct path per icon name.
const PATH_MAP: Record<IconName, string> = {
  search:
    'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.35-4.35',
  'alert-circle':
    'M12 8v4M12 16h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z',
  check: 'M20 6 9 17l-5-5',
  close: 'M18 6 6 18M6 6l12 12',
  inbox:
    'M22 12h-6l-2 3H10l-2-3H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
};

const svgAttrs: Record<string, SVGProps<SVGSVGElement>> = {
  fill: { fill: 'none' },
  stroke: { stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const },
};

function Icon({ name, size = 'md', label }: IconProps) {
  const px = SIZE_MAP[size];
  const d = PATH_MAP[name];

  const ariaProps = label
    ? { 'aria-label': label }
    : { 'aria-hidden': 'true' as const };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={px}
      height={px}
      viewBox="0 0 24 24"
      {...svgAttrs.fill}
      {...svgAttrs.stroke}
      {...ariaProps}
      className="inline-block shrink-0"
    >
      <path d={d} />
    </svg>
  );
}

export default Icon;

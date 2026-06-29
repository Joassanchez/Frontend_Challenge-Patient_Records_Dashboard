# Patient Records Dashboard

Frontend challenge — patient records management dashboard built with Vite, React, TypeScript, and Tailwind CSS.

## Tech Stack

- **Runtime**: React 19 + TypeScript 6
- **Build**: Vite 8
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **Routing**: React Router v7
- **State**: Zustand v5
- **Forms**: React Hook Form + Zod
- **Testing**: Vitest + React Testing Library (jsdom)
- **Linting**: ESLint flat config + Prettier

## Getting Started

```bash
npm install
npm run dev
```

## Docker

```bash
docker compose up --build
```

Open [http://localhost:5173](http://localhost:5173). The dev server runs inside the container with hot reload via bind mount.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest in watch mode |
| `npm test -- --run` | Run Vitest once |

## Project Structure

```
src/
├── patients-dashboard/   # Atomic Design by responsibility
│   ├── atoms/            # UI primitives
│   ├── molecules/        # Composite components
│   ├── organisms/        # Domain-aware sections
│   ├── pages/            # Route-level composition
│   ├── schemas/          # Zod validation schemas
│   ├── store/            # Zustand stores
│   └── types/            # Domain type definitions
├── api/                  # API client and domain modules
├── shared/
│   ├── hooks/            # Reusable hooks
│   └── utils/            # Utilities (cn, etc.)
└── test/                 # Test setup
```

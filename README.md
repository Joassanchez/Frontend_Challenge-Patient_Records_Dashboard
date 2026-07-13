# Patient Records Dashboard

Panel de gestión de historias clínicas — frontend challenge construido con Vite, React, TypeScript y Tailwind CSS.

## Funcionalidades

- **Listado de pacientes** — visualización con carga progresiva (intersection observer + paginación manual) y búsqueda insensible a diacríticos.
- **Gestión de pacientes** — crear nuevos pacientes y editar existentes mediante un modal con formulario validado.
- **Favoritos** — marcar/desmarcar pacientes como favoritos, persistidos en `localStorage` con paginación propia.
- **Toasts** — sistema de notificaciones con cola FIFO (máximo 3 visibles), cierre automático y manual.
- **Diseño responsive** — mobile-first con breakpoints para tablets y escritorio.

## Stack técnico

| Capa | Tecnología |
|---|---|
| Runtime | React 19 + TypeScript 6 |
| Build | Vite 8 |
| Estilos | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Ruteo | React Router v7 |
| Estado global | Zustand v5 |
| Formularios | React Hook Form + Zod |
| Tests | Vitest v4 + React Testing Library (jsdom) |
| Linting | ESLint flat config + Prettier |

## Requisitos previos

- Node.js 22 o superior
- npm 10 o superior

## Configuración inicial

1. Clonar el repositorio e instalar dependencias:

   ```bash
   npm install
   ```

2. Copiar el archivo de variables de entorno y ajustar si es necesario:

   ```bash
   cp .env.example .env
   ```

   La variable `VITE_API_BASE_URL` apunta a la API MockAPI. Si usás otro endpoint, editala en el `.env`.

3. Iniciar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   Abrí [http://localhost:5173](http://localhost:5173).

## Docker

Levantar con Docker Compose (usa bind mount para hot reload):

```bash
docker compose up --build
```

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Iniciar servidor de desarrollo Vite |
| `npm run build` | Type-check (`tsc -b`) y build de producción |
| `npm run preview` | Previsualizar build de producción |
| `npm run lint` | Ejecutar ESLint |
| `npm test` | Ejecutar Vitest en modo watch |
| `npm test -- --run` | Ejecutar Vitest una sola vez |

## Arquitectura

El proyecto sigue **Atomic Design** adaptado al dominio:

```
src/
├── api/                       # Cliente HTTP y definiciones de error
│   ├── apiClient.ts           # Fetch wrapper con manejo de errores tipado
│   └── types.ts               # Tipos compartidos de API (ApiError, guards)
├── patients-dashboard/
│   ├── api/                   # Módulo de API específico del dominio
│   │   └── patients.api.ts    # Obtener pacientes con validación Zod
│   ├── atoms/                 # Componentes primitivos (Button, Input, Badge, Avatar, Toast…)
│   ├── molecules/             # Componentes compuestos (Modal, FormField, SearchInput, EmptyState…)
│   ├── organisms/             # Secciones con lógica de negocio (PatientsSection, FavoritesSection, PatientCard…)
│   ├── pages/                 # Composición a nivel de ruta (DashboardPage)
│   ├── schemas/               # Schemas Zod (validación de API + formularios)
│   ├── store/                 # Stores Zustand (patients, favorites, modal, toast)
│   └── types/                 # Tipos del dominio (Patient)
└── shared/
    └── utils/                 # Utilidades reutilizables (cn, localStorage tipado, storageKeys)
```

### Decisiones de arquitectura

- **Zustand con selectores exportados**: cada store exporta selectores como funciones puras fuera del hook para evitar re-renders innecesarios y mantener las suscripciones granulares.
- **Separación input/output en formularios**: `PatientFormInput` (entrada cruda de Zod) y `PatientFormData` (salida parseada) permiten que el store complete campos como `website` y `avatar` en modo creación sin que el formulario tenga que conocer esa lógica.
- **Validación de respuesta de API con Zod**: `apiResponseSchema.safeParse()` valida que MockAPI devuelva la forma esperada, manejando edge cases como `avatar: {}` en lugar de string mediante un preprocesador.
- **Persistencia en localStorage tipada**: `getItem` y `setItem` usan validadores en tiempo de ejecución para garantizar que los datos recuperados coincidan con el tipo esperado, con fallback seguro.

## Tests

```bash
# Modo watch (desarrollo)
npm test

# Una sola ejecución (CI)
npm test -- --run
```

La suite cubre **352 tests** en 34 archivos, incluyendo tests unitarios para stores, schemas, átomos, moléculas, organismos, página principal y el cliente HTTP. Usa jsdom como entorno y React Testing Library para componentes.

## Variables de entorno

| Variable | Descripción | Default |
|---|---|---|
| `VITE_API_BASE_URL` | URL base de la API MockAPI | `https://63bedcf7f5cfc0949b634fc8.mockapi.io` |

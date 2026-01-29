# Helpdesk System - Frontend Agent Guidelines

## 1. Project Overview

The **Helpdesk System Frontend** is a Single Page Application (SPA) built with **React 19**, **Vite**, and **TypeScript**. It uses **TanStack Router** for routing, **TanStack Query** for state management, and **Mantine UI** for the component library.

**Key Technologies:**

- **Build Tool**: Vite
- **Framework**: React 19
- **Language**: TypeScript
- **Routing**: TanStack Router (File-based routing)
- **State Management**: TanStack Query (React Query) v5
- **UI Library**: Mantine UI v7
- **Styling**: Tailwind CSS v4 + Mantine Styles
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios

## 2. Build and Run Commands

### Installation

```bash
npm install
```

### Development

Runs the dev server with HMR.

```bash
npm run dev
```

### Build

Type-checks and builds the production bundle.

```bash
npm run build
```

### Linting

Runs ESLint.

```bash
npm run lint
```

## 3. Code Style & Architecture Guidelines

### Architecture: Feature-Based Hooks & File-Based Routing

- **Routes (`src/routes/`)**:
  - Follow **TanStack Router** file-based routing conventions.
  - `__root.tsx`: Root layout.
  - `index.tsx`: Home page.
  - `about.tsx` -> `/about`.
  - `tickets/index.tsx` -> `/tickets`.
  - `tickets/$ticketId.tsx` -> `/tickets/:ticketId`.
  - Use `createFileRoute` for type-safe params and search params.

- **Hooks (`src/hooks/*.ts`)**:
  - **Responsibility**: Encapsulate ALL API calls and state logic.
  - **Pattern**: Wrap `useQuery` and `useMutation` in custom hooks (e.g., `useTickets`, `useAuth`).
  - **Validation**: Define Zod schemas for API responses/requests here.
  - **No Direct API Calls**: Components should NEVER call `api.get/post` directly; they must use a hook.

- **Components (`src/components/`)**:
  - **UI Components**: Reusable, presentational components (e.g., `DataTable`, `StatusBadge`).
  - **Feature Components**: Complex components specific to a feature (e.g., `TicketList`, `LoginForm`).
  - Prefer **Mantine** components (`<Button>`, `<TextInput>`) over HTML elements.

- **API Client (`src/lib/api.ts`)**:
  - Configured Axios instance with interceptors for Auth (JWT) and error handling.

### Naming Conventions

- **Files**: `PascalCase.tsx` for components, `camelCase.ts` for hooks/utils.
- **Components**: `PascalCase` (e.g., `TicketDetail`).
- **Hooks**: `useCamelCase` (e.g., `useTicketById`).
- **Routes**: Kebab-case directories/files map to URL paths (e.g., `ticket-details.tsx`).

### Code Example (Good)

**Hook (`useTickets.ts`)**

```typescript
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";

const fetchTickets = async () => {
  const { data } = await api.get("/tickets");
  return data;
};

export const useTickets = () => {
  return useQuery({
    queryKey: ["tickets"],
    queryFn: fetchTickets,
  });
};
```

**Component (`TicketList.tsx`)**

```typescript
import { useTickets } from "../hooks/useTickets";
import { Table, Loader } from "@mantine/core";

export const TicketList = () => {
    const { data: tickets, isLoading } = useTickets();

    if (isLoading) return <Loader />;

    return (
        <Table>
            {/* ... render rows ... */}
        </Table>
    );
};
```

## 4. Testing Instructions

_Currently, no automated testing framework is configured._

**Future Guidelines:**

- **Unit Tests**: Vitest + React Testing Library.
- **E2E Tests**: Playwright or Cypress.

## 5. Security & Environment

### Environment Variables

Required variables in `.env`:

- `VITE_API_URL`: Backend API URL (e.g., `http://localhost:3000/api`).

### Security Best Practices

- **XSS**: React handles most escaping, but be careful with `dangerouslySetInnerHTML`.
- **Auth**: Store tokens in `HttpOnly` cookies (handled by backend) or memory. Do NOT store sensitive data in `localStorage`.
- **Validation**: Validate all form inputs with Zod before submitting.

## 6. Do's and Don'ts

### ✅ DO

- **Do** use **Mantine** components for consistent UI.
- **Do** use **TanStack Query** for all server state.
- **Do** use **React Hook Form** + **Zod** for forms.
- **Do** create small, reusable components.
- **Do** use `Outlet` for nested layouts.

### ❌ DON'T

- **Don't** use `useEffect` for data fetching (use `useQuery`).
- **Don't** use inline styles (use Tailwind classes or Mantine props).
- **Don't** import `axios` directly in components (use `api` instance via hooks).
- **Don't** use `any` type (define interfaces).

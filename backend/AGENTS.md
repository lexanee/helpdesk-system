# Helpdesk System - Backend Agent Guidelines

## 1. Project Overview

The **Helpdesk System Backend** is a RESTful API built with **Node.js**, **Express**, and **TypeScript**. It uses **Prisma ORM** for database interactions (PostgreSQL recommended) and **Socket.IO** for real-time features.

**Key Technologies:**

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Validation**: Zod
- **Auth**: JWT & Bcrypt
- **Real-time**: Socket.IO
- **Docs**: Swagger/OpenAPI

## 2. Build and Run Commands

### Installation

```bash
npm install
```

### Development

Runs the server in watch mode using `tsx`.

```bash
npm run dev
```

### Build

Compiles TypeScript to JavaScript in the `dist/` directory.

```bash
npm run build
```

### Production Start

Runs the compiled code.

```bash
npm start
```

### Database Migrations

apply schema changes to the database.

```bash
npx prisma migrate dev
```

## 3. Code Style & Architecture Guidelines

### Architecture: Controller-Service Pattern

We strictly follow the **Controller-Service** separation of concerns.

- **Services (`src/services/*.service.ts`)**:
  - **Responsibility**: ALL business logic, database calls (Prisma), data validation (Zod), and third-party API calls.
  - **Validation**: Define Zod schemas here. Validate inputs _before_ processing.
  - **Error Handling**: Throw standard `Error` objects (e.g., `throw new Error("User not found")`).
  - **Logging**: Use `log.service.ts` to record audit trails.

- **Controllers (`src/controllers/*.controller.ts`)**:
  - **Responsibility**: HTTP layer only. Parse requests, call Services, map errors to status codes, send JSON responses.
  - **No DB Access**: Never import `prisma` directly in a controller.
  - **Error Mapping**:
    - `Error: "Not found"` -> `404 Not Found`
    - `Error: "Access denied"` -> `403 Forbidden`
    - `ZodError` / Validation -> `400 Bad Request`
    - Unknown -> `500 Internal Server Error`

- **Routes (`src/routes/*.routes.ts`)**:
  - **Responsibility**: Define endpoints, apply middleware (Auth, RBAC, Upload), and document with Swagger.

### Naming Conventions

- **Files**: `kebab-case.type.ts` (e.g., `user.service.ts`, `auth.controller.ts`).
- **Variables/Functions**: `camelCase` (e.g., `getUserById`, `isValid`).
- **Classes/Types**: `PascalCase` (e.g., `User`, `CreateTicketDTO`).
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`).

### Code Example (Good)

**Service (`user.service.ts`)**

```typescript
import { z } from "zod";
import prisma from "../utils/prisma";

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

export const createUser = async (data: unknown) => {
  const validated = createUserSchema.parse(data); // Validation
  return prisma.user.create({ data: validated }); // DB Access
};
```

**Controller (`user.controller.ts`)**

```typescript
import * as userService from "../services/user.service";

export const create = async (req: Request, res: Response) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
};
```

## 4. Testing Instructions

_Currently, no automated testing framework is configured._

**Future Guidelines (When implementing tests):**

- **Framework**: Use **Jest** or **Vitest**.
- **Unit Tests**: Mock `prisma` calls to test Service logic in isolation.
- **Integration Tests**: Test API endpoints using `supertest` with a test database.
- **Command**: `npm test`

## 5. Security & Environment

### Environment Variables

Required variables in `.env`:

- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_SECRET`: Strong secret for signing tokens.
- `PORT`: (Optional) Server port, defaults to 3000.

### Security Best Practices

- **Secrets**: NEVER hardcode secrets (API keys, passwords) in code. Use `process.env`.
- **Authentication**: Apply `authenticateToken` middleware to all protected routes.
- **Authorization**: Use `requirePermission` or role checks for sensitive actions.
- **Input Sanitization**: Rely on Zod validation to strip unknown fields and validate types.
- **Headers**: `helmet` middleware is configured for security headers.

## 6. Do's and Don'ts

### ✅ DO

- **Do** keep Controllers thin and Services fat.
- **Do** use `async/await` for all asynchronous operations.
- **Do** document every route with Swagger comments.
- **Do** use the shared `createPaginatedResponse` utility for lists.
- **Do** use `log.service.ts` for important business actions (create, update, delete).

### ❌ DON'T

- **Don't** use `any` type unless absolutely necessary. Define interfaces or use Zod types.
- **Don't** put business logic in Controllers.
- **Don't** access the database directly from Controllers or Routes.
- **Don't** commit `.env` files or `node_modules`.
- **Don't** leave `console.log` in production code (use a logger).

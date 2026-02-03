# Helpdesk System

A modern, full-stack Helpdesk System built with **React**, **Node.js**, **TypeScript**, and **Prisma**.

## 🚀 Key Features

- **Role-Based Access Control (RBAC)**: Fine-grained permissions (Admin, Support Agent, Customer) managed via a dynamic Module-based system.
- **Ticket Management**: Full lifecycle management (Create, Assign, Update Status, Priority).
- **Real-time Updates**: Live notifications and ticket updates using **Socket.IO**.
- **User Management**: Complete CRUD for users with secure role assignment.
- **System Configuration**: Manage Categories, Services, Priorities, and Statuses dynamically.
- **Audit Logging**: enhance security and traceability.
- **Modern UI**: Built with **Mantine UI** and **Tailwind CSS**.

## 🛠️ Technology Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: JWT & Bcrypt
- **Real-time**: Socket.IO
- **Validation**: Zod

### Frontend

- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: TanStack Router (File-based)
- **State Management**: TanStack Query (React Query)
- **UI Library**: Mantine UI v7
- **Styling**: Tailwind CSS v4

---

## 📦 Installation & Setup

### Prerequisites

- Node.js (v18+)
- PostgreSQL Database

### 1. Clone the Repository

```bash
git clone <repository-url>
cd helpdesk-system
```

### 2. Install Dependencies

This project is configured as a Monorepo. Install dependencies from the root:

```bash
npm install
```

### 3. Environment Configuration

Create `.env` files for both Backend and Frontend.

**Backend (`backend/.env`):**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/helpdesk_db"
JWT_SECRET="super-secret-key-change-this"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```

**Frontend (`frontend/.env`):**

```env
VITE_API_URL="http://localhost:5000/api"
VITE_SOCKET_URL="http://localhost:5000"
```

### 4. Database Setup

Initialize the database and seed default data (Roles, Permissions, Users).

```bash
# Run from root
npm run db:reset
# OR run from backend directory: npx prisma migrate reset
```

_`db:reset` will drop the database, apply migrations, and run the seeder._

---

## 🏃‍♂️ Running the Application

You can run both Frontend and Backend concurrently from the root:

```bash
npm run dev
```

Or run them individually:

```bash
npm run dev:frontend  # Runs on http://localhost:5173
npm run dev:backend   # Runs on http://localhost:5000
```

---

## 🔐 Default Credentials

The database seeder creates the following default accounts:

| Role              | Email                 | Password     | Access                     |
| :---------------- | :-------------------- | :----------- | :------------------------- |
| **Administrator** | `admin@helpdesk.com`  | `adminadmin` | Full System Access         |
| **Support Agent** | `agent1@helpdesk.com` | `adminadmin` | Manage Tickets, View Users |
| **Customer**      | `customer1@email.com` | `customer`   | Create & View Own Tickets  |

---

## 📂 Project Structure

```
helpdesk-system/
├── backend/            # Express.js API
│   ├── prisma/         # Database Schema & Seeders
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   └── ...
├── frontend/           # React Application
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── ...
├── package.json        # Root scripts & workspace config
└── ...
```

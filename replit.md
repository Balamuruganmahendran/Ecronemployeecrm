# Employee LMS (Login Management System)

## Overview

This is an Employee Login Management System built with React (frontend), Express (backend), and PostgreSQL (database via Drizzle ORM). The application provides two distinct user experiences:

- **Employee Module**: Attendance tracking, task management, and leave requests
- **Admin Module**: Employee management, task assignment, leave approval, and analytics

The system enforces role-based access control, ensuring employees and admins can only access their respective features. Authentication is handled via JWT tokens with bcrypt password hashing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Component Library**: shadcn/ui (Radix UI primitives) with Tailwind CSS
- Uses the "new-york" style variant with custom design tokens
- All components follow a consistent design system inspired by Linear and Notion
- Supports light/dark mode through CSS variables

**Routing**: wouter (lightweight React router)
- Client-side routing with protected route components
- Role-based redirects (admins → `/admin/*`, employees → `/employee/*`)

**State Management**: 
- TanStack Query (React Query) for server state
- Local state with React hooks
- Authentication state persisted in localStorage

**Form Handling**: React Hook Form with Zod validation via `@hookform/resolvers`

**Key Design Decisions**:
- Two-column layout for admin (fixed sidebar + main content)
- Single-column layout for employees (top navigation + centered content)
- Typography system uses Inter font exclusively
- Spacing follows Tailwind's 2/4/6/8 unit system
- Component-based architecture with reusable UI primitives

### Backend Architecture

**Framework**: Express.js with TypeScript

**Development vs Production**:
- Development: Vite middleware for HMR and SSR
- Production: Static file serving from `dist/public`

**API Design**: RESTful endpoints with JWT authentication middleware
- `/api/auth/*` - Authentication (login)
- `/api/employees/*` - Employee CRUD (admin only)
- `/api/attendance/*` - Attendance tracking and stats
- `/api/tasks/*` - Task management
- `/api/leave-requests/*` - Leave request handling
- `/api/analytics/*` - Analytics data (admin only)

**Authentication Flow**:
1. User submits employeeId + password
2. Server validates credentials, hashes password with bcrypt
3. JWT token generated with employee data
4. Token sent in Authorization header for subsequent requests
5. Middleware validates token on protected routes

**Storage Layer**: In-memory storage implementation (`MemStorage`) with interface (`IStorage`)
- Allows for easy swap to database implementation
- Methods for CRUD operations on all entities
- UUIDs generated via `crypto.randomUUID()`

**Key Design Decisions**:
- Middleware-based authentication (`authenticate`, `requireAdmin`)
- Session secret configurable via environment variable
- Database seeding creates default admin and sample employee
- Export functionality for attendance (CSV/Excel via XLSX library)

### Data Schema

**Database**: PostgreSQL with Drizzle ORM

**Tables**:
1. **employees**
   - `id` (UUID, primary key)
   - `employeeId` (text, unique) - User-facing ID for login
   - `name` (text)
   - `password` (text, bcrypt hashed)
   - `role` (text) - "Admin" or "Employee"

2. **attendance**
   - `id` (UUID, primary key)
   - `employeeId` (text, references employees)
   - `loginTime` (timestamp)
   - `logoutTime` (timestamp, nullable)
   - `date` (text) - ISO date string

3. **tasks**
   - `id` (UUID, primary key)
   - `title` (text)
   - `description` (text)
   - `assignedTo` (text, references employees)
   - `assignedDate` (text)
   - `dueDate` (text)
   - `priority` (text) - "Low", "Medium", "High"
   - `status` (text) - "Pending", "Completed"

4. **leaveRequests**
   - `id` (UUID, primary key)
   - `employeeId` (text, references employees)
   - `startDate` (text)
   - `endDate` (text)
   - `reason` (text)
   - `status` (text) - "Pending", "Approved", "Rejected"

**Validation**: Zod schemas generated from Drizzle tables via `drizzle-zod`

**Key Design Decisions**:
- Dates stored as text (ISO format) for simplicity
- No foreign key constraints defined (application-level integrity)
- Insert schemas omit `id` field (auto-generated)
- Employee role determines access level (no separate roles table)

## External Dependencies

### Database
- **@neondatabase/serverless**: Neon Postgres serverless driver
- **Drizzle ORM**: Type-safe SQL query builder
  - `drizzle-orm` - Core ORM
  - `drizzle-kit` - Migration tooling
  - Schema definition in `shared/schema.ts`
  - Migrations output to `./migrations`

### Authentication & Security
- **bcryptjs**: Password hashing (10 salt rounds)
- **jsonwebtoken**: JWT token generation/validation
- Session secret via `process.env.SESSION_SECRET` (fallback: "your-secret-key")

### UI Component Libraries
- **Radix UI**: Headless UI primitives (20+ components including dialogs, dropdowns, tooltips)
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **tailwind-merge**: Conditional className merging

### Data Handling
- **xlsx**: Excel file generation for attendance exports
- **date-fns**: Date manipulation and formatting
- **Zod**: Runtime type validation

### Development Tools
- **Vite**: Build tool and dev server
- **TypeScript**: Type safety across frontend/backend
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Production bundling for backend
- **@replit/vite-plugin-***: Replit-specific development enhancements
  - Runtime error overlay
  - Cartographer (code navigation)
  - Dev banner

### Font Resources
- **Google Fonts**: Inter font family (weights 300-700)

### Key Integration Points
- Environment variable `DATABASE_URL` required for Postgres connection
- Font loading from Google Fonts CDN
- localStorage for authentication persistence
- File downloads via browser link creation (attendance exports)
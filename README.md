# BridgeSync

BridgeSync is a specialized project management platform built to resolve the "lost in translation" hurdles between "High-Context" Japanese clients and "Low-Context" Vietnamese offshore IT development teams.

Unlike generic tools like Jira which fail to capture cultural nuances and place a heavy translation burden on Bridge System Engineers (BrSEs), BridgeSync aims to reduce manual translation time, minimize requirement-related rework, and establish clear communication protocols.

This project was built as part of the ISYS2101 - Software Engineering Project Management university course.

---

## 🚀 Tech Stack

The MVP is built with a modern Full-Stack **MERN** stack:

**Frontend:**
*   **Core:** React (v19) + Vite (v8)
*   **Styling:** Tailwind CSS (v4) with custom design system (oklch color palette)
*   **State & Caching:** TanStack React Query (v5) + React Context (Auth)
*   **Internationalization (i18n):** react-i18next (EN / VI / JA)
*   **Icons:** Lucide React
*   **Excel Export:** SheetJS (xlsx)

**Backend:**
*   **Server:** Node.js + Express (v5)
*   **Database:** MongoDB Atlas + Mongoose (v9)
*   **Authentication:** JSON Web Tokens (JWT) & bcrypt
*   **External APIs:** DeepL API integration for dynamic translation fallback

---

## 📁 Project Structure

```
BridgeSync/
├── src/                          # Frontend (React + Vite)
│   ├── api/                      # API client layer
│   │   ├── apiClient.js          # Shared auth fetch wrapper (JWT Bearer header)
│   │   ├── auth.js               # Login / Register
│   │   ├── projects.js           # CRUD for projects
│   │   ├── tasks.js              # CRUD for tasks
│   │   ├── glossary.js           # GET/POST for glossary terms
│   │   ├── hourenso.js           # GET/POST for hourenso reports
│   │   ├── translate.js          # POST for translation
│   │   └── stats.js              # GET dashboard statistics
│   ├── components/
│   │   ├── ui/                   # Reusable UI components (Button, Card, Modal, TranslateTooltip)
│   │   ├── LanguageToggle.jsx    # EN/VI/JA language switcher
│   │   └── ProtectedRoute.jsx    # Auth guard for routes
│   ├── context/
│   │   └── AuthContext.jsx       # JWT auth state (token + user in localStorage)
│   ├── hooks/
│   │   └── useAuth.js            # Auth hook (login/register/logout mutations)
│   ├── layouts/
│   │   └── MainLayout.jsx        # Sidebar + topbar layout
│   ├── locales/                  # i18n translation dictionaries
│   │   ├── en.json
│   │   ├── vi.json
│   │   └── ja.json
│   ├── pages/
│   │   ├── DashboardPage.jsx     # Live stats + recent activity
│   │   ├── ProjectsPage.jsx      # Project list + create/delete
│   │   ├── TasksPage.jsx         # Task board + create + status cycling
│   │   ├── GlossaryPage.jsx      # IT glossary table + add term
│   │   ├── HourensoPage.jsx      # Hourenso reports + create + Excel export
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   └── SettingsPage.jsx
│   ├── App.jsx                   # Route definitions
│   ├── main.jsx                  # Entry point
│   ├── i18n.js                   # i18next configuration
│   └── index.css                 # Design system (Tailwind v4 @theme)
├── server/                       # Backend (Express + MongoDB)
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, Logout, Refresh token
│   │   ├── projectController.js  # CRUD for projects
│   │   ├── taskController.js     # CRUD for tasks
│   │   ├── glossaryController.js # GET/POST for glossary
│   │   ├── hourensoController.js # GET/POST for hourenso reports
│   │   ├── translationController.js  # Glossary-first translation with DeepL fallback
│   │   └── statsController.js    # Aggregated dashboard statistics
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT protect + role-based authorize
│   │   └── projectMiddleware.js  # Project-scoped access
│   ├── models/
│   │   ├── Users.js              # User schema (name, email, role, preferredLanguage)
│   │   ├── Projects.js           # Project schema (name, description, status, members)
│   │   ├── Tasks.js              # Task schema (projectId, title, status, assignee, reporter)
│   │   ├── ITGlossary.js         # Trilingual glossary schema (baseTerm, translations)
│   │   └── HourensoReports.js    # Hourenso schema (houkoku, renraku, soudan)
│   ├── permission/
│   │   └── project.js            # Scoped project filtering by user role
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── glossaryRoutes.js
│   │   ├── hourensoRoutes.js
│   │   ├── translationRoutes.js
│   │   └── statsRoutes.js
│   ├── server.js                 # Express app entry point
│   └── .env                      # Environment variables
├── package.json                  # Frontend dependencies + scripts
├── vite.config.js                # Vite config with API proxy
├── FEATURES.md                   # Detailed feature documentation
└── README.md                     # This file
```

---

## 📦 Installation & Usage

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)

### 1. Clone and install dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Configure environment variables

Create/edit `server/.env`:

```env
PORT=3000
DATABASE_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=BridgeSync
ACCESS_TOKEN_SECRET=<your-access-token-secret>
REFRESH_TOKEN_SECRET=<your-refresh-token-secret>
JWT_EXPIRES_IN=30m
DEEPL_API_URL=https://api-free.deepl.com/v2/translate
DEEPL_API_KEY=<your-deepl-api-key>
```

### 3. Start the development server

```bash
npm run dev
```

This starts both the Vite frontend (port 5173) and Express backend (port 3000) concurrently.

### 4. Build for production

```bash
npm run build
```

---

## 🔑 Test Accounts

You can register new accounts via the Signup page (`/signup`). Choose from the following roles:

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **PM** | Project Manager | Create/delete projects, create tasks, update task status, create reports |
| **BrSE** | Bridge System Engineer | Create projects, create tasks, update task status, add glossary terms, create reports |
| **Developer** | Developer | Update task status, create reports |
| **Japanese client** | Japanese Client | View-only access to projects, tasks, glossary |

### Pre-registered test accounts (on the shared MongoDB Atlas):

| Email | Password | Role |
|-------|----------|------|
| `pm@bridgesync.com` | `Test1234` | PM |
| `brse@bridgesync.com` | `Test1234` | BrSE |
| `dev@bridgesync.com` | `Test1234` | Developer |
| `client@bridgesync.com` | `Test1234` | Japanese client |

> **Note:** If these accounts don't exist yet in your database, create them via the Signup page at `/signup`. Select the appropriate role from the dropdown during registration.

---

## 🔗 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login (returns JWT) | Public |

### Projects
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/projects` | List projects (scoped by user) | All authenticated |
| GET | `/api/projects/:id` | Get single project | All authenticated |
| POST | `/api/projects` | Create project | PM, BrSE |
| DELETE | `/api/projects/:id` | Delete project | PM |
| GET | `/api/projects/:id/members` | Get project members | All authenticated |

### Tasks
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/tasks/:projectId` | Get tasks for a project | All authenticated |
| POST | `/api/tasks` | Create task | PM, BrSE |
| PUT | `/api/tasks/:taskId/status` | Update task status | PM, BrSE, Developer |

### IT Glossary
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/glossary` | List all glossary terms | All authenticated |
| POST | `/api/glossary` | Add new term | BrSE |

### Hourenso Reports
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/hourenso/:projectId` | Get reports by project | All authenticated |
| POST | `/api/hourenso` | Create report | PM, BrSE, Developer |

### Translation
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/api/translate` | Translate text (glossary → DeepL fallback) | All authenticated |

### Dashboard Stats
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/stats` | Aggregated dashboard statistics | All authenticated |

---

## 📖 Features Overview

For a detailed breakdown of all features, please see the [FEATURES.md](./FEATURES.md) file.

---

## 👥 Role-Based Access Matrix

| Feature | PM | BrSE | Developer | Japanese Client |
|---------|:--:|:----:|:---------:|:---------------:|
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| View Projects | ✅ | ✅ | ✅ | ✅ |
| Create Project | ✅ | ✅ | ❌ | ❌ |
| Delete Project | ✅ | ❌ | ❌ | ❌ |
| View Tasks | ✅ | ✅ | ✅ | ✅ |
| Create Task | ✅ | ✅ | ❌ | ❌ |
| Update Task Status | ✅ | ✅ | ✅ | ❌ |
| View Glossary | ✅ | ✅ | ✅ | ✅ |
| Add Glossary Term | ❌ | ✅ | ❌ | ❌ |
| View Reports | ✅ | ✅ | ✅ | ✅ |
| Create Report | ✅ | ✅ | ✅ | ❌ |
| Export Reports (Excel) | ✅ | ✅ | ✅ | ✅ |
| Translate Text | ✅ | ✅ | ✅ | ✅ |

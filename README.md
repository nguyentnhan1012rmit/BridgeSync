# BridgeSync

BridgeSync is a specialized project management platform built to resolve the "lost in translation" hurdles between "High-Context" Japanese clients and "Low-Context" Vietnamese offshore IT development teams.

Unlike generic tools like Jira which fail to capture cultural nuances and place a heavy translation burden on Bridge System Engineers (BrSEs), BridgeSync aims to reduce manual translation time, minimize requirement-related rework, and establish clear communication protocols.

This project was built as part of the **ISYS2101 — Software Engineering Project Management** university course.

---

## 🚀 Tech Stack

The MVP is built with a modern Full-Stack **MERN** architecture:

**Frontend:**
* **Core:** React (v19) + Vite (v8)
* **Styling:** Tailwind CSS (v4) with custom design system (oklch color palette, glassmorphism, micro-animations)
* **State & Caching:** TanStack React Query (v5) + React Context (Auth)
* **Internationalization (i18n):** react-i18next (EN / VI / JA)
* **Icons:** Lucide React
* **Excel Import/Export:** ExcelJS

**Backend:**
* **Server:** Node.js + Express (v5)
* **Database:** MongoDB Atlas + Mongoose (v9)
* **Authentication:** JSON Web Tokens (JWT) & bcrypt
* **External APIs:** DeepL API integration for dynamic translation fallback

---

## 📁 Project Structure

```
BridgeSync/
├── src/                              # Frontend (React + Vite)
│   ├── api/                          # API client layer
│   │   ├── apiClient.js              # Shared auth fetch wrapper (JWT Bearer)
│   │   ├── auth.js                   # Login / Register
│   │   ├── projects.js               # CRUD for projects
│   │   ├── tasks.js                  # CRUD for tasks
│   │   ├── glossary.js               # GET/POST/import for glossary terms
│   │   ├── hourenso.js               # GET/POST for hourenso reports
│   │   ├── translate.js              # POST for translation
│   │   └── stats.js                  # GET dashboard statistics
│   ├── components/
│   │   ├── ui/                       # Reusable UI components
│   │   │   ├── Button.jsx            # Multi-variant button
│   │   │   ├── Card.jsx              # Glass-panel card wrapper
│   │   │   ├── Modal.jsx             # Accessible modal dialog
│   │   │   ├── SelectTranslate.jsx   # Global select-to-translate widget
│   │   │   ├── TextHighlighter.jsx   # Auto glossary term highlighter
│   │   │   ├── TranslateTooltip.jsx  # Hover tooltip for glossary terms
│   │   │   └── index.js              # Barrel exports
│   │   ├── LanguageToggle.jsx        # EN/VI/JA language switcher
│   │   └── ProtectedRoute.jsx        # Auth guard for routes
│   ├── context/
│   │   └── AuthContext.jsx           # JWT auth state (token + user)
│   ├── hooks/
│   │   └── useAuth.js                # Auth hook (login/register/logout)
│   ├── layouts/
│   │   └── MainLayout.jsx            # Sidebar + topbar layout
│   ├── locales/                      # i18n translation dictionaries
│   │   ├── en.json
│   │   ├── vi.json
│   │   └── ja.json
│   ├── pages/
│   │   ├── DashboardPage.jsx         # Live stats + recent activity
│   │   ├── ProjectsPage.jsx          # Project list + create/delete
│   │   ├── TasksPage.jsx             # Task board + status cycling
│   │   ├── GlossaryPage.jsx          # IT glossary table + CSV/XLSX import
│   │   ├── HourensoPage.jsx          # Hourenso reports + quality check + Excel export
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   └── SettingsPage.jsx          # Language & display preferences
│   ├── App.jsx                       # Route definitions
│   ├── main.jsx                      # Entry point (React Query + i18n)
│   ├── i18n.js                       # i18next configuration
│   └── index.css                     # Design system (Tailwind v4 @theme)
├── server/                           # Backend (Express + MongoDB)
│   ├── controllers/
│   │   ├── authController.js         # Register, Login, Logout, Refresh
│   │   ├── projectController.js      # CRUD for projects
│   │   ├── taskController.js         # CRUD for tasks
│   │   ├── glossaryController.js     # GET/POST/import for glossary
│   │   ├── hourensoController.js     # GET/POST for hourenso reports
│   │   ├── translationController.js  # Glossary-first + DeepL fallback
│   │   └── statsController.js        # Aggregated dashboard statistics
│   ├── middleware/
│   │   ├── authMiddleware.js         # JWT protect + role-based authorize
│   │   └── projectMiddleware.js      # Project-scoped access
│   ├── models/
│   │   ├── Users.js                  # User schema (name, email, role)
│   │   ├── Projects.js              # Project schema (name, status, members)
│   │   ├── Tasks.js                  # Task schema (projectId, status, assignee)
│   │   ├── ITGlossary.js            # Trilingual glossary schema
│   │   └── HourensoReports.js       # Hourenso schema (報連相)
│   ├── permission/
│   │   └── project.js                # Scoped project filtering by role
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── glossaryRoutes.js
│   │   ├── hourensoRoutes.js
│   │   ├── translationRoutes.js
│   │   └── statsRoutes.js
│   ├── tests/                        # RBAC and API integration tests
│   ├── app.js                        # Express app composition
│   ├── seed_user_data.js             # Database seeding script (dev utility)
│   ├── server.js                     # Database connection + listen entry point
│   ├── .env.example                  # Environment variable template
│   └── .env                          # Environment variables (git-ignored)
├── public/
│   └── favicon.svg                   # App favicon
├── docs/
│   ├── DEPLOYMENT.md                 # Cloud deployment guide
│   └── UAT_CHECKLIST.md              # Demo/UAT checklist
├── package.json                      # Frontend dependencies + scripts
├── vite.config.js                    # Vite config with API proxy
├── eslint.config.js                  # ESLint configuration
├── index.html                        # HTML entry point
├── FEATURES.md                       # Detailed feature documentation
└── README.md                         # This file
```

---

## 📦 Installation & Usage

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)
- DeepL API key (optional — for translation fallback)

### 1. Clone and install dependencies

```bash
git clone https://github.com/nguyentnhan1012rmit/BridgeSync.git
cd BridgeSync

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Configure environment variables

Copy the template and fill in your values:

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
PORT=3000
DATABASE_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=BridgeSync
ACCESS_TOKEN_SECRET=<your-access-token-secret>
REFRESH_TOKEN_SECRET=<your-refresh-token-secret>
JWT_EXPIRES_IN=30m
DEEPL_API_URL=https://api-free.deepl.com/v2/translate
DEEPL_API_KEY=<your-deepl-api-key>
FRONTEND_ORIGIN=http://localhost:5173
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

### 5. Quality checks

```bash
npm run lint
npm test
npm run build
```

### 6. QA and deployment references

- Manual UAT/demo checklist: [`docs/UAT_CHECKLIST.md`](docs/UAT_CHECKLIST.md)
- Role-based demo script and screenshot list: [`docs/ROLE_BASED_DEMO_SCRIPT.md`](docs/ROLE_BASED_DEMO_SCRIPT.md)
- Technical and feature report draft: [`docs/TECHNICAL_AND_FEATURE_REPORT.md`](docs/TECHNICAL_AND_FEATURE_REPORT.md)
- Cloud deployment guide: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)

---

## ✅ Recent UAT & Verification Status

The application has successfully passed the **Final UAT (User Acceptance Testing) Verification**:
- **Infrastructure:** Verified concurrent frontend/backend initialization (`npm run dev`) with proper `helmet` and `mongoose` dependencies. Quality checks (`npm run lint`, `npm test`, `npm run build`) all pass.
- **RBAC & Authorization:** Verified that the API correctly enforces role-based access control. Creation and deletion endpoints (`POST`, `PUT`, `DELETE`) for Projects, Tasks, and Hourenso reports are strictly blocked (yielding `403 Forbidden`) for the `Japanese client` role.
- **UI Cleanup:** Cleaned up the `DashboardPage` so that Quick Action buttons (New Project, New Task, New Report) are conditionally hidden based on the user's role, preventing unauthorized users (like Developers or Clients) from seeing actions they cannot perform.
- **Deployment Ready:** The application is verified and structurally ready for production deployment to Vercel (Frontend) and Render/Railway (Backend).

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
| `pm_final@bridgesync.com` | `Test1234` | PM |
| `brse_final@bridgesync.com` | `Test1234` | BrSE |
| `uat_dev@bridgesync.com` | `Test1234` | Developer |
| `client_final@bridgesync.com` | `Test1234` | Japanese client |

> **Note:** If these accounts don't exist yet in your database, create them via the Signup page at `/signup`. Select the appropriate role from the dropdown during registration.

---

## 🔗 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login (returns access + refresh token) | Public |
| POST | `/api/auth/refresh` | Refresh access token | Public |
| POST | `/api/auth/logout` | Logout / revoke refresh token | Authenticated |
| GET | `/api/auth/users` | List users for member assignment | PM, BrSE |

### Projects
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/projects` | List projects (scoped by user) | All authenticated |
| GET | `/api/projects/:id` | Get single project | All authenticated |
| POST | `/api/projects` | Create project | PM, BrSE |
| DELETE | `/api/projects/:id` | Delete project | PM |
| GET | `/api/projects/:id/members` | Get project members | All authenticated |
| POST | `/api/projects/:id/members` | Add project member | PM |
| DELETE | `/api/projects/:id/members/:userId` | Remove project member | PM |

### Tasks
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/tasks/:projectId` | Get tasks for a project | All authenticated |
| POST | `/api/tasks` | Create task | PM, BrSE |
| PUT | `/api/tasks/:taskId` | Edit task details | PM, BrSE |
| PUT | `/api/tasks/:taskId/status` | Update task status | PM, BrSE, Developer |
| DELETE | `/api/tasks/:taskId` | Delete task | PM, BrSE |

### IT Glossary
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/glossary` | List/search glossary terms with optional pagination | All authenticated |
| POST | `/api/glossary` | Add new term | BrSE |
| POST | `/api/glossary/import` | Import glossary terms from parsed CSV/XLSX rows | BrSE |

### Hourenso Reports
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/hourenso/:projectId` | Get reports by project | All authenticated |
| POST | `/api/hourenso` | Create report | PM, BrSE, Developer |
| PUT | `/api/hourenso/reports/:reportId` | Edit report | PM, BrSE, Developer |
| DELETE | `/api/hourenso/reports/:reportId` | Delete report | PM, BrSE, Developer |

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

**Core features include:**
1. **Bilingual Dual-View Interface** — Instant EN/VI/JA switching via react-i18next
2. **Smart Hover-to-Translate** — Auto-detection and highlighting of IT glossary terms with trilingual tooltips
3. **Select-to-Translate** — Select any text and get instant translations via IT Glossary + DeepL
4. **Automated Hourenso Templates** — Structured 報連相 reporting with quality check and Excel export
5. **Project Management with RBAC** — Role-based project creation, deletion, scoping, and project language preference
6. **Task Management with Status Cycling** — Create, edit, delete, and inline status cycling
7. **Live Dashboard** — Aggregated stats with auto-refresh
8. **Secure Backend** — JWT auth, role middleware, translation API proxying

---

## 🎨 UI/UX Design System

BridgeSync features a premium, modern design system built on Tailwind CSS v4:

| Design Element | Details |
|---|---|
| **Color Palette** | Semantic oklch-based colors (primary sapphire, teal accent, amber warning, semantic surfaces) |
| **Typography** | Inter + Noto Sans JP via Google Fonts, tight letter-spacing on headings |
| **Glassmorphism** | Frosted-glass topbar and auth cards with `backdrop-filter: blur` |
| **Micro-Animations** | Button press, card hover lift, modal bounce entrance, page slide-in, skeleton shimmer loaders |
| **Sidebar** | Collapsible with active indicator, user avatar footer, smooth transitions |
| **Data Tables** | Uppercase headers, hover-highlighted rows, rounded containers |
| **Status Badges** | Color-coded bordered badges with click-to-cycle interaction |
| **Language Toggle** | iOS-style segmented control with flag emojis (🇺🇸 🇻🇳 🇯🇵) |
| **Empty States** | Contextual icons with muted labels for zero-data scenarios |

---

## 👥 Role-Based Access Matrix

| Feature | PM | BrSE | Developer | Japanese Client |
|---------|:--:|:----:|:---------:|:---------------:|
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| View Projects | ✅ | ✅ | ✅ | ✅ |
| Create Project | ✅ | ✅ | ❌ | ❌ |
| Delete Project | ✅ | ❌ | ❌ | ❌ |
| Add/Remove Project Members | ✅ | ❌ | ❌ | ❌ |
| View Tasks | ✅ | ✅ | ✅ | ✅ |
| Create Task | ✅ | ✅ | ❌ | ❌ |
| Edit/Delete Task | ✅ | ✅ | ❌ | ❌ |
| Update Task Status | ✅ | ✅ | ✅ | ❌ |
| View Glossary | ✅ | ✅ | ✅ | ✅ |
| Add Glossary Term | ❌ | ✅ | ❌ | ❌ |
| Import Glossary Terms | ❌ | ✅ | ❌ | ❌ |
| View Reports | ✅ | ✅ | ✅ | ✅ |
| Create Report | ✅ | ✅ | ✅ | ❌ |
| Edit/Delete Report | ✅ | ✅ | ✅ | ❌ |
| Export Reports (Excel) | ✅ | ✅ | ✅ | ✅ |
| Select-to-Translate | ✅ | ✅ | ✅ | ✅ |
| Hover-to-Translate | ✅ | ✅ | ✅ | ✅ |

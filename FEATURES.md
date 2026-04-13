# BridgeSync — Detailed Features

BridgeSync contains core MVP features specifically designed to bridge the gap between Japanese business culture and Vietnamese offshore development teams. All features are fully connected to a live backend API with role-based access control.

---

## 1. Bilingual Dual-View Interface

**The Problem:** Traditional Project Management tools force teams to use a single workspace language or rely heavily on external translation tools, causing context switching and confusion.

**The Solution:** A globally synchronized state that allows instant language switching without reloading the page.

*   **Implementation:** Powered by `react-i18next`.
*   **Supported Languages:** English (EN — default for academic grading), Vietnamese (VI), and Japanese (JA).
*   **Mechanics:**
    *   A `LanguageToggle` component sits in the top navigation bar.
    *   Clicking a language flag instantly changes all static UI text (navigation, buttons, labels) by pulling from the respective JSON dictionary in `src/locales/`.
    *   The user's language preference is saved in `localStorage`, meaning the application remembers their choice across sessions.

---

## 2. Smart Hover-to-Translate & Custom IT Glossary

**The Problem:** Bridge System Engineers (BrSEs) waste hours manually translating repetitive IT jargon (e.g., "API", "CI/CD", "Sprint"). Generic translators like Google Translate often fail to provide technically accurate context for these terms.

**The Solution:** An interactive terminology system that provides instant, culturally and technically accurate translations on hover — backed by a live database.

*   **Implementation:** Custom `TranslateTooltip` component and `GlossaryPage` with full CRUD.
*   **Mechanics:**
    *   When an offshore developer is reading a task card written in Japanese (or vice versa), complex IT terms are automatically detected and highlighted with a dashed underline.
    *   Hovering over the term reveals a clean, animated tooltip showing the term's exact meaning in English, Vietnamese, and Japanese.
    *   These definitions are sourced from a curated **IT Glossary** stored in MongoDB (`ITGlossary` collection), ensuring niche accuracy rather than relying on generic API translations.
    *   The `GlossaryPage` provides a **searchable table** for users to study or reference these terms, fetched live from `GET /api/glossary`.
    *   **BrSE-only: Add Term** — Users with the `BrSE` role can add new glossary terms via a modal form with trilingual inputs (`baseTerm`, English, Vietnamese, Japanese). This calls `POST /api/glossary`.
    *   Terms are sorted alphabetically and searchable across all three languages.

### Test Accounts for This Feature

| Action | Required Role | Test Account | Password |
|--------|--------------|--------------|----------|
| View glossary | Any authenticated | `dev@bridgesync.com` | `Test1234` |
| Add new term | BrSE only | `brse@bridgesync.com` | `Test1234` |

---

## 3. Automated Hourenso (報連相) Templates

**The Problem:** Japanese stakeholders expect rigorous, structured reporting based on the cultural concept of **Hourenso** (Houkoku – Report, Renraku – Contact, Soudan – Consult). Vietnamese offshore teams often struggle to format their updates to meet these implicit expectations.

**The Solution:** Pre-built reporting interfaces that naturally guide users to write updates in the correct cultural format — stored and retrieved from the database.

*   **Implementation:** The `HourensoPage` component connected to `GET/POST /api/hourenso`.
*   **Mechanics:**
    *   **Project Selector:** Users first select a project from a dropdown to view/create reports for that specific project.
    *   Reports are broken down into the three mandatory sections:
        *   **報告 (Houkoku) — Report:** Current status, progress, issues, next steps. (`currentStatus`, `progress`, `issues`, `nextSteps` — required fields)
        *   **連絡 (Renraku) — Contact/Share:** Information that needs to be shared with the broader team. (`sharedInformation` — optional)
        *   **相談 (Soudan) — Consult:** Specific topics requiring stakeholder decisions, proposed options, and deadlines. (`topic`, `proposedOptions`, `deadline` — optional)
    *   **Create Report Modal:** A structured form that enforces the Hourenso template. The `proposedOptions` field accepts comma-separated values and stores them as an array.
    *   **One-Click Export to Excel:** Uses the `xlsx` library to compile all reports for the selected project into a formatted Excel file. The export now uses **real data from the database** instead of mock data.
    *   **Role Restriction:** Only `PM`, `BrSE`, and `Developer` roles can create reports. The `Japanese client` role is blocked from creating reports (view-only).

### Test Accounts for This Feature

| Action | Required Role | Test Account | Password |
|--------|--------------|--------------|----------|
| View reports | Any authenticated | `client@bridgesync.com` | `Test1234` |
| Create report | PM, BrSE, Developer | `dev@bridgesync.com` | `Test1234` |
| Create report | PM, BrSE, Developer | `brse@bridgesync.com` | `Test1234` |
| Create report | PM, BrSE, Developer | `pm@bridgesync.com` | `Test1234` |
| Export to Excel | Any authenticated | `dev@bridgesync.com` | `Test1234` |

---

## 4. Project Management with RBAC

**The Problem:** Different team members need different levels of access — PMs should manage projects, BrSEs should bridge communication, and developers should focus on their assigned tasks without the clutter of administrative controls.

**The Solution:** Role-Based Access Control (RBAC) on both frontend UI and backend endpoints.

*   **Implementation:** `ProjectsPage` connected to `GET/POST/DELETE /api/projects`.
*   **Mechanics:**
    *   **View Projects:** All authenticated users see projects scoped to their membership via `scopedProject` middleware.
    *   **Create Project:** PM and BrSE roles see a "New Project" button that opens a modal form with project name and description fields. Calls `POST /api/projects`.
    *   **Delete Project:** PM-only. A trash icon appears on each project card. Requires confirmation dialog. Calls `DELETE /api/projects/:id`.
    *   **Project Cards:** Display project name, description, status badge (Active/Archived), member count, and creation date.
    *   **Loading States:** Skeleton spinners while data loads. Error banners on API failures. Empty state for new users.

### Test Accounts for This Feature

| Action | Required Role | Test Account | Password |
|--------|--------------|--------------|----------|
| View projects | Any authenticated | `dev@bridgesync.com` | `Test1234` |
| Create project | PM or BrSE | `pm@bridgesync.com` | `Test1234` |
| Create project | PM or BrSE | `brse@bridgesync.com` | `Test1234` |
| Delete project | PM only | `pm@bridgesync.com` | `Test1234` |

---

## 5. Task Management with Status Cycling

**The Problem:** Task boards need to reflect real-time status and allow quick updates without navigating through multiple screens.

**The Solution:** A task list view with inline status cycling and project-scoped filtering — connected to live backend data.

*   **Implementation:** `TasksPage` connected to `GET/POST/PUT /api/tasks`.
*   **Mechanics:**
    *   **Project Selector:** Users select a project from a dropdown to view its tasks.
    *   **Task List:** Displays task title, description, assignee name, status badge, and creation date.
    *   **Status Cycling:** Click the status badge to cycle through: `ongoing` → `completed` → `delayed` → back to `ongoing`. Calls `PUT /api/tasks/:taskId/status`.
    *   **Create Task:** PM and BrSE roles can create tasks via a modal form with title, description, and assignee dropdown (populated from project members via `GET /api/projects/:id/members`).
    *   **Assignee Dropdown:** Shows all project members with their roles for easy assignment.

### Test Accounts for This Feature

| Action | Required Role | Test Account | Password |
|--------|--------------|--------------|----------|
| View tasks | Any authenticated | `dev@bridgesync.com` | `Test1234` |
| Create task | PM or BrSE | `pm@bridgesync.com` | `Test1234` |
| Update task status | PM, BrSE, Developer | `dev@bridgesync.com` | `Test1234` |

---

## 6. Live Dashboard with Aggregated Stats

**The Problem:** Teams need a quick overview of project health, pending work, and recent activity without clicking through every page.

**The Solution:** A dashboard with live statistics pulled from the database and a recent activity feed.

*   **Implementation:** `DashboardPage` connected to `GET /api/stats`.
*   **Mechanics:**
    *   **Stats Cards:** Four metric cards displaying:
        *   Active Projects (count of projects with `status: 'active'`)
        *   Pending Tasks (count of tasks with `status: 'ongoing'`)
        *   Reports This Week (count of hourenso reports created in the last 7 days)
        *   Glossary Terms (total count of IT glossary entries)
    *   **Recent Activity Feed:** Displays the 5 most recent hourenso reports across all projects, showing author name, project name, report summary, and timestamp.
    *   **Quick Actions Panel:** Shortcut buttons for creating projects, tasks, reports, and exporting to Excel.
    *   **Auto-Refresh:** Stats refresh every 30 seconds via React Query's `refetchInterval`.

### Test Accounts for This Feature

| Action | Required Role | Test Account | Password |
|--------|--------------|--------------|----------|
| View dashboard | Any authenticated | `pm@bridgesync.com` | `Test1234` |

---

## 7. Secure Backend & Translation Fallback Strategy

**The Problem:** Storing sensitive API keys on the frontend is a security risk, and a static mock glossary doesn't scale. Moreover, different project members need explicit data boundaries to avoid unintentional edits.

**The Solution:** A dedicated Node.js/Express backend that handles data persistence, authentication, and secure translation API proxying.

*   **Implementation:** Express REST API, MongoDB (Mongoose), JWT authentication, role-based middleware.
*   **Mechanics:**
    *   **Role-Based Access Control (RBAC):** Users authenticate via JWT. Specific roles (`PM`, `BrSE`, `Developer`, `Japanese client`) determine API permissions. Middlewares like `authorize('PM')` ensure strict scoping over endpoints (e.g., users can only view projects they belong to via `scopedProject`).
    *   **Translation Fallback System:** The backend's `/api/translate` endpoint orchestrates translations gracefully. It **first** queries the custom `ITGlossary` database for high-accuracy terms. If a definition doesn't exist, it safely communicates with the external **DeepL API** (concealing the server's `DEEPL_API_KEY`) to fetch and return the translation.
    *   **JWT Token Flow:**
        *   Login returns an access token (30min expiry) & refresh token (7 day expiry).
        *   All protected API calls include `Authorization: Bearer <token>` header via the shared `apiClient.js`.
        *   Frontend stores token in `localStorage` and auto-injects via `authFetch()`.

---


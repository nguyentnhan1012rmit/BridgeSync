# BridgeSync Technical and Feature Report

## 1. Project Overview

BridgeSync is a MERN-based project management platform designed for Japanese clients and Vietnamese offshore software teams. The application focuses on reducing communication friction in cross-cultural software projects by combining role-based project management, trilingual glossary support, select-to-translate workflows, and structured Hourenso reporting.

The project addresses a common offshore development problem: Japanese clients often communicate with high-context assumptions, while Vietnamese development teams need explicit and structured information. BridgeSync helps Bridge System Engineers, Project Managers, Developers, and Japanese clients work in one shared workspace with clear project boundaries and multilingual support.

## 2. Main Objectives

- Provide a project management workspace for PM, BrSE, Developer, and Japanese client roles.
- Enforce project-scoped RBAC so users only access projects they are allowed to see.
- Support trilingual communication in English, Vietnamese, and Japanese.
- Provide an IT glossary that improves translation consistency across teams.
- Support structured Hourenso reporting for Japanese stakeholder communication.
- Allow BrSE users to import glossary terms from CSV/XLSX files.
- Add security and reliability improvements suitable for a course MVP demo.

## 3. Technology Stack

### Frontend

- React 19
- Vite 8
- React Router
- TanStack React Query
- Tailwind CSS 4
- react-i18next
- Lucide React
- ExcelJS for CSV/XLSX import and Excel export

### Backend

- Node.js
- Express 5
- MongoDB
- Mongoose
- JSON Web Tokens
- bcrypt
- Helmet
- express-rate-limit
- Axios for DeepL API proxying

### Testing and Quality

- ESLint
- Node.js native test runner
- Backend RBAC and API integration-style tests
- UAT checklist
- Deployment guide
- Role-based demo script

## 4. System Architecture

BridgeSync uses a separated frontend and backend architecture.

The frontend is a React single-page application. It communicates with the backend through a shared API client layer. Protected routes are guarded by authentication state, and API calls automatically include JWT bearer tokens.

The backend is an Express REST API. It handles authentication, role authorization, project-scoped access control, database persistence, translation fallback, glossary import, task management, Hourenso reports, and dashboard statistics.

MongoDB stores users, projects, tasks, glossary terms, and Hourenso reports. Mongoose schemas define validation, relationships, and indexes for common queries.

## 5. Core Data Models

### User

The user model stores:

- name
- email
- hashed password
- role
- preferred language
- hashed refresh token

Supported roles:

- PM
- BrSE
- Developer
- Japanese client

### Project

The project model stores:

- project name
- description
- status
- preferred reporting language
- member list
- timestamps

Projects are the main scoping boundary for RBAC. Non-PM users can only access projects where they are listed as members.

### Task

The task model stores:

- project ID
- title
- description
- status
- assignee
- reporter
- timestamps

Supported statuses:

- ongoing
- completed
- delayed

### IT Glossary

The glossary model stores:

- base term
- normalized base term
- English translation
- Vietnamese translation
- Japanese translation
- creator
- usage count

Normalized terms prevent duplicate entries such as `API` and `api`.

### Hourenso Report

The Hourenso report model stores:

- project ID
- author
- Houkoku section
- Renraku section
- Soudan section
- timestamps

The required Houkoku fields are current status, progress, issues, and next steps.

## 6. Authentication and Session Management

BridgeSync uses JWT authentication with access tokens and refresh tokens.

The access token is used for normal protected API calls. The refresh token is used to request a new access token when the old access token expires.

Security improvements implemented:

- Passwords are hashed with bcrypt.
- Refresh tokens are not stored as plain text.
- Refresh tokens are hashed before being saved to MongoDB.
- Refresh tokens are rotated on every refresh request.
- If an invalid refresh token is reused, the stored refresh token hash is cleared.
- Logout revokes the stored refresh token hash on the backend and clears local session state on the frontend.

On the frontend, `authFetch` automatically retries a failed request after refreshing the token. If refresh fails, the app dispatches an auth error and logs the user out cleanly.

## 7. Role-Based Access Control

BridgeSync implements RBAC at two levels:

- UI-level controls hide or show actions based on the user's role.
- Backend middleware enforces role and project access regardless of what the frontend displays.

Role permissions:

| Feature | PM | BrSE | Developer | Japanese Client |
| --- | --- | --- | --- | --- |
| View dashboard | Yes | Yes | Yes | Yes |
| View assigned projects | Yes | Yes | Yes | Yes |
| Create projects | Yes | Yes | No | No |
| Delete projects | Yes | No | No | No |
| Add/remove project members | Yes | No | No | No |
| View tasks | Yes | Yes | Yes | Yes |
| Create tasks | Yes | Yes | No | No |
| Edit/delete tasks | Yes | Yes | No | No |
| Update task status | Yes | Yes | Yes | No |
| View glossary | Yes | Yes | Yes | Yes |
| Add/import glossary terms | No | Yes | No | No |
| View Hourenso reports | Yes | Yes | Yes | Yes |
| Create/edit/delete reports | Yes | Yes | Yes | No |
| Export reports | Yes | Yes | Yes | Yes |

## 8. Project-Scoped Authorization

Project-scoped authorization is one of the most important backend improvements.

The backend uses middleware to load the project from:

- URL params such as `/projects/:projectId`
- request body fields such as `projectId`
- task records when updating task status or editing/deleting tasks
- report records when editing/deleting Hourenso reports

After the project is loaded, `authGetProject` checks whether:

- the user is a PM, or
- the user is a member of the project

This prevents users from accessing another project by manually changing an ID in the URL or API request.

## 9. Frontend Features

### 9.1 Authentication Pages

The application includes login and signup screens. Users can register with a role, then log in to access protected pages.

Protected routes redirect unauthenticated users to the login page.

### 9.2 Main Layout

The main app layout includes:

- sidebar navigation
- top bar
- language toggle
- user profile section
- logout button
- responsive mobile sidebar

### 9.3 Dashboard

The dashboard shows:

- active projects
- pending tasks
- reports this week
- glossary term count
- recent Hourenso activity
- quick action buttons

Dashboard data is fetched from the backend and scoped by role.

### 9.4 Projects

The Projects page supports:

- list active projects
- create project
- delete project
- show member count
- show preferred reporting language tag
- manage members for PM users

PM users can open a member management modal to add or remove project members.

### 9.5 Tasks

The Tasks page supports:

- select project
- list tasks by project
- create task
- edit task title, description, and assignee
- delete task
- update task status by cycling through statuses
- assign tasks only to project members

Task status cycling is optimized for demo because users can update progress directly from the task list.

### 9.6 IT Glossary

The Glossary page supports:

- server-side search
- server-side pagination
- add glossary terms
- import glossary terms from CSV/XLSX
- duplicate detection
- invalid row skipping
- role restriction for BrSE-only write operations

The glossary improves terminology consistency across the team.

### 9.7 Hover-to-Translate

Known glossary terms are highlighted in project/task/report text. Hovering over a highlighted term shows English, Vietnamese, and Japanese translations.

This feature helps users understand technical terms without leaving the workflow.

### 9.8 Select-to-Translate

Authenticated users can select text anywhere in the app. A floating translate button appears near the selection. Clicking it shows translations in English, Vietnamese, and Japanese.

The backend checks the custom glossary first. If no glossary match exists, it falls back to DeepL when configured.

### 9.9 Hourenso Reporting

The Hourenso page supports:

- select project
- list reports
- create report
- edit report
- delete report
- quality check before submission
- export reports to Excel
- include project preferred language in export

Hourenso sections:

- Houkoku: report/current status
- Renraku: shared information
- Soudan: consultation/decision request

The quality check is rule-based and helps users improve report clarity before submitting.

## 10. Backend Features

### 10.1 REST API

The backend exposes REST endpoints for:

- authentication
- projects
- project members
- tasks
- glossary
- translation
- Hourenso reports
- dashboard statistics

### 10.2 Standardized Error Responses

Errors are returned with a consistent shape:

```json
{
  "message": "Human-readable error message",
  "error": {
    "code": "ERROR_CODE",
    "status": 400
  }
}
```

This keeps frontend error handling simple while still giving enough information for debugging.

### 10.3 Security Middleware

The backend uses:

- Helmet for security headers
- express-rate-limit for API rate limiting
- CORS origin filtering
- JSON body size limit
- JWT auth middleware
- role authorization middleware
- project access middleware

### 10.4 Glossary Import

Glossary import accepts parsed rows from the frontend. The backend:

- requires a non-empty terms array
- limits imports to 500 rows
- validates required trilingual fields
- normalizes base terms
- skips duplicates inside the uploaded file
- skips duplicates already in the database
- returns imported/skipped counts

### 10.5 Dashboard Aggregation

The dashboard endpoint calculates:

- active project count
- pending task count
- reports this week
- glossary term count
- recent reports

Queries are role-aware. PM users see broader project data, while non-PM users see scoped data.

## 11. Performance Optimizations

Frontend optimizations:

- Route-level lazy loading using `React.lazy`.
- React Query caching with stale time and garbage collection time.
- ExcelJS is lazy-loaded only when importing/exporting Excel.
- Glossary search and pagination are handled server-side.

Backend optimizations:

- Read-only queries use `.lean()`.
- Project scoping is pushed into MongoDB queries instead of filtering after fetching.
- Dashboard counts run in parallel.
- MongoDB indexes are added for common project/task/report queries.
- Translation glossary usage count is updated atomically.

Note: ExcelJS is larger than the previous SheetJS dependency, but it removes the high-severity audit warning from the unpatched `xlsx` package. It is dynamically imported, so it does not increase the initial app bundle.

## 12. Testing

Automated backend tests cover:

- project-scoped task access
- blocking non-members
- invalid task statuses
- assignee validation
- Japanese client write restrictions
- glossary duplicate validation
- glossary import
- preferred language validation
- cascade deletion
- malformed project IDs
- RBAC helper logic

Current automated status:

- lint passes
- tests pass
- production build passes
- npm audit reports zero high vulnerabilities after dependency updates

## 13. Deployment

Recommended deployment:

- Frontend: Vercel, Netlify, or static host
- Backend: Render, Railway, Fly.io, or Node host
- Database: MongoDB Atlas

Important environment variables:

- `DATABASE_URI`
- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`
- `JWT_EXPIRES_IN`
- `DEEPL_API_URL`
- `DEEPL_API_KEY`
- `FRONTEND_ORIGIN`
- `VITE_API_BASE_URL`

## 14. Demo Flow

Recommended demo roles:

- PM: create project, manage members, create/edit/delete task, view dashboard
- BrSE: import glossary, add glossary term, create task, hover translate
- Developer: update task status, create Hourenso report, edit report, export Excel
- Japanese client: verify view-only access

The full role-based demo script is documented in `docs/ROLE_BASED_DEMO_SCRIPT.md`.

## 15. Limitations

BridgeSync is strong for a course MVP, but it is not a complete production SaaS system yet.

Remaining limitations:

- No real-time collaboration or WebSocket updates.
- No frontend E2E test suite yet.
- No advanced audit logging for sensitive actions.
- No password reset flow.
- No email verification.
- No file attachment support for tasks/reports.
- No advanced admin dashboard for user management.
- Hourenso quality check is rule-based, not a real LLM-powered AI system.

## 16. Conclusion

BridgeSync successfully implements the core scope of a trilingual, role-based project management tool for Japanese-Vietnamese offshore software teams. It provides strong demo value through project-scoped RBAC, glossary-assisted translation, Hourenso reporting, Excel import/export, and role-based workflows.

The current package is suitable for course submission and demonstration. The strongest technical points are backend RBAC, refresh token rotation, glossary import, structured reporting, and optimized frontend code splitting.

# BridgeSync UAT and Demo Checklist

Use this checklist before submission or live demo. The goal is to prove the MVP matches the proposal: trilingual project management, project-scoped RBAC, glossary-assisted translation, and Hourenso reporting.

## 1. Environment

- [ ] Frontend dependencies installed with `npm ci`.
- [ ] Backend dependencies installed with `cd server && npm ci`.
- [ ] `server/.env` exists and contains `DATABASE_URI`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, and `JWT_EXPIRES_IN`.
- [ ] Optional: `DEEPL_API_KEY` configured for live translation fallback.
- [ ] `npm run lint` passes.
- [ ] `npm test` passes.
- [ ] `npm run build` passes.
- [ ] `npm run dev` starts frontend and backend without errors.

## 2. Demo Accounts

Prepare at least four users:

| Role | Demo purpose |
| --- | --- |
| PM | Project creation, deletion, global dashboard visibility |
| BrSE | Project/task creation and glossary term creation |
| Developer | Task status updates and Hourenso report creation |
| Japanese client | View-only access to assigned project data |

## 3. Authentication and Session

- [ ] User can sign up with name, email, password, and role.
- [ ] User can log in and reaches Dashboard.
- [ ] Invalid login shows an error.
- [ ] Protected routes redirect unauthenticated users to login.
- [ ] Expired access token can be refreshed by refresh token.
- [ ] Logout clears local session.

## 4. Project-Scoped RBAC

- [ ] PM can create a project.
- [ ] PM/BrSE project creator is automatically added as a member.
- [ ] PM/BrSE can choose a preferred project language: EN, VI, or JA.
- [ ] Project cards show the preferred language tag.
- [ ] PM can add project members from the member management modal.
- [ ] PM can remove project members from the member management modal.
- [ ] Project member can view assigned project.
- [ ] Non-member cannot access project details by manually changing the project ID.
- [ ] Non-member cannot access `/api/projects/:id/members`.
- [ ] PM can delete a project.
- [ ] Project deletion removes related tasks and Hourenso reports.

## 5. Task Management

- [ ] Project selector only shows projects visible to the current user.
- [ ] PM/BrSE can create tasks in an accessible project.
- [ ] PM/BrSE can edit task title, description, and assignee.
- [ ] PM/BrSE can delete a task.
- [ ] Task title is required.
- [ ] Assignee must be a project member.
- [ ] Developer can update task status for an accessible project.
- [ ] Invalid task status is rejected by the API.
- [ ] Japanese client cannot create tasks or update task status.

## 6. Glossary and Translation

- [ ] Any authenticated user can view glossary terms.
- [ ] BrSE can add a new trilingual glossary term.
- [ ] BrSE can import glossary terms from `.csv` or `.xlsx`.
- [ ] Import accepts columns such as `baseTerm`, `en`, `vi`, and `ja`.
- [ ] Import skips invalid rows and duplicate terms without crashing.
- [ ] Non-BrSE cannot add glossary terms.
- [ ] Duplicate glossary terms are rejected case-insensitively, for example `API` vs `api`.
- [ ] Hover-to-translate highlights known glossary terms in task/report text.
- [ ] Select-to-translate appears only when authenticated.
- [ ] Select-to-translate returns glossary source for exact glossary matches.
- [ ] If DeepL is unavailable or unconfigured, translation gracefully returns original text with source label.

## 7. Hourenso Reporting

- [ ] Project member can view reports for accessible project.
- [ ] Non-member cannot view reports by manually changing project ID.
- [ ] PM, BrSE, and Developer can create reports.
- [ ] PM, BrSE, and Developer can edit reports.
- [ ] PM, BrSE, and Developer can delete reports.
- [ ] Japanese client cannot create reports.
- [ ] Houkoku fields `currentStatus`, `progress`, `issues`, and `nextSteps` are required.
- [ ] Soudan options are stored as an array.
- [ ] Invalid Soudan deadline is rejected.
- [ ] Excel export downloads a workbook with visible report fields.
- [ ] Excel export includes the project's preferred language.

## 8. Dashboard

- [ ] Dashboard loads active project count, pending task count, reports this week, glossary count, and recent activity.
- [ ] PM dashboard reflects all active projects.
- [ ] Non-PM dashboard reflects assigned projects and personal pending tasks.
- [ ] Stats refresh without page reload.

## 9. Backend Security and API Hygiene

- [ ] API responses use a consistent `{ message, error: { code, status } }` shape on errors.
- [ ] Refresh tokens are stored hashed in the database.
- [ ] Refresh token calls rotate and return a new refresh token.
- [ ] Helmet security headers are enabled.
- [ ] API rate limiting returns 429 for excessive requests.
- [ ] Glossary supports server-side search and pagination.

## 10. UI and Resilience

- [ ] Language toggle switches EN/VI/JA labels without reload.
- [ ] Main protected layout is usable on common laptop and mobile widths.
- [ ] Error boundary shows a reload fallback instead of a blank screen if a page crashes.
- [ ] Loading and empty states are visible for dashboard, projects, tasks, glossary, and Hourenso pages.

## 11. Acceptance Criteria

The MVP is ready for course demo when:

- [ ] All automated checks pass.
- [ ] Each role can complete its expected workflow.
- [ ] Manual ID changes cannot reveal another project member's data.
- [ ] Translation and Hourenso features are demonstrated with real data.
- [ ] Deployment URL or local demo instructions are ready.
- [ ] Role-based demo script in `docs/ROLE_BASED_DEMO_SCRIPT.md` is rehearsed.

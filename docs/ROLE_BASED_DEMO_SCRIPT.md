# BridgeSync Role-Based Demo Script

Use this flow for the final presentation. Capture 3-5 screenshots from the marked checkpoints if screenshots are required.

## Screenshot Set

1. `01-pm-dashboard.png` — PM dashboard showing project/task/report/glossary stats.
2. `02-pm-project-members.png` — PM project page with the member management modal open.
3. `03-brse-glossary-import.png` — BrSE glossary page after CSV/XLSX import result.
4. `04-developer-task-hourenso.png` — Developer task status update or Hourenso report form.
5. `05-client-view-only.png` — Japanese client view showing no create/edit/delete controls.

## 1. PM Flow

Goal: prove project ownership, member management, scoped data, and destructive actions.

1. Log in as PM.
2. Open Dashboard and point out active projects, pending tasks, reports this week, and glossary count.
3. Open Projects.
4. Create a project with preferred language `JA`.
5. Open the member management modal on that project.
6. Add a BrSE and Developer to the project.
7. Remove a member and add them back to show both directions.
8. Open Tasks and create a task assigned to the Developer.
9. Edit the task title/assignee, then delete a disposable demo task.
10. Delete a disposable project and explain that tasks/reports cascade.

Expected result: PM can manage project structure and members; non-members cannot access project data by ID.

## 2. BrSE Flow

Goal: prove bridge-specific glossary and communication support.

1. Log in as BrSE.
2. Open Glossary.
3. Import a CSV/XLSX file with 5 terms.
4. Search for one imported term.
5. Add one manual trilingual term.
6. Open Projects or Tasks and hover a highlighted glossary term.
7. Select any sentence and use Select-to-Translate.

Expected result: BrSE can maintain terminology at scale and support trilingual collaboration.

## 3. Developer Flow

Goal: prove developers can work inside assigned project scope without admin controls.

1. Log in as Developer.
2. Open Tasks.
3. Select the assigned project.
4. Cycle a task status from `ongoing` to `completed` or `delayed`.
5. Open Hourenso.
6. Create a report and show the quality check score.
7. Edit the report once, then export reports to Excel.

Expected result: Developer can update work and submit structured Hourenso reports, but cannot manage project members or create projects.

## 4. Japanese Client Flow

Goal: prove view-only access.

1. Log in as Japanese client.
2. Open Projects, Tasks, Glossary, and Hourenso.
3. Confirm create/edit/delete controls are not visible for restricted actions.
4. Try viewing assigned project data.
5. Optionally try a protected API action from browser dev tools or Postman and show the 403 response.

Expected result: client can read assigned information but cannot mutate tasks, reports, glossary, or project membership.

## 5. Security/API Talking Points

- Access tokens are short-lived.
- Refresh tokens are stored hashed in MongoDB and rotated on refresh.
- Backend uses project-scoped middleware for project, task, and Hourenso routes.
- Backend returns consistent error responses with `message` and `error.code`.
- Helmet and rate limiting are enabled for the Express API.

# BridgeSync

BridgeSync is a specialized project management platform built to resolve the "lost in translation" hurdles between "High-Context" Japanese clients and "Low-Context" Vietnamese offshore IT development teams. 

Unlike generic tools like Jira which fail to capture cultural nuances and place a heavy translation burden on Bridge System Engineers (BrSEs), BridgeSync aims to reduce manual translation time, minimize requirement-related rework, and establish clear communication protocols.

This project was built as part of the ISYS2101 - Software Engineering Project Management university course.

## 🚀 MVP Setup

The MVP is built with a modern Full-Stack MERN tech stack:

**Frontend:**
*   **Core:** React (v19) + Vite
*   **Styling:** Tailwind CSS (v4)
*   **State & Caching:** React Query + LocalStorage
*   **Internationalization (i18n):** react-i18next (EN/VI/JP)
*   **Icons:** Lucide React
*   **Excel Export:** SheetJS (xlsx)

**Backend:**
*   **Server:** Node.js + Express
*   **Database:** MongoDB + Mongoose
*   **Authentication:** JSON Web Tokens (JWT) & bcrypt
*   **External APIs:** DeepL API integration for dynamic translation fallback

## 📦 Installation & Usage

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Start the development server:**
    ```bash
    npm run dev
    ```
3.  **Build for production:**
    ```bash
    npm run build
    ```

## 📖 Features Overview

For a detailed breakdown of the core features (Bilingual Dual-View, Smart Hover-to-Translate, and Automated Hourenso Templates), please see the [FEATURES.md](./FEATURES.md) file.

## 🧭 What to do next (Next Steps)

The frontend MVP and backend REST API foundations are established. To turn this into a fully operational application, consider the following next steps:

1.  **Connect Frontend to Backend API:**
    *   Currently, the React frontend uses `React Query` but might still rely on local mocked data. Replace the mock data with actual `axios` or `fetch` calls to the existing Express endpoints (e.g., `/api/projects`, `/api/tasks`, `/api/auth`).
    *   Implement user authentication flow on the frontend using the new JWT-based API routes.
2.  **Hourenso CRUD Capabilities:**
    *   The `HourensoReports` MongoDB model is ready, but the controllers and routes (`hourensoRoutes.js`) need to be built on the backend.
    *   Build the frontend forms to create, edit, and delete Hourenso reports, moving beyond the current static display.
3.  **Expand IT Glossary Features:**
    *   Use the existing `/api/glossary` endpoints to allow BrSEs to add, edit, and delete terms from the shared glossary directly from the application UI.

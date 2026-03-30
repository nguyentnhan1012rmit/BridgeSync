# BridgeSync

BridgeSync is a specialized project management platform built to resolve the "lost in translation" hurdles between "High-Context" Japanese clients and "Low-Context" Vietnamese offshore IT development teams. 

Unlike generic tools like Jira which fail to capture cultural nuances and place a heavy translation burden on Bridge System Engineers (BrSEs), BridgeSync aims to reduce manual translation time, minimize requirement-related rework, and establish clear communication protocols.

This project was built as part of the ISYS2101 - Software Engineering Project Management university course.

## 🚀 MVP Setup

The MVP is built with a modern React tech stack:
*   **Frontend:** React (v19) + Vite
*   **Styling:** Tailwind CSS (v4)
*   **State & Caching:** React Query + LocalStorage
*   **Internationalization (i18n):** react-i18next (EN/VI/JP)
*   **Icons:** Lucide React
*   **Excel Export:** SheetJS (xlsx)

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

The frontend MVP scaffold is complete. To turn this into a fully functional application, consider the following next steps:

1.  **Backend Integration & Database:**
    *   Initialize a Node.js/Express backend (or Firebase/Supabase).
    *   Design the MongoDB/PostgreSQL schema for Users, Projects, Tasks, and Hourenso Reports.
    *   Replace the mock data in the React components with real API calls using React Query.
2.  **Authentication & Roles (RBAC):**
    *   Implement user authentication (e.g., using JWT or a service like Clerk/Auth0).
    *   Create roles for BrSEs, Vietnamese Developers, and Japanese Stakeholders to control data visibility and edit permissions.
3.  **Real Translation API Connection:**
    *   Currently, the "Hover-to-Translate" feature uses a local, mocked IT Glossary.
    *   Integrate DeepL Pro or Google Cloud Translation APIs.
    *   Implement an API route on the backend to handle the translation requests securely (keeping API keys hidden from the frontend).
4.  **Hourenso CRUD Capabilities:**
    *   Build the forms to create, edit, and delete Hourenso reports, moving beyond the current static display.
    *   Implement form validation to ensure all required Houkoku/Renraku/Soudan fields are completed.
5.  **Expand IT Glossary Features:**
    *   Allow BrSEs to add, edit, and delete terms from the shared glossary to train the custom dictionary over time.

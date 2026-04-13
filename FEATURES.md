# BridgeSync Detailed Features

BridgeSync contains three core MVP features specifically designed to bridge the gap between Japanese business culture and Vietnamese offshore development teams.

## 1. Bilingual Dual-View Interface

**The Problem:** Traditional Project Management tools force teams to use a single workspace language or rely heavily on external translation tools, causing context switching and confusion.

**The Solution:** A globally synchronized state that allows instant language switching without reloading the page.

*   **Implementation:** Powered by `react-i18next`.
*   **Supported Languages:** English (EN - default for academic grading), Vietnamese (VI), and Japanese (JP).
*   **Mechanics:**
    *   A `LanguageToggle` component sits in the top navigation bar.
    *   Clicking a language flag instantly changes all static UI text (navigation, buttons, labels) by pulling from the respective JSON dictionary in `src/locales/`.
    *   The user's language preference is saved in `localStorage`, meaning the application remembers their choice across sessions.

## 2. Smart Hover-to-Translate & Custom IT Glossary

**The Problem:** Bridge System Engineers (BrSEs) waste hours manually translating repetitive IT jargon (e.g., "API", "CI/CD", "Sprint"). Generic translators like Google Translate often fail to provide technically accurate context for these terms.

**The Solution:** An interactive terminology system that provides instant, culturally and technically accurate translations on hover.

*   **Implementation:** Custom `TranslateTooltip` component and `TasksPage` highlighting logic.
*   **Mechanics:**
    *   When an offshore developer is reading a task card written in Japanese (or vice versa), complex IT terms are automatically detected and highlighted with a dashed underline.
    *   Hovering over the term reveals a clean, animated tooltip showing the term's exact meaning in English, Vietnamese, and Japanese.
    *   These definitions are sourced from a curated **IT Glossary**, ensuring niche accuracy rather than relying on generic API translations.
    *   The `GlossaryPage` provides a searchable, filterable table for users to study or reference these terms independently.

## 3. Automated Hourenso (報連相) Templates

**The Problem:** Japanese stakeholders expect rigorous, structured reporting based on the cultural concept of **Hourenso** (Houkoku - Report, Renraku - Contact, Soudan - Consult). Vietnamese offshore teams often struggle to format their updates to meet these implicit expectations.

**The Solution:** Pre-built reporting interfaces that naturally guide users to write updates in the correct cultural format.

*   **Implementation:** The `HourensoPage` component.
*   **Mechanics:**
    *   Reports are broken down into the three mandatory sections:
        *   **報告 (Houkoku) — Report:** Current status, progress, issues, next steps.
        *   **連絡 (Renraku) — Contact/Share:** Information that needs to be shared with the broader team without requiring immediate action.
        *   **相談 (Soudan) — Consult:** specific topics requiring stakeholder decisions, proposed options, and deadlines.
    *   **One-Click Export to Excel:** Because many Japanese corporate stakeholders heavily rely on spreadsheets and might be resistant to adopting a new web portal, the application includes a `Download` button. This button uses the `xlsx` library to instantly compile all active reports into a formatted Excel file, bridging the gap between modern agile tools and traditional corporate workflows.

## 4. Secure Backend & Translation Fallback Strategy

**The Problem:** Storing sensitive API keys on the frontend is a security risk, and a static mock glossary doesn't scale. Moreover, different project members need explicit data boundaries to avoid unintentional edits.

**The Solution:** A dedicated Node.js/Express backend that handles data persistence, authentication, and secure translation API proxying.

*   **Implementation:** Express REST API, MongoDB (Mongoose), JWT authentication, Document referencing.
*   **Mechanics:**
    *   **Role-Based Access Control (RBAC):** Users authenticate via JWT. Specific roles (`PM`, `BrSE`, `Developer`, `Japanese client`) determine API permissions. Middlewares like `authorize('PM')` ensure strict scoping over endpoints (e.g., users can only view `scopedProject`s they belong to).
    *   **Translation Fallback System:** The backend's `/api/translate` endpoint orchestrates translations gracefully. It **first** queries the custom `ITGlossary` database for high-accuracy terms. If a definition doesn't exist, it safely communicates with the external **DeepL API** (concealing the server's `DEEPL_API_KEY`) to fetch and return the translation.

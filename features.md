
# SanityTrack: Feature & Engine Guide

This document provides a comprehensive overview of the SanityTrack application, its features, user roles, and the underlying AI engine. Use this as a guide for creating documentation and demonstration videos.

## 1. Application Overview

**SanityTrack is an AI-powered operating system for restaurants.** It's designed to automate tedious tasks, provide proactive insights, and empower every member of the team, from the owner to the kitchen staff. It consolidates operations, compliance, team management, and quality control into a single, intelligent platform.

---

## 2. User Roles & Dashboards

The application is built around four distinct user roles, each with a tailored dashboard.

*   **Owner:** The high-level decision-maker. The Owner dashboard focuses on **Key Performance Indicators (KPIs)**, strategic oversight, system administration, and high-priority approvals. They command the AI Sentinel Agent and have access to all manager-level functions.
*   **Manager:** The on-the-ground operator. The Manager dashboard is for day-to-day operations: **shift scheduling, inventory management, quality control, task delegation,** and handling AI-generated alerts.
*   **Employee:** The frontline team member. The Employee dashboard is a focused hub for action: viewing their **schedule, completing assigned tasks, reporting issues,** and accessing training materials.
*   **Health Department:** An external stakeholder. The Health Department dashboard provides a portal for inspectors to **review compliance data, log inspection reports,** and communicate directly with business owners about health and safety issues.

---

## 3. Core Feature Guide

This section details the primary features of the application, organized by operational theme.

### Theme 1: AI Sentinel & Autonomous Operations

*   **AI Monitoring Setup (Owner):**
    *   **Location:** Owner Dashboard -> Strategic Command & Administration -> AI Sentinel & Security -> AI Monitoring Setup.
    *   **Functionality:** Owners can add virtual "cameras" and provide natural language instructions (prompts) telling the AI what to look for (e.g., "Count customers in line," "Check for spills").
    *   **How it Works:** Simulates analyzing a video feed by sending a representative image and the owner's prompt to an AI flow (`cameraAnalysisFlow.ts`), which returns structured observations.

*   **Sentinel Agent Rules (Owner):**
    *   **Location:** Owner Dashboard -> System Administration -> AI Agent Rules.
    *   **Functionality:** The "brain" of the AI. Owners can enable/disable predefined rules or create custom "IF... THEN..." rules in plain English (e.g., "IF an employee is idle, THEN create a task to restock napkins").
    *   **How it Works:** The `master-agent-decision-flow.ts` takes the owner's rules and a simulated "current state" of the business. It uses AI tool-calling to decide which action (like creating a task or sending an email) to take.

*   **Service Recovery & Wait Time Alerts (Owner/Employee):**
    *   **Location:** Owner Dashboard (for authorization), Employee Dashboard (for action).
    *   **Functionality:** An owner uses their camera to scan for long wait times (`owner-service-alert-widget.tsx`). If the AI (`analyze-wait-time-flow.ts`) detects an issue, it creates an alert for the owner. The owner can then authorize a recovery action (e.g., a gift card), which creates a task on the assigned employee's dashboard.

### Theme 2: Team & Quality Management

*   **Shift Planner (Manager/Owner):**
    *   **Location:** Manager Dashboard -> Shift Planner.
    *   **Functionality:** Managers define shifts and use the AI (`ai-shift-planner.ts`) to generate an optimal schedule based on employee availability. They can then manually adjust and publish the schedule, making it visible to employees.

*   **Live Time Clock & AI Punctuality Warnings (Manager):**
    *   **Location:** Manager Dashboard -> Live Time Clock Feed.
    *   **Functionality:** Simulates a live feed of employee clock-ins. If an employee is late, the manager can click a button to have the AI (`generate-warning-letter-flow.ts`) draft a professional warning email.

*   **Quality Control & Golden Standards (Manager/Owner):**
    *   **Location:** Manager Dashboard -> Quality Control.
    *   **Functionality:** Managers define "golden standard" photos for menu items. They can then use the AI (`compare-food-quality-flow.ts`) to compare a photo of a freshly made dish against the standard, receiving a quality score and specific feedback. Failures can trigger alerts on the KDS and create tasks for employees.

*   **Kitchen Display System (KDS) Alerts:**
    *   **Location:** Standalone page at `/kds/display`.
    *   **Functionality:** A dedicated, always-on screen for the kitchen. When a QA check fails, this screen flashes and sounds an alarm, showing the kitchen staff what went wrong. It's paired to a location using a unique code.

### Theme 3: Inventory & Ordering

*   **Inventory Management (Manager/Owner):**
    *   **Location:** Manager Dashboard -> Inventory.
    *   **Functionality:** A comprehensive inventory tracker using the FIFO (First-In, First-Out) method. It tracks items by batch to monitor aging and spoilage.

*   **AI-Assisted Receiving (Manager):**
    *   **Location:** Manager Dashboard -> Inventory -> "Receive Inventory" button.
    *   **Functionality:** The manager takes a photo of a paper invoice. The AI (`scan-invoice-flow.ts`) uses OCR and reasoning to read the invoice, extract line items and quantities, and match them to existing inventory items, ready to be added as new batches.

*   **AI Reorder Assistant & Purchase Orders (Manager):**
    *   **Location:** Manager Dashboard -> Inventory.
    *   **Functionality:** When inventory levels fall below their "par" (ideal) level, the manager can click a button. The AI (`generate-shopping-list-flow.ts`) creates a formatted shopping list and email subject. The manager can then submit this as a Purchase Order for owner approval.

*   **Micro-Ordering & Price Optimizer (Manager/Owner):**
    *   **Location:** Manager Dashboard -> Ordering.
    *   **Functionality:** Managers build a shopping list. The AI (`optimizeOrderFlow.ts`) then analyzes simulated prices from different suppliers (e.g., a major distributor vs. a local supermarket) and recommends a "smart-split" order to achieve the lowest total cost.

### Theme 4: Strategic Growth & Marketing

*   **AI Menu Innovation Lab (Owner):**
    *   **Location:** Owner Dashboard -> Marketing & Innovation tab.
    *   **Functionality:** Owners can input their top-selling ingredient or flavor. The AI (`suggest-menu-trends-flow.ts`) then analyzes current food trends and seasonality (e.g., upcoming holidays) to suggest new, complementary ingredients and invent two complete, themed menu item concepts (name, description, marketing angle).

*   **Ghost Shopper Program (Owner):**
    *   **Location:** Owner Dashboard -> Marketing & Innovation tab.
    *   **Functionality:** The owner can enter a customer's email and select a reward. The AI (`generate-ghost-shopper-invite-flow.ts`) drafts a professional invitation for them to act as a "secret shopper" and provide valuable, unbiased feedback.

*   **Company Announcements (Owner):**
    *   **Location:** Owner Dashboard -> Marketing & Innovation tab.
    *   **Functionality:** The owner or CEO can record and upload a video message. This announcement is then prominently displayed at the top of every employee's dashboard, ensuring high visibility for important communications.

### Theme 5: Knowledge, Training & Administration

*   **AI Onboarding (New Owners):**
    *   **Location:** Root page `/` for new, unauthenticated users.
    *   **Functionality:** A conversational AI guides new owners through a setup interview, asking about their business, menu, and tasks. A second AI (`master-onboarding-parser-flow.ts`) then parses the entire conversation transcript to pre-populate their dashboard with relevant data.

*   **Company Brain & Knowledge Base (All Roles):**
    *   **Location:** Knowledge Base (Manager/Owner), Company Brain (All).
    *   **Functionality:** Managers and Owners can upload documents (PDFs, images) to create a corporate knowledge base. The "Company Brain" is an AI assistant that *only* uses these documents to answer questions, ensuring accurate, context-aware responses (a technique known as Retrieval-Augmented Generation or RAG).

*   **Training Center (All Roles):**
    *   **Location:** Training Page.
    *   **Functionality:** Includes a "Menu Game" to test employees on menu knowledge and a "Speed Run Challenge" where they can upload videos of themselves making items to compete on a leaderboard.

*   **System Administration (Owner):**
    *   **Location:** Owner Dashboard.
    *   **Functionality:** Owners can manage team permissions, customize application branding (logo, colors), and view billing information.

---

## 4. The "Engine" - How the AI Works

SanityTrack's intelligence is powered by **Google's Gemini models** accessed through the **Genkit** framework.

*   **AI Flows (`src/ai/flows/*.ts`):** These are the core backend AI logic files. Each file defines a specific capability (e.g., `analyzeIssueFlow`, `generateScheduleFlow`). They contain the main prompt that instructs the AI, defines the expected input/output format using Zod schemas, and calls the AI model.

*   **Server Actions (`src/app/actions.ts`):** This is the **secure bridge** between the frontend (UI components) and the backend (AI Flows). When you click a button in the app, it calls a function in this file. This function then securely calls the appropriate AI flow on the server. This prevents direct, insecure communication from the user's browser to the AI.

*   **Key AI Techniques Used:**
    *   **Structured Output:** We tell the AI to always respond in a specific JSON format defined by our Zod schemas. This makes the AI's output predictable and easy to use in the UI.
    *   **Tool Calling:** The Sentinel Agent uses this technique. We give the AI a "toolbox" of functions it can use (e.g., `createTask`, `sendEmail`). Based on the prompt and its reasoning, the AI decides *if and when* to use a tool to accomplish its goal.
    *   **Retrieval-Augmented Generation (RAG):** The Company Brain uses this. Instead of answering from its general knowledge, we first "retrieve" relevant information from your uploaded documents and "augment" the prompt with that context, forcing the AI to base its answer only on your company's data.
    *   **Multi-modal Analysis:** Features like invoice scanning and food quality audits provide the AI with both text (prompts) and images, allowing it to "see" and reason about visual information.

---

## 5. How to Create a Demonstration Video (Suggested Script)

1.  **Start at the Root Page (`/`):**
    *   Show the main landing page.
    *   Explain the four user roles.
    *   Click the **Owner** quick-access button to log in.

2.  **The Owner Experience:**
    *   Briefly show the KPI dashboard.
    *   Navigate to **System Administration -> AI Agent Rules**. Explain how an owner can create custom rules for the AI.
    *   Navigate to **AI Sentinel & Security -> AI Monitoring Setup**. Add a "virtual camera" and write a prompt like "Count people in line."
    *   Click the **"Run Agent Cycle"** button. Show the result in the **Activity Log**, explaining that the AI followed the rules to take an action.
    *   Go to **Approvals** and show the pending "Hiring Request." Approve it, which will trigger the `postJobAction`.

3.  **The Manager Experience:**
    *   Switch to the **Manager** dashboard.
    *   Go to the **Shift Planner**. Add a few shifts and use the "Generate AI Schedule" button. Show how the schedule is automatically filled. Manually change one assignment, then click **"Publish Schedule."**
    *   Go to the **Inventory** page. Show the list of items. Click **"Generate Shopping List,"** show the AI-generated list, and submit it as a Purchase Order.
    *   Go to the **Ordering** page. Show the list and click **"Optimize My Order."** Explain the AI's "smart-split" recommendation and the cost savings.
    *   Go to **Quality Control**. Select the "Classic Burger" and upload a new photo to the "Dish to Audit" section. Run the AI audit and show the score and feedback.

4.  **The Employee Experience:**
    *   Switch to the **Employee** dashboard.
    *   Show that the schedule published by the manager is now visible.
    *   Show the "My Mission for Today" list, which includes tasks generated by the Manager and the Sentinel Agent.
    *   Open the **Training** page and play one round of the Menu Game.

5.  **Connecting the Dots:**
    *   This is a crucial step to show the app's power.
    *   Go back to the **Owner** dashboard. Show the `pendingPurchaseOrders` that the Manager submitted. Approve one.
    *   This shows how actions by one role create tasks or approvals for another, demonstrating a cohesive system.

By following this script, you can create a clear and compelling video that showcases the full power and intelligence of the SanityTrack application.

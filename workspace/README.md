# Live Ingredient-Level Inventory System

This is a production-ready system for real-time inventory tracking, AI-powered anomaly detection, and automated reordering suggestions.

## Tech Stack
- **Backend**: Firebase Cloud Functions (TypeScript)
- **Database**: Firestore
- **Frontend**: React, Next.js, TypeScript, Tailwind CSS
- **CI/CD**: GitHub Actions & Google Cloud Build

## Setup & Installation

1.  **Clone the repository.**
2.  **Firebase Project**: Ensure your Firebase project is configured correctly. The necessary environment variables are handled by the App Hosting setup.
3.  **Install Dependencies**:
    ```bash
    npm install
    cd functions && npm install && cd ..
    ```
4.  **Environment Variables (for AI/Supplier APIs)**:
    For local development, create a `.env` file in the root and add your `GOOGLE_API_KEY`. For deployed environments, this is handled via App Hosting secrets.

## Local Development

1.  **Start Firebase Emulators**: This is the recommended way to develop locally.
    ```bash
    firebase emulators:start
    ```
2.  **Run Frontend Dev Server**:
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:3000`, connected to the local emulators.

## Deployment

1.  **Login to Firebase**:
    ```bash
    firebase login
    ```
2.  **Deploy all services**:
    ```bash
    firebase deploy
    ```
    To deploy only specific services, use flags like `firebase deploy --only functions`.

---
This concludes the complete system blueprint.

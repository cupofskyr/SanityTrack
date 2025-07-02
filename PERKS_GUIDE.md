
# Employee Perks Program: Developer Guide

## 1. Overview
This system manages an employee perks program featuring membership cards with credit balances and mobile wallet access. It is built on Firebase (Firestore, Cloud Functions, Auth, Storage) and React.

## 2. Roles & Permissions
- **Owner**: Full read/write access to all employee perks. Can customize app branding.
- **Manager**: Access restricted to employees within their `locationId`.
- **Employee**: Read-only access to their own perks.

## 3. Crash-Proofing & "Glue" Logic
To ensure system integrity and prevent common crashes from missing data:
- **`onUserCreate` Trigger**: A Cloud Function automatically runs when a new user signs up. It creates documents in `/users` and `/employees` with default values (e.g., `role: "employee"`, `creditBalance: 0`). This guarantees that data exists for every user from the moment they are created.
- **`useAuth` Hook**: This is the frontend's single source of truth for user data. It listens for auth state changes and merges the Firebase Auth user object with the corresponding role and permission data from their `/users` document in Firestore.

## 4. Backend Architecture
- **Cloud Functions**: All business logic is handled by callable functions (`adjustBalance`, etc.). They enforce permissions and create immutable audit logs.
- **Firestore Rules**: Act as the ultimate security layer, blocking any client-side action that violates permission rules.

## 5. Frontend Architecture
- **React & TypeScript**: The UI is built with React components and strong typing.
- **`PerksManagementPage.tsx`**: A role-aware component that displays different views based on the `role` provided by the `useAuth` hook.
- **`BrandingUploaderPage.tsx`**: A feature-rich dashboard for Owners to customize the app's color scheme and logo.

## 6. Branding Integration Flow
1.  An **Owner** uses the Branding Uploader page.
2.  The logo is uploaded to **Firebase Storage** at `branding/{ownerId}/logo.ext`.
3.  The color and logo URL are saved in **Firestore** at `/branding/{ownerId}`.
4.  The `PerksManagementPage` component listens to this document and dynamically applies the styles, ensuring a consistent brand experience.

## 7. Testing with cURL
Replace `YOUR_PROJECT_ID` with your Firebase project ID and `USER_AUTH_TOKEN` with a valid Firebase Auth ID token for a user with the required permissions.

### Adjust Balance (Owner/Manager)
```bash
curl -X POST \
  -H "Authorization: Bearer USER_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data": {"employeeId": "TARGET_EMPLOYEE_UID", "amount": 50, "reason": "Monthly bonus"}}' \
  https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/adjustBalance
```

### Change Card Status (Owner/Manager)
```bash
curl -X POST \
  -H "Authorization: Bearer USER_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data": {"employeeId": "TARGET_EMPLOYEE_UID", "newStatus": "suspended"}}' \
  https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/changeCardStatus
```

/**
 * Import function triggers from their respective submodules:
 *
 * import { onCall } from "firebase-functions/v2/https";
 * import { onDocumentWritten } from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger"; // Uncomment to enable logging

// Import your HTTP handler function from your API module
import { handler as smsSettingsHandler } from "./api/settings/sms";

// Export Cloud Function with CORS enabled for smsSettings endpoint
export const smsSettings = onRequest({ cors: true }, smsSettingsHandler);

// src/lib/firebase-admin.js

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let db;
let auth;

try {
    const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
    );

    console.log("Service account available:", !!serviceAccount);

    // Extract projectId from service account or environment variables
    const projectId =
        serviceAccount.project_id ||
        process.env.FIREBASE_PROJECT_ID ||
        process.env.GCLOUD_PROJECT ||
        process.env.GOOGLE_CLOUD_PROJECT;

    console.log("Project ID found:", projectId);

    if (!projectId) {
        throw new Error('Firebase project ID not found. Set FIREBASE_PROJECT_ID environment variable or ensure it exists in your service account key.');
    }

    if (!getApps().length) {
        console.log("Initializing Firebase Admin SDK...");
        initializeApp({
            credential: cert(serviceAccount),
            projectId: projectId
        });
    }

    db = getFirestore();
    auth = getAuth();

    if (!auth) {
        throw new Error('Auth instance could not be initialized.');
    }

    console.log('Firebase Admin SDK initialized successfully with project:', projectId);
    console.log('Auth instance available:', !!auth);
} catch (e) {
    console.error('Firebase Admin SDK initialization failed:', e.message);
    console.error('Error stack:', e.stack);
    db = null;
    auth = null;
}

// Export both auth and adminAuth (for backward compatibility)
const adminAuth = auth;
export { db, auth, adminAuth };

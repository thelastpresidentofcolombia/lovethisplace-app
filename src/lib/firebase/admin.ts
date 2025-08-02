import admin from 'firebase-admin';
import { getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// IMPORTANT: Make sure the FIREBASE_SERVICE_ACCOUNT_KEY is set in your .env file
const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY || import.meta.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
);

if (!getApps().length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log('Firebase Admin SDK Initialized.');
    } catch (e) {
        console.error('Firebase Admin SDK Initialization Error:', e.stack);
    }
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();
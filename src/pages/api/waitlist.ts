import type { APIRoute } from 'astro';
// --- FIX: Use the Firebase Admin SDK for server-side operations ---
import { adminDb } from '../../lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export const POST: APIRoute = async ({ request }) => {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ message: 'Method not allowed' }), {
            status: 405,
        });
    }

    try {
        const data = await request.json();
        const email = data.email;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return new Response(JSON.stringify({ message: 'Invalid email address' }), {
                status: 400,
            });
        }

        // --- FIX: Use adminDb and FieldValue for a reliable server-side write ---
        const waitlistCollection = adminDb.collection('waitlist');
        await waitlistCollection.add({
            email: email,
            createdAt: FieldValue.serverTimestamp(),
        });

        return new Response(
            JSON.stringify({ message: 'Successfully joined the waitlist!' }),
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error('Error adding document to waitlist: ', error);
        return new Response(JSON.stringify({ message: 'Something went wrong on the server' }), {
            status: 500,
        });
    }
};
import type { APIRoute } from 'astro';
// --- FIX: Correctly import FieldValue and use adminDb directly ---
import { adminAuth, adminDb } from '../../lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
// --- END FIX ---

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
    const sessionCookie = cookies.get('session')?.value;
    if (!sessionCookie) {
        return new Response(JSON.stringify({ error: 'Not authenticated.' }), { status: 401 });
    }

    let decodedToken;
    try {
        decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    } catch (err) {
        console.error('Token verification failed:', err);
        return new Response(JSON.stringify({ error: 'Invalid session.' }), { status: 401 });
    }
    const referrerId = decodedToken.uid;

    let data: { propertyId?: string; note?: string };
    try {
        data = await request.json();
    } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON.' }), { status: 400 });
    }
    const { propertyId, note } = data;
    if (!propertyId) {
        return new Response(JSON.stringify({ error: 'propertyId is required.' }), { status: 400 });
    }

    try {
        // --- FIX: Use adminDb and the correctly imported FieldValue ---
        const doc = await adminDb.collection('notes').add({
            propertyId,
            note: note || '',
            referrerId,
            createdAt: FieldValue.serverTimestamp(),
        });
        // --- END FIX ---

        const origin = new URL(request.url).origin;
        const link = `${origin}/places/${propertyId}?ref=${referrerId}`;
        return new Response(JSON.stringify({ link }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        // Log the detailed error on the server
        console.error("Error saving note to Firestore:", err);
        return new Response(JSON.stringify({ error: 'Server error while saving note.' }), { status: 500 });
    }
};
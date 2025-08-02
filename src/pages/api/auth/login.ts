import type { APIRoute } from 'astro';
import { adminAuth } from '../../../lib/firebase/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
    const { idToken } = await request.json();

    if (!idToken) {
        return new Response(JSON.stringify({ error: 'ID token is missing.' }), { status: 400 });
    }

    try {
        // Set session expiration to 5 days.
        const expiresIn = 60 * 60 * 24 * 5 * 1000;

        // Create the session cookie. This will also verify the ID token.
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

        cookies.set('session', sessionCookie, {
            httpOnly: true,
            secure: import.meta.env.PROD, // Use secure cookies in production
            maxAge: expiresIn / 1000,
            path: '/',
            sameSite: 'lax',
        });

        return new Response(JSON.stringify({ status: 'success' }), { status: 200 });

    } catch (error) {
        console.error('Error creating session cookie:', error);
        return new Response(JSON.stringify({ error: 'Invalid token or server error.' }), { status: 401 });
    }
};
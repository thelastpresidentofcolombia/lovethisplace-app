// src/auth/login.ts

import { auth } from '../lib/firebase-admin';

// ...existing code...

try {
    if (!auth) {
        throw new Error('Firebase Auth instance is not initialized.');
    }

    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    cookies.set('session', sessionCookie, {
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'none',
        maxAge: expiresIn / 1000,
    });

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
    });
} catch (error) {
    console.error('Error creating session cookie:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
    });
}

// ...existing code...
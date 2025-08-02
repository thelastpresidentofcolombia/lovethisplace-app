// src/pages/api/auth/logout.ts
import type { APIRoute } from 'astro';
export const POST: APIRoute = ({ cookies }) => {
    cookies.delete('session', { path: '/' });
    return new Response(null, {
        status: 303,
        headers: { Location: '/login' },
    });
};

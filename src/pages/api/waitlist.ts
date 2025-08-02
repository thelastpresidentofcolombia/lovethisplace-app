import type { APIRoute } from 'astro';
import { db } from '../../lib/firebase'; // Import our database connection
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const POST: APIRoute = async ({ request }) => {
    // Check if the request is a POST request
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ message: 'Method not allowed' }), {
            status: 405,
        });
    }

    try {
        const data = await request.json();
        const email = data.email;

        // Simple email validation
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return new Response(JSON.stringify({ message: 'Invalid email address' }), {
                status: 400,
            });
        }

        // Add the new email to the 'waitlist' collection in Firestore
        const waitlistCollection = collection(db, 'waitlist');
        await addDoc(waitlistCollection, {
            email: email,
            createdAt: serverTimestamp(), // Add a timestamp
        });

        // Return a success response
        return new Response(
            JSON.stringify({ message: 'Successfully joined the waitlist!' }),
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error('Error adding document: ', error);
        return new Response(JSON.stringify({ message: 'Something went wrong' }), {
            status: 500,
        });
    }
};
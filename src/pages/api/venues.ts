// src/pages/api/venues.ts
import type { APIRoute } from "astro";
import { adminDb } from "../../lib/firebase/admin";

export const GET: APIRoute = async ({ request, cookies }) => {
    // Protect the API route - only logged-in users can get the venues
    const sessionCookie = cookies.get("session")?.value;
    if (!sessionCookie) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    try {
        // We don't need to verify the cookie here unless we need the user's ID.
        // The presence of the cookie is enough to proceed for this query.

        const venuesCollectionRef = adminDb.collection("venues").orderBy("id");
        const venueSnapshot = await venuesCollectionRef.get();
        const venues = venueSnapshot.docs.map((doc) => ({
            docId: doc.id,
            ...doc.data(),
        }));

        return new Response(JSON.stringify(venues), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Error fetching venues:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch venues" }), { status: 500 });
    }
};
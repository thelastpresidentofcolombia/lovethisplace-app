// This script imports villa data from a CSV file to Firebase
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
initializeApp({
    credential: cert(serviceAccount)
});
const db = getFirestore();

// Read and parse CSV
const csvFile = fs.readFileSync('./villas.csv', 'utf8');
const records = parse(csvFile, {
    columns: true,
    skip_empty_lines: true
});

async function importVillas() {
    try {
        console.log(`Importing ${records.length} villas...`);

        // Create a batch write
        const batch = db.batch();

        // Process each record
        records.forEach((villa, index) => {
            // Create a document with an ID based on the villa name or use an index
            const id = (villa.id || `villa-${index + 1}`).toString();
            const docRef = db.collection('venues').doc(id);

            // Clean up the data and add image paths
            const villaData = {
                id: id,
                name: villa.name || `Villa ${index + 1}`,
                neighborhood: villa.neighborhood || 'Unknown',
                guests: parseInt(villa.guests) || 2,
                bedrooms: parseInt(villa.bedrooms) || 1,
                bathrooms: parseInt(villa.bathrooms) || 1,
                description: villa.description || '',
                imageUrls: [
                    `/images/villas/${id}/1.jpg`,
                    `/images/villas/${id}/2.jpg`,
                    `/images/villas/${id}/3.jpg`
                ].filter(path => {
                    // Only include images that exist (optional check)
                    try {
                        return fs.existsSync(`./public${path}`);
                    } catch {
                        return true; // Include by default if check fails
                    }
                }),
                // Add any other fields from your CSV
            };

            batch.set(docRef, villaData);
        });

        // Commit the batch
        await batch.commit();
        console.log('Import completed successfully!');
    } catch (error) {
        console.error('Error importing villas:', error);
    }
}

importVillas();

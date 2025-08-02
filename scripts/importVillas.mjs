import fs from 'fs';
import Papa from 'papaparse';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Load environment variables from .env file
dotenv.config();

console.log('Starting villa import script...');

// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: process.env.PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.PUBLIC_FIREBASE_APP_ID,
};

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const venuesCollection = collection(db, 'venues');

console.log('Firebase initialized.');

// --- Read and Parse CSV File ---
const csvFilePath = './villas.csv';
const csvFile = fs.readFileSync(csvFilePath, 'utf8');

Papa.parse(csvFile, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
        console.log(`Found ${results.data.length} villas to import.`);

        for (const villa of results.data) {
            try {
                // --- THIS IS THE FIX: Using the correct column header 'RELATIVE-FILE-PATH' ---
                const imageFolderPath = villa['RELATIVE-FILE-PATH'] || '';

                const imageUrls = [];
                if (imageFolderPath) {
                    for (let i = 1; i <= 10; i++) {
                        // We also need to fix the path separators for the web
                        const webPath = imageFolderPath.replace(/\\/g, '/').replace('public', '');
                        imageUrls.push(`${webPath}/${i}.webp`);
                    }
                }

                const venueData = {
                    id: villa.ID,
                    name: villa.TITLE,
                    bedrooms: parseInt(villa.BEDROOMS) || 0,
                    guests: villa.GUESTS,
                    description: villa.DESCRIPTION,
                    amenities: villa.AMENITIES ? villa.AMENITIES.split(',').map(item => item.trim()) : [],
                    price: villa.PRICE,
                    imageFolderPath: imageFolderPath, // Storing the original path
                    neighborhood: villa.NEIGHBORHOOD,
                    imageUrls: imageUrls,
                };

                await addDoc(venuesCollection, venueData);
                console.log(`✅ Successfully imported: ${venueData.name}`);

            } catch (error) {
                console.error(`❌ Failed to import: ${villa.TITLE}`, error);
            }
        }
        console.log('\n🎉 Import complete!');
        process.exit(0);
    }
});
import type { APIRoute } from 'astro';
import { db } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import fs from 'fs/promises';
import Papa from 'papaparse';

export const GET: APIRoute = async () => {
    console.log('--- Starting Villa Import via API ---');

    try {
        const csvFilePath = './villas.csv';
        console.log(`Reading CSV file at: ${csvFilePath}`);
        const csvFile = await fs.readFile(csvFilePath, 'utf8');
        console.log('✅ File read successfully.');

        const results = Papa.parse(csvFile, {
            header: true,
            skipEmptyLines: true,
        });

        const villas = results.data as any[];
        console.log(`Found ${villas.length} villas to import.`);

        const venuesCollection = collection(db, 'venues');
        let importCount = 0;

        for (const villa of villas) {
            try {
                const imageFolderPath = villa['RELATIVE-FILE-PATH'] || '';
                const imageUrls = [];
                if (imageFolderPath) {
                    for (let i = 1; i <= 10; i++) {
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
                    neighborhood: villa.NEIGHBORHOOD,
                    imageUrls: imageUrls,
                };

                await addDoc(venuesCollection, venueData);
                console.log(`✅ Successfully imported: ${venueData.name}`);
                importCount++;

            } catch (error) {
                console.error(`❌ Failed to import row: ${villa.TITLE}`, error);
            }
        }

        const message = `<h1>Import Complete!</h1><p>Successfully imported ${importCount} of ${villas.length} villas. Check your terminal for details and your Firebase console to see the new 'venues' collection.</p>`;
        return new Response(message, { status: 200, headers: { 'Content-Type': 'text/html' } });

    } catch (error) {
        console.error('❌ A critical error occurred:', error);
        const message = `<h1>Import Failed</h1><p>A critical error occurred. Check the terminal for details.</p><pre>${error.message}</pre>`;
        return new Response(message, { status: 500, headers: { 'Content-Type': 'text/html' } });
    }
};
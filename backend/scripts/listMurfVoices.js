import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.MURF_API_KEY;

if (!API_KEY) {
    console.error("❌ MURF_API_KEY is missing in .env");
    process.exit(1);
}

async function listVoices() {
    try {
        console.log("Fetching Murf.ai voices...");
        const response = await fetch('https://api.murf.ai/v1/speech/voices', {
            method: 'GET',
            headers: {
                'api-key': API_KEY,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`API Error: ${response.status} ${err}`);
        }

        const voices = await response.json();
        
        // Filter specifically for Hindi and English
        const hindi = voices.filter(v => v.locale.includes('hi-IN'));
        const english = voices.filter(v => v.locale.includes('en-US'));

        console.log(`\n--- FOUND ${hindi.length} HINDI VOICES ---`);
        hindi.forEach(v => {
             console.log(`ID: ${v.voiceId} | Name: ${v.displayName} | Gender: ${v.gender}`);
        });

        console.log(`\n--- FOUND ${english.length} ENGLISH VOICES (Top 3) ---`);
        english.slice(0, 3).forEach(v => {
             console.log(`ID: ${v.voiceId} | Name: ${v.displayName} | Gender: ${v.gender}`);
        });

    } catch (error) {
        console.error("Failed to list voices:", error);
    }
}

listVoices();

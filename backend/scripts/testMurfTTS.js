import { textToSpeechMurf } from "../lib/textToSpeechMurf.js";
import dotenv from "dotenv";
dotenv.config();

console.log("🚀 Starting Murf TTS Test...");

async function test() {
    try {
        const fileName = await textToSpeechMurf("Hello, this is a test of the Murf API.", "en", "test_murf_audio.mp3");
        console.log("✅ Success! Audio saved to uploads/" + fileName);
    } catch (error) {
        console.error("❌ Test Failed:", error.message);
    }
}

test();

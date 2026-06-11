const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error('OPENAI_API_KEY is not set');
  process.exit(1);
}

const client = new OpenAI({ apiKey: API_KEY });
const OUTPUT_PATH = path.join(__dirname, 'antal-commercial', 'public', 'voiceover.mp3');

const script = "Everyone says the real estate market is frozen. They're lying. Institutional money is still buying; they just have better data than you. Look at this. This is the Antal Capital engine. We don't guess. We engineer. You drop a property address here, and instantly, our system calculates your exact Cash to Close, projected ROI, and underwrites the loan options in seconds. No spreadsheets. No waiting on banks. While you're still doing the math, my guys are submitting the offer. Stop playing with dead data. Click the link, run your numbers, and secure your capital today.";

async function generateAudio() {
  try {
    console.log('Calling OpenAI TTS API...');

    const response = await client.audio.speech.create({
      model: 'tts-1-hd',
      voice: 'onyx',
      input: script,
    });

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(OUTPUT_PATH, Buffer.from(buffer));
    console.log(`Saved: ${OUTPUT_PATH}`);
  } catch (error) {
    console.error('Error generating audio:', error.message);
    process.exit(1);
  }
}

generateAudio();

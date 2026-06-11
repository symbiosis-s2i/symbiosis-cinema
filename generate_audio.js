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

async function generateScript() {
  console.log('Generating real estate ad script...');
  try {
    const response = await client.chat.completions.create({
      model: 'openai/gpt-5.5-instant',
      messages: [
        {
          role: 'system',
          content: 'You are a creative assistant. Write a 35-second real estate ad script for Antal Capital. Do not include any visual cues or brackets, only the spoken script.'
        },
        {
          role: 'user',
          content: 'Please generate a real estate ad script.'
        }
      ],
      max_tokens: 150
    });

    const script = response.choices[0].message.content.trim();
    console.log('Generated script:', script);
    return script;
  } catch (error) {
    console.error('Error generating script:', error.message);
    process.exit(1);
  }
}

async function generateAudio(script) {
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

(async () => {
  const script = await generateScript();
  await generateAudio(script);
})();

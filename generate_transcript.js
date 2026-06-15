"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { OpenAI } = require("openai");

const AUDIO_PATH = "./antal-commercial/public/voiceover.mp3";
const OUTPUT_PATH = "./antal-commercial/public/transcript.json";

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY is not set");
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey });

  if (!fs.existsSync(AUDIO_PATH)) {
    console.error(`Audio file not found: ${AUDIO_PATH}`);
    process.exit(1);
  }

  console.log(`Sending ${AUDIO_PATH} to Whisper…`);

  const response = await openai.audio.transcriptions.create({
    file: fs.createReadStream(AUDIO_PATH),
    model: "whisper-1",
    response_format: "verbose_json",
    timestamp_granularities: ["word"],
  });

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(response, null, 2));

  console.log(`Transcript saved to ${OUTPUT_PATH}`);
  console.log(`Words transcribed: ${response.words?.length ?? 0}`);
  console.log(`Text: "${response.text}"`);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});

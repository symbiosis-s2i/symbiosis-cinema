"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { pipeline } = require("node:stream/promises");
const { fal } = require("@fal-ai/client");

const VIDEO_PATH = "./antal-commercial/public/looped_podcast.mp4";
const AUDIO_PATH = "./antal-commercial/public/voiceover.mp3";
const OUTPUT_PATH = "./antal-commercial/public/landscape_founder_synced.mp4";
const MODEL = "fal-ai/sync-lipsync/v2";

async function main() {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) {
    console.error("FAL_KEY not set in environment.");
    process.exit(1);
  }
  fal.config({ credentials: apiKey });

  console.log(`[1/4] Uploading video: ${VIDEO_PATH}`);
  if (!fs.existsSync(VIDEO_PATH)) {
    console.error(`Video not found: ${VIDEO_PATH}`);
    process.exit(1);
  }
  const videoBuf = fs.readFileSync(VIDEO_PATH);
  const videoFile = new File([videoBuf], "looped_podcast.mp4", { type: "video/mp4" });
  const videoUrl = await fal.storage.upload(videoFile);
  console.log(`      uploaded: ${videoUrl}`);

  console.log(`[2/4] Uploading audio: ${AUDIO_PATH}`);
  if (!fs.existsSync(AUDIO_PATH)) {
    console.error(`Audio not found: ${AUDIO_PATH}`);
    process.exit(1);
  }
  const audioBuf = fs.readFileSync(AUDIO_PATH);
  const audioFile = new File([audioBuf], "voiceover.mp3", { type: "audio/mpeg" });
  const audioUrl = await fal.storage.upload(audioFile);
  console.log(`      uploaded: ${audioUrl}`);

  console.log(`[3/4] Submitting lipsync job: ${MODEL}`);
  const started = Date.now();
  const result = await fal.subscribe(MODEL, {
    input: {
      video_url: videoUrl,
      audio_url: audioUrl,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === "IN_PROGRESS") {
        for (const log of update.logs ?? []) {
          if (log?.message) console.log(`      [fal] ${log.message}`);
        }
      } else {
        console.log(`      [fal] status: ${update.status}`);
      }
    },
  });
  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  console.log(`      lipsync finished in ${elapsed}s`);

  const outVideoUrl =
    result?.data?.video?.url ??
    result?.video?.url ??
    result?.data?.url ??
    null;
  if (!outVideoUrl) {
    console.error("No video URL in response. Full payload:");
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(`      output video URL: ${outVideoUrl}`);

  console.log(`[4/4] Downloading synced video to ${OUTPUT_PATH}…`);
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  const response = await fetch(outVideoUrl);
  if (!response.ok || !response.body) {
    console.error(`Download failed: ${response.status} ${response.statusText}`);
    process.exit(1);
  }
  await pipeline(response.body, fs.createWriteStream(OUTPUT_PATH));
  const sizeMB = (fs.statSync(OUTPUT_PATH).size / (1024 * 1024)).toFixed(2);
  console.log(`Done. Saved ${sizeMB} MB → ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});

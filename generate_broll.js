"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { pipeline } = require("node:stream/promises");

const { fal } = require("@fal-ai/client");

const IMAGE_PATH = "./antal-commercial/public/antal_podcast_base.jpg";
const OUTPUT_PATH = "./antal-commercial/public/script2_podcast.mp4";
const MODEL = "fal-ai/kling-video/v2.1/master/image-to-video";

const PROMPT =
  "Animate with zero camera movement. The subject must remain perfectly static, maintaining 100% intense eye contact with the camera. Animate natural, slow blinking, microscopic breathing, and minor involuntary neck muscle movements to prepare for a lip-sync pass.";

const args = process.argv.slice(2);
const isVertical = args.includes("--vertical") || args.includes("--reel");
const ASPECT_RATIO = isVertical ? "9:16" : "16:9";
const FORMAT_LABEL = isVertical ? "Vertical / Reel (9:16)" : "Horizontal / YouTube (16:9)";

async function main() {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) {
    console.error("FAL_KEY not set in environment.");
    process.exit(1);
  }
  fal.config({ credentials: apiKey });

  if (!fs.existsSync(IMAGE_PATH)) {
    console.error(`Image not found: ${IMAGE_PATH}`);
    process.exit(1);
  }

  console.log(`[1/3] Uploading ${IMAGE_PATH} to fal storage…`);
  const buffer = fs.readFileSync(IMAGE_PATH);
  const file = new File([buffer], "antal_broll_3_base.jpg", { type: "image/jpeg" });
  const imageUrl = await fal.storage.upload(file);
  console.log(`      uploaded: ${imageUrl}`);

  console.log(`      Format: ${FORMAT_LABEL}`);
  console.log(`[2/3] Submitting Kling generation: ${MODEL}`);
  const started = Date.now();
  const result = await fal.subscribe(MODEL, {
    input: {
      prompt: PROMPT,
      image_url: imageUrl,
      duration: "5",
      aspect_ratio: ASPECT_RATIO,
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
  console.log(`      generation finished in ${elapsed}s`);

  const videoUrl =
    result?.data?.video?.url ??
    result?.video?.url ??
    result?.data?.url ??
    null;
  if (!videoUrl) {
    console.error("No video URL in response. Full payload:");
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(`      video URL: ${videoUrl}`);

  console.log(`[3/3] Downloading video to ${OUTPUT_PATH}…`);
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  const response = await fetch(videoUrl);
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

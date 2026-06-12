const BYTEPLUS_API_KEY = "ark-1cf43687-f941-4b42-917d-9afe68f67542-4f7af";
const { fal } = require("@fal-ai/client");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

fal.config({
  credentials: "602b8fa7-b0ec-4f82-9d2b-0be1f4d2f664:cdfb86d36a91862b2855dcdce4bba4fd"
});

// Helper function to download cloud URLs to local files using native global fetch
async function downloadFile(url, outputPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download asset: ${res.statusText}`);
  const arrayBuffer = await res.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(arrayBuffer));
  console.log(`💾 Saved local asset: ${outputPath}`);
}

async function main() {
  console.log("🎬 Launching Automated Multi-Track Commercial Production Engine...");
  try {
    const imagePath = path.join(__dirname, 'antal-commercial', 'public', 'antal_broll_3_base.jpg');
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Target asset missing from disk location: ${imagePath}`);
    }

    let imageContent = fs.readFileSync(imagePath);
    let imageBuffer;
    let mimeType = 'image/jpeg';

    const textStart = imageContent.toString('utf8').trim().substring(0, 10);
    if (textStart.startsWith('iVBORw0K')) {
      console.log("💡 Discovered Base64 text wrapper. Converting text stream into raw binary image canvas...");
      imageBuffer = Buffer.from(imageContent.toString('utf8').trim(), 'base64');
      mimeType = 'image/png';
    } else {
      imageBuffer = imageContent;
    }

    console.log("📦 Uploading presenter matrix to cloud canvas...");
    const uploadedUrl = await fal.storage.upload(
      new Blob([imageBuffer], { type: mimeType }),
      { fileName: mimeType === 'image/png' ? 'base_asset.png' : 'base_asset.jpg' }
    );

    // STEP 1: Generate Master Audio & Face Track (A-Roll)
    console.log("🗣️ Generating 15-Second Master Talking Head (A-Roll)...");
    const aRollResult = await fal.subscribe("bytedance/seedance-2.0/image-to-video", {
      input: {
        image_url: uploadedUrl,
        prompt: "A close-up shot of the speaker looking directly into the camera inside a modern corporate office, delivering the dialogue: \"We lost money on fix-and-flips, managed 15 million in real estate, then watched hundreds of deals die because capital was slow. So we built Antal—the AI-powered, white-labeled operating layer for private credit. Deploy your own automated lending stack at AntalCapital.com.\""
      }
    });
    const aRollUrl = aRollResult.video.url;
    console.log("✅ A-Roll Rendered successfully.");

    // STEP 2: Generate High-Energy Cinematic Cutaways (B-Roll)
    console.log("🚀 Generating Cinematic B-Roll Track 1 (Skyscraper Drone)...");
    const bRoll1Res = await fal.subscribe("fal-ai/luma-dream-machine", {
      input: { prompt: "An intense, cinematic FPV drone plunge diving straight down the sleek glass facade of a black luxury skyscraper at dusk. 4k, vertical 9:16 aspect ratio.", aspect_ratio: "9:16" }
    });

    console.log("🚀 Generating Cinematic B-Roll Track 2 (Tech Servers)...");
    const bRoll2Res = await fal.subscribe("fal-ai/luma-dream-machine", {
      input: { prompt: "Macro close-up shot of high-tech corporate server racks flashing with glowing blue and green data stream lights. 4k, vertical 9:16 aspect ratio.", aspect_ratio: "9:16" }
    });

    console.log("🚀 Generating Cinematic B-Roll Track 3 (Fintech Dashboard)...");
    const bRoll3Res = await fal.subscribe("fal-ai/luma-dream-machine", {
      input: { prompt: "A sleek, modern digital venture capital dashboard shifting instantly from a red 'Deal Delayed' graph to a bright green 'Approved' metric. 4k, vertical 9:16 aspect ratio.", aspect_ratio: "9:16" }
    });

    // STEP 3: Download everything to Replit disk storage
    console.log("📥 Pulling remote streams down to local production studio workspace...");
    await downloadFile(aRollUrl, "a_roll.mp4");
    await downloadFile(bRoll1Res.video.url, "b_roll1.mp4");
    await downloadFile(bRoll2Res.video.url, "b_roll2.mp4");
    await downloadFile(bRoll3Res.video.url, "b_roll3.mp4");

    // STEP 4: Invoke FFmpeg to programmatically slice and overlay scenes every few seconds
    console.log("🎬 Initializing local FFmpeg automation layer. Executing 2-second clip pacing...");
    const ffmpegCommand = `ffmpeg -y -i a_roll.mp4 -i b_roll1.mp4 -i b_roll2.mp4 -i b_roll3.mp4 -filter_complex "[1:v]scale=720:1280[b1]; [2:v]scale=720:1280[b2]; [3:v]scale=720:1280[b3]; [0:v][b1]overlay=enable='between(t,0,3)'[v1]; [v1][b2]overlay=enable='between(t,6,9)'[v2]; [v2][b3]overlay=enable='between(t,11,14)'" -c:a copy antal_commercial_final.mp4`;

    exec(ffmpegCommand, (error, stdout, stderr) => {
      if (error) {
        console.error("❌ FFmpeg editing sequence failed:", error);
        return;
      }
      console.log("🎉 SUCCESS! Your hyper-dynamic commercial timeline has been compiled!");
      console.log("📦 Output File Location: antal_commercial_final.mp4");
    });

  } catch (err) {
    console.error("❌ Execution error:", err.message || err);
    if (err.body) console.error("📋 Detailed Server Validation Error:", JSON.stringify(err.body, null, 2));
  }
}

main();

const { fal } = require("@fal-ai/client");
const fs = require("fs");
const path = require("path");

fal.config({
  credentials: "602b8fa7-b0ec-4f82-9d2b-0be1f4d2f664:cdfb86d36a91862b2855dcdce4bba4fd"
});

async function main() {
  console.log("🎬 Initiating clean, self-contained Seedance 2.0 commercial production...");
  try {
    const imagePath = path.join(__dirname, 'antal-commercial', 'public', 'antal_broll_3_base.jpg');
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Target image asset missing from disk at: ${imagePath}`);
    }

    console.log("📦 Uploading clean base image asset to Fal cloud canvas...");
    const imageBuffer = fs.readFileSync(imagePath);
    const uploadedUrl = await fal.storage.upload(
      new Blob([imageBuffer], { type: 'image/jpeg' }),
      { fileName: 'antal_broll_3_base.jpg' }
    );

    console.log("🚀 Dispatching pristine cinematic payload to ByteDance layer...");
    const payload = {
      input: {
        image_url: uploadedUrl,
        prompt: "A high-end cinematic close-up commercial shot of a professional speaker looking directly into the camera inside a modern, softly-lit corporate private equity office. The camera executes a subtle, ultra-smooth dolly-in tracking shot, keeping razor-sharp focus on the subject's face. The speaker delivers the following dialogue with a highly confident, clear, and rapid-fire commercial cadence: \"We lost money on fix-and-flips, managed 15 million in real estate, then watched hundreds of deals die because capital was slow. So we built Antal—the AI-powered, white-labeled operating layer for private credit. Deploy your own automated lending stack at AntalCapital.com.\" Professional Hollywood studio lighting, pristine skin details, 4k resolution, clean audio lip-sync."
      }
    };
    console.log("Payload being sent to fal.subscribe:", JSON.stringify(payload, null, 2));
    const result = await fal.subscribe("bytedance/seedance-2.0/image-to-video", payload);

    console.log("🎉 Video processing accepted and complete!");
    console.log("Video Download URL:", result.data.video.url);
  } catch (err) {
    console.error("❌ Execution error:", err.message || err);
    if (err.response) {
      console.error("Response data:", err.response.data);
    }
  }
}

main();

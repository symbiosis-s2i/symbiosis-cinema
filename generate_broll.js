const { fal } = require("@fal-ai/client");
const fs = require("fs");
const path = require("path");

fal.config({
  credentials: "602b8fa7-b0ec-4f82-9d2b-0be1f4d2f664:cdfb86d36a91862b2855dcdce4bba4fd"
});

async function main() {
  console.log("🎬 Initiating smart standalone production line...");
  try {
    const imagePath = path.join(__dirname, 'antal-commercial', 'public', 'antal_broll_3_base.jpg');
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Target image asset missing from disk at: ${imagePath}`);
    }

    let imageContent = fs.readFileSync(imagePath);
    let imageBuffer;
    let mimeType = 'image/jpeg';

    // Auto-detect if file is a Base64 text string disguised as a file
    const textStart = imageContent.toString('utf8').trim().substring(0, 10);
    if (textStart.startsWith('iVBORw0K')) {
      console.log("💡 Discovered Base64 text wrapper. Converting text stream into raw binary image canvas...");
      imageBuffer = Buffer.from(imageContent.toString('utf8').trim(), 'base64');
      mimeType = 'image/png'; // The signature belongs to a PNG structure
    } else {
      imageBuffer = imageContent;
    }

    console.log("📦 Uploading binary asset matrix to Fal cloud space...");
    const uploadedUrl = await fal.storage.upload(
      new Blob([imageBuffer], { type: mimeType }),
      { fileName: mimeType === 'image/png' ? 'base_asset.png' : 'base_asset.jpg' }
    );

    console.log("🚀 Dispatching clean payload to ByteDance execution layer...");
    const payload = {
      input: {
        image_url: uploadedUrl,
        prompt: "A high-end cinematic close-up commercial shot of a professional speaker looking directly into the camera inside a modern, softly-lit corporate private equity office. The camera executes a subtle, ultra-smooth dolly-in tracking shot, keeping razor-sharp focus on the subject's face. The speaker delivers the following dialogue with a highly confident, clear, and rapid-fire commercial cadence: \"We lost money on fix-and-flips, managed 15 million in real estate, then watched hundreds of deals die because capital was slow. So we built Antal—the AI-powered, white-labeled operating layer for private credit. Deploy your own automated lending stack at AntalCapital.com.\" Professional Hollywood studio lighting, pristine skin details, 4k resolution, clean audio lip-sync."
      }
    };

    const result = await fal.subscribe("bytedance/seedance-2.0/image-to-video", payload);

    console.log("🎉 Video processing complete!");
    console.log("Video Download URL:", result.data.video.url);
  } catch (err) {
    console.error("❌ Execution error:", err.message || err);
    if (err.body) {
      console.error("📋 Detailed Server Validation Error:", JSON.stringify(err.body, null, 2));
    }
  }
}

main();

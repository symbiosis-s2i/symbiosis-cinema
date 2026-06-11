const { fal } = require("@fal-ai/client");
const fs = require("fs");
const path = require("path");

async function generateSeedanceVideo() {
  console.log("🎬 Locating local assets and initiating Seedance 2.0...");
  
  try {
    // Look for the founder image in the public folder relative to this script
    const imagePath = path.join(__dirname, 'antal-commercial', 'public', 'antal_broll_3_base.jpg');
    
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Founder image not found at path: ${imagePath}`);
    }

    console.log("📦 Uploading founder image to secure cloud storage...");
    const imageBuffer = fs.readFileSync(imagePath);
    const founderImageUrl = await fal.storage.upload(
      new Blob([imageBuffer], { type: 'image/jpeg' }),
      { fileName: 'founder_image.jpg' }
    );

    console.log(`✅ Asset live at: ${founderImageUrl}`);
    console.log("🚀 Dispatching omni-modal payload to Seedance 2.0 execution layer...");

    const result = await fal.subscribe("bytedance/seedance-2.0/image-to-video", {
      input: {
        image_url: founderImageUrl,
        prompt: "A close-up, high-end commercial shot of the speaker looking directly into the camera inside a modern, softly-lit corporate venture capital office space. The camera executes a slow, dramatic dolly-in tracking shot, maintaining sharp cinematic focus on their face. The speaker delivers the following dialogue with an authentic, confident, and rapid-fire cadence: \"We lost money on fix-and-flips, managed 15 million in real estate, then watched hundreds of deals die because capital was slow. So we built Antal—the AI-powered, white-labeled operating layer for private credit. Deploy your own automated lending stack at AntalCapital.com.\" Studio-grade color grading, ultra-realistic skin textures, 4k quality, natural ambient room tone audio.",
        resolution: "720p",
        duration: 15,
        aspect_ratio: "9:16",
        generate_audio: true
      }
    });

    console.log("🎉 Production Complete!");
    console.log("Video Download URL:", result.data.video.url);
  } catch (error) {
    console.error("❌ Generation failed:", error.message || error);
  }
}

generateSeedanceVideo();

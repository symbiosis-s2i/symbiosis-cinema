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
        prompt: "[VISUAL HOOK]: The video starts with an intense, cinematic FPV drone plunge diving straight down the sleek glass facade of a black luxury skyscraper at dusk, passing a massive glowing \"ANTAL CAPITAL\" sign with motion-blur speed. [CAMERA TRANSITION]: The camera cuts sharply via a seamless whip-pan into a high-end corporate penthouse office. [SPEAKER & MOVEMENT]: The speaker in a sharp tailored suit is actively walking with immense confidence towards a floor-to-ceiling window overlooking a neon-lit city skyline. The camera executes a dramatic, sweeping 360-degree orbital tracking shot, circling tightly around him as he moves and intensely gestures. The shot dynamically tightens from a medium-wide shot into a high-contrast cinematic close-up. The speaker delivers this exact dialogue with a powerful, rapid, authoritative cadence: \"We lost money on fix-and-flips, managed 15 million in real estate, then watched hundreds of deals die because capital was slow. So we built Antal—the AI-powered, white-labeled operating layer for private credit. Deploy your own automated lending stack at AntalCapital.com.\" Ultra-realistic skin, professional Hollywood lighting, 4k resolution, seamless audio synchronization.",
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

const { fal } = require("@fal-ai/client");

async function generateSeedanceVideo() {
  console.log("🎬 Initiating standalone Seedance 2.0 video generation...");
  try {
    const result = await fal.subscribe("bytedance/seedance-2.0/image-to-video", {
      input: {
        image_url: "https://your-replit-app.com/public/founder_image.jpg",
        prompt: "A close-up, high-end commercial shot of the speaker looking directly into the camera inside a modern, softly-lit corporate venture capital office space. The camera executes a slow, dramatic dolly-in tracking shot, maintaining sharp cinematic focus on their face. The speaker delivers the following dialogue with an authentic, confident, and rapid-fire cadence: \"We lost money on fix-and-flips, managed 15 million in real estate, then watched hundreds of deals die because capital was slow. So we built Antal—the AI-powered, white-labeled operating layer for private credit. Deploy your own automated lending stack at AntalCapital.com.\" Studio-grade color grading, ultra-realistic skin textures, 4k quality, natural ambient room tone audio.",
        resolution: "720p",
        duration: "15",
        aspect_ratio: "9:16",
        generate_audio: true
      }
    });

    console.log("🚀 Standalone Seedance 2.0 Production Complete!");
    console.log("Video Download URL:", result.data.video.url);
  } catch (error) {
    console.error("❌ Generation error:", error);
  }
}

generateSeedanceVideo();

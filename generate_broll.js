const { fal } = require("@fal-ai/client");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const fetch = require("node-fetch");

// Initialize fal config
fal.config({
  credentials: "602b8fa7-b0ec-4f82-9d2b-0be1f4d2f664:cdfb86d36a91862b2855dcdce4bba4fd"
});

async function generateShot1Hook() {
  console.log("🎥 Generating Shot 1: FPV Drone...");
  const result = await fal.subscribe("fal-ai/luma-dream-machine", {
    input: {
      prompt: "An intense, cinematic FPV drone plunge diving straight down the sleek glass facade of a black luxury skyscraper at dusk, passing a massive glowing neon sign that reads ANTAL CAPITAL with hyper-realistic motion-blur speed. 4k resolution, Hollywood lighting.",
      aspect_ratio: "9:16"
    }
  });
  return result.data.video.url;
}

async function generateShot2Pitch() {
  console.log("🎥 Generating Shot 2: Talking Head Pitch...");
  const imagePath = path.join(__dirname, 'antal-commercial', 'public', 'antal_broll_3_base.jpg');
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Asset not found at path: ${imagePath}`);
  }
  const imageBuffer = fs.readFileSync(imagePath);
  const founderImageUrl = await fal.storage.upload(
    new Blob([imageBuffer], { type: 'image/jpeg' }),
    { fileName: 'antal_broll_3_base.jpg' }
  );

  const result = await fal.subscribe("bytedance/seedance-2.0/image-to-video", {
    input: {
      image_url: founderImageUrl,
      prompt: "A close-up shot of the speaker looking directly into the camera inside a modern corporate office, delivering the dialogue: \"We lost money on fix-and-flips, managed 15 million in real estate, then watched hundreds of deals die because capital was slow. So we built Antal—the AI-powered, white-labeled operating layer for private credit. Deploy your own automated lending stack at AntalCapital.com.\" Clean audio sync, natural framing.",
      duration: 11,
      aspect_ratio: "9:16",
      generate_audio: true
    }
  });
  return result.data.video.url;
}

async function downloadFile(url, outputPath) {
  console.log(`⬇️ Downloading from ${url} to ${outputPath}...`);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download file: ${response.statusText}`);
  const fileStream = fs.createWriteStream(outputPath);
  await new Promise((resolve, reject) => {
    response.body.pipe(fileStream);
    response.body.on("error", reject);
    fileStream.on("finish", resolve);
  });
}

async function main() {
  try {
    const shot1Url = await generateShot1Hook();
    const shot2Url = await generateShot2Pitch();

    await downloadFile(shot1Url, "shot1.mp4");
    await downloadFile(shot2Url, "shot2.mp4");

    console.log("🎬 Stitching videos together...");
    exec('ffmpeg -i shot1.mp4 -i shot2.mp4 -filter_complex "[0:v][1:v]concat=n=2:v=1:a=0[outv]" -map "[outv]" -map 1:a -c:v libx264 -c:a aac -strict experimental antal_commercial_final.mp4', (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error during video stitching: ${error.message}`);
        return;
      }
      console.log("🎉 Final video created: antal_commercial_final.mp4");
    });
  } catch (error) {
    console.error("❌ Error in processing:", error);
  }
}

main();

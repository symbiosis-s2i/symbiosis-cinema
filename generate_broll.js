const { fal } = require("@fal-ai/client");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

// Initialize fal config
fal.config({
  credentials: "602b8fa7-b0ec-4f82-9d2b-0be1f4d2f664:cdfb86d36a91862b2855dcdce4bba4fd"
});

async function generateMasterTalkingHead() {
  console.log("🎥 Generating Master Talking Head...");
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
      prompt: "A close-up shot of the speaker delivering a corporate pitch. Clean audio sync, natural framing.",
      duration: 15,
      aspect_ratio: "16:9",
      generate_audio: true
    }
  });
  return result.data.video.url;
}

async function generateBrollClip(prompt) {
  console.log(`🎥 Generating B-roll: ${prompt}...`);
  const result = await fal.subscribe("fal-ai/luma-dream-machine", {
    input: {
      prompt,
      duration: 3,
      aspect_ratio: "16:9"
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
    const masterUrl = await generateMasterTalkingHead();
    const broll1Url = await generateBrollClip("Corporate server room with blinking lights and data racks.");
    const broll2Url = await generateBrollClip("High-tech dashboard with analytics and graphs.");
    const broll3Url = await generateBrollClip("Drone shot over a cityscape at sunset.");

    await downloadFile(masterUrl, "master.mp4");
    await downloadFile(broll1Url, "broll1.mp4");
    await downloadFile(broll2Url, "broll2.mp4");
    await downloadFile(broll3Url, "broll3.mp4");

    console.log("🎬 Stitching videos together...");
    exec('ffmpeg -i master.mp4 -i broll1.mp4 -i broll2.mp4 -i broll3.mp4 -filter_complex "[0:v][1:v]overlay=enable=\'between(t,0,2)\':shortest=1[v1];[v1][2:v]overlay=enable=\'between(t,2,4)\':shortest=1[v2];[v2][3:v]overlay=enable=\'between(t,4,6)\':shortest=1[outv]" -map "[outv]" -map 0:a -c:v libx264 -c:a aac -strict experimental antal_commercial_final.mp4', (error, stdout, stderr) => {
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

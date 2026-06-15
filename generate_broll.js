const express = require('express');
const bodyParser = require('body-parser');
const { fal } = require("@fal-ai/client");
const { OpenAI } = require("openai");
const fs = require("fs");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
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

const app = express();
app.use(bodyParser.json());

app.post('/generate-video', async (req, res) => {
  console.log("🎬 Launching Automated Multi-Track Commercial Production Engine...");
  try {
    const { userTopic, image_url } = req.body;
    let voiceoverScript, brollPrompt1, brollPrompt2, brollPrompt3;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-5.5',
        messages: [
          {
            role: 'system',
            content: `You are a creative assistant. Generate content for a ${userTopic}.`
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
        stop: null,
        n: 1,
        stream: false,
        logprobs: null,
        presence_penalty: 0,
        frequency_penalty: 0,
        user: null,
        json_schema: {
          type: "object",
          properties: {
            voiceoverScript: { type: "string" },
            brollPrompt1: { type: "string" },
            brollPrompt2: { type: "string" },
            brollPrompt3: { type: "string" }
          },
          required: ["voiceoverScript", "brollPrompt1", "brollPrompt2", "brollPrompt3"]
        }
      });

      const result = JSON.parse(response.choices[0].message.content);
      voiceoverScript = result.voiceoverScript;
      brollPrompt1 = result.brollPrompt1;
      brollPrompt2 = result.brollPrompt2;
      brollPrompt3 = result.brollPrompt3;
      
      // Generate audio using OpenAI TTS
      console.log("🔊 Generating voiceover audio...");
      const ttsResponse = await openai.audio.speech.create({
        model: 'tts-1',
        voice: req.body.voice || 'onyx',
        input: voiceoverScript,
      });

      const audioBuffer = await ttsResponse.arrayBuffer();
      fs.writeFileSync('openai_voice.mp3', Buffer.from(audioBuffer));
      console.log("✅ Voiceover audio generated and saved as openai_voice.mp3.");
      
      
      // Generate audio using OpenAI TTS
      console.log("🔊 Generating voiceover audio...");
      const ttsResponse = await openai.audio.speech.create({
        model: 'tts-1',
        voice: req.body.voice || 'onyx',
        input: voiceoverScript,
      });

      const audioBuffer = await ttsResponse.arrayBuffer();
      fs.writeFileSync('openai_voice.mp3', Buffer.from(audioBuffer));
      console.log("✅ Voiceover audio generated and saved as openai_voice.mp3.");
      
    } catch (error) {
      console.error("❌ OpenAI API call failed:", error.message || error);
      res.status(500).send("OpenAI API call failed");
      return;
    }
    const defaultImagePath = path.join(__dirname, 'antal-commercial', 'public', 'antal_broll_3_base.jpg');
    const imagePath = image_url || defaultImagePath;

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
        prompt: voiceoverScript
      }
    });
    const aRollUrl = aRollResult.video.url;
    console.log("✅ A-Roll Rendered successfully.");

    // STEP 2: Generate High-Energy Cinematic Cutaways (B-Roll)
    console.log("🚀 Generating Cinematic B-Roll Track 1 (Skyscraper Drone)...");
    const bRoll1Res = await fal.subscribe("fal-ai/luma-dream-machine", {
      input: { prompt: brollPrompt1, aspect_ratio: "9:16" }
    });

    console.log("🚀 Generating Cinematic B-Roll Track 2 (Tech Servers)...");
    const bRoll2Res = await fal.subscribe("fal-ai/luma-dream-machine", {
      input: { prompt: brollPrompt2, aspect_ratio: "9:16" }
    });

    console.log("🚀 Generating Cinematic B-Roll Track 3 (Fintech Dashboard)...");
    const bRoll3Res = await fal.subscribe("fal-ai/luma-dream-machine", {
      input: { prompt: brollPrompt3, aspect_ratio: "9:16" }
    });

    // STEP 3: Download everything to Replit disk storage
    console.log("📥 Pulling remote streams down to local production studio workspace...");
    await downloadFile(aRollUrl, "a_roll.mp4");
    await downloadFile(bRoll1Res.video.url, "b_roll1.mp4");
    await downloadFile(bRoll2Res.video.url, "b_roll2.mp4");
    await downloadFile(bRoll3Res.video.url, "b_roll3.mp4");

    // STEP 4: Invoke FFmpeg to programmatically slice and overlay scenes every few seconds
    console.log("🎬 Initializing local FFmpeg automation layer. Executing 2-second clip pacing...");
    const ffmpegCommand = `ffmpeg -y -i a_roll.mp4 -i b_roll1.mp4 -i b_roll2.mp4 -i b_roll3.mp4 -i openai_voice.mp3 -filter_complex "[1:v]scale=720:1280[b1]; [2:v]scale=720:1280[b2]; [3:v]scale=720:1280[b3]; [0:v][b1]overlay=enable='between(t,0,3)'[v1]; [v1][b2]overlay=enable='between(t,6,9)'[v2]; [v2][b3]overlay=enable='between(t,11,14)'" -map 4:a -c:v libx264 -shortest antal_commercial_final.mp4`;

    exec(ffmpegCommand, (error, stdout, stderr) => {
      if (error) {
        console.error("❌ FFmpeg editing sequence failed:", error);
        res.status(500).send("FFmpeg editing sequence failed");
        return;
      }
      console.log("🎉 SUCCESS! Your hyper-dynamic commercial timeline has been compiled!");
      res.sendFile(path.resolve('antal_commercial_final.mp4'));
    });

  } catch (err) {
    console.error("❌ Execution error:", err.message || err);
    if (err.body) console.error("📋 Detailed Server Validation Error:", JSON.stringify(err.body, null, 2));
    res.status(500).send(err.message || "Execution error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
[phases.setup]
nixPkgs = ["...", "ffmpeg"]
[phases.setup]
nixPkgs = ["...", "ffmpeg"]
[phases.setup]
nixPkgs = ["...", "ffmpeg"]

const express = require('express');
const bodyParser = require('body-parser');
const { fal } = require("@fal-ai/client");
const { OpenAI } = require("openai");
const runway = require('runwayml'); // Assuming runwayml is the package for Runway ML

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
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
    const { userTopic, image_url, brollProvider = 'fal' } = req.body; // Default to 'fal' if not specified
    let voiceoverScript, brollPrompt1, brollPrompt2, brollPrompt3;

    try {
      const response = await openrouter.chat.completions.create({
        model: 'mistralai/mistral-large',
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
    } else if (brollProvider === 'kling') {
      console.log("🚀 Generating Cinematic B-Roll using Kling AI...");

      const klingHeaders = {
        'Authorization': `Bearer ${process.env.FAL_KEY}`,
        'Content-Type': 'application/json'
      };

      const klingPayload = (promptText) => ({
        prompt: promptText,
        duration: 5,
        aspect_ratio: '16:9'
      });

      const klingUrls = await Promise.all([
        fetch('https://queue.fal.run/fal-ai/kling-video/v3/text-to-video', {
          method: 'POST',
          headers: klingHeaders,
          body: JSON.stringify(klingPayload(brollPrompt1))
        }).then(res => res.json()),

        fetch('https://queue.fal.run/fal-ai/kling-video/v3/text-to-video', {
          method: 'POST',
          headers: klingHeaders,
          body: JSON.stringify(klingPayload(brollPrompt2))
        }).then(res => res.json()),

        fetch('https://queue.fal.run/fal-ai/kling-video/v3/text-to-video', {
          method: 'POST',
          headers: klingHeaders,
          body: JSON.stringify(klingPayload(brollPrompt3))
        }).then(res => res.json())
      ]);

      const taskIds = klingUrls.map(res => res.task_id);

      const checkKlingStatus = async (taskId) => {
        const response = await fetch(`https://api-singapore.klingai.com/v1/videos/text2video/tasks/${taskId}`, {
          headers: klingHeaders
        });
        const result = await response.json();
        return result.status === 'SUCCEEDED' ? result.output_url : null;
      };

      const pollKlingTasks = async () => {
        const urls = [];
        while (urls.length < 3) {
          console.log("🔄 Polling Kling AI for task completion...");
          const results = await Promise.all(taskIds.map(checkKlingStatus));
          urls.push(...results.filter(url => url !== null));
          if (urls.length < 3) await new Promise(resolve => setTimeout(resolve, 7000));
        }
        return urls;
      };

      const [bRoll1Url, bRoll2Url, bRoll3Url] = await pollKlingTasks();
      bRoll1Res = { video: { url: bRoll1Url } };
      bRoll2Res = { video: { url: bRoll2Url } };
      bRoll3Res = { video: { url: bRoll3Url } };
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
    let bRoll1Res, bRoll2Res, bRoll3Res;

    if (brollProvider === 'runway') {
      console.log("🚀 Generating Cinematic B-Roll using Runway ML...");

      const runwayHeaders = {
        'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
        'X-Runway-Version': '2024-11-06',
        'Content-Type': 'application/json'
      };

      const runwayPayload = (promptText) => ({
        model: 'mistralai/mistral-small',
        promptText,
        ratio: '1280:720',
        duration: 5
      });

      const runwayUrls = await Promise.all([
        fetch('https://api.runwayml.com/v1/text_to_video', {
          method: 'POST',
          headers: runwayHeaders,
          body: JSON.stringify(runwayPayload(brollPrompt1))
        }).then(res => res.json()),

        fetch('https://api.runwayml.com/v1/text_to_video', {
          method: 'POST',
          headers: runwayHeaders,
          body: JSON.stringify(runwayPayload(brollPrompt2))
        }).then(res => res.json()),

        fetch('https://api.runwayml.com/v1/text_to_video', {
          method: 'POST',
          headers: runwayHeaders,
          body: JSON.stringify(runwayPayload(brollPrompt3))
        }).then(res => res.json())
      ]);

      const taskIds = runwayUrls.map(res => res.id);

      const checkStatus = async (taskId) => {
        const response = await fetch(`https://api.runwayml.com/v1/tasks/${taskId}`, {
          headers: runwayHeaders
        });
        const result = await response.json();
        return result.status === 'SUCCEEDED' ? result.outputUrl : null;
      };

      const pollRunwayTasks = async () => {
        const urls = [];
        while (urls.length < 3) {
          console.log("🔄 Polling Runway ML for task completion...");
          const results = await Promise.all(taskIds.map(checkStatus));
          urls.push(...results.filter(url => url !== null));
          if (urls.length < 3) await new Promise(resolve => setTimeout(resolve, 5000));
        }
        return urls;
      };

      const [bRoll1Url, bRoll2Url, bRoll3Url] = await pollRunwayTasks();
      bRoll1Res = { video: { url: bRoll1Url } };
      bRoll2Res = { video: { url: bRoll2Url } };
      bRoll3Res = { video: { url: bRoll3Url } };
    } else {
      console.log("🚀 Generating Cinematic B-Roll Track 1 (Skyscraper Drone) using Fal AI...");
      bRoll1Res = await fal.subscribe("mistralai/mistral-small", {
        input: { prompt: brollPrompt1, aspect_ratio: "9:16" }
      });

      console.log("🚀 Generating Cinematic B-Roll Track 2 (Tech Servers) using Mistral AI...");
      bRoll2Res = await fal.subscribe("mistralai/mistral-small", {
        input: { prompt: brollPrompt2, aspect_ratio: "9:16" }
      });

      console.log("🚀 Generating Cinematic B-Roll Track 3 (Fintech Dashboard) using Mistral AI...");
      bRoll3Res = await fal.subscribe("mistralai/mistral-small", {
        input: { prompt: brollPrompt3, aspect_ratio: "9:16" }
      });
    }

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

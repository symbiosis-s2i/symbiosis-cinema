const OpenAI = require('openai');
const { spawn } = require('child_process');

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error('OPENAI_API_KEY is not set');
  process.exit(1);
}

const client = new OpenAI({ apiKey: API_KEY });

async function generateScript() {
  console.log('Generating real estate ad script...');
  try {
    const response = await client.chat.completions.create({
      model: 'gpt-5.4-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a creative assistant. Write a 35-second real estate ad script for Antal Capital. Do not include any visual cues or brackets, only the spoken script.'
        },
        {
          role: 'user',
          content: 'Please generate a real estate ad script.'
        }
      ],
      max_tokens: 150
    });

    const script = response.choices[0].message.content.trim();
    console.log('Generated script:', script);
    return script;
  } catch (error) {
    console.error('Error generating script:', error.message);
    process.exit(1);
  }
}
const fs = require('fs');
const path = require('path');

const INPUT_VIDEO = './looped_podcast.mp4';
const INPUT_AUDIO = './voiceover_cartesia.mp3';
const LOOPED_VIDEO = '/tmp/looped_cartesia_video.mp4';
const OUTPUT_VIDEO = './cartesia_founder_synced.mp4';
const LOOPS = 7;

console.log('🎬 Starting Cartesia lip-sync generation...\n');

// Step 1: Create looped video
function createLoopedVideo() {
  return new Promise((resolve, reject) => {
    console.log(`📹 Creating looped video (${LOOPS} loops)...`);

    const ffmpeg = spawn('ffmpeg', [
      '-i', INPUT_VIDEO,
      '-filter:v', `loop=${LOOPS - 1}:1`,
      '-y',
      LOOPED_VIDEO
    ]);

    ffmpeg.stderr.on('data', (data) => {
      process.stderr.write(data);
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Looped video created successfully\n');
        resolve();
      } else {
        reject(new Error(`FFmpeg failed with code ${code}`));
      }
    });

    ffmpeg.on('error', (err) => {
      reject(err);
    });
  });
}

// Step 2: Call fal-ai sync-lipsync using the SDK
async function syncWithFalAI() {
  console.log('🎙️ Uploading files and calling sync-lipsync...');

  const FAL_KEY = process.env.FAL_KEY;
  if (!FAL_KEY) {
    throw new Error('FAL_KEY environment variable not set');
  }

  // Import the fal SDK
  const { fal } = require('@fal-ai/client');

  try {
    // Read the video and audio files
    const videoBuffer = fs.readFileSync(LOOPED_VIDEO);
    const audioBuffer = fs.readFileSync(INPUT_AUDIO);

    console.log(`Video size: ${(videoBuffer.length / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Audio size: ${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB`);

    // Upload files to fal storage to get URLs
    console.log('Uploading video to storage...');
    const videoUrl = await fal.storage.upload(
      new Blob([videoBuffer], { type: 'video/mp4' }),
      { fileName: 'looped_cartesia_video.mp4' }
    );

    console.log('Uploading audio to storage...');
    const audioUrl = await fal.storage.upload(
      new Blob([audioBuffer], { type: 'audio/mpeg' }),
      { fileName: 'voiceover_cartesia.mp3' }
    );

    console.log(`Video URL: ${videoUrl}`);
    console.log(`Audio URL: ${audioUrl}`);
    console.log('Calling fal-ai/sync-lipsync...');

    // Call the API with file URLs
    const result = await fal.subscribe('fal-ai/sync-lipsync', {
      input: {
        video_url: videoUrl,
        audio_url: audioUrl
      }
    });

    console.log('✅ API response received\n');
    return result;
  } catch (error) {
    console.error('API Error:', error.message);
    console.error('Stack:', error.stack);
    throw new Error(`Sync failed: ${error.message}`);
  }
}

// Step 3: Download result
async function downloadResult(resultUrl) {
  console.log('📥 Downloading synced video...');

  const https = require('https');

  return new Promise((resolve, reject) => {
    https.get(resultUrl, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Download failed with status ${res.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(OUTPUT_VIDEO);

      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(OUTPUT_VIDEO, () => {});
        reject(err);
      });

      res.on('error', (err) => {
        fs.unlink(OUTPUT_VIDEO, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

// Main execution
async function main() {
  try {
    // Generate script
    const script = await generateScript();

    // Create looped video
    await createLoopedVideo();

    // Call fal-ai API
    const apiResponse = await syncWithFalAI();
    console.log('\n📋 API Response received');

    // Extract the video URL from response
    let downloadUrl;
    if (apiResponse.data && apiResponse.data.video) {
      downloadUrl = apiResponse.data.video.url || apiResponse.data.video;
    } else if (apiResponse.data && apiResponse.data.video_url) {
      downloadUrl = apiResponse.data.video_url;
    } else if (apiResponse.video) {
      downloadUrl = apiResponse.video.url || apiResponse.video;
    } else if (apiResponse.video_url) {
      downloadUrl = apiResponse.video_url;
    } else if (apiResponse.output && apiResponse.output.video) {
      downloadUrl = apiResponse.output.video.url || apiResponse.output.video;
    } else if (apiResponse.output && apiResponse.output.video_url) {
      downloadUrl = apiResponse.output.video_url;
    } else {
      console.log('Full API Response:', JSON.stringify(apiResponse, null, 2));
      throw new Error('Could not extract video URL from API response');
    }

    if (!downloadUrl || !downloadUrl.startsWith('http')) {
      throw new Error(`Invalid download URL: ${downloadUrl}`);
    }

    console.log(`Download URL: ${downloadUrl}`);

    // Download the result
    await downloadResult(downloadUrl);

    // Cleanup
    if (fs.existsSync(LOOPED_VIDEO)) {
      fs.unlinkSync(LOOPED_VIDEO);
    }

    console.log('\n✨ Success! Lip-synced video saved to: ' + OUTPUT_VIDEO);
    console.log('📊 File info:');
    const stats = fs.statSync(OUTPUT_VIDEO);
    console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Path: ${path.resolve(OUTPUT_VIDEO)}`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);

    // Cleanup on error
    if (fs.existsSync(LOOPED_VIDEO)) {
      try {
        fs.unlinkSync(LOOPED_VIDEO);
      } catch (e) {}
    }

    process.exit(1);
  }
}

main();

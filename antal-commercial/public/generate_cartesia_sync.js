const OpenAI = require('openai');
const { spawn } = require('child_process');

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error('OPENAI_API_KEY is not set');
  process.exit(1);
}

const client = new OpenAI({ apiKey: API_KEY });

async function generateScript(targetNiche) {
  console.log('Generating real estate ad script...');
  try {
    const response = await client.chat.completions.create({
      model: 'gpt-5.4-mini',
      messages: [{
          role: 'system',
          content: `You are a creative assistant. Write a 35-second real estate ad script for Antal Capital focusing on ${targetNiche}. Do not include any visual cues or brackets, only the spoken script.`
        },
        {
          role: 'user',
          content: `Please generate a real estate ad script for ${targetNiche}.`
        }
      ],
      max_completion_tokens: 150
    });

    const script = response.choices[0].message.content.trim();
    console.log('Generated script:', script);
    return script;
  } catch (error) {
    console.error('Error generating script:', error.message);
    process.exit(1);
  }
}
function retryWithDelay(fn, retries = 3, delay = 3000) {
  return async function(...args) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        if (attempt < retries) {
          console.warn(`Attempt ${attempt} failed. Retrying in ${delay / 1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
  };
}
const path = require('path');

const INPUT_VIDEO = path.join(__dirname, 'looped_podcast.mp4');
const INPUT_AUDIO = path.join(__dirname, 'antal-commercial', 'public', 'voiceover_cartesia.mp3');
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

async function syncWithFalAI() {
  console.log('🎙️ Uploading files and calling Seedance 2.0...');

  const FAL_KEY = process.env.FAL_KEY;
  if (!FAL_KEY) {
    throw new Error('FAL_KEY environment variable not set');
  }

  // Import the fal SDK
  const { fal } = require('@fal-ai/client');

  try {
    // Read the audio file
    const audioBuffer = fs.readFileSync(INPUT_AUDIO);

    console.log(`Audio size: ${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB`);

    // Upload audio to fal storage to get URL
    console.log('Uploading audio to storage...');
    const audioUrl = await fal.storage.upload(
      new Blob([audioBuffer], { type: 'audio/mpeg' }),
      { fileName: 'voiceover_cartesia.mp3' }
    );

    console.log(`Audio URL: ${audioUrl}`);

    // Define the founder image asset path
    const founderImagePath = path.join(__dirname, 'founder_image.jpg');
    const founderImageBuffer = fs.readFileSync(founderImagePath);

    console.log('Uploading founder image to storage...');
    const founderImageUrl = await fal.storage.upload(
      new Blob([founderImageBuffer], { type: 'image/jpeg' }),
      { fileName: 'founder_image.jpg' }
    );

    console.log(`Founder Image URL: ${founderImageUrl}`);
    console.log('Calling bytedance/seedance-2.0/image-to-video...');

    // Call the Seedance 2.0 API with file URLs
    const result = await fal.subscribe('bytedance/seedance-2.0/image-to-video', {
      input: {
        image_url: founderImageUrl,
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
    const targetNiche = 'luxury townhomes'; // Example target niche
    const script = await generateScript(targetNiche);

    // Create looped video
    await retryWithDelay(createLoopedVideo)();

    // Call fal-ai API
    const apiResponse = await retryWithDelay(syncWithFalAI)();
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

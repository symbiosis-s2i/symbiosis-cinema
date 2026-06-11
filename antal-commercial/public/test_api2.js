const https = require('https');

async function testEndpoint(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.fal.ai',
      port: 443,
      path: path,
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.FAL_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': 2
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, path });
      });
    });

    req.on('error', (e) => {
      resolve({ status: 'ERROR', path });
    });

    req.write('{}');
    req.end();
  });
}

async function main() {
  const paths = [
    '/v1/fal-ai/sync-lipsync/v2',
    '/v2/fal-ai/sync-lipsync',
    '/fal-ai/sync-lipsync/v2',
    '/v1/fal-ai/lipsync',
    '/v1/fal-ai/lipsync-sync',
    '/v1/lipsync-sync',
    '/v1/sync-lips',
    '/v1/fal-ai/audio-lipsync'
  ];

  console.log('Testing more endpoints...\n');
  for (const path of paths) {
    const result = await testEndpoint(path);
    console.log(`${result.path.padEnd(50)} -> ${result.status}`);
  }
}

main();

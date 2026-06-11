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
        resolve({ status: res.statusCode, path, error: data.substring(0, 100) });
      });
    });

    req.on('error', (e) => {
      resolve({ status: 'ERROR', path, error: e.message });
    });

    req.write('{}');
    req.end();
  });
}

async function main() {
  const paths = [
    '/sync-lipsync',
    '/v1/sync-lipsync',
    '/v1/fal-ai/sync-lipsync',
    '/queue/sync-lipsync',
    '/api/sync-lipsync'
  ];

  console.log('Testing API endpoints...\n');
  for (const path of paths) {
    const result = await testEndpoint(path);
    console.log(`${result.path.padEnd(40)} -> ${result.status}`);
  }
}

main();

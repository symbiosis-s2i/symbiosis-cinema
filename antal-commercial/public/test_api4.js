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
        const statusOk = res.statusCode < 400;
        resolve({ status: res.statusCode, path, statusOk });
      });
    });

    req.on('error', (e) => {
      resolve({ status: 'ERROR', path, statusOk: false });
    });

    req.write('{}');
    req.end();
  });
}

async function main() {
  const paths = [
    '/v1/sync_lipsync',
    '/v1/sync-lipsync', 
    '/v1/lipsync',
    '/queue/fal-ai/sync-lipsync/requests',
    '/v1/request',
    '/'
  ];

  console.log('Testing endpoints...\n');
  for (const path of paths) {
    const result = await testEndpoint(path);
    console.log(`${result.path.padEnd(40)} -> ${result.status}`);
  }
}

main();

const https = require('https');

async function testWithKey(keyFormat, label) {
  const options = {
    hostname: 'api.fal.ai',
    port: 443,
    path: '/v1/fal-ai/sync-lipsync',
    method: 'POST',
    headers: {
      'Authorization': keyFormat,
      'Content-Type': 'application/json',
      'Content-Length': 2
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ label, status: res.statusCode, response: data.substring(0, 150) });
      });
    });

    req.on('error', (e) => {
      resolve({ label, status: 'ERROR', response: e.message });
    });

    req.write('{}');
    req.end();
  });
}

async function main() {
  const fullKey = process.env.FAL_KEY;
  const [id, token] = fullKey.split(':');
  
  const formats = [
    { key: `Key ${fullKey}`, label: 'Full Key with "Key" prefix' },
    { key: fullKey, label: 'Full Key without prefix' },
    { key: `Bearer ${token}`, label: 'Token with "Bearer" prefix' },
    { key: token, label: 'Token only' }
  ];

  console.log('Testing different key formats...\n');
  for (const format of formats) {
    const result = await testWithKey(format.key, format.label);
    console.log(`${result.label.padEnd(35)} -> ${result.status}`);
  }
}

main();

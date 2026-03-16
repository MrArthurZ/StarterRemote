const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ url, status: res.statusCode, isArray: Array.isArray(parsed), keys: Object.keys(parsed) });
        } catch (e) {
          resolve({ url, status: res.statusCode, error: 'Not JSON or too large', snippet: data.slice(0, 200) });
        }
      });
    }).on('error', reject);
  });
}

Promise.all([
  fetchJson('https://devitjobs.com/api/jobsList'),
  fetchJson('https://remoteok.com/api')
]).then(console.log).catch(console.error);

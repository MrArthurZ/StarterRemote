async function testCors(url) {
  try {
    const r = await fetch(url, { method: 'OPTIONS', headers: { 'Origin': 'http://localhost:3000' } });
    console.log(url, 'CORS headers:', r.headers.get('access-control-allow-origin'));
  } catch (e) { console.log(url, 'CORS error', e.message); }
}
testCors('https://remoteok.com/api');
testCors('https://himalayas.app/jobs/api');

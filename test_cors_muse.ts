async function testCorsGet(url) {
  try {
    const r = await fetch(url, { method: 'GET', headers: { 'Origin': 'http://localhost:3000' } });
    console.log(url, 'GET CORS headers:', r.headers.get('access-control-allow-origin'));
  } catch (e) { console.log(url, 'CORS error', e.message); }
}
testCorsGet('https://www.themuse.com/api/public/jobs?page=1');

async function test() {
  try {
    const r = await fetch('https://www.themuse.com/api/public/jobs?page=1');
    const d = await r.json();
    console.log('muse:', d.results.length);
  } catch (e) { console.log('muse error', e.message); }
}
test();

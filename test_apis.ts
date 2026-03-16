async function test() {
  try {
    const r1 = await fetch('https://devitjobs.com/api/jobsList');
    const d1 = await r1.json();
    console.log('devitjobs:', Array.isArray(d1), d1.length);
  } catch (e) { console.log('devitjobs error', e.message); }

  try {
    const r2 = await fetch('https://remoteok.com/api');
    const d2 = await r2.json();
    console.log('remoteok:', Array.isArray(d2), d2.length);
  } catch (e) { console.log('remoteok error', e.message); }

  try {
    const r3 = await fetch('https://himalayas.app/jobs/api');
    const d3 = await r3.json();
    console.log('himalayas:', Array.isArray(d3), Object.keys(d3));
  } catch (e) { console.log('himalayas error', e.message); }
}
test();

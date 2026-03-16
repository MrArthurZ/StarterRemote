async function test() {
  const r = await fetch('https://www.themuse.com/api/public/jobs?page=1&location=Flexible%20/%20Remote');
  const d = await r.json();
  console.log(JSON.stringify(d.results.slice(0, 1), null, 2));
}
test();

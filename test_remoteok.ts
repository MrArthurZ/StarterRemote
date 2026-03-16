async function test() {
  const r = await fetch('https://remoteok.com/api');
  const d = await r.json();
  console.log(JSON.stringify(d.slice(0, 2), null, 2));
}
test();

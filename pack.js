export default pack;

async function pack(html,ext={}) {
  const candidates = await Promise.all([
    `data:text/html${getCharsetParam(html)},${html}`,
    makePackedUrl("gzip", html),
    makePackedUrl("deflate", html),
    makePackedUrl("deflate-raw", html),
    ...(ext.makePackedUrls?.(html) ?? [])
  ]);

  if (ext?.index != null) return candidates[ext.index];

  let shortest = candidates[0];
  for (const c of candidates) {
    if (byteLength(c) < byteLength(shortest)) shortest = c;
  }

  return shortest;
}

async function makePackedUrl(format, html) {
  const payload = await formatPayload(format, html);

  const unpackCode = unpack.toString();
  const boot = unpackCode
    .slice(unpackCode.indexOf("\n"), -2)
    .replace(/\s*\n\s*/g, "")
    .replace("${payload}", payload)
    .replace("${format}", format);

  return `data:text/html${getCharsetParam(boot)},<body onload="${boot}">`;
}

function getCharsetParam(content) {
  const isAscii = /^[\x00-\x7F]*$/.test(content);
  return isAscii ? "" : ";charset=utf8";
}

async function formatPayload(format, html) {
  const comp = await new Response(
    new Blob([html])
      .stream()
      .pipeThrough(new CompressionStream(format))
  ).arrayBuffer();
  return btoa(String.fromCharCode(...new Uint8Array(comp)));
}

function byteLength(string) {
  return new TextEncoder().encode(string).length;
}

function unpack(payload, format) {
  fetch`data:;base64,${payload}`
  .then(a=>
    new Response(
      a.body
      .pipeThrough(new DecompressionStream(`${format}`))
    )
    .text()
    .then(a=>document.documentElement.innerHTML=a)
  )
}
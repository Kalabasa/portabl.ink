export default pack;

async function pack(html) {
  const candidates = await Promise.all([
    `data:text/html,${html}`,
    makePackedUrl("gzip", html),
    makePackedUrl("deflate", html),
    makePackedUrl("deflate-raw", html),
  ]);

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

  return `data:text/html,<body onload="${boot}">`;
}

async function formatPayload(format, html) {
  const data = new Blob([html]).stream()
    .pipeThrough(new CompressionStream(format))
  const buffer = await new Response(data).arrayBuffer();
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function byteLength(string) {
  byteLength.textEncoder = byteLength.textEncoder ?? new TextEncoder();
  return byteLength.textEncoder.encode(string).length;
}

// This function doesn't actually get called at pack time
function unpack(payload, format) {
  fetch`data:;base64,${payload}`
    .then(a =>
      new Response(
        a.body
          .pipeThrough(new DecompressionStream(`${format}`))
      )
        .text()
        .then(a => document.write(a))
    )
}
const data = new Blob([document.body.innerHTML]).stream()
  .pipeThrough(new CompressionStream("deflate-raw"))
const buffer = await new Response(data).arrayBuffer();
const payload = btoa(String.fromCharCode(...new Uint8Array(buffer)));

const unpackJs = await fetch("unpack.js");
const bootstrap = (await unpackJs.text()).replace( "$payload$", payload).replace(/\s*\n\s*/g, "");

const url = `data:text/html,<body onload="${bootstrap}">`;

const a = document.createElement('a');
a.href = url;
a.textContent = "📦 Packed link";
a.style = "z-index: 99999999; position: fixed; right: 50%; padding: 20px; background: yellow; font: 20px sans-serif;"
a.onclick = async () => {
  await navigator.clipboard.writeText(url);
  a.textContent += " (Link copied!)";
};
document.body.prepend(a);
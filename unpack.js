fetch`data:;base64,$payload$`
.then(a=>
  new Response(
    a.body
    .pipeThrough(new DecompressionStream('deflate-raw'))
  )
  .text()
  .then(a=>document.write(a))
)
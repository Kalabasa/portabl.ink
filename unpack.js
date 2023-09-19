fetch`data:;base64,$payload$`
.then(a=>
  new Response(
    a.body
    .pipeThrough(new DecompressionStream('$format$'))
  )
  .text()
  .then(a=>document.write(a))
)
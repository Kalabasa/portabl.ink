#!/usr/bin/env bash
serve () {
openssl req \
  -new \
  -days 365 \
  -nodes \
  -x509 \
  -subj /CN=dev.portabl.ink \
  -keyout /tmp/dev.portabl.ink.pem \
  -out /tmp/dev.portabl.ink.pem
authbind python -c "
import ssl
from http.server import HTTPServer, SimpleHTTPRequestHandler
CERTFILE = '/tmp/dev.portabl.ink.pem'
context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain(CERTFILE)
server_address = ('', 443)
with HTTPServer(server_address, SimpleHTTPRequestHandler) as httpd:
  httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
  print(f'''Server info:
  name: {httpd.server_name}
  address: {httpd.server_address}
  ''')
  try:
    httpd.serve_forever()
  except Exception as e:
    httpd.server_close()
    raise e"
}

run () {
google-chrome-stable --user-data-dir=`mktemp -d` --no-first-run --host-rules='MAP portabl.ink 127.0.0.1' 'https://portabl.ink'
}

(trap 'kill 0' SIGINT; serve & run)

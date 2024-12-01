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
# To allow python to bind to port 443 without root, install authbind then,
#   sudo touch /etc/authbind/byport/443
#   sudo chown $USER /etc/authbind/byport/443
#   sudo chmod 500 /etc/authbind/byport/443
authbind python -c "
import ssl
from http.server import HTTPServer, SimpleHTTPRequestHandler

CERTFILE = '/tmp/dev.portabl.ink.pem'
context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain(CERTFILE)
server_address = ('', 443)

class CustomHTTPRequestHandler(SimpleHTTPRequestHandler):
  def translate_path(self, path):
    if path.startswith('/portabl.ink'):
      path = path[len('/portabl.ink'):]
    return super().translate_path(path)

with HTTPServer(server_address, CustomHTTPRequestHandler) as httpd:
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
google-chrome-stable \
  --user-data-dir=`mktemp -d` \
  --no-first-run \
  --ignore-certificate-errors \
  --host-rules='MAP kalabasa.github.io 127.0.0.1' \
  'https://kalabasa.github.io/portabl.ink'
}

trap 'kill 0' SIGINT
serve &
run
kill 0
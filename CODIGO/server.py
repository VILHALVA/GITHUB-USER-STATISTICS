from http.server import SimpleHTTPRequestHandler, HTTPServer
import json
import pandas as pd
import urllib.parse
import urllib.request

class RequestHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path)
        if parsed_path.path == '/api/github':
            query_params = urllib.parse.parse_qs(parsed_path.query)
            username = query_params.get('username', [None])[0]
            
            if not username:
                self.send_response(400)
                self.send_header('Content-Type', 'text/plain')
                self.end_headers()
                self.wfile.write(b'Username parameter is missing.')
                return

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()

            url = f'https://api.github.com/users/{username}/repos'
            try:
                response = urllib.request.urlopen(url)
                data = json.loads(response.read().decode('utf-8'))
                df = pd.DataFrame(data)
                df_json = df.to_json(orient='records')
                self.wfile.write(df_json.encode('utf-8'))
            except urllib.error.HTTPError as e:
                self.send_response(e.code)
                self.send_header('Content-Type', 'text/plain')
                self.end_headers()
                self.wfile.write(f'Error fetching data: {e.reason}'.encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'text/plain')
                self.end_headers()
                self.wfile.write(f'Internal Server Error: {str(e)}'.encode('utf-8'))
        else:
            super().do_GET()

def run(server_class=HTTPServer, handler_class=RequestHandler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'SERVIDOR RODANDO NA PORTA {port}...')
    httpd.serve_forever()

if __name__ == "__main__":
    run()

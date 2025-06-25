from http.server import BaseHTTPRequestHandler
import json
from datetime import datetime


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        health_data = {
            'status': 'healthy',
            'service': 'ai-guardian-vercel',
            'timestamp': datetime.utcnow().isoformat(),
            'version': '1.0.0',
            'platform': 'vercel-serverless',
            'endpoints': [
                '/api/scan',
                '/api/health',
                '/api/learn',
                '/api/compliance'
            ]
        }
        
        self.wfile.write(json.dumps(health_data).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers() 
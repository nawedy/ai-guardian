from http.server import BaseHTTPRequestHandler
import json
import os
import sys
import re
import uuid
import time
from datetime import datetime
from urllib.parse import parse_qs

# Add project root to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

class VulnerabilityScanner:
    """Simplified vulnerability scanner for serverless deployment"""
    
    def __init__(self):
        self.patterns = {
            'HARDCODED_SECRET': [
                r'password\s*=\s*["\'][^"\']{8,}["\']',
                r'api_key\s*=\s*["\'][^"\']{20,}["\']',
                r'secret\s*=\s*["\'][^"\']{16,}["\']',
                r'token\s*=\s*["\'][^"\']{20,}["\']'
            ],
            'SQL_INJECTION': [
                r'execute\s*\(\s*["\'].*%s.*["\']',
                r'query\s*\(\s*["\'].*\+.*["\']',
                r'SELECT\s+.*\+.*FROM',
                r'cursor\.execute\s*\([^)]*%[^)]*\)'
            ],
            'XSS': [
                r'innerHTML\s*=\s*.*\+',
                r'document\.write\s*\(',
                r'eval\s*\(',
                r'dangerouslySetInnerHTML'
            ],
            'CSRF': [
                r'@app\.route.*methods.*POST.*without.*csrf',
                r'request\.form.*without.*validation',
                r'<form.*without.*token'
            ]
        }
    
    def scan_code(self, code, language='python', filename='temp.py'):
        """Scan code for vulnerabilities"""
        start_time = time.time()
        scan_id = str(uuid.uuid4())[:8]
        vulnerabilities = []
        
        lines = code.split('\n')
        
        for line_num, line in enumerate(lines, 1):
            for vuln_type, patterns in self.patterns.items():
                for pattern in patterns:
                    if re.search(pattern, line, re.IGNORECASE):
                        vulnerabilities.append({
                            'id': f"{vuln_type}_{uuid.uuid4().hex[:8]}",
                            'type': vuln_type,
                            'name': vuln_type.replace('_', ' ').title(),
                            'severity': self._get_severity(vuln_type),
                            'confidence': 0.85,
                            'line': line_num,
                            'column': line.find(re.search(pattern, line, re.IGNORECASE).group()) + 1,
                            'description': self._get_description(vuln_type),
                            'fix_suggestion': self._get_fix_suggestion(vuln_type),
                            'code_snippet': line.strip()
                        })
        
        scan_time = time.time() - start_time
        
        return {
            'scan_id': f"scan_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{scan_id}",
            'timestamp': datetime.utcnow().isoformat(),
            'vulnerabilities': vulnerabilities,
            'scan_time': round(scan_time, 3),
            'language': language,
            'filename': filename,
            'total_lines': len(lines),
            'summary': {
                'total': len(vulnerabilities),
                'critical': len([v for v in vulnerabilities if v['severity'] == 'CRITICAL']),
                'high': len([v for v in vulnerabilities if v['severity'] == 'HIGH']),
                'medium': len([v for v in vulnerabilities if v['severity'] == 'MEDIUM']),
                'low': len([v for v in vulnerabilities if v['severity'] == 'LOW'])
            }
        }
    
    def _get_severity(self, vuln_type):
        severity_map = {
            'HARDCODED_SECRET': 'CRITICAL',
            'SQL_INJECTION': 'HIGH',
            'XSS': 'HIGH',
            'CSRF': 'MEDIUM'
        }
        return severity_map.get(vuln_type, 'MEDIUM')
    
    def _get_description(self, vuln_type):
        descriptions = {
            'HARDCODED_SECRET': 'Hardcoded password, API key, or secret detected in source code',
            'SQL_INJECTION': 'Potential SQL injection vulnerability through dynamic query construction',
            'XSS': 'Cross-site scripting vulnerability through unsafe DOM manipulation',
            'CSRF': 'Cross-site request forgery vulnerability due to missing protection'
        }
        return descriptions.get(vuln_type, 'Security vulnerability detected')
    
    def _get_fix_suggestion(self, vuln_type):
        suggestions = {
            'HARDCODED_SECRET': 'Move secrets to environment variables or secure configuration',
            'SQL_INJECTION': 'Use parameterized queries or prepared statements',
            'XSS': 'Sanitize user input and use safe DOM manipulation methods',
            'CSRF': 'Implement CSRF tokens and validate requests'
        }
        return suggestions.get(vuln_type, 'Follow security best practices')

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Handle CORS
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            self.end_headers()
            
            # Parse request body
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length:
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
            else:
                data = {}
            
            # Initialize scanner
            scanner = VulnerabilityScanner()
            
            # Perform scan
            result = scanner.scan_code(
                code=data.get('code', ''),
                language=data.get('language', 'python'),
                filename=data.get('filename', 'temp.py')
            )
            
            # Return response
            self.wfile.write(json.dumps(result).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_response = {
                'error': str(e),
                'message': 'Internal server error during scanning',
                'scan_id': None,
                'timestamp': datetime.utcnow().isoformat()
            }
            self.wfile.write(json.dumps(error_response).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def do_GET(self):
        # Handle health check
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        health_data = {
            'status': 'healthy',
            'service': 'ai-guardian-scanner',
            'timestamp': datetime.utcnow().isoformat(),
            'version': '1.0.0',
            'platform': 'vercel-serverless'
        }
        
        self.wfile.write(json.dumps(health_data).encode()) 
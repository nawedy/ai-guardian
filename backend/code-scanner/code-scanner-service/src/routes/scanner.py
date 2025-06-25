from flask import Blueprint, jsonify, request
from datetime import datetime
import ast
import re
import hashlib
import json
import os
from typing import Dict, List, Any
from src.external_scanners import ExternalScannerIntegration

scanner_bp = Blueprint('scanner', __name__)

class VulnerabilityScanner:
    """Core vulnerability scanning engine"""
    
    def __init__(self):
        self.vulnerability_patterns = self._load_vulnerability_patterns()
        self.supported_languages = ['python', 'javascript', 'java', 'csharp', 'go', 'rust']
        self.external_scanners = ExternalScannerIntegration()
    
    def _load_vulnerability_patterns(self) -> Dict[str, List[Dict]]:
        """Load vulnerability detection patterns"""
        return {
            'python': [
                {
                    'id': 'PY001',
                    'type': 'SQL_INJECTION',
                    'severity': 'HIGH',
                    'pattern': r'execute\s*\(\s*["\'].*%.*["\']',
                    'description': 'Potential SQL injection vulnerability',
                    'recommendation': 'Use parameterized queries instead of string formatting'
                },
                {
                    'id': 'PY002',
                    'type': 'XSS',
                    'severity': 'HIGH',
                    'pattern': r'render_template_string\s*\(\s*.*\+.*\)',
                    'description': 'Potential XSS vulnerability in template rendering',
                    'recommendation': 'Use safe template rendering with proper escaping'
                },
                {
                    'id': 'PY003',
                    'type': 'HARDCODED_SECRET',
                    'severity': 'CRITICAL',
                    'pattern': r'(password|secret|key|token)\s*=\s*["\'][^"\']{8,}["\']',
                    'description': 'Hardcoded secret detected',
                    'recommendation': 'Use environment variables or secure configuration'
                },
                {
                    'id': 'PY004',
                    'type': 'EVAL_INJECTION',
                    'severity': 'CRITICAL',
                    'pattern': r'eval\s*\(\s*.*input.*\)',
                    'description': 'Code injection via eval() with user input',
                    'recommendation': 'Avoid using eval() with user input'
                }
            ],
            'javascript': [
                {
                    'id': 'JS001',
                    'type': 'XSS',
                    'severity': 'HIGH',
                    'pattern': r'innerHTML\s*=\s*.*\+.*',
                    'description': 'Potential XSS vulnerability via innerHTML',
                    'recommendation': 'Use textContent or proper sanitization'
                },
                {
                    'id': 'JS002',
                    'type': 'EVAL_INJECTION',
                    'severity': 'CRITICAL',
                    'pattern': r'eval\s*\(\s*.*\)',
                    'description': 'Use of eval() function',
                    'recommendation': 'Avoid eval() and use safer alternatives'
                },
                {
                    'id': 'JS003',
                    'type': 'HARDCODED_SECRET',
                    'severity': 'CRITICAL',
                    'pattern': r'(apiKey|secret|password|token)\s*[:=]\s*["\'][^"\']{8,}["\']',
                    'description': 'Hardcoded API key or secret',
                    'recommendation': 'Use environment variables for secrets'
                }
            ]
        }
    
    def scan_code(self, code: str, language: str, filename: str = None) -> List[Dict[str, Any]]:
        """Scan code for vulnerabilities"""
        vulnerabilities = []
        
        if language not in self.supported_languages:
            return vulnerabilities
        
        patterns = self.vulnerability_patterns.get(language, [])
        lines = code.split('\n')
        
        for line_num, line in enumerate(lines, 1):
            for pattern in patterns:
                if re.search(pattern['pattern'], line, re.IGNORECASE):
                    vulnerability = {
                        'id': f"{pattern['id']}_{hashlib.md5(f'{filename}_{line_num}'.encode()).hexdigest()[:8]}",
                        'type': pattern['type'],
                        'severity': pattern['severity'],
                        'file': filename or 'unknown',
                        'line': line_num,
                        'code_snippet': line.strip(),
                        'description': pattern['description'],
                        'recommendation': pattern['recommendation'],
                        'timestamp': datetime.utcnow().isoformat()
                    }
                    vulnerabilities.append(vulnerability)
        
        # Additional AST-based analysis for Python
        if language == 'python':
            vulnerabilities.extend(self._python_ast_analysis(code, filename))
        
        # Run external scanners
        if language == 'python' and self.external_scanners.bandit_available:
            external_vulns = self.external_scanners.run_bandit_scan(code, filename)
            vulnerabilities.extend(external_vulns)
        
        if self.external_scanners.semgrep_available:
            external_vulns = self.external_scanners.run_semgrep_scan(code, language, filename)
            vulnerabilities.extend(external_vulns)
        
        return vulnerabilities
    
    def _python_ast_analysis(self, code: str, filename: str = None) -> List[Dict[str, Any]]:
        """Advanced Python AST analysis"""
        vulnerabilities = []
        
        try:
            tree = ast.parse(code)
            
            for node in ast.walk(tree):
                # Check for dangerous function calls
                if isinstance(node, ast.Call):
                    if isinstance(node.func, ast.Name):
                        if node.func.id in ['exec', 'eval', 'compile']:
                            vulnerability = {
                                'id': f"AST001_{hashlib.md5(f'{filename}_{node.lineno}'.encode()).hexdigest()[:8]}",
                                'type': 'CODE_INJECTION',
                                'severity': 'CRITICAL',
                                'file': filename or 'unknown',
                                'line': node.lineno,
                                'code_snippet': f"Use of {node.func.id}()",
                                'description': f'Dangerous use of {node.func.id}() function',
                                'recommendation': 'Avoid dynamic code execution',
                                'timestamp': datetime.utcnow().isoformat()
                            }
                            vulnerabilities.append(vulnerability)
                
                # Check for hardcoded strings that might be secrets
                if isinstance(node, ast.Str) and len(node.s) > 20:
                    if any(keyword in node.s.lower() for keyword in ['password', 'secret', 'key', 'token']):
                        vulnerability = {
                            'id': f"AST002_{hashlib.md5(f'{filename}_{node.lineno}'.encode()).hexdigest()[:8]}",
                            'type': 'HARDCODED_SECRET',
                            'severity': 'HIGH',
                            'file': filename or 'unknown',
                            'line': node.lineno,
                            'code_snippet': 'Potential hardcoded secret',
                            'description': 'Potential hardcoded secret in string literal',
                            'recommendation': 'Use environment variables or secure configuration',
                            'timestamp': datetime.utcnow().isoformat()
                        }
                        vulnerabilities.append(vulnerability)
        
        except SyntaxError:
            # Code has syntax errors, skip AST analysis
            pass
        
        return vulnerabilities

# Initialize scanner
scanner = VulnerabilityScanner()

@scanner_bp.route('/scan', methods=['POST'])
def scan_code():
    """Scan code for vulnerabilities"""
    try:
        data = request.json
        
        if not data or 'code' not in data:
            return jsonify({'error': 'Code content is required'}), 400
        
        code = data['code']
        language = data.get('language', 'python').lower()
        filename = data.get('filename', 'unknown')
        
        # Perform vulnerability scan
        vulnerabilities = scanner.scan_code(code, language, filename)
        
        # Generate scan summary
        summary = {
            'total_vulnerabilities': len(vulnerabilities),
            'critical': len([v for v in vulnerabilities if v['severity'] == 'CRITICAL']),
            'high': len([v for v in vulnerabilities if v['severity'] == 'HIGH']),
            'medium': len([v for v in vulnerabilities if v['severity'] == 'MEDIUM']),
            'low': len([v for v in vulnerabilities if v['severity'] == 'LOW'])
        }
        
        scan_result = {
            'scan_id': hashlib.md5(f"{code}_{datetime.utcnow()}".encode()).hexdigest()[:16],
            'timestamp': datetime.utcnow().isoformat(),
            'language': language,
            'filename': filename,
            'vulnerabilities': vulnerabilities,
            'summary': summary,
            'status': 'completed'
        }
        
        return jsonify(scan_result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@scanner_bp.route('/scan/file', methods=['POST'])
def scan_file():
    """Scan uploaded file for vulnerabilities"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Read file content
        code = file.read().decode('utf-8')
        filename = file.filename
        
        # Detect language from file extension
        language_map = {
            '.py': 'python',
            '.js': 'javascript',
            '.java': 'java',
            '.cs': 'csharp',
            '.go': 'go',
            '.rs': 'rust'
        }
        
        file_ext = os.path.splitext(filename)[1].lower()
        language = language_map.get(file_ext, 'unknown')
        
        if language == 'unknown':
            return jsonify({'error': f'Unsupported file type: {file_ext}'}), 400
        
        # Perform scan
        vulnerabilities = scanner.scan_code(code, language, filename)
        
        # Generate summary
        summary = {
            'total_vulnerabilities': len(vulnerabilities),
            'critical': len([v for v in vulnerabilities if v['severity'] == 'CRITICAL']),
            'high': len([v for v in vulnerabilities if v['severity'] == 'HIGH']),
            'medium': len([v for v in vulnerabilities if v['severity'] == 'MEDIUM']),
            'low': len([v for v in vulnerabilities if v['severity'] == 'LOW'])
        }
        
        scan_result = {
            'scan_id': hashlib.md5(f"{code}_{datetime.utcnow()}".encode()).hexdigest()[:16],
            'timestamp': datetime.utcnow().isoformat(),
            'language': language,
            'filename': filename,
            'vulnerabilities': vulnerabilities,
            'summary': summary,
            'status': 'completed'
        }
        
        return jsonify(scan_result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@scanner_bp.route('/scan/batch', methods=['POST'])
def scan_batch():
    """Scan multiple files in batch"""
    try:
        data = request.json
        
        if not data or 'files' not in data:
            return jsonify({'error': 'Files array is required'}), 400
        
        files = data['files']
        batch_results = []
        
        for file_data in files:
            if 'code' not in file_data or 'filename' not in file_data:
                continue
            
            code = file_data['code']
            filename = file_data['filename']
            language = file_data.get('language', 'python').lower()
            
            vulnerabilities = scanner.scan_code(code, language, filename)
            
            summary = {
                'total_vulnerabilities': len(vulnerabilities),
                'critical': len([v for v in vulnerabilities if v['severity'] == 'CRITICAL']),
                'high': len([v for v in vulnerabilities if v['severity'] == 'HIGH']),
                'medium': len([v for v in vulnerabilities if v['severity'] == 'MEDIUM']),
                'low': len([v for v in vulnerabilities if v['severity'] == 'LOW'])
            }
            
            file_result = {
                'filename': filename,
                'language': language,
                'vulnerabilities': vulnerabilities,
                'summary': summary
            }
            
            batch_results.append(file_result)
        
        # Overall batch summary
        total_vulnerabilities = sum(result['summary']['total_vulnerabilities'] for result in batch_results)
        overall_summary = {
            'total_files': len(batch_results),
            'total_vulnerabilities': total_vulnerabilities,
            'critical': sum(result['summary']['critical'] for result in batch_results),
            'high': sum(result['summary']['high'] for result in batch_results),
            'medium': sum(result['summary']['medium'] for result in batch_results),
            'low': sum(result['summary']['low'] for result in batch_results)
        }
        
        batch_scan_result = {
            'batch_id': hashlib.md5(f"{json.dumps(files)}_{datetime.utcnow()}".encode()).hexdigest()[:16],
            'timestamp': datetime.utcnow().isoformat(),
            'results': batch_results,
            'summary': overall_summary,
            'status': 'completed'
        }
        
        return jsonify(batch_scan_result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@scanner_bp.route('/patterns', methods=['GET'])
def get_patterns():
    """Get available vulnerability patterns"""
    return jsonify({
        'supported_languages': scanner.supported_languages,
        'patterns': scanner.vulnerability_patterns
    })

@scanner_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'code-scanner',
        'timestamp': datetime.utcnow().isoformat(),
        'supported_languages': scanner.supported_languages
    })


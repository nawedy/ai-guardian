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
        self.supported_languages = [
            'python', 'javascript', 'typescript', 'java', 'csharp', 'go', 'rust', 
            'cpp', 'c', 'php', 'ruby', 'swift', 'kotlin', 'scala', 'html', 'css', 
            'sql', 'shell', 'powershell', 'r', 'matlab', 'perl', 'lua', 'dart'
        ]
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
                    'type': 'WEAK_CRYPTO',
                    'severity': 'MEDIUM',
                    'pattern': r'md5\(|sha1\(',
                    'description': 'Weak cryptographic hash function',
                    'recommendation': 'Use stronger hash functions like SHA-256 or bcrypt'
                },
                {
                    'id': 'PY005',
                    'type': 'UNSAFE_EVAL',
                    'severity': 'HIGH',
                    'pattern': r'eval\s*\(',
                    'description': 'Unsafe use of eval() function',
                    'recommendation': 'Avoid eval() or use ast.literal_eval() for safe evaluation'
                }
            ],
            'javascript': [
                {
                    'id': 'JS001',
                    'type': 'XSS',
                    'severity': 'HIGH',
                    'pattern': r'innerHTML\s*=\s*.*\+',
                    'description': 'Potential XSS vulnerability with innerHTML',
                    'recommendation': 'Use textContent or sanitize input before setting innerHTML'
                },
                {
                    'id': 'JS002',
                    'type': 'UNSAFE_EVAL',
                    'severity': 'HIGH',
                    'pattern': r'eval\s*\(',
                    'description': 'Unsafe use of eval() function',
                    'recommendation': 'Avoid eval() or use JSON.parse() for safe evaluation'
                },
                {
                    'id': 'JS003',
                    'type': 'HARDCODED_SECRET',
                    'severity': 'CRITICAL',
                    'pattern': r'(password|secret|key|token|apikey)\s*[:=]\s*["\'][^"\']{8,}["\']',
                    'description': 'Hardcoded secret detected',
                    'recommendation': 'Use environment variables or secure configuration'
                },
                {
                    'id': 'JS004',
                    'type': 'WEAK_RANDOMNESS',
                    'severity': 'MEDIUM',
                    'pattern': r'Math\.random\(\)',
                    'description': 'Weak random number generation',
                    'recommendation': 'Use crypto.getRandomValues() for cryptographic purposes'
                },
                {
                    'id': 'JS005',
                    'type': 'PROTOTYPE_POLLUTION',
                    'severity': 'HIGH',
                    'pattern': r'__proto__|\[.*constructor.*\]',
                    'description': 'Potential prototype pollution vulnerability',
                    'recommendation': 'Validate and sanitize object properties'
                }
            ],
            'typescript': [
                {
                    'id': 'TS001',
                    'type': 'ANY_TYPE',
                    'severity': 'LOW',
                    'pattern': r':\s*any\b',
                    'description': 'Use of any type reduces type safety',
                    'recommendation': 'Use specific types instead of any'
                },
                {
                    'id': 'TS002',
                    'type': 'XSS',
                    'severity': 'HIGH',
                    'pattern': r'innerHTML\s*=\s*.*\+',
                    'description': 'Potential XSS vulnerability with innerHTML',
                    'recommendation': 'Use textContent or sanitize input before setting innerHTML'
                },
                {
                    'id': 'TS003',
                    'type': 'HARDCODED_SECRET',
                    'severity': 'CRITICAL',
                    'pattern': r'(password|secret|key|token|apikey)\s*[:=]\s*["\'][^"\']{8,}["\']',
                    'description': 'Hardcoded secret detected',
                    'recommendation': 'Use environment variables or secure configuration'
                },
                {
                    'id': 'TS004',
                    'type': 'UNSAFE_ASSERTION',
                    'severity': 'MEDIUM',
                    'pattern': r'as\s+any|!\s*$',
                    'description': 'Unsafe type assertion',
                    'recommendation': 'Use proper type guards instead of unsafe assertions'
                }
            ],
            'java': [
                {
                    'id': 'JV001',
                    'type': 'SQL_INJECTION',
                    'severity': 'HIGH',
                    'pattern': r'Statement.*executeQuery\s*\(\s*["\'].*\+.*["\']',
                    'description': 'Potential SQL injection vulnerability',
                    'recommendation': 'Use PreparedStatement with parameterized queries'
                },
                {
                    'id': 'JV002',
                    'type': 'HARDCODED_SECRET',
                    'severity': 'CRITICAL',
                    'pattern': r'(password|secret|key|token)\s*=\s*["\'][^"\']{8,}["\']',
                    'description': 'Hardcoded secret detected',
                    'recommendation': 'Use external configuration or environment variables'
                },
                {
                    'id': 'JV003',
                    'type': 'WEAK_CRYPTO',
                    'severity': 'MEDIUM',
                    'pattern': r'MessageDigest\.getInstance\s*\(\s*["\']MD5["\']',
                    'description': 'Weak cryptographic hash function',
                    'recommendation': 'Use SHA-256 or stronger hash functions'
                },
                {
                    'id': 'JV004',
                    'type': 'DESERIALIZATION',
                    'severity': 'HIGH',
                    'pattern': r'ObjectInputStream.*readObject',
                    'description': 'Unsafe deserialization',
                    'recommendation': 'Validate object types before deserialization'
                }
            ],
            'csharp': [
                {
                    'id': 'CS001',
                    'type': 'SQL_INJECTION',
                    'severity': 'HIGH',
                    'pattern': r'SqlCommand.*CommandText\s*=\s*.*\+',
                    'description': 'Potential SQL injection vulnerability',
                    'recommendation': 'Use parameterized queries with SqlParameter'
                },
                {
                    'id': 'CS002',
                    'type': 'HARDCODED_SECRET',
                    'severity': 'CRITICAL',
                    'pattern': r'(password|secret|key|token)\s*=\s*["\'][^"\']{8,}["\']',
                    'description': 'Hardcoded secret detected',
                    'recommendation': 'Use configuration files or environment variables'
                },
                {
                    'id': 'CS003',
                    'type': 'WEAK_CRYPTO',
                    'severity': 'MEDIUM',
                    'pattern': r'MD5\.Create|SHA1\.Create',
                    'description': 'Weak cryptographic hash function',
                    'recommendation': 'Use SHA256 or stronger hash functions'
                }
            ],
            'go': [
                {
                    'id': 'GO001',
                    'type': 'SQL_INJECTION',
                    'severity': 'HIGH',
                    'pattern': r'Query\s*\(\s*["\'].*\+.*["\']',
                    'description': 'Potential SQL injection vulnerability',
                    'recommendation': 'Use prepared statements with placeholders'
                },
                {
                    'id': 'GO002',
                    'type': 'HARDCODED_SECRET',
                    'severity': 'CRITICAL',
                    'pattern': r'(password|secret|key|token)\s*:=\s*["\'][^"\']{8,}["\']',
                    'description': 'Hardcoded secret detected',
                    'recommendation': 'Use environment variables or configuration files'
                },
                {
                    'id': 'GO003',
                    'type': 'WEAK_CRYPTO',
                    'severity': 'MEDIUM',
                    'pattern': r'md5\.Sum|sha1\.Sum',
                    'description': 'Weak cryptographic hash function',
                    'recommendation': 'Use SHA-256 or stronger hash functions'
                }
            ],
            'rust': [
                {
                    'id': 'RS001',
                    'type': 'UNSAFE_CODE',
                    'severity': 'MEDIUM',
                    'pattern': r'unsafe\s*{',
                    'description': 'Unsafe code block detected',
                    'recommendation': 'Review unsafe code for memory safety issues'
                },
                {
                    'id': 'RS002',
                    'type': 'HARDCODED_SECRET',
                    'severity': 'CRITICAL',
                    'pattern': r'(password|secret|key|token)\s*=\s*["\'][^"\']{8,}["\']',
                    'description': 'Hardcoded secret detected',
                    'recommendation': 'Use environment variables or configuration files'
                }
            ],
            'php': [
                {
                    'id': 'PHP001',
                    'type': 'SQL_INJECTION',
                    'severity': 'HIGH',
                    'pattern': r'mysql_query\s*\(\s*["\'].*\$.*["\']',
                    'description': 'Potential SQL injection vulnerability',
                    'recommendation': 'Use prepared statements with PDO or mysqli'
                },
                {
                    'id': 'PHP002',
                    'type': 'XSS',
                    'severity': 'HIGH',
                    'pattern': r'echo\s+\$_GET|echo\s+\$_POST',
                    'description': 'Potential XSS vulnerability',
                    'recommendation': 'Use htmlspecialchars() to escape output'
                },
                {
                    'id': 'PHP003',
                    'type': 'FILE_INCLUSION',
                    'severity': 'HIGH',
                    'pattern': r'include\s*\(\s*\$_GET|require\s*\(\s*\$_GET',
                    'description': 'Potential file inclusion vulnerability',
                    'recommendation': 'Validate and sanitize file paths'
                }
            ],
            'cpp': [
                {
                    'id': 'CPP001',
                    'type': 'BUFFER_OVERFLOW',
                    'severity': 'HIGH',
                    'pattern': r'strcpy\s*\(|strcat\s*\(|sprintf\s*\(',
                    'description': 'Potential buffer overflow vulnerability',
                    'recommendation': 'Use safe alternatives like strncpy, strncat, snprintf'
                },
                {
                    'id': 'CPP002',
                    'type': 'MEMORY_LEAK',
                    'severity': 'MEDIUM',
                    'pattern': r'new\s+\w+(?!.*delete)',
                    'description': 'Potential memory leak - new without delete',
                    'recommendation': 'Use smart pointers or ensure proper memory management'
                }
            ],
            'sql': [
                {
                    'id': 'SQL001',
                    'type': 'SQL_INJECTION',
                    'severity': 'HIGH',
                    'pattern': r'EXEC\s*\(\s*@|sp_executesql\s*@',
                    'description': 'Dynamic SQL execution detected',
                    'recommendation': 'Use parameterized queries to prevent SQL injection'
                },
                {
                    'id': 'SQL002',
                    'type': 'WEAK_AUTH',
                    'severity': 'MEDIUM',
                    'pattern': r'password\s*=\s*["\']["\']|pwd\s*=\s*["\']["\']',
                    'description': 'Empty password detected',
                    'recommendation': 'Use strong passwords and secure authentication'
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


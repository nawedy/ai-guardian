import subprocess
import json
import tempfile
import os
from typing import Dict, List, Any

class ExternalScannerIntegration:
    """Integration with external SAST tools"""
    
    def __init__(self):
        self.bandit_available = self._check_bandit()
        self.semgrep_available = self._check_semgrep()
    
    def _check_bandit(self) -> bool:
        """Check if Bandit is available"""
        try:
            subprocess.run(['bandit', '--version'], capture_output=True, check=True)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False
    
    def _check_semgrep(self) -> bool:
        """Check if Semgrep is available"""
        try:
            subprocess.run(['semgrep', '--version'], capture_output=True, check=True)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False
    
    def run_bandit_scan(self, code: str, filename: str = None) -> List[Dict[str, Any]]:
        """Run Bandit security scan on Python code"""
        if not self.bandit_available:
            return []
        
        vulnerabilities = []
        
        try:
            # Create temporary file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as temp_file:
                temp_file.write(code)
                temp_file_path = temp_file.name
            
            # Run Bandit
            result = subprocess.run([
                'bandit', '-f', 'json', temp_file_path
            ], capture_output=True, text=True)
            
            # Clean up temp file
            os.unlink(temp_file_path)
            
            if result.stdout:
                bandit_output = json.loads(result.stdout)
                
                for issue in bandit_output.get('results', []):
                    vulnerability = {
                        'id': f"BANDIT_{issue.get('test_id', 'UNKNOWN')}_{hash(issue.get('filename', '') + str(issue.get('line_number', 0))) % 10000:04d}",
                        'type': issue.get('test_name', 'UNKNOWN').upper().replace(' ', '_'),
                        'severity': self._map_bandit_severity(issue.get('issue_severity', 'LOW')),
                        'file': filename or 'unknown',
                        'line': issue.get('line_number', 0),
                        'code_snippet': issue.get('code', '').strip(),
                        'description': issue.get('issue_text', ''),
                        'recommendation': f"Bandit recommendation: {issue.get('test_name', '')}",
                        'confidence': issue.get('issue_confidence', 'UNKNOWN'),
                        'source': 'bandit'
                    }
                    vulnerabilities.append(vulnerability)
        
        except Exception as e:
            print(f"Error running Bandit: {e}")
        
        return vulnerabilities
    
    def run_semgrep_scan(self, code: str, language: str, filename: str = None) -> List[Dict[str, Any]]:
        """Run Semgrep security scan"""
        if not self.semgrep_available:
            return []
        
        vulnerabilities = []
        
        try:
            # Map language to file extension
            ext_map = {
                'python': '.py',
                'javascript': '.js',
                'java': '.java',
                'go': '.go',
                'rust': '.rs'
            }
            
            file_ext = ext_map.get(language, '.txt')
            
            # Create temporary file
            with tempfile.NamedTemporaryFile(mode='w', suffix=file_ext, delete=False) as temp_file:
                temp_file.write(code)
                temp_file_path = temp_file.name
            
            # Run Semgrep with security rules
            result = subprocess.run([
                'semgrep', '--config=auto', '--json', temp_file_path
            ], capture_output=True, text=True)
            
            # Clean up temp file
            os.unlink(temp_file_path)
            
            if result.stdout:
                semgrep_output = json.loads(result.stdout)
                
                for finding in semgrep_output.get('results', []):
                    vulnerability = {
                        'id': f"SEMGREP_{finding.get('check_id', 'UNKNOWN').replace('.', '_')}_{hash(str(finding.get('start', {}))) % 10000:04d}",
                        'type': self._extract_vulnerability_type(finding.get('check_id', '')),
                        'severity': self._map_semgrep_severity(finding.get('extra', {}).get('severity', 'INFO')),
                        'file': filename or 'unknown',
                        'line': finding.get('start', {}).get('line', 0),
                        'code_snippet': finding.get('extra', {}).get('lines', '').strip(),
                        'description': finding.get('extra', {}).get('message', ''),
                        'recommendation': f"Semgrep rule: {finding.get('check_id', '')}",
                        'source': 'semgrep'
                    }
                    vulnerabilities.append(vulnerability)
        
        except Exception as e:
            print(f"Error running Semgrep: {e}")
        
        return vulnerabilities
    
    def _map_bandit_severity(self, severity: str) -> str:
        """Map Bandit severity to our standard levels"""
        mapping = {
            'LOW': 'LOW',
            'MEDIUM': 'MEDIUM',
            'HIGH': 'HIGH'
        }
        return mapping.get(severity.upper(), 'MEDIUM')
    
    def _map_semgrep_severity(self, severity: str) -> str:
        """Map Semgrep severity to our standard levels"""
        mapping = {
            'INFO': 'LOW',
            'WARNING': 'MEDIUM',
            'ERROR': 'HIGH'
        }
        return mapping.get(severity.upper(), 'MEDIUM')
    
    def _extract_vulnerability_type(self, check_id: str) -> str:
        """Extract vulnerability type from Semgrep check ID"""
        if 'sql' in check_id.lower():
            return 'SQL_INJECTION'
        elif 'xss' in check_id.lower():
            return 'XSS'
        elif 'csrf' in check_id.lower():
            return 'CSRF'
        elif 'secret' in check_id.lower() or 'password' in check_id.lower():
            return 'HARDCODED_SECRET'
        elif 'eval' in check_id.lower():
            return 'CODE_INJECTION'
        else:
            return 'SECURITY_MISCONFIGURATION'


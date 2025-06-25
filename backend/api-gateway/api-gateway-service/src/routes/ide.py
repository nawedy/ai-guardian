from flask import Blueprint, jsonify, request
from datetime import datetime
import requests
import json
from typing import Dict, List, Any

ide_bp = Blueprint('ide', __name__)

class IDEIntegrationService:
    """Service for IDE integration endpoints"""
    
    def __init__(self):
        self.scanner_service_url = "http://localhost:5001"
        self.learning_service_url = "http://localhost:5003"
        
    def scan_code_snippet(self, code: str, language: str, filename: str = None) -> Dict:
        """Scan code snippet for vulnerabilities"""
        try:
            # Call scanner service
            response = requests.post(f"{self.scanner_service_url}/api/scan", 
                                   json={
                                       "code": code,
                                       "language": language,
                                       "filename": filename or "untitled"
                                   }, timeout=30)
            
            if response.status_code == 200:
                scan_result = response.json()
                
                # Also run compliance scan
                compliance_response = requests.post(f"{self.scanner_service_url}/api/compliance/scan",
                                                  json={
                                                      "code": code,
                                                      "language": language,
                                                      "filename": filename or "untitled"
                                                  }, timeout=30)
                
                compliance_result = {}
                if compliance_response.status_code == 200:
                    compliance_result = compliance_response.json().get('results', {})
                
                # Combine results
                return {
                    "vulnerabilities": scan_result.get("vulnerabilities", []),
                    "compliance": compliance_result,
                    "scan_time": scan_result.get("scan_time", 0),
                    "language": language,
                    "filename": filename
                }
            else:
                return {"error": "Scanner service unavailable", "vulnerabilities": []}
                
        except Exception as e:
            return {"error": str(e), "vulnerabilities": []}
    
    def get_fix_suggestions(self, vulnerability_id: str, code_context: str) -> Dict:
        """Get fix suggestions for a specific vulnerability"""
        # Mock implementation - in real scenario, this would use AI/ML models
        fix_suggestions = {
            "HARDCODED_SECRET": {
                "title": "Use Environment Variables",
                "description": "Store secrets in environment variables instead of hardcoding them",
                "code_example": "import os\napi_key = os.environ.get('API_KEY')",
                "confidence": 0.9
            },
            "SQL_INJECTION": {
                "title": "Use Parameterized Queries",
                "description": "Use parameterized queries to prevent SQL injection",
                "code_example": "cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))",
                "confidence": 0.95
            },
            "XSS": {
                "title": "Sanitize User Input",
                "description": "Sanitize and validate all user input before rendering",
                "code_example": "from html import escape\nsafe_input = escape(user_input)",
                "confidence": 0.85
            }
        }
        
        return fix_suggestions.get(vulnerability_id, {
            "title": "Review Code",
            "description": "Manual review recommended for this vulnerability type",
            "code_example": "# Please review this code section manually",
            "confidence": 0.5
        })
    
    def submit_feedback(self, user_id: str, vulnerability_id: str, feedback: str, context: Dict) -> bool:
        """Submit user feedback for adaptive learning"""
        try:
            response = requests.post(f"{self.learning_service_url}/api/feedback",
                                   json={
                                       "user_id": user_id,
                                       "vulnerability_id": vulnerability_id,
                                       "feedback": feedback,
                                       "context": context
                                   }, timeout=10)
            return response.status_code == 200
        except:
            return False

# Initialize service
ide_service = IDEIntegrationService()

@ide_bp.route('/scan', methods=['POST'])
def scan_code():
    """IDE endpoint for scanning code snippets"""
    try:
        data = request.json
        
        if not data or 'code' not in data:
            return jsonify({'error': 'Code is required'}), 400
        
        code = data['code']
        language = data.get('language', 'python')
        filename = data.get('filename')
        
        # Scan code
        result = ide_service.scan_code_snippet(code, language, filename)
        
        return jsonify({
            'scan_id': f"ide_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            'timestamp': datetime.utcnow().isoformat(),
            'result': result
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ide_bp.route('/scan/file', methods=['POST'])
def scan_file():
    """IDE endpoint for scanning entire files"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'File is required'}), 400
        
        file = request.files['file']
        language = request.form.get('language', 'python')
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Read file content
        code = file.read().decode('utf-8')
        
        # Scan code
        result = ide_service.scan_code_snippet(code, language, file.filename)
        
        return jsonify({
            'scan_id': f"ide_file_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            'timestamp': datetime.utcnow().isoformat(),
            'filename': file.filename,
            'result': result
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ide_bp.route('/fix-suggestions/<vulnerability_type>', methods=['GET'])
def get_fix_suggestions(vulnerability_type):
    """Get fix suggestions for a vulnerability type"""
    try:
        code_context = request.args.get('context', '')
        
        suggestions = ide_service.get_fix_suggestions(vulnerability_type, code_context)
        
        return jsonify({
            'vulnerability_type': vulnerability_type,
            'suggestions': suggestions,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ide_bp.route('/feedback', methods=['POST'])
def submit_feedback():
    """Submit feedback for adaptive learning"""
    try:
        data = request.json
        
        required_fields = ['user_id', 'vulnerability_id', 'feedback']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        success = ide_service.submit_feedback(
            data['user_id'],
            data['vulnerability_id'],
            data['feedback'],
            data.get('context', {})
        )
        
        return jsonify({
            'success': success,
            'timestamp': datetime.utcnow().isoformat()
        }), 200 if success else 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ide_bp.route('/status', methods=['GET'])
def get_status():
    """Get AI Guardian service status"""
    try:
        # Check scanner service
        scanner_status = "unknown"
        try:
            response = requests.get(f"{ide_service.scanner_service_url}/health", timeout=5)
            scanner_status = "healthy" if response.status_code == 200 else "unhealthy"
        except:
            scanner_status = "unavailable"
        
        # Check learning service
        learning_status = "unknown"
        try:
            response = requests.get(f"{ide_service.learning_service_url}/api/health", timeout=5)
            learning_status = "healthy" if response.status_code == 200 else "unhealthy"
        except:
            learning_status = "unavailable"
        
        return jsonify({
            'ai_guardian_status': 'healthy' if scanner_status == 'healthy' else 'degraded',
            'services': {
                'scanner': scanner_status,
                'learning': learning_status
            },
            'timestamp': datetime.utcnow().isoformat(),
            'version': '1.0.0'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ide_bp.route('/config', methods=['GET'])
def get_config():
    """Get IDE configuration settings"""
    return jsonify({
        'supported_languages': ['python', 'javascript', 'java', 'csharp', 'go', 'rust'],
        'scan_settings': {
            'auto_scan_on_save': True,
            'scan_interval_seconds': 300,
            'max_file_size_mb': 10
        },
        'notification_settings': {
            'show_critical_immediately': True,
            'show_high_severity': True,
            'show_medium_severity': False,
            'show_low_severity': False
        },
        'compliance_settings': {
            'enabled_regulations': ['GDPR', 'CCPA', 'HIPAA', 'PCI-DSS', 'SOX'],
            'data_classification': True,
            'privacy_scanning': True
        }
    }), 200

@ide_bp.route('/health', methods=['GET'])
def health_check():
    """Health check for IDE integration service"""
    return jsonify({
        'status': 'healthy',
        'service': 'ide-integration',
        'timestamp': datetime.utcnow().isoformat()
    })


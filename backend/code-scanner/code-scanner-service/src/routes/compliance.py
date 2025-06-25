from flask import Blueprint, jsonify, request
from datetime import datetime
import re
import json
from typing import Dict, List, Any
from dataclasses import dataclass

compliance_bp = Blueprint('compliance', __name__)

@dataclass
class ComplianceRule:
    """Represents a compliance rule"""
    id: str
    name: str
    regulation: str  # GDPR, CCPA, HIPAA, SOX, PCI-DSS
    severity: str
    pattern: str
    description: str
    remediation: str

class ComplianceEngine:
    """Enhanced compliance and privacy monitoring engine"""
    
    def __init__(self):
        self.compliance_rules = self._load_compliance_rules()
        self.data_classification_patterns = self._load_data_classification_patterns()
        self.privacy_patterns = self._load_privacy_patterns()
        
    def _load_compliance_rules(self) -> List[ComplianceRule]:
        """Load compliance rules for various regulations"""
        return [
            # GDPR Rules
            ComplianceRule(
                id="GDPR_001",
                name="Personal Data Collection Without Consent",
                regulation="GDPR",
                severity="HIGH",
                pattern=r"(email|phone|address|name|ssn|social_security).*collect|store|save",
                description="Code appears to collect personal data without explicit consent mechanism",
                remediation="Implement explicit consent collection before processing personal data"
            ),
            ComplianceRule(
                id="GDPR_002", 
                name="Data Retention Without Policy",
                regulation="GDPR",
                severity="MEDIUM",
                pattern=r"(delete|remove|purge).*never|permanent|forever",
                description="Data retention appears to be indefinite without clear policy",
                remediation="Implement data retention policies and automatic deletion"
            ),
            ComplianceRule(
                id="GDPR_003",
                name="Cross-Border Data Transfer",
                regulation="GDPR",
                severity="HIGH",
                pattern=r"(transfer|send|export).*data.*(us|usa|china|russia|non-eu)",
                description="Potential cross-border data transfer without adequate safeguards",
                remediation="Ensure adequate safeguards for international data transfers"
            ),
            
            # CCPA Rules
            ComplianceRule(
                id="CCPA_001",
                name="Personal Information Sale Without Notice",
                regulation="CCPA",
                severity="HIGH",
                pattern=r"(sell|share|monetize).*personal.*information",
                description="Code may be selling personal information without proper notice",
                remediation="Implement clear notice and opt-out mechanisms for data sales"
            ),
            ComplianceRule(
                id="CCPA_002",
                name="Consumer Rights Not Implemented",
                regulation="CCPA",
                severity="MEDIUM",
                pattern=r"(delete|access|portability).*request.*not.*implemented",
                description="Consumer rights requests may not be properly implemented",
                remediation="Implement mechanisms for delete, access, and portability requests"
            ),
            
            # HIPAA Rules
            ComplianceRule(
                id="HIPAA_001",
                name="PHI Transmission Without Encryption",
                regulation="HIPAA",
                severity="CRITICAL",
                pattern=r"(medical|health|patient|phi).*transmit|send.*http(?!s)",
                description="Protected Health Information transmitted without encryption",
                remediation="Use HTTPS/TLS for all PHI transmissions"
            ),
            ComplianceRule(
                id="HIPAA_002",
                name="PHI Logging in Plain Text",
                regulation="HIPAA",
                severity="HIGH",
                pattern=r"log.*(?:patient_id|medical_record|diagnosis|treatment)",
                description="Protected Health Information being logged in plain text",
                remediation="Avoid logging PHI or implement proper anonymization"
            ),
            
            # SOX Rules
            ComplianceRule(
                id="SOX_001",
                name="Financial Data Without Audit Trail",
                regulation="SOX",
                severity="HIGH",
                pattern=r"(financial|accounting|revenue).*update|modify.*no.*audit",
                description="Financial data modifications without proper audit trail",
                remediation="Implement comprehensive audit logging for financial data"
            ),
            
            # PCI-DSS Rules
            ComplianceRule(
                id="PCI_001",
                name="Credit Card Data Storage",
                regulation="PCI-DSS",
                severity="CRITICAL",
                pattern=r"(credit_card|card_number|cvv|expiry).*store|save|persist",
                description="Credit card data being stored, which violates PCI-DSS",
                remediation="Never store sensitive payment data; use tokenization"
            ),
            ComplianceRule(
                id="PCI_002",
                name="Payment Data Transmission Without Encryption",
                regulation="PCI-DSS",
                severity="CRITICAL",
                pattern=r"(payment|card|pan).*transmit.*http(?!s)",
                description="Payment data transmitted without encryption",
                remediation="Use strong encryption for all payment data transmission"
            )
        ]
    
    def _load_data_classification_patterns(self) -> Dict[str, List[Dict]]:
        """Load data classification patterns"""
        return {
            'PII': [
                {'pattern': r'\b\d{3}-\d{2}-\d{4}\b', 'type': 'SSN', 'confidence': 0.9},
                {'pattern': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', 'type': 'EMAIL', 'confidence': 0.8},
                {'pattern': r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b', 'type': 'CREDIT_CARD', 'confidence': 0.9},
                {'pattern': r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', 'type': 'PHONE', 'confidence': 0.7},
                {'pattern': r'\b\d{1,5}\s\w+\s(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)\b', 'type': 'ADDRESS', 'confidence': 0.6}
            ],
            'PHI': [
                {'pattern': r'(?i)(patient|medical|health|diagnosis|treatment|medication)', 'type': 'MEDICAL_TERM', 'confidence': 0.7},
                {'pattern': r'\b(?:MRN|medical_record_number)[-_]?\d+\b', 'type': 'MEDICAL_RECORD', 'confidence': 0.9},
                {'pattern': r'(?i)(blood_pressure|heart_rate|temperature|weight|height)', 'type': 'VITAL_SIGNS', 'confidence': 0.8}
            ],
            'FINANCIAL': [
                {'pattern': r'(?i)(account_number|routing_number|iban|swift)', 'type': 'BANK_INFO', 'confidence': 0.8},
                {'pattern': r'\b\d{10,12}\b', 'type': 'ACCOUNT_NUMBER', 'confidence': 0.6},
                {'pattern': r'(?i)(salary|income|revenue|profit|loss)', 'type': 'FINANCIAL_DATA', 'confidence': 0.7}
            ]
        }
    
    def _load_privacy_patterns(self) -> List[Dict]:
        """Load privacy violation patterns"""
        return [
            {
                'id': 'PRIVACY_001',
                'name': 'Tracking Without Consent',
                'pattern': r'(?i)(track|analytics|pixel|beacon).*without.*consent',
                'severity': 'HIGH',
                'description': 'User tracking implemented without consent'
            },
            {
                'id': 'PRIVACY_002', 
                'name': 'Data Collection Without Notice',
                'pattern': r'(?i)collect.*data.*(?!notice|inform|consent)',
                'severity': 'MEDIUM',
                'description': 'Data collection without proper user notice'
            },
            {
                'id': 'PRIVACY_003',
                'name': 'Third Party Data Sharing',
                'pattern': r'(?i)(share|send|transmit).*data.*(third.?party|partner|vendor)',
                'severity': 'HIGH',
                'description': 'Data sharing with third parties detected'
            },
            {
                'id': 'PRIVACY_004',
                'name': 'Biometric Data Processing',
                'pattern': r'(?i)(fingerprint|facial|biometric|voice_print)',
                'severity': 'CRITICAL',
                'description': 'Biometric data processing requires special protection'
            }
        ]
    
    def scan_compliance(self, code: str, language: str, filename: str = None) -> Dict[str, Any]:
        """Perform comprehensive compliance scan"""
        results = {
            'compliance_violations': [],
            'data_classifications': [],
            'privacy_violations': [],
            'regulatory_summary': {},
            'risk_score': 0.0,
            'recommendations': []
        }
        
        # Check compliance rules
        compliance_violations = self._check_compliance_rules(code, filename)
        results['compliance_violations'] = compliance_violations
        
        # Classify data types
        data_classifications = self._classify_data(code, filename)
        results['data_classifications'] = data_classifications
        
        # Check privacy violations
        privacy_violations = self._check_privacy_violations(code, filename)
        results['privacy_violations'] = privacy_violations
        
        # Generate regulatory summary
        results['regulatory_summary'] = self._generate_regulatory_summary(
            compliance_violations, data_classifications, privacy_violations
        )
        
        # Calculate risk score
        results['risk_score'] = self._calculate_compliance_risk_score(
            compliance_violations, data_classifications, privacy_violations
        )
        
        # Generate recommendations
        results['recommendations'] = self._generate_compliance_recommendations(
            compliance_violations, data_classifications, privacy_violations
        )
        
        return results
    
    def _check_compliance_rules(self, code: str, filename: str = None) -> List[Dict]:
        """Check code against compliance rules"""
        violations = []
        
        for rule in self.compliance_rules:
            matches = re.finditer(rule.pattern, code, re.IGNORECASE | re.MULTILINE)
            
            for match in matches:
                line_number = code[:match.start()].count('\n') + 1
                
                violation = {
                    'id': rule.id,
                    'name': rule.name,
                    'regulation': rule.regulation,
                    'severity': rule.severity,
                    'description': rule.description,
                    'remediation': rule.remediation,
                    'file': filename or 'unknown',
                    'line': line_number,
                    'code_snippet': self._extract_code_snippet(code, match.start(), match.end()),
                    'timestamp': datetime.utcnow().isoformat()
                }
                violations.append(violation)
        
        return violations
    
    def _classify_data(self, code: str, filename: str = None) -> List[Dict]:
        """Classify data types found in code"""
        classifications = []
        
        for category, patterns in self.data_classification_patterns.items():
            for pattern_info in patterns:
                matches = re.finditer(pattern_info['pattern'], code, re.IGNORECASE)
                
                for match in matches:
                    line_number = code[:match.start()].count('\n') + 1
                    
                    classification = {
                        'category': category,
                        'type': pattern_info['type'],
                        'confidence': pattern_info['confidence'],
                        'file': filename or 'unknown',
                        'line': line_number,
                        'matched_text': match.group(),
                        'context': self._extract_code_snippet(code, match.start(), match.end()),
                        'timestamp': datetime.utcnow().isoformat()
                    }
                    classifications.append(classification)
        
        return classifications
    
    def _check_privacy_violations(self, code: str, filename: str = None) -> List[Dict]:
        """Check for privacy violations"""
        violations = []
        
        for pattern_info in self.privacy_patterns:
            matches = re.finditer(pattern_info['pattern'], code, re.IGNORECASE | re.MULTILINE)
            
            for match in matches:
                line_number = code[:match.start()].count('\n') + 1
                
                violation = {
                    'id': pattern_info['id'],
                    'name': pattern_info['name'],
                    'severity': pattern_info['severity'],
                    'description': pattern_info['description'],
                    'file': filename or 'unknown',
                    'line': line_number,
                    'code_snippet': self._extract_code_snippet(code, match.start(), match.end()),
                    'timestamp': datetime.utcnow().isoformat()
                }
                violations.append(violation)
        
        return violations
    
    def _extract_code_snippet(self, code: str, start: int, end: int, context_lines: int = 2) -> str:
        """Extract code snippet with context"""
        lines = code.split('\n')
        start_line = code[:start].count('\n')
        end_line = code[:end].count('\n')
        
        snippet_start = max(0, start_line - context_lines)
        snippet_end = min(len(lines), end_line + context_lines + 1)
        
        return '\n'.join(lines[snippet_start:snippet_end])
    
    def _generate_regulatory_summary(self, compliance_violations: List, 
                                   data_classifications: List, 
                                   privacy_violations: List) -> Dict:
        """Generate summary by regulation"""
        summary = {}
        
        # Count violations by regulation
        for violation in compliance_violations:
            reg = violation['regulation']
            if reg not in summary:
                summary[reg] = {
                    'total_violations': 0,
                    'critical': 0,
                    'high': 0,
                    'medium': 0,
                    'low': 0,
                    'data_types_found': set(),
                    'risk_level': 'LOW'
                }
            
            summary[reg]['total_violations'] += 1
            summary[reg][violation['severity'].lower()] += 1
        
        # Add data classifications
        for classification in data_classifications:
            category = classification['category']
            if category == 'PHI':
                if 'HIPAA' not in summary:
                    summary['HIPAA'] = {
                        'total_violations': 0, 'critical': 0, 'high': 0, 
                        'medium': 0, 'low': 0, 'data_types_found': set(), 'risk_level': 'LOW'
                    }
                summary['HIPAA']['data_types_found'].add(classification['type'])
            elif category == 'PII':
                for reg in ['GDPR', 'CCPA']:
                    if reg not in summary:
                        summary[reg] = {
                            'total_violations': 0, 'critical': 0, 'high': 0,
                            'medium': 0, 'low': 0, 'data_types_found': set(), 'risk_level': 'LOW'
                        }
                    summary[reg]['data_types_found'].add(classification['type'])
        
        # Calculate risk levels
        for reg, data in summary.items():
            if data['critical'] > 0:
                data['risk_level'] = 'CRITICAL'
            elif data['high'] > 0:
                data['risk_level'] = 'HIGH'
            elif data['medium'] > 0:
                data['risk_level'] = 'MEDIUM'
            
            # Convert sets to lists for JSON serialization
            data['data_types_found'] = list(data['data_types_found'])
        
        return summary
    
    def _calculate_compliance_risk_score(self, compliance_violations: List,
                                       data_classifications: List,
                                       privacy_violations: List) -> float:
        """Calculate overall compliance risk score (0-10)"""
        score = 0.0
        
        # Weight violations by severity
        severity_weights = {'CRITICAL': 3.0, 'HIGH': 2.0, 'MEDIUM': 1.0, 'LOW': 0.5}
        
        for violation in compliance_violations:
            score += severity_weights.get(violation['severity'], 0.5)
        
        for violation in privacy_violations:
            score += severity_weights.get(violation['severity'], 0.5)
        
        # Add score for sensitive data presence
        for classification in data_classifications:
            if classification['confidence'] > 0.8:
                score += 1.0
            elif classification['confidence'] > 0.6:
                score += 0.5
        
        return min(score, 10.0)  # Cap at 10
    
    def _generate_compliance_recommendations(self, compliance_violations: List,
                                           data_classifications: List,
                                           privacy_violations: List) -> List[Dict]:
        """Generate compliance recommendations"""
        recommendations = []
        
        # Regulation-specific recommendations
        regulations_found = set()
        for violation in compliance_violations:
            regulations_found.add(violation['regulation'])
        
        if 'GDPR' in regulations_found:
            recommendations.append({
                'priority': 'HIGH',
                'regulation': 'GDPR',
                'title': 'Implement GDPR Compliance Framework',
                'description': 'Establish data protection policies, consent mechanisms, and user rights implementation',
                'actions': [
                    'Implement explicit consent collection',
                    'Create data retention policies',
                    'Establish data subject rights procedures',
                    'Implement privacy by design principles'
                ]
            })
        
        if 'HIPAA' in regulations_found:
            recommendations.append({
                'priority': 'CRITICAL',
                'regulation': 'HIPAA',
                'title': 'Secure PHI Handling',
                'description': 'Implement HIPAA-compliant PHI protection measures',
                'actions': [
                    'Encrypt all PHI transmissions',
                    'Implement access controls',
                    'Establish audit logging',
                    'Create incident response procedures'
                ]
            })
        
        if 'PCI-DSS' in regulations_found:
            recommendations.append({
                'priority': 'CRITICAL',
                'regulation': 'PCI-DSS',
                'title': 'Payment Data Security',
                'description': 'Implement PCI-DSS compliant payment processing',
                'actions': [
                    'Never store sensitive payment data',
                    'Use tokenization for payment processing',
                    'Implement strong encryption',
                    'Regular security testing'
                ]
            })
        
        return recommendations

# Initialize compliance engine
compliance_engine = ComplianceEngine()

@compliance_bp.route('/scan', methods=['POST'])
def scan_compliance():
    """Perform compliance scan on code"""
    try:
        data = request.json
        
        if not data or 'code' not in data:
            return jsonify({'error': 'Code is required'}), 400
        
        code = data['code']
        language = data.get('language', 'python')
        filename = data.get('filename', 'unknown')
        
        # Perform compliance scan
        results = compliance_engine.scan_compliance(code, language, filename)
        
        return jsonify({
            'scan_id': f"compliance_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            'filename': filename,
            'language': language,
            'timestamp': datetime.utcnow().isoformat(),
            'results': results
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@compliance_bp.route('/regulations', methods=['GET'])
def get_supported_regulations():
    """Get list of supported regulations"""
    try:
        regulations = {}
        
        for rule in compliance_engine.compliance_rules:
            reg = rule.regulation
            if reg not in regulations:
                regulations[reg] = {
                    'name': reg,
                    'rules_count': 0,
                    'description': _get_regulation_description(reg)
                }
            regulations[reg]['rules_count'] += 1
        
        return jsonify({
            'supported_regulations': list(regulations.values()),
            'total_rules': len(compliance_engine.compliance_rules)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def _get_regulation_description(regulation: str) -> str:
    """Get description for regulation"""
    descriptions = {
        'GDPR': 'General Data Protection Regulation - EU data protection law',
        'CCPA': 'California Consumer Privacy Act - California privacy law',
        'HIPAA': 'Health Insurance Portability and Accountability Act - US healthcare privacy law',
        'SOX': 'Sarbanes-Oxley Act - US financial reporting law',
        'PCI-DSS': 'Payment Card Industry Data Security Standard - Payment security standard'
    }
    return descriptions.get(regulation, f'{regulation} compliance rules')

@compliance_bp.route('/data-classification', methods=['POST'])
def classify_data():
    """Classify data types in code"""
    try:
        data = request.json
        
        if not data or 'code' not in data:
            return jsonify({'error': 'Code is required'}), 400
        
        code = data['code']
        filename = data.get('filename', 'unknown')
        
        # Classify data
        classifications = compliance_engine._classify_data(code, filename)
        
        return jsonify({
            'filename': filename,
            'timestamp': datetime.utcnow().isoformat(),
            'classifications': classifications,
            'summary': {
                'total_findings': len(classifications),
                'categories': list(set(c['category'] for c in classifications)),
                'high_confidence': len([c for c in classifications if c['confidence'] > 0.8])
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@compliance_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'compliance-monitor',
        'timestamp': datetime.utcnow().isoformat(),
        'supported_regulations': len(set(rule.regulation for rule in compliance_engine.compliance_rules)),
        'total_rules': len(compliance_engine.compliance_rules),
        'data_classification_categories': len(compliance_engine.data_classification_patterns)
    })


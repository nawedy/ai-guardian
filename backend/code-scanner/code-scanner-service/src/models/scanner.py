from sqlalchemy import Column, Integer, String, DateTime, Text, Enum
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import enum

db = SQLAlchemy()

class SeverityLevel(enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class VulnerabilityType(enum.Enum):
    SQL_INJECTION = "SQL_INJECTION"
    XSS = "XSS"
    CSRF = "CSRF"
    CODE_INJECTION = "CODE_INJECTION"
    HARDCODED_SECRET = "HARDCODED_SECRET"
    INSECURE_DESERIALIZATION = "INSECURE_DESERIALIZATION"
    BROKEN_ACCESS_CONTROL = "BROKEN_ACCESS_CONTROL"
    SECURITY_MISCONFIGURATION = "SECURITY_MISCONFIGURATION"
    VULNERABLE_COMPONENTS = "VULNERABLE_COMPONENTS"
    INSUFFICIENT_LOGGING = "INSUFFICIENT_LOGGING"

class ScanResult(db.Model):
    """Model for storing scan results"""
    __tablename__ = 'scan_results'
    
    id = Column(Integer, primary_key=True)
    scan_id = Column(String(32), unique=True, nullable=False)
    filename = Column(String(255), nullable=False)
    language = Column(String(50), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(String(20), default='completed')
    total_vulnerabilities = Column(Integer, default=0)
    critical_count = Column(Integer, default=0)
    high_count = Column(Integer, default=0)
    medium_count = Column(Integer, default=0)
    low_count = Column(Integer, default=0)
    
    def to_dict(self):
        return {
            'id': self.id,
            'scan_id': self.scan_id,
            'filename': self.filename,
            'language': self.language,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'status': self.status,
            'summary': {
                'total_vulnerabilities': self.total_vulnerabilities,
                'critical': self.critical_count,
                'high': self.high_count,
                'medium': self.medium_count,
                'low': self.low_count
            }
        }

class Vulnerability(db.Model):
    """Model for storing individual vulnerabilities"""
    __tablename__ = 'vulnerabilities'
    
    id = Column(Integer, primary_key=True)
    vulnerability_id = Column(String(64), unique=True, nullable=False)
    scan_id = Column(String(32), nullable=False)
    type = Column(Enum(VulnerabilityType), nullable=False)
    severity = Column(Enum(SeverityLevel), nullable=False)
    filename = Column(String(255), nullable=False)
    line_number = Column(Integer, nullable=False)
    code_snippet = Column(Text)
    description = Column(Text)
    recommendation = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    is_fixed = Column(db.Boolean, default=False)
    fix_applied_at = Column(DateTime)
    
    def to_dict(self):
        return {
            'id': self.vulnerability_id,
            'scan_id': self.scan_id,
            'type': self.type.value if self.type else None,
            'severity': self.severity.value if self.severity else None,
            'file': self.filename,
            'line': self.line_number,
            'code_snippet': self.code_snippet,
            'description': self.description,
            'recommendation': self.recommendation,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'is_fixed': self.is_fixed,
            'fix_applied_at': self.fix_applied_at.isoformat() if self.fix_applied_at else None
        }

class User(db.Model):
    """User model for authentication and preferences"""
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    username = Column(String(80), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


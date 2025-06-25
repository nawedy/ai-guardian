# AI Guardian - API Documentation

## Overview
AI Guardian provides comprehensive REST APIs for vulnerability scanning, compliance monitoring, adaptive learning, and IDE integration.

## Base URLs
- **Scanner Service**: `http://localhost:5001`
- **Learning Service**: `http://localhost:5003`
- **API Gateway**: `http://localhost:5004`

## Authentication
Currently, AI Guardian operates without authentication for development. For production deployment, enable JWT-based authentication:

```bash
export AUTH_ENABLED=true
export JWT_SECRET_KEY=your-secret-key
```

## Scanner Service API (Port 5001)

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "ai-guardian-scanner"
}
```

### Vulnerability Scanning

#### Scan Code Snippet
```http
POST /api/scan
Content-Type: application/json

{
  "code": "password = 'hardcoded123'",
  "language": "python",
  "filename": "example.py"
}
```

**Response:**
```json
{
  "scan_id": "scan_20250620_123456",
  "timestamp": "2025-06-20T12:34:56.789Z",
  "vulnerabilities": [
    {
      "id": "HARDCODED_SECRET",
      "name": "Hardcoded Secret",
      "severity": "CRITICAL",
      "confidence": 0.95,
      "line": 1,
      "column": 11,
      "description": "Hardcoded password detected",
      "fix_suggestion": "Use environment variables for secrets"
    }
  ],
  "scan_time": 0.45,
  "language": "python"
}
```

#### Upload and Scan File
```http
POST /api/scan/file
Content-Type: multipart/form-data

file: [binary file data]
language: python
```

#### Batch Scan Multiple Files
```http
POST /api/scan/batch
Content-Type: application/json

{
  "files": [
    {
      "filename": "file1.py",
      "code": "import os\npassword = 'secret'",
      "language": "python"
    },
    {
      "filename": "file2.js",
      "code": "const apiKey = 'hardcoded-key';",
      "language": "javascript"
    }
  ]
}
```

### Vulnerability Patterns

#### Get Available Patterns
```http
GET /api/patterns
```

**Response:**
```json
{
  "patterns": [
    {
      "id": "HARDCODED_SECRET",
      "name": "Hardcoded Secret",
      "description": "Detects hardcoded passwords, API keys, and secrets",
      "severity": "CRITICAL",
      "languages": ["python", "javascript", "java"]
    }
  ],
  "total_patterns": 25
}
```

### Real-time Monitoring

#### Start File Monitoring
```http
POST /api/monitor/start
Content-Type: application/json

{
  "directory": "/path/to/project",
  "file_patterns": ["*.py", "*.js"],
  "scan_interval": 300
}
```

#### Stop File Monitoring
```http
POST /api/monitor/stop
Content-Type: application/json

{
  "monitor_id": "monitor_123456"
}
```

#### Get Monitoring Status
```http
GET /api/monitor/status
```

**Response:**
```json
{
  "active_monitors": 2,
  "total_files_monitored": 150,
  "last_scan": "2025-06-20T12:30:00.000Z",
  "monitors": [
    {
      "id": "monitor_123456",
      "directory": "/path/to/project",
      "status": "active",
      "files_count": 75
    }
  ]
}
```

### WebSocket Real-time Updates
```javascript
// Connect to WebSocket for real-time updates
const ws = new WebSocket('ws://localhost:8765');

ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('Real-time update:', data);
};

// Message format:
{
  "type": "vulnerability_detected",
  "timestamp": "2025-06-20T12:34:56.789Z",
  "file": "/path/to/file.py",
  "vulnerability": {
    "id": "SQL_INJECTION",
    "severity": "HIGH",
    "line": 25
  }
}
```

## Compliance Service API (Port 5001)

### Compliance Scanning

#### Scan for Compliance Violations
```http
POST /api/compliance/scan
Content-Type: application/json

{
  "code": "email = input('Enter email:')",
  "language": "python",
  "filename": "user_input.py"
}
```

**Response:**
```json
{
  "scan_id": "compliance_20250620_123456",
  "timestamp": "2025-06-20T12:34:56.789Z",
  "results": {
    "compliance_violations": [
      {
        "id": "GDPR_001",
        "regulation": "GDPR",
        "name": "Data Collection Without Consent",
        "severity": "HIGH",
        "description": "Personal data collection without explicit consent",
        "line": 1,
        "fix_suggestion": "Implement consent mechanism before data collection"
      }
    ],
    "data_classification": [
      {
        "type": "EMAIL",
        "category": "PII",
        "confidence": 0.9,
        "line": 1,
        "context": "email = input('Enter email:')"
      }
    ],
    "regulatory_summary": {
      "GDPR": {
        "total_violations": 1,
        "critical": 0,
        "high": 1,
        "medium": 0,
        "low": 0,
        "risk_level": "HIGH"
      }
    },
    "risk_score": 7.5
  }
}
```

#### Get Supported Regulations
```http
GET /api/compliance/regulations
```

**Response:**
```json
{
  "supported_regulations": [
    {
      "name": "GDPR",
      "description": "General Data Protection Regulation - EU data protection law",
      "rules_count": 3
    },
    {
      "name": "CCPA",
      "description": "California Consumer Privacy Act - California privacy law",
      "rules_count": 2
    }
  ],
  "total_rules": 10
}
```

#### Data Classification
```http
POST /api/compliance/data-classification
Content-Type: application/json

{
  "text": "John Doe, SSN: 123-45-6789, Email: john@example.com"
}
```

**Response:**
```json
{
  "classifications": [
    {
      "type": "SSN",
      "category": "PII",
      "value": "123-45-6789",
      "confidence": 0.98,
      "start_pos": 11,
      "end_pos": 22
    },
    {
      "type": "EMAIL",
      "category": "PII",
      "value": "john@example.com",
      "confidence": 0.95,
      "start_pos": 31,
      "end_pos": 47
    }
  ]
}
```

## Adaptive Learning Service API (Port 5003)

### Health Check
```http
GET /api/health
```

### User Feedback

#### Submit Feedback
```http
POST /api/feedback
Content-Type: application/json

{
  "user_id": "user_123",
  "vulnerability_id": "HARDCODED_SECRET",
  "feedback": "false_positive",
  "context": {
    "file": "config.py",
    "line": 15,
    "reason": "This is a test configuration"
  }
}
```

**Response:**
```json
{
  "success": true,
  "feedback_id": "feedback_123456",
  "timestamp": "2025-06-20T12:34:56.789Z"
}
```

### User Preferences

#### Get User Preferences
```http
GET /api/preferences/{user_id}
```

**Response:**
```json
{
  "user_id": "user_123",
  "preferences": {
    "sensitivity_threshold": 0.7,
    "enabled_checks": ["HARDCODED_SECRET", "SQL_INJECTION"],
    "notification_settings": {
      "critical": true,
      "high": true,
      "medium": false,
      "low": false
    }
  },
  "learning_stats": {
    "total_feedback": 45,
    "false_positives_reported": 12,
    "accuracy_improvement": 0.15
  }
}
```

#### Update User Preferences
```http
PUT /api/preferences/{user_id}
Content-Type: application/json

{
  "sensitivity_threshold": 0.8,
  "enabled_checks": ["HARDCODED_SECRET", "SQL_INJECTION", "XSS"],
  "notification_settings": {
    "critical": true,
    "high": true,
    "medium": true,
    "low": false
  }
}
```

### Learning and Recommendations

#### Trigger Learning Update
```http
POST /api/learn
Content-Type: application/json

{
  "user_id": "user_123",
  "force_update": false
}
```

#### Get Recommendations
```http
GET /api/recommendations/{user_id}
```

**Response:**
```json
{
  "recommendations": [
    {
      "type": "threshold_adjustment",
      "title": "Reduce False Positives",
      "description": "Consider increasing sensitivity threshold for HARDCODED_SECRET",
      "suggested_value": 0.85,
      "confidence": 0.8
    },
    {
      "type": "new_check",
      "title": "Enable XSS Detection",
      "description": "Based on your codebase, XSS detection might be beneficial",
      "check_id": "XSS",
      "confidence": 0.7
    }
  ]
}
```

## API Gateway Service (Port 5004)

### Health Check
```http
GET /health
```

### IDE Integration

#### IDE Code Scanning
```http
POST /api/ide/scan
Content-Type: application/json

{
  "code": "const password = 'hardcoded123';",
  "language": "javascript",
  "filename": "app.js"
}
```

**Response:**
```json
{
  "scan_id": "ide_20250620_123456",
  "timestamp": "2025-06-20T12:34:56.789Z",
  "result": {
    "vulnerabilities": [
      {
        "id": "HARDCODED_SECRET",
        "name": "Hardcoded Secret",
        "severity": "CRITICAL",
        "line": 1,
        "fix_suggestion": "Use environment variables"
      }
    ],
    "compliance": {
      "violations": [],
      "risk_score": 2.5
    },
    "scan_time": 0.3
  }
}
```

#### IDE File Scanning
```http
POST /api/ide/scan/file
Content-Type: multipart/form-data

file: [binary file data]
language: javascript
```

#### Get Fix Suggestions
```http
GET /api/ide/fix-suggestions/{vulnerability_type}?context=code_snippet
```

**Response:**
```json
{
  "vulnerability_type": "HARDCODED_SECRET",
  "suggestions": {
    "title": "Use Environment Variables",
    "description": "Store secrets in environment variables instead of hardcoding them",
    "code_example": "const password = process.env.DB_PASSWORD;",
    "confidence": 0.9
  },
  "timestamp": "2025-06-20T12:34:56.789Z"
}
```

#### Submit IDE Feedback
```http
POST /api/ide/feedback
Content-Type: application/json

{
  "user_id": "ide_user_123",
  "vulnerability_id": "HARDCODED_SECRET",
  "feedback": "helpful",
  "context": {
    "ide": "vscode",
    "file": "app.js",
    "action_taken": "applied_fix"
  }
}
```

#### Get IDE Configuration
```http
GET /api/ide/config
```

**Response:**
```json
{
  "supported_languages": ["python", "javascript", "java", "csharp", "go", "rust"],
  "scan_settings": {
    "auto_scan_on_save": true,
    "scan_interval_seconds": 300,
    "max_file_size_mb": 10
  },
  "notification_settings": {
    "show_critical_immediately": true,
    "show_high_severity": true,
    "show_medium_severity": false,
    "show_low_severity": false
  },
  "compliance_settings": {
    "enabled_regulations": ["GDPR", "CCPA", "HIPAA", "PCI-DSS", "SOX"],
    "data_classification": true,
    "privacy_scanning": true
  }
}
```

#### Get Service Status
```http
GET /api/ide/status
```

**Response:**
```json
{
  "ai_guardian_status": "healthy",
  "services": {
    "scanner": "healthy",
    "learning": "healthy"
  },
  "timestamp": "2025-06-20T12:34:56.789Z",
  "version": "1.0.0"
}
```

## Error Handling

### Standard Error Response Format
```json
{
  "error": "Error message",
  "error_code": "ERROR_CODE",
  "timestamp": "2025-06-20T12:34:56.789Z",
  "details": {
    "field": "Additional error details"
  }
}
```

### Common HTTP Status Codes
- **200**: Success
- **400**: Bad Request (invalid input)
- **404**: Not Found (resource doesn't exist)
- **429**: Too Many Requests (rate limit exceeded)
- **500**: Internal Server Error
- **503**: Service Unavailable

## Rate Limiting
- **Default Limit**: 100 requests per minute per IP
- **Headers**: 
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

## SDK and Client Libraries

### Python SDK
```python
from ai_guardian import AIGuardianClient

client = AIGuardianClient(base_url="http://localhost:5004")

# Scan code
result = client.scan_code(
    code="password = 'secret'",
    language="python"
)

# Submit feedback
client.submit_feedback(
    user_id="user_123",
    vulnerability_id="HARDCODED_SECRET",
    feedback="false_positive"
)
```

### JavaScript SDK
```javascript
import { AIGuardianClient } from 'ai-guardian-js';

const client = new AIGuardianClient({
  baseUrl: 'http://localhost:5004'
});

// Scan code
const result = await client.scanCode({
  code: "const password = 'secret';",
  language: 'javascript'
});

// Get configuration
const config = await client.getConfig();
```

## Webhook Integration

### Configure Webhooks
```http
POST /api/webhooks
Content-Type: application/json

{
  "url": "https://your-app.com/webhook",
  "events": ["vulnerability_detected", "compliance_violation"],
  "secret": "webhook_secret"
}
```

### Webhook Payload Example
```json
{
  "event": "vulnerability_detected",
  "timestamp": "2025-06-20T12:34:56.789Z",
  "data": {
    "scan_id": "scan_123456",
    "file": "/path/to/file.py",
    "vulnerability": {
      "id": "SQL_INJECTION",
      "severity": "HIGH",
      "line": 25
    }
  },
  "signature": "sha256=..."
}
```

---

**AI Guardian API v1.0.0** - Comprehensive REST API for AI-powered cybersecurity scanning.


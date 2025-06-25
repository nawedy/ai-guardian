# AI Guardian - User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Web Dashboard](#web-dashboard)
3. [CLI Tool](#cli-tool)
4. [IDE Integration](#ide-integration)
5. [Vulnerability Management](#vulnerability-management)
6. [Compliance Monitoring](#compliance-monitoring)
7. [Adaptive Learning](#adaptive-learning)
8. [Team Management](#team-management)
9. [Configuration](#configuration)
10. [Troubleshooting](#troubleshooting)

## Getting Started

### What is AI Guardian?
AI Guardian is a comprehensive AI-powered cybersecurity platform that provides:
- **Real-time code scanning** for vulnerabilities
- **Compliance monitoring** for GDPR, CCPA, HIPAA, PCI-DSS, SOX
- **Adaptive learning** to reduce false positives
- **IDE integration** for seamless development workflow
- **Team collaboration** features for security management

### First Time Setup

1. **Access the Web Dashboard**
   - Open your browser and navigate to `http://localhost:5173`
   - The dashboard provides an overview of your security status

2. **Configure Your First Scan**
   - Click on "Scan Results" in the sidebar
   - Upload a code file or paste code directly
   - Select the programming language
   - Click "Start Scan"

3. **Review Results**
   - View detected vulnerabilities with severity levels
   - Read fix suggestions and apply recommended changes
   - Provide feedback to improve future scans

## Web Dashboard

### Dashboard Overview
The main dashboard displays:
- **Security Score**: Overall security rating (0-100)
- **Active Vulnerabilities**: Count by severity level
- **Recent Scans**: Latest scanning activity
- **Compliance Status**: Regulatory compliance overview
- **Team Activity**: Recent team member actions

### Navigation Menu
- **Dashboard**: Main overview and statistics
- **Scan Results**: Detailed vulnerability reports
- **Real-Time Monitor**: Live scanning and file monitoring
- **Team Management**: User roles and permissions
- **Settings**: Configuration and preferences

### Key Features

#### Security Metrics
- **Critical Issues**: Immediate attention required
- **High Priority**: Should be addressed soon
- **Medium Priority**: Address when convenient
- **Low Priority**: Minor improvements

#### Trend Analysis
- **Vulnerability Trends**: Track improvements over time
- **Scan Frequency**: Monitor scanning activity
- **Fix Rate**: Measure remediation effectiveness

## CLI Tool

### Installation
```bash
cd cli
pip install -r requirements.txt
chmod +x ai-guardian
```

### Basic Commands

#### Scan a File
```bash
./ai-guardian scan --file /path/to/code.py --language python
```

#### Scan a Directory
```bash
./ai-guardian scan --directory /path/to/project --recursive
```

#### Check Status
```bash
./ai-guardian status
```

#### Configure Settings
```bash
./ai-guardian config --set scanner.timeout=60
./ai-guardian config --get scanner.timeout
```

### Advanced Usage

#### Batch Scanning
```bash
# Scan multiple files
./ai-guardian scan --files file1.py file2.js file3.java

# Scan with specific patterns
./ai-guardian scan --directory /project --include "*.py,*.js" --exclude "test_*"
```

#### Output Formats
```bash
# JSON output
./ai-guardian scan --file code.py --format json

# CSV output for reporting
./ai-guardian scan --directory /project --format csv --output report.csv

# XML output for integration
./ai-guardian scan --file code.py --format xml
```

#### CI/CD Integration
```bash
# Exit with error code if vulnerabilities found
./ai-guardian scan --directory /project --fail-on critical,high

# Generate reports for CI/CD
./ai-guardian scan --directory /project --report-format junit --output test-results.xml
```

## IDE Integration

### Visual Studio Code Extension

#### Installation
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "AI Guardian"
4. Click Install

#### Features
- **Real-time Scanning**: Automatic scanning on file save
- **Inline Warnings**: Vulnerability highlights in code
- **Quick Fixes**: One-click remediation suggestions
- **Compliance Alerts**: GDPR, CCPA, HIPAA notifications

#### Usage
1. **Automatic Scanning**: Save any supported file to trigger scan
2. **Manual Scanning**: Right-click → "AI Guardian: Scan File"
3. **View Results**: Check Problems panel for vulnerabilities
4. **Apply Fixes**: Click lightbulb icon for quick fixes

### IntelliJ IDEA Plugin

#### Installation
1. Open IntelliJ IDEA
2. Go to File → Settings → Plugins
3. Search for "AI Guardian"
4. Install and restart IDE

#### Configuration
1. Go to File → Settings → Tools → AI Guardian
2. Set server URL: `http://localhost:5004`
3. Configure scan settings and notifications
4. Enable real-time monitoring

### Other IDEs
AI Guardian provides REST APIs for integration with any IDE:
- **Sublime Text**: Via package manager
- **Atom**: Through package installation
- **Vim/Neovim**: Using plugin managers
- **Emacs**: Through package repositories

## Vulnerability Management

### Understanding Severity Levels

#### Critical (Score: 9.0-10.0)
- **Hardcoded Secrets**: API keys, passwords in code
- **SQL Injection**: Direct database vulnerabilities
- **Remote Code Execution**: Arbitrary code execution risks
- **Action Required**: Fix immediately

#### High (Score: 7.0-8.9)
- **Cross-Site Scripting (XSS)**: User input vulnerabilities
- **Authentication Bypass**: Security control bypasses
- **Sensitive Data Exposure**: Unprotected sensitive information
- **Action Required**: Fix within 24-48 hours

#### Medium (Score: 4.0-6.9)
- **CSRF Vulnerabilities**: Cross-site request forgery
- **Information Disclosure**: Non-sensitive information leaks
- **Weak Cryptography**: Outdated encryption methods
- **Action Required**: Fix within 1-2 weeks

#### Low (Score: 1.0-3.9)
- **Code Quality Issues**: Best practice violations
- **Minor Information Leaks**: Version information exposure
- **Deprecated Functions**: Outdated but functional code
- **Action Required**: Fix when convenient

### Vulnerability Details

#### Viewing Details
1. Click on any vulnerability in the scan results
2. Review the detailed description and impact
3. Examine the affected code snippet
4. Read the fix suggestion and implementation steps

#### Fix Suggestions
Each vulnerability includes:
- **Description**: What the vulnerability is
- **Impact**: Potential security consequences
- **Fix Suggestion**: Specific remediation steps
- **Code Example**: Before and after code samples
- **References**: Links to security resources

#### Tracking Progress
- **Status Updates**: Mark vulnerabilities as fixed, ignored, or in progress
- **Assignment**: Assign vulnerabilities to team members
- **Due Dates**: Set deadlines for remediation
- **Comments**: Add notes and discussion

## Compliance Monitoring

### Supported Regulations

#### GDPR (General Data Protection Regulation)
- **Data Collection**: Consent mechanisms
- **Data Processing**: Lawful basis requirements
- **Data Storage**: Retention and deletion policies
- **Data Transfer**: Cross-border transfer safeguards

#### CCPA (California Consumer Privacy Act)
- **Consumer Rights**: Access, deletion, opt-out
- **Data Sales**: Third-party data sharing
- **Privacy Notices**: Transparent data practices
- **Data Security**: Reasonable security measures

#### HIPAA (Health Insurance Portability and Accountability Act)
- **PHI Protection**: Protected health information
- **Access Controls**: User authentication and authorization
- **Audit Trails**: Activity logging and monitoring
- **Data Encryption**: Transmission and storage security

#### PCI-DSS (Payment Card Industry Data Security Standard)
- **Cardholder Data**: Credit card information protection
- **Network Security**: Secure network architecture
- **Access Control**: Restricted access to cardholder data
- **Monitoring**: Regular security testing

#### SOX (Sarbanes-Oxley Act)
- **Financial Data**: Accurate financial reporting
- **Internal Controls**: Process documentation
- **Audit Trails**: Change tracking and approval
- **Data Integrity**: Preventing unauthorized modifications

### Compliance Dashboard
- **Regulation Status**: Compliance level for each regulation
- **Violation Summary**: Count and severity of violations
- **Risk Assessment**: Overall compliance risk score
- **Remediation Plan**: Prioritized action items

### Data Classification
AI Guardian automatically identifies:
- **PII (Personally Identifiable Information)**: Names, addresses, SSNs
- **PHI (Protected Health Information)**: Medical records, diagnoses
- **Financial Data**: Credit cards, bank accounts, financial records
- **Sensitive Business Data**: Trade secrets, confidential information

## Adaptive Learning

### How It Works
AI Guardian learns from your feedback to:
- **Reduce False Positives**: Fewer irrelevant alerts
- **Improve Accuracy**: Better vulnerability detection
- **Personalize Results**: Tailored to your coding patterns
- **Optimize Performance**: Faster and more efficient scans

### Providing Feedback

#### Vulnerability Feedback
1. **True Positive**: Confirm the vulnerability is real
2. **False Positive**: Mark as not a real security issue
3. **Not Applicable**: Doesn't apply to your use case
4. **Need More Info**: Request additional details

#### Feedback Process
1. Click the feedback button on any vulnerability
2. Select the appropriate feedback type
3. Optionally add comments explaining your decision
4. Submit feedback to improve future scans

### Learning Metrics
- **Accuracy Improvement**: Percentage increase in detection accuracy
- **False Positive Reduction**: Decrease in irrelevant alerts
- **Scan Efficiency**: Improvement in scan speed and resource usage
- **User Satisfaction**: Feedback quality and usefulness ratings

### Personalization Features
- **Custom Thresholds**: Adjust sensitivity for different vulnerability types
- **Preferred Languages**: Optimize for your primary programming languages
- **Project Context**: Learn patterns specific to your projects
- **Team Preferences**: Share learning across team members

## Team Management

### User Roles

#### Administrator
- **Full Access**: All features and settings
- **User Management**: Add, remove, and modify users
- **Configuration**: System-wide settings and policies
- **Reporting**: Access to all reports and analytics

#### Security Manager
- **Vulnerability Management**: Review and assign vulnerabilities
- **Compliance Oversight**: Monitor regulatory compliance
- **Team Coordination**: Manage security workflows
- **Reporting**: Generate security reports

#### Developer
- **Code Scanning**: Scan own code and projects
- **Vulnerability Fixes**: Address assigned security issues
- **Feedback**: Provide learning feedback
- **Basic Reporting**: View personal and project reports

#### Viewer
- **Read-Only Access**: View reports and dashboards
- **No Modifications**: Cannot change settings or data
- **Limited Scope**: Access only to assigned projects

### Team Workflows

#### Vulnerability Assignment
1. Security manager reviews new vulnerabilities
2. Assigns vulnerabilities to appropriate developers
3. Sets priority levels and due dates
4. Tracks progress and completion

#### Code Review Integration
1. Integrate AI Guardian with code review process
2. Automatic scanning of pull requests
3. Block merges with critical vulnerabilities
4. Require security approval for sensitive changes

#### Reporting and Analytics
- **Team Performance**: Vulnerability fix rates by team member
- **Project Security**: Security status by project or repository
- **Trend Analysis**: Security improvements over time
- **Compliance Reports**: Regulatory compliance status

## Configuration

### Scanner Settings

#### Language Support
```yaml
scanner:
  enabled_languages:
    - python
    - javascript
    - java
    - csharp
    - go
    - rust
  
  language_specific:
    python:
      external_tools: [bandit, semgrep]
      timeout: 30
    javascript:
      external_tools: [eslint-security]
      timeout: 20
```

#### Vulnerability Detection
```yaml
vulnerability_detection:
  severity_thresholds:
    critical: 9.0
    high: 7.0
    medium: 4.0
    low: 1.0
  
  enabled_checks:
    - HARDCODED_SECRET
    - SQL_INJECTION
    - XSS
    - CSRF
    - AUTHENTICATION_BYPASS
```

### Compliance Settings

#### Regulation Configuration
```yaml
compliance:
  enabled_regulations:
    - GDPR
    - CCPA
    - HIPAA
    - PCI-DSS
    - SOX
  
  data_classification:
    enabled: true
    confidence_threshold: 0.7
    
  privacy_scanning:
    enabled: true
    scan_comments: true
    scan_strings: true
```

### Notification Settings

#### Alert Configuration
```yaml
notifications:
  email:
    enabled: true
    smtp_server: smtp.example.com
    recipients:
      critical: [security-team@company.com]
      high: [dev-team@company.com]
  
  webhook:
    enabled: true
    url: https://your-app.com/webhook
    events: [vulnerability_detected, compliance_violation]
  
  in_app:
    enabled: true
    show_desktop_notifications: true
```

### Performance Settings

#### Scanning Performance
```yaml
performance:
  max_file_size_mb: 10
  scan_timeout_seconds: 60
  parallel_scans: 4
  cache_enabled: true
  cache_ttl_hours: 24
```

## Troubleshooting

### Common Issues

#### Slow Scanning Performance
**Symptoms**: Scans take longer than expected
**Solutions**:
1. Increase scan timeout in configuration
2. Enable parallel scanning
3. Reduce file size limits
4. Enable caching for repeated scans

#### High False Positive Rate
**Symptoms**: Many irrelevant vulnerability alerts
**Solutions**:
1. Provide feedback on false positives
2. Adjust sensitivity thresholds
3. Customize rules for your codebase
4. Enable adaptive learning features

#### Service Connection Errors
**Symptoms**: Cannot connect to AI Guardian services
**Solutions**:
1. Check if services are running: `curl http://localhost:5001/health`
2. Verify firewall settings and port accessibility
3. Check service logs for error messages
4. Restart services if necessary

#### Memory Usage Issues
**Symptoms**: High memory consumption during scans
**Solutions**:
1. Reduce batch size in configuration
2. Limit parallel scan processes
3. Increase system memory allocation
4. Enable garbage collection optimization

### Getting Help

#### Documentation
- **User Guide**: Comprehensive usage instructions
- **API Documentation**: Technical integration details
- **Deployment Guide**: Installation and configuration
- **FAQ**: Frequently asked questions

#### Support Channels
- **GitHub Issues**: Bug reports and feature requests
- **Community Forum**: User discussions and tips
- **Email Support**: Direct technical assistance
- **Enterprise Support**: Dedicated support for enterprise customers

#### Diagnostic Information
When reporting issues, include:
- AI Guardian version number
- Operating system and version
- Error messages and logs
- Steps to reproduce the issue
- Configuration files (sanitized)

---

**AI Guardian v1.0.0** - Comprehensive user guide for AI-powered cybersecurity platform.


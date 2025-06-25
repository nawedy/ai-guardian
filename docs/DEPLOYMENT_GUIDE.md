# AI Guardian - Deployment Guide

## Overview
AI Guardian is a comprehensive AI-powered cybersecurity platform that provides real-time code scanning, vulnerability detection, compliance monitoring, and adaptive learning capabilities.

## System Requirements

### Minimum Requirements
- **CPU**: 2 cores, 2.4 GHz
- **RAM**: 4 GB
- **Storage**: 10 GB available space
- **OS**: Ubuntu 20.04+, CentOS 8+, or macOS 10.15+
- **Python**: 3.11+
- **Node.js**: 20+

### Recommended Requirements
- **CPU**: 4 cores, 3.0 GHz
- **RAM**: 8 GB
- **Storage**: 20 GB available space
- **Network**: High-speed internet connection

## Installation Methods

### Method 1: Quick Setup Script
```bash
# Clone the repository
git clone <repository-url>
cd ai-guardian

# Run the setup script
chmod +x setup.sh
./setup.sh

# Start all services
./start-services.sh
```

### Method 2: Manual Installation

#### Backend Services Setup

**1. Code Scanner Service**
```bash
cd backend/code-scanner/code-scanner-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python src/main.py
```

**2. Adaptive Learning Service**
```bash
cd backend/adaptive-learning/adaptive-learning-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python src/main.py
```

**3. API Gateway Service**
```bash
cd backend/api-gateway/api-gateway-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python src/main.py
```

#### Frontend Setup

**Web Dashboard**
```bash
cd frontend/web-dashboard/web-dashboard
npm install --legacy-peer-deps
npm run dev
```

#### CLI Tool Setup
```bash
cd cli
pip install -r requirements.txt
chmod +x ai-guardian
```

## Service Configuration

### Environment Variables
Create a `.env` file in the root directory:

```bash
# Scanner Service
SCANNER_PORT=5001
SCANNER_DEBUG=true
EXTERNAL_SCANNERS_ENABLED=true

# Learning Service
LEARNING_PORT=5003
ML_MODEL_PATH=/path/to/models
FEEDBACK_THRESHOLD=10

# API Gateway
GATEWAY_PORT=5004
RATE_LIMIT_PER_MINUTE=100
AUTH_ENABLED=false

# Database
DATABASE_URL=sqlite:///ai_guardian.db

# External Services
BANDIT_ENABLED=true
SEMGREP_ENABLED=true
```

### Configuration Files

**Main Configuration (.guardian-config.yaml)**
```yaml
version: 1.0
platform: standalone

scanner:
  enabled_languages: [python, javascript, java, csharp, go, rust]
  scan_timeout: 30
  max_file_size_mb: 10
  external_scanners:
    bandit: true
    semgrep: true

compliance:
  enabled_regulations: [GDPR, CCPA, HIPAA, PCI-DSS, SOX]
  data_classification: true
  privacy_scanning: true

learning:
  feedback_enabled: true
  model_update_interval: 3600
  false_positive_threshold: 0.1

monitoring:
  real_time_enabled: true
  websocket_port: 8765
  scan_interval_seconds: 300
```

## Deployment Options

### Option 1: Cloud Deployment (Recommended)

#### Vercel Deployment (Frontend)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd frontend/web-dashboard/web-dashboard
vercel --prod
```

#### AWS/GCP Deployment (Backend)
```bash
# Build Docker images
docker build -t ai-guardian-scanner backend/code-scanner/code-scanner-service
docker build -t ai-guardian-learning backend/adaptive-learning/adaptive-learning-service
docker build -t ai-guardian-gateway backend/api-gateway/api-gateway-service

# Deploy to cloud platform
# (Platform-specific commands)
```

### Option 2: Docker Deployment

**Docker Compose Setup**
```yaml
version: '3.8'
services:
  scanner:
    build: ./backend/code-scanner/code-scanner-service
    ports:
      - "5001:5001"
    environment:
      - SCANNER_PORT=5001
    
  learning:
    build: ./backend/adaptive-learning/adaptive-learning-service
    ports:
      - "5003:5003"
    environment:
      - LEARNING_PORT=5003
    
  gateway:
    build: ./backend/api-gateway/api-gateway-service
    ports:
      - "5004:5004"
    environment:
      - GATEWAY_PORT=5004
    depends_on:
      - scanner
      - learning
    
  frontend:
    build: ./frontend/web-dashboard/web-dashboard
    ports:
      - "3000:3000"
    depends_on:
      - gateway
```

**Deploy with Docker Compose**
```bash
docker-compose up -d
```

### Option 3: On-Premise Deployment

**System Service Setup (Linux)**
```bash
# Create systemd service files
sudo cp deployment/systemd/*.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable ai-guardian-scanner
sudo systemctl enable ai-guardian-learning
sudo systemctl enable ai-guardian-gateway
sudo systemctl start ai-guardian-scanner
sudo systemctl start ai-guardian-learning
sudo systemctl start ai-guardian-gateway
```

## Security Configuration

### SSL/TLS Setup
```bash
# Generate SSL certificates
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365

# Configure HTTPS in services
export SSL_CERT_PATH=/path/to/cert.pem
export SSL_KEY_PATH=/path/to/key.pem
```

### Authentication Setup
```bash
# Enable authentication
export AUTH_ENABLED=true
export JWT_SECRET_KEY=your-secret-key
export SESSION_TIMEOUT=3600
```

### Firewall Configuration
```bash
# Allow required ports
sudo ufw allow 5001  # Scanner service
sudo ufw allow 5003  # Learning service
sudo ufw allow 5004  # API gateway
sudo ufw allow 3000  # Frontend (development)
sudo ufw allow 80    # HTTP (production)
sudo ufw allow 443   # HTTPS (production)
```

## Monitoring and Logging

### Log Configuration
```bash
# Create log directories
mkdir -p /var/log/ai-guardian

# Configure log rotation
sudo cp deployment/logrotate/ai-guardian /etc/logrotate.d/
```

### Health Monitoring
```bash
# Check service health
curl http://localhost:5001/health
curl http://localhost:5003/api/health
curl http://localhost:5004/health

# Monitor with systemctl (if using systemd)
sudo systemctl status ai-guardian-scanner
sudo systemctl status ai-guardian-learning
sudo systemctl status ai-guardian-gateway
```

## Performance Tuning

### Database Optimization
```sql
-- Create indexes for better performance
CREATE INDEX idx_scan_results_timestamp ON scan_results(timestamp);
CREATE INDEX idx_vulnerabilities_severity ON vulnerabilities(severity);
CREATE INDEX idx_compliance_violations_regulation ON compliance_violations(regulation);
```

### Memory Optimization
```bash
# Adjust Python memory settings
export PYTHONMALLOC=malloc
export MALLOC_ARENA_MAX=2

# Configure garbage collection
export PYTHONGC=1
```

### Caching Configuration
```bash
# Enable Redis for caching (optional)
sudo apt-get install redis-server
export REDIS_URL=redis://localhost:6379
```

## Backup and Recovery

### Database Backup
```bash
# Backup SQLite database
cp /path/to/ai_guardian.db /backup/ai_guardian_$(date +%Y%m%d).db

# Backup configuration files
tar -czf /backup/ai_guardian_config_$(date +%Y%m%d).tar.gz .guardian-config.yaml
```

### Service Recovery
```bash
# Restart services
sudo systemctl restart ai-guardian-scanner
sudo systemctl restart ai-guardian-learning
sudo systemctl restart ai-guardian-gateway

# Check logs for errors
sudo journalctl -u ai-guardian-scanner -f
```

## Troubleshooting

### Common Issues

**1. Service Connection Errors**
```bash
# Check if services are running
netstat -tulpn | grep :5001
netstat -tulpn | grep :5003
netstat -tulpn | grep :5004

# Check firewall settings
sudo ufw status
```

**2. High Memory Usage**
```bash
# Monitor memory usage
top -p $(pgrep -f "python src/main.py")

# Adjust batch size in configuration
# Edit .guardian-config.yaml
scanner:
  batch_size: 50  # Reduce from default 100
```

**3. Slow Scanning Performance**
```bash
# Enable external scanner optimization
export BANDIT_PARALLEL=true
export SEMGREP_JOBS=4

# Increase scan timeout
export SCAN_TIMEOUT=60
```

### Debug Mode
```bash
# Enable debug logging
export DEBUG=true
export LOG_LEVEL=DEBUG

# Run services in foreground for debugging
python src/main.py --debug
```

## Maintenance

### Regular Updates
```bash
# Update dependencies
pip install -r requirements.txt --upgrade
npm update

# Update external scanners
pip install bandit --upgrade
pip install semgrep --upgrade
```

### Performance Monitoring
```bash
# Monitor system resources
htop
iotop
nethogs

# Check service metrics
curl http://localhost:5001/api/metrics
curl http://localhost:5003/api/metrics
curl http://localhost:5004/api/metrics
```

## Support and Documentation

### Additional Resources
- **API Documentation**: `/docs/API_DOCUMENTATION.md`
- **User Guide**: `/docs/USER_GUIDE.md`
- **Development Guide**: `/docs/DEVELOPMENT_SETUP.md`
- **Troubleshooting**: `/docs/TROUBLESHOOTING.md`

### Support Channels
- **GitHub Issues**: For bug reports and feature requests
- **Documentation**: Comprehensive guides and tutorials
- **Community**: Discord/Slack channels for community support
- **Enterprise**: Dedicated support for enterprise customers

---

**AI Guardian v1.0.0** - Production-ready deployment guide for secure software development.


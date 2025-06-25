# AI Guardian: Railway + Vercel Production Deployment Guide

## 🚀 Complete Production Deployment (Preserves 100% Advanced Functionality)

This guide will deploy your **sophisticated AI Guardian cybersecurity platform** to production while maintaining all advanced features:

- ✅ **5 Advanced Microservices** (API Gateway, Code Scanner, Intelligent Analysis, Remediation Engine, Adaptive Learning)
- ✅ **Real-time WebSocket Monitoring** 
- ✅ **AI-Powered Analysis** (OpenAI, Anthropic, HuggingFace)
- ✅ **Multi-language Code Scanning** (Python, JavaScript, Java, C#, Go, Rust)
- ✅ **Compliance Monitoring** (OWASP, NIST, SOC2)
- ✅ **Adaptive Machine Learning**
- ✅ **Production Security** (No hardcoded secrets, disabled debug)

**Total Cost: $5-10/month | Deployment Time: 4-6 hours**

---

## 📋 Prerequisites

1. **Railway Account** - [Sign up](https://railway.app) (free)
2. **Vercel Account** - [Sign up](https://vercel.com) (free)
3. **NeonDB Account** - [Sign up](https://neon.tech) (free)
4. **GitHub Repository** - Code must be in Git

---

## 🗃️ Phase 1: Database Setup (NeonDB)

### 1.1 Create Production Database

```bash
# Go to https://neon.tech
# Create new project: "ai-guardian-production"
# Copy the connection string - will look like:
# postgresql://username:password@host/database?sslmode=require
```

### 1.2 Save Database URL
```bash
# You'll need this for Railway environment variables
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
```

---

## 🚂 Phase 2: Railway Backend Deployment

### 2.1 Deploy Code Scanner Service (Core Service)

1. **Create New Railway Project**
   ```bash
   # Go to https://railway.app/new
   # Connect GitHub repository
   # Select: backend/code-scanner/code-scanner-service
   ```

2. **Environment Variables**
   ```bash
   # Add these in Railway Dashboard > Variables
   SECRET_KEY=your-super-secure-32-char-secret-key-here
   DATABASE_URL=postgresql://username:password@host/database
   ENVIRONMENT=production
   DEBUG=false
   PORT=5001
   ENABLE_REAL_TIME_SCANNING=true
   MAX_CONCURRENT_SCANS=50
   
   # Optional AI API Keys (for advanced features)
   OPENAI_API_KEY=your-openai-key
   ANTHROPIC_API_KEY=your-anthropic-key
   HUGGINGFACE_API_TOKEN=your-huggingface-token
   ```

3. **Deploy**
   ```bash
   # Railway will automatically detect railway.toml
   # Build and deploy will happen automatically
   # Note the deployed URL: https://ai-guardian-code-scanner.railway.app
   ```

### 2.2 Deploy API Gateway Service

1. **Create New Railway Service**
   ```bash
   # In same Railway project, add new service
   # Connect to: backend/api-gateway/api-gateway-service
   ```

2. **Environment Variables**
   ```bash
   SECRET_KEY=your-super-secure-32-char-secret-key-here
   DATABASE_URL=postgresql://username:password@host/database
   ENVIRONMENT=production
   DEBUG=false
   PORT=5000
   
   # Microservice URLs (update with your actual Railway URLs)
   CODE_SCANNER_URL=https://ai-guardian-code-scanner.railway.app
   INTELLIGENT_ANALYSIS_URL=https://ai-guardian-intelligent-analysis.railway.app
   REMEDIATION_ENGINE_URL=https://ai-guardian-remediation-engine.railway.app
   ADAPTIVE_LEARNING_URL=https://ai-guardian-adaptive-learning.railway.app
   ```

### 2.3 Deploy Remaining Services

**Repeat for each service:**

1. **Intelligent Analysis Service**
   ```bash
   # Directory: backend/intelligent-analysis/intelligent-analysis-service
   # Port: 5002
   # Additional env: OPENAI_API_KEY, ANTHROPIC_API_KEY
   ```

2. **Remediation Engine Service**
   ```bash
   # Directory: backend/remediation-engine/remediation-engine-service  
   # Port: 5003
   # Additional env: GITHUB_TOKEN, GITLAB_TOKEN
   ```

3. **Adaptive Learning Service**
   ```bash
   # Directory: backend/adaptive-learning/adaptive-learning-service
   # Port: 5004
   # Additional env: ENABLE_ADAPTIVE_LEARNING=true
   ```

### 2.4 Configure Service Discovery

Update each service with the actual Railway URLs:

```bash
# In Railway Dashboard, update environment variables for all services:
API_GATEWAY_URL=https://your-api-gateway.railway.app
CODE_SCANNER_URL=https://your-code-scanner.railway.app  
INTELLIGENT_ANALYSIS_URL=https://your-intelligent-analysis.railway.app
REMEDIATION_ENGINE_URL=https://your-remediation-engine.railway.app
ADAPTIVE_LEARNING_URL=https://your-adaptive-learning.railway.app
WEBSOCKET_URL=wss://your-code-scanner.railway.app/ws
```

---

## ⚡ Phase 3: Vercel Frontend Deployment

### 3.1 Prepare Frontend Environment

Create `frontend/web-dashboard/web-dashboard/.env.production`:

```bash
# Frontend production environment variables
VITE_API_GATEWAY_URL=https://your-api-gateway.railway.app
VITE_CODE_SCANNER_URL=https://your-code-scanner.railway.app
VITE_INTELLIGENT_ANALYSIS_URL=https://your-intelligent-analysis.railway.app
VITE_REMEDIATION_ENGINE_URL=https://your-remediation-engine.railway.app
VITE_ADAPTIVE_LEARNING_URL=https://your-adaptive-learning.railway.app
VITE_WEBSOCKET_URL=wss://your-code-scanner.railway.app/ws
VITE_ENVIRONMENT=production
```

### 3.2 Deploy to Vercel

```bash
# Option 1: Vercel CLI
npm i -g vercel
cd frontend/web-dashboard/web-dashboard
vercel --prod

# Option 2: Vercel Dashboard
# Go to https://vercel.com/new
# Import GitHub repository
# Set Root Directory: frontend/web-dashboard/web-dashboard
# Framework Preset: Vite
# Add environment variables from .env.production
```

### 3.3 Update CORS Settings

Update Railway services with Vercel domain:

```bash
# Add to all Railway services:
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-domain.com
CORS_ALLOW_CREDENTIALS=true
```

---

## 🔒 Phase 4: Security Configuration

### 4.1 Generate Secure Keys

```bash
# Generate secure secrets (run locally)
python -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))"
python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_urlsafe(32))"
python -c "import secrets; print('ENCRYPTION_KEY=' + secrets.token_urlsafe(32))"
```

### 4.2 Update All Services

Replace placeholder secret keys with generated ones in all Railway services.

### 4.3 Configure Rate Limiting

```bash
# Add to all Railway services:
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_BURST=20
ENABLE_API_RATE_LIMITING=true
```

---

## 🔍 Phase 5: Testing & Verification

### 5.1 Health Check All Services

```bash
# Test each service endpoint:
curl https://your-api-gateway.railway.app/health
curl https://your-code-scanner.railway.app/health
curl https://your-intelligent-analysis.railway.app/health
curl https://your-remediation-engine.railway.app/health
curl https://your-adaptive-learning.railway.app/health
```

### 5.2 Test Advanced Features

1. **Real-time Scanning**
   - Open frontend: https://your-frontend.vercel.app
   - Go to Real-time Monitor
   - Upload code for scanning
   - Verify WebSocket connection

2. **AI Analysis**
   - Use Intelligent Analysis features
   - Verify OpenAI/Anthropic integration

3. **Compliance Monitoring**
   - Test OWASP, NIST compliance checks
   - Verify all security rules

4. **Adaptive Learning**
   - Verify ML model adaptation
   - Check learning insights

### 5.3 Performance Testing

```bash
# Test concurrent scanning (from multiple terminals)
for i in {1..10}; do
  curl -X POST https://your-code-scanner.railway.app/api/scan \
    -H "Content-Type: application/json" \
    -d '{"code":"print(\"test\")", "language":"python"}' &
done
```

---

## 📊 Phase 6: Monitoring & Maintenance

### 6.1 Application Monitoring

```bash
# Add to Railway services:
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=INFO
ENABLE_METRICS=true
```

### 6.2 Database Monitoring

```bash
# Monitor NeonDB in dashboard:
# - Connection count
# - Query performance  
# - Storage usage
```

### 6.3 Service Health Monitoring

Frontend includes built-in service health checking via `/health` endpoints.

---

## 🎯 Production URLs

After successful deployment:

```bash
# Frontend (Vercel)
https://your-frontend.vercel.app

# Backend Services (Railway)
https://your-api-gateway.railway.app
https://your-code-scanner.railway.app
https://your-intelligent-analysis.railway.app
https://your-remediation-engine.railway.app
https://your-adaptive-learning.railway.app

# WebSocket (Real-time)
wss://your-code-scanner.railway.app/ws
```

---

## 🛠️ Troubleshooting

### Common Issues

1. **Service Connection Errors**
   ```bash
   # Check environment variables in Railway
   # Verify all service URLs are updated
   # Check CORS settings
   ```

2. **Database Connection Issues**
   ```bash
   # Verify DATABASE_URL format
   # Check NeonDB connection limits
   # Test connection string locally
   ```

3. **WebSocket Connection Failed**
   ```bash
   # Verify WSS protocol (not WS) for production
   # Check WEBSOCKET_URL environment variable
   # Test WebSocket endpoint directly
   ```

4. **API Authentication Errors**
   ```bash
   # Verify SECRET_KEY is same across all services
   # Check CORS settings
   # Verify environment variables
   ```

### Performance Optimization

1. **Database Optimization**
   ```bash
   # Add connection pooling settings:
   DATABASE_POOL_SIZE=20
   DATABASE_POOL_TIMEOUT=30
   DATABASE_POOL_RECYCLE=3600
   ```

2. **Caching Configuration**
   ```bash
   # Add Redis for production caching:
   REDIS_URL=redis://your-redis-instance
   CACHE_TTL=3600
   ```

---

## 🎉 Success!

Your **AI Guardian** platform is now running in production with:

- ✅ **100% Advanced Functionality Preserved**
- ✅ **Production Security** (No debug, secure secrets)
- ✅ **Scalable Architecture** (5 microservices)
- ✅ **Real-time Capabilities** (WebSocket monitoring)
- ✅ **AI-Powered Analysis** (Multiple AI providers)
- ✅ **Professional Monitoring** (Health checks, logging)

**Estimated Monthly Cost: $5-10**
**Deployment Time: 4-6 hours**

The platform maintains all sophisticated cybersecurity features while running in a production-grade environment with proper security, monitoring, and scalability. 
# AI Guardian: Render + Vercel Production Deployment Guide

## 🚀 Complete Production Deployment (100% Advanced Functionality + FREE TIER)

Deploy your **sophisticated AI Guardian cybersecurity platform** using **Render + Vercel** while maintaining all advanced features:

- ✅ **5 Advanced Microservices** preserved
- ✅ **Real-time WebSocket Monitoring** 
- ✅ **AI-Powered Analysis** 
- ✅ **Multi-language Code Scanning**
- ✅ **Compliance Monitoring**
- ✅ **Adaptive Machine Learning**
- ✅ **100% FREE for 90 days**, then ~$7/month

**Deployment Time: 4-6 hours | Cost: FREE (90 days) then $7/month**

---

## 🆚 **Render vs Railway**

| Feature | Render | Railway |
|---------|--------|---------|
| **Free Tier** | ✅ 90 days free | ✅ $5 credit |
| **Python Support** | ✅ Native | ✅ Native |
| **WebSocket** | ✅ Full support | ✅ Full support |
| **Environment Variables** | ✅ Yes | ✅ Yes |
| **Health Checks** | ✅ Yes | ✅ Yes |
| **Multiple Services** | ✅ Yes | ✅ Yes |
| **Database** | ✅ PostgreSQL | ✅ PostgreSQL |
| **Your Experience** | ✅ **Already using** | ❌ New platform |

**Result: Render is perfect for your needs!**

---

## 📋 Prerequisites

1. **Render Account** - You already have this! 🎉
2. **Vercel Account** - [Sign up](https://vercel.com) (free)
3. **GitHub Repository** - Code must be in Git

---

## 🗃️ Phase 1: Database Setup (Render PostgreSQL)

### 1.1 Create Database
```bash
# In Render Dashboard:
# 1. Go to https://dashboard.render.com
# 2. Click "New" → "PostgreSQL"
# 3. Name: "ai-guardian-db"
# 4. Database Name: "ai_guardian_production"
# 5. User: "ai_guardian_user"
# 6. Plan: Free (90 days)
# 7. Click "Create Database"
```

### 1.2 Get Database URL
```bash
# In Render Database dashboard:
# Copy "External Database URL" 
# Will look like: postgresql://username:password@host:port/database
```

---

## 🚀 Phase 2: Deploy Backend Services to Render

### 2.1 Deploy Code Scanner Service (Core)

1. **Create New Web Service**
   ```bash
   # In Render Dashboard:
   # 1. Click "New" → "Web Service"
   # 2. Connect GitHub repository
   # 3. Name: "ai-guardian-code-scanner"
   # 4. Root Directory: backend/code-scanner/code-scanner-service
   # 5. Runtime: Python 3
   ```

2. **Build & Start Commands**
   ```bash
   # Build Command:
   pip install -r requirements.txt
   
   # Start Command:
   python src/main.py
   ```

3. **Environment Variables**
   ```bash
   # Add in Render service settings:
   SECRET_KEY=your-super-secure-32-char-secret-key-here
   DATABASE_URL=postgresql://username:password@host:port/database
   ENVIRONMENT=production
   DEBUG=false
   PORT=5001
   ENABLE_REAL_TIME_SCANNING=true
   MAX_CONCURRENT_SCANS=50
   
   # Optional AI keys:
   OPENAI_API_KEY=your-openai-key
   ANTHROPIC_API_KEY=your-anthropic-key
   ```

4. **Advanced Settings**
   ```bash
   # Health Check Path: /health
   # Plan: Free
   # Region: Oregon (or closest to you)
   ```

### 2.2 Deploy API Gateway Service

Repeat the same process:
```bash
# Service Name: ai-guardian-api-gateway
# Root Directory: backend/api-gateway/api-gateway-service
# Port: 5000
# Same environment variables + service URLs:

CODE_SCANNER_URL=https://ai-guardian-code-scanner.onrender.com
INTELLIGENT_ANALYSIS_URL=https://ai-guardian-intelligent-analysis.onrender.com
REMEDIATION_ENGINE_URL=https://ai-guardian-remediation-engine.onrender.com
ADAPTIVE_LEARNING_URL=https://ai-guardian-adaptive-learning.onrender.com
```

### 2.3 Deploy Remaining Services

**For each service, create new Render web service:**

1. **Intelligent Analysis**
   ```bash
   # Name: ai-guardian-intelligent-analysis
   # Directory: backend/intelligent-analysis/intelligent-analysis-service
   # Port: 5002
   ```

2. **Remediation Engine**
   ```bash
   # Name: ai-guardian-remediation-engine
   # Directory: backend/remediation-engine/remediation-engine-service
   # Port: 5003
   ```

3. **Adaptive Learning**
   ```bash
   # Name: ai-guardian-adaptive-learning
   # Directory: backend/adaptive-learning/adaptive-learning-service
   # Port: 5004
   ```

**All services use the same:**
- Build Command: `pip install -r requirements.txt`
- Start Command: `python src/main.py`
- Health Check: `/health`
- Database URL: Same PostgreSQL connection

---

## ⚡ Phase 3: Deploy Frontend to Vercel

### 3.1 Prepare Environment Variables

Create `frontend/web-dashboard/web-dashboard/.env.production`:

```bash
# Frontend environment variables for Render services
VITE_API_GATEWAY_URL=https://ai-guardian-api-gateway.onrender.com
VITE_CODE_SCANNER_URL=https://ai-guardian-code-scanner.onrender.com
VITE_INTELLIGENT_ANALYSIS_URL=https://ai-guardian-intelligent-analysis.onrender.com
VITE_REMEDIATION_ENGINE_URL=https://ai-guardian-remediation-engine.onrender.com
VITE_ADAPTIVE_LEARNING_URL=https://ai-guardian-adaptive-learning.onrender.com
VITE_WEBSOCKET_URL=wss://ai-guardian-code-scanner.onrender.com/ws
VITE_ENVIRONMENT=production
```

### 3.2 Deploy to Vercel

```bash
# Option 1: Vercel CLI
npm i -g vercel
cd frontend/web-dashboard/web-dashboard
vercel --prod

# Option 2: Vercel Dashboard
# 1. Go to https://vercel.com/new
# 2. Import GitHub repository
# 3. Root Directory: frontend/web-dashboard/web-dashboard
# 4. Framework: Vite
# 5. Add environment variables
```

### 3.3 Update CORS Settings

Add Vercel domain to all Render services:
```bash
# Add to all services' environment variables:
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-domain.com
CORS_ALLOW_CREDENTIALS=true
```

---

## 🔒 Phase 4: Security Configuration

### 4.1 Generate Secure Keys
```bash
# Run locally to generate secure keys:
python -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))"
python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_urlsafe(32))"
python -c "import secrets; print('ENCRYPTION_KEY=' + secrets.token_urlsafe(32))"
```

### 4.2 Update All Services
Replace placeholder keys in all Render services with generated ones.

---

## 🔍 Phase 5: Testing & Verification

### 5.1 Health Check All Services
```bash
# Test each service (replace with your actual URLs):
curl https://ai-guardian-api-gateway.onrender.com/health
curl https://ai-guardian-code-scanner.onrender.com/health
curl https://ai-guardian-intelligent-analysis.onrender.com/health
curl https://ai-guardian-remediation-engine.onrender.com/health
curl https://ai-guardian-adaptive-learning.onrender.com/health
```

### 5.2 Test Advanced Features
1. **Real-time Scanning**: Upload code and verify WebSocket
2. **AI Analysis**: Test intelligent analysis features
3. **Compliance**: Verify OWASP/NIST monitoring
4. **Learning**: Check adaptive ML capabilities

---

## 💰 **Cost Comparison**

| Platform | Free Tier | After Free | Notes |
|----------|-----------|------------|-------|
| **Render** | 90 days | $7/month | PostgreSQL included |
| **Railway** | $5 credit | $5-10/month | Pay per usage |
| **Vercel** | Forever | Free | Frontend only |

**Winner: Render** (longer free period, predictable pricing)

---

## ⚠️ **Render-Specific Considerations**

### Cold Starts
- Free tier services "sleep" after 15 min of inactivity
- First request after sleep takes ~30 seconds
- **Solution**: Keep-alive service or upgrade to paid tier

### Service Limits
- Free tier: 750 hours/month per service
- 5 services = need to monitor usage
- **Solution**: Upgrade critical services if needed

---

## 🎯 **Final URLs** 

After deployment:
```bash
# Frontend (Vercel)
https://your-ai-guardian.vercel.app

# Backend Services (Render)
https://ai-guardian-api-gateway.onrender.com
https://ai-guardian-code-scanner.onrender.com
https://ai-guardian-intelligent-analysis.onrender.com
https://ai-guardian-remediation-engine.onrender.com
https://ai-guardian-adaptive-learning.onrender.com

# WebSocket (Real-time)
wss://ai-guardian-code-scanner.onrender.com/ws
```

---

## 🎉 **Advantages of Using Render**

✅ **You already know the platform**
✅ **90 days completely free**
✅ **Native Python support** (no Docker)
✅ **Built-in PostgreSQL**
✅ **WebSocket support**
✅ **Health monitoring**
✅ **Automatic HTTPS**
✅ **Git-based deployments**
✅ **Environment variables**
✅ **Simple pricing** ($7/month predictable)

---

## 🏆 **Result**

Your sophisticated AI Guardian platform running on Render + Vercel with:
- ✅ **100% Advanced Features Preserved**
- ✅ **Real-time WebSocket Monitoring**
- ✅ **AI-Powered Analysis**
- ✅ **Professional Security**
- ✅ **90 Days FREE**
- ✅ **Platform You Already Know**

**Perfect solution for your budget and expertise!** 🚀 
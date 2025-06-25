# AI Guardian: Render Free Tier Deployment Guide

## 🆓 **FREE TIER DEPLOYMENT** (Perfect for Testing & Development)

Since you need the free plan, here's the complete step-by-step guide to deploy all 5 AI Guardian microservices on Render's free tier.

## ✅ **Prerequisites Completed**
- ✅ **Repository**: https://github.com/nawedy/ai-guardian (public and accessible)
- ✅ **Code**: All 217 files pushed and ready
- ✅ **Database**: `strapi-postgres` available (90 days free)
- ✅ **Configuration**: All services production-ready

## 🎯 **Free Tier Deployment Strategy**

### **Free Tier Limitations to Know**
- **Sleep after 15 minutes** of inactivity
- **750 hours/month** per service (31 days = 744 hours)
- **Cold start delay** (~30 seconds after sleep)
- **1 free database** (you already have this!)

### **Solution: Strategic Service Deployment**
Deploy services in order of importance for testing:

## 🚀 **Step-by-Step Deployment**

### **Service 1: AI Guardian Code Scanner** (CORE - Deploy First)

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Click "New" → "Web Service"

2. **Connect Repository**
   - Select "Build and deploy from a Git repository"
   - Connect GitHub: `https://github.com/nawedy/ai-guardian`
   - Branch: `main`

3. **Service Configuration**
   ```bash
   Name: ai-guardian-code-scanner
   Runtime: Python 3
   Build Command: cd backend/code-scanner/code-scanner-service && pip install -r requirements.txt
   Start Command: cd backend/code-scanner/code-scanner-service && python src/main.py
   ```

4. **Advanced Settings**
   ```bash
   Plan: Free
   Region: Ohio (same as your database)
   Health Check Path: /health
   Auto-Deploy: Yes
   ```

5. **Environment Variables**
   ```bash
   SECRET_KEY=ai-guardian-scanner-secure-key-2025-production-free
   DATABASE_URL=postgresql://strapi_postgres_38iw_user:YOUR_PASSWORD@YOUR_HOST:5432/strapi_postgres_38iw
   ENVIRONMENT=production
   DEBUG=false
   PORT=5001
   ENABLE_REAL_TIME_SCANNING=true
   MAX_CONCURRENT_SCANS=25
   ```

6. **Click "Create Web Service"**

### **Service 2: AI Guardian API Gateway** (Deploy Second)

Repeat the same process with these settings:
```bash
Name: ai-guardian-api-gateway
Build Command: cd backend/api-gateway/api-gateway-service && pip install -r requirements.txt
Start Command: cd backend/api-gateway/api-gateway-service && python src/main.py

Environment Variables:
SECRET_KEY=ai-guardian-gateway-secure-key-2025-production-free
DATABASE_URL=postgresql://strapi_postgres_38iw_user:YOUR_PASSWORD@YOUR_HOST:5432/strapi_postgres_38iw
ENVIRONMENT=production
DEBUG=false
PORT=5000
CODE_SCANNER_URL=https://ai-guardian-code-scanner.onrender.com
```

### **Service 3: AI Guardian Intelligent Analysis**

```bash
Name: ai-guardian-intelligent-analysis
Build Command: cd backend/intelligent-analysis/intelligent-analysis-service && pip install -r requirements.txt
Start Command: cd backend/intelligent-analysis/intelligent-analysis-service && python src/main.py

Environment Variables:
SECRET_KEY=ai-guardian-analysis-secure-key-2025-production-free
DATABASE_URL=postgresql://strapi_postgres_38iw_user:YOUR_PASSWORD@YOUR_HOST:5432/strapi_postgres_38iw
ENVIRONMENT=production
DEBUG=false
PORT=5002
ENABLE_AI_ANALYSIS=true
```

### **Service 4: AI Guardian Remediation Engine**

```bash
Name: ai-guardian-remediation-engine
Build Command: cd backend/remediation-engine/remediation-engine-service && pip install -r requirements.txt
Start Command: cd backend/remediation-engine/remediation-engine-service && python src/main.py

Environment Variables:
SECRET_KEY=ai-guardian-remediation-secure-key-2025-production-free
DATABASE_URL=postgresql://strapi_postgres_38iw_user:YOUR_PASSWORD@YOUR_HOST:5432/strapi_postgres_38iw
ENVIRONMENT=production
DEBUG=false
PORT=5003
```

### **Service 5: AI Guardian Adaptive Learning**

```bash
Name: ai-guardian-adaptive-learning
Build Command: cd backend/adaptive-learning/adaptive-learning-service && pip install -r requirements.txt
Start Command: cd backend/adaptive-learning/adaptive-learning-service && python src/main.py

Environment Variables:
SECRET_KEY=ai-guardian-learning-secure-key-2025-production-free
DATABASE_URL=postgresql://strapi_postgres_38iw_user:YOUR_PASSWORD@YOUR_HOST:5432/strapi_postgres_38iw
ENVIRONMENT=production
DEBUG=false
PORT=5004
ENABLE_ADAPTIVE_LEARNING=true
```

## 🔑 **Get Your Database Connection String**

1. **Go to Database Dashboard**
   - https://dashboard.render.com/d/dpg-d184bvfdiees73amjjqg-a
   - Click "Connect" → "External Connection"
   - Copy the connection string

2. **Format**: 
   ```
   postgresql://username:password@host:5432/database_name
   ```

3. **Use this exact string** in all services' `DATABASE_URL` environment variable

## 🎯 **Expected Service URLs After Deployment**

```bash
# Core Services (Deploy These First)
https://ai-guardian-code-scanner.onrender.com
https://ai-guardian-api-gateway.onrender.com

# Additional Services  
https://ai-guardian-intelligent-analysis.onrender.com
https://ai-guardian-remediation-engine.onrender.com
https://ai-guardian-adaptive-learning.onrender.com

# WebSocket (Real-time)
wss://ai-guardian-code-scanner.onrender.com/ws
```

## 🔍 **Testing Your Deployment**

### **Health Checks**
Test each service after deployment:
```bash
curl https://ai-guardian-code-scanner.onrender.com/health
curl https://ai-guardian-api-gateway.onrender.com/health
# ... etc for all services
```

### **Expected Response**
```json
{
  "status": "healthy",
  "service": "AI Guardian Code Scanner",
  "version": "1.0.0",
  "database": "connected",
  "features": {
    "real_time_scanning": true,
    "websocket": true,
    "ai_analysis": true
  }
}
```

## ⚡ **Free Tier Optimization Tips**

### **Keep Services Awake**
- **Primary method**: Regular health check pings
- **Tools**: UptimeRobot, StatusCake (free monitoring)
- **Frequency**: Every 14 minutes

### **Priority Order**
If you hit free tier limits:
1. **Code Scanner** (core functionality)
2. **API Gateway** (service coordination)  
3. **Intelligent Analysis** (AI features)
4. **Remediation Engine** (automated fixes)
5. **Adaptive Learning** (ML improvements)

## 💰 **Cost Breakdown**

```bash
# FREE TIER (90 days)
Database: FREE (PostgreSQL)
5 Web Services: FREE (750 hours each)
Total: $0/month

# AFTER 90 DAYS
Database: $7/month
5 Web Services: Still FREE
Total: $7/month (just database)
```

## 🎉 **Deployment Checklist**

- [ ] Deploy Code Scanner service
- [ ] Deploy API Gateway service  
- [ ] Test health endpoints
- [ ] Deploy remaining 3 services
- [ ] Configure service URLs in frontend
- [ ] Test WebSocket connectivity
- [ ] Set up monitoring/keep-alive

## 🔄 **Next Steps**

1. **Deploy services** using the steps above
2. **Get service URLs** from Render dashboard
3. **Update frontend** environment variables
4. **Deploy frontend** to Vercel
5. **Test full application**

## 🚀 **Ready to Deploy!**

Everything is prepared for free tier deployment:
- ✅ **Repository**: Public and accessible
- ✅ **Code**: Production-ready
- ✅ **Database**: Available
- ✅ **Configuration**: Optimized for free tier

**Start with Service 1 (Code Scanner) and work your way through the list!**

**Estimated deployment time**: 30-45 minutes (manual but straightforward)
**Cost**: FREE for 90 days, then $7/month (database only) 
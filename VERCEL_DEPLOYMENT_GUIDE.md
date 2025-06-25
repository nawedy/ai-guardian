# AI Guardian - Vercel Deployment Guide (No Docker)

## 🎯 **Best Option: Vercel Frontend + Railway Backend**

This approach gives you the best of both worlds: Vercel's excellent frontend hosting with Railway's Python-friendly backend hosting.

### Step 1: Deploy Frontend to Vercel

```bash
# Navigate to frontend directory
cd frontend/web-dashboard/web-dashboard

# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (will prompt for configuration)
vercel --prod
```

#### Vercel Configuration
Create `vercel.json` in the frontend root:

```json
{
  "framework": "vite",
  "buildCommand": "pnpm build", 
  "outputDirectory": "dist",
  "installCommand": "pnpm install",
  "env": {
    "VITE_API_BASE_URL": "@vite_api_base_url",
    "VITE_WEBSOCKET_URL": "@vite_websocket_url"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, PUT, DELETE" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
      ]
    }
  ]
}
```

#### Environment Variables in Vercel Dashboard
```bash
VITE_API_BASE_URL=https://your-railway-backend.up.railway.app
VITE_WEBSOCKET_URL=wss://your-railway-websocket.up.railway.app
```

### Step 2: Deploy Backend to Railway

```bash
# 1. Push your code to GitHub if not already done
git add .
git commit -m "Prepare for Railway deployment"
git push origin main

# 2. Go to railway.app and sign up
# 3. Click "Deploy from GitHub repo"
# 4. Select your ai-guardian-project repository
```

#### Railway Service Configuration
Create separate Railway services for each backend component:

**Service 1: Code Scanner** 
```bash
# Railway will auto-detect Python
# Root Directory: backend/code-scanner/code-scanner-service
# Start Command: python src/main.py
# Port: 5001
```

**Service 2: Adaptive Learning**
```bash
# Root Directory: backend/adaptive-learning/adaptive-learning-service  
# Start Command: python src/main.py
# Port: 5003
```

**Service 3: API Gateway**
```bash
# Root Directory: backend/api-gateway/api-gateway-service
# Start Command: python src/main.py  
# Port: 5004
```

#### Railway Environment Variables
For each service, add these environment variables:

```bash
# Common for all services
SECRET_KEY=your-secure-secret-key-here
FLASK_DEBUG=false
PYTHONPATH=/app

# For API Gateway service specifically  
SCANNER_SERVICE_URL=https://code-scanner-service.up.railway.app
LEARNING_SERVICE_URL=https://adaptive-learning-service.up.railway.app

# Database (Railway provides PostgreSQL)
DATABASE_URL=${RAILWAY_DATABASE_URL}
```

---

## 🔄 **Alternative: Full Vercel Serverless**

Convert your Flask apps to Vercel serverless functions. This requires significant restructuring but gives you a truly serverless architecture.

### Project Structure for Vercel Serverless
```
ai-guardian-project/
├── frontend/               # Existing Vite frontend
├── api/                   # New Vercel serverless functions
│   ├── scan.py           # Vulnerability scanning endpoint
│   ├── learn.py          # Adaptive learning endpoint
│   ├── monitor.py        # Real-time monitoring endpoint
│   └── health.py         # Health check endpoint
└── vercel.json           # Vercel configuration
```

### Convert Flask Routes to Serverless Functions

#### Example: Scan Function
Create `api/scan.py`:

```python
from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Add the scanner logic
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend', 'code-scanner', 'code-scanner-service', 'src'))

from models.scanner import VulnerabilityScanner

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))
        
        # Initialize scanner
        scanner = VulnerabilityScanner()
        
        # Perform scan
        result = scanner.scan_code(
            data.get('code', ''),
            data.get('language', 'python'),
            data.get('filename', 'temp.py')
        )
        
        # Return response
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            'scan_id': result.get('scan_id'),
            'vulnerabilities': result.get('vulnerabilities', []),
            'scan_time': result.get('scan_time', 0)
        }
        
        self.wfile.write(json.dumps(response).encode())
        
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
```

#### Vercel Configuration for Serverless
Update `vercel.json`:

```json
{
  "functions": {
    "api/*.py": {
      "runtime": "@vercel/python"
    }
  },
  "rewrites": [
    {
      "source": "/api/scan",
      "destination": "/api/scan.py"
    },
    {
      "source": "/api/learn", 
      "destination": "/api/learn.py"
    },
    {
      "source": "/api/monitor",
      "destination": "/api/monitor.py"
    }
  ],
  "build": {
    "env": {
      "PYTHONPATH": "$VERCEL_PROJECT_ROOT"
    }
  }
}
```

---

## 🏆 **Recommended: Vercel + Neon Database**

Use Vercel for hosting with Neon for the database (following your user rules preference).

### Step 1: Set Up Neon Database

```bash
# You can use existing Neon project: summer-mud-70095506 (ai-ensemble-coding-engine)
# Or upgrade your plan to create a new dedicated project for AI Guardian
```

Let me get the connection string for your existing Neon project:

```bash
# Using existing project: ai-ensemble-coding-engine
PROJECT_ID=summer-mud-70095506
DATABASE_URL=postgresql://username:password@eastus2.azure.neon.tech/neondb?sslmode=require
```

### Step 2: Database Schema Setup

```sql
-- Create AI Guardian tables in your Neon database
CREATE TABLE vulnerabilities (
    id SERIAL PRIMARY KEY,
    scan_id VARCHAR(255) NOT NULL,
    vulnerability_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    confidence FLOAT NOT NULL,
    file_path TEXT,
    line_number INTEGER,
    description TEXT,
    fix_suggestion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_feedback (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    vulnerability_id VARCHAR(255) NOT NULL,
    feedback VARCHAR(50) NOT NULL,
    context JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE scan_results (
    id SERIAL PRIMARY KEY,
    scan_id VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(255),
    scan_time FLOAT,
    total_vulnerabilities INTEGER,
    critical_count INTEGER,
    high_count INTEGER,
    medium_count INTEGER,
    low_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 **Quick Start: 15-Minute Deployment**

Here's the fastest way to get AI Guardian running on Vercel + Railway:

### Step 1: Fix Security Issues (5 minutes)
```bash
# Create environment files
cat > backend/code-scanner/code-scanner-service/.env << EOF
SECRET_KEY=$(openssl rand -hex 32)
FLASK_DEBUG=false
DATABASE_URL=postgresql://your-neon-connection-string
EOF

# Copy to other services
cp backend/code-scanner/code-scanner-service/.env backend/adaptive-learning/adaptive-learning-service/.env
cp backend/code-scanner/code-scanner-service/.env backend/api-gateway/api-gateway-service/.env
```

### Step 2: Deploy Frontend to Vercel (3 minutes)
```bash
cd frontend/web-dashboard/web-dashboard
echo "VITE_API_BASE_URL=https://ai-guardian-gateway.up.railway.app" > .env
vercel --prod
```

### Step 3: Deploy Backend to Railway (7 minutes)
```bash
# 1. Push to GitHub
git add .
git commit -m "Production deployment"
git push origin main

# 2. In Railway dashboard:
# - Connect GitHub repo
# - Create 3 services (scanner, learning, gateway)
# - Set root directories and environment variables
# - Deploy
```

---

## 💰 **Cost Comparison: No Docker Options**

### Option 1: Vercel + Railway
- **Frontend**: $0 (Vercel hobby plan)
- **Backend**: $5-10/month (Railway)
- **Database**: $0 (Neon free tier)
- **Total**: $5-10/month

### Option 2: Vercel + Render
- **Frontend**: $0 (Vercel hobby plan)  
- **Backend**: $7/month (Render)
- **Database**: $0 (Neon free tier)
- **Total**: $7/month

### Option 3: Full Vercel Serverless
- **Everything**: $20/month (Vercel Pro for serverless functions)
- **Database**: $0 (Neon free tier)
- **Total**: $20/month

---

## ⚡ **Pros/Cons of No-Docker Deployment**

### ✅ Pros
- **Faster deployment** (no container building)
- **Lower costs** (no container hosting fees)
- **Easier debugging** (direct access to logs)
- **Auto-scaling** (platform handles scaling)
- **Simple CI/CD** (git push to deploy)

### ❌ Cons
- **Platform lock-in** (harder to migrate)
- **Environment differences** (dev vs prod)
- **Limited customization** (platform constraints)
- **Debugging complexity** (serverless cold starts)

---

## 🎯 **My Recommendation**

**Go with Option 1: Vercel + Railway**

**Why?**
- ✅ Keeps your existing Python Flask architecture
- ✅ No code changes required  
- ✅ $5-10/month cost
- ✅ Professional deployment in 15 minutes
- ✅ Easy to scale and maintain
- ✅ Follows your user rules (modern stack)

**Next Steps:**
1. Run the Quick Start commands above
2. Test the deployment  
3. Configure your domain
4. Add monitoring and backup

This gives you a production-ready AI Guardian platform without Docker complexity!
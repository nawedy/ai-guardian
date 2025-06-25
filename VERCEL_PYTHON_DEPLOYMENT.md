# AI Guardian - Full Vercel Python Deployment

## 🐍 **Deploy Everything to Vercel (Python + Frontend)**

Yes! You can deploy your entire AI Guardian project (Python backend + React frontend) to Vercel using serverless functions.

## 📁 **Project Restructure for Vercel**

First, let's reorganize your project for Vercel deployment:

```
ai-guardian-project/
├── api/                          # Vercel serverless functions
│   ├── scan.py                  # Vulnerability scanning
│   ├── learn.py                 # Adaptive learning
│   ├── feedback.py              # User feedback
│   ├── monitor.py               # Real-time monitoring
│   ├── compliance.py            # Compliance scanning
│   └── health.py                # Health checks
├── frontend/                     # Existing React frontend
├── lib/                         # Shared Python code
│   ├── scanner/                 # Scanner logic
│   ├── learning/                # Learning logic
│   └── database/                # Database models
├── requirements.txt             # Python dependencies
└── vercel.json                  # Vercel configuration
```

## 🔧 **Step 1: Create Vercel Configuration**

Create `vercel.json` in your project root:

```json
{
  "framework": "vite",
  "buildCommand": "cd frontend/web-dashboard/web-dashboard && pnpm build",
  "outputDirectory": "frontend/web-dashboard/web-dashboard/dist",
  "installCommand": "cd frontend/web-dashboard/web-dashboard && pnpm install",
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
      "source": "/api/learn/(.*)",
      "destination": "/api/learn.py"
    },
    {
      "source": "/api/feedback",
      "destination": "/api/feedback.py"
    },
    {
      "source": "/api/monitor/(.*)",
      "destination": "/api/monitor.py"
    },
    {
      "source": "/api/compliance/(.*)",
      "destination": "/api/compliance.py"
    },
    {
      "source": "/api/health",
      "destination": "/api/health.py"
    }
  ],
  "env": {
    "SECRET_KEY": "@secret_key",
    "DATABASE_URL": "@database_url",
    "NEON_PROJECT_ID": "@neon_project_id"
  }
}
```

## 🐍 **Step 2: Convert Flask Services to Serverless Functions**

### Create `api/scan.py` (Main Vulnerability Scanner)

```python
from http.server import BaseHTTPRequestHandler
import json
import os
import sys
from urllib.parse import parse_qs

# Add project root to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Import your existing scanner logic
from backend.code_scanner.code_scanner_service.src.models.scanner import VulnerabilityScanner
from backend.code_scanner.code_scanner_service.src.external_scanners import ExternalScanner

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Handle CORS
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            self.end_headers()
            
            # Parse request body
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length:
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
            else:
                data = {}
            
            # Initialize scanner
            scanner = VulnerabilityScanner()
            
            # Perform scan
            result = scanner.scan_code(
                code=data.get('code', ''),
                language=data.get('language', 'python'),
                filename=data.get('filename', 'temp.py')
            )
            
            # Return response
            response = {
                'scan_id': result.get('scan_id'),
                'timestamp': result.get('timestamp'),
                'vulnerabilities': result.get('vulnerabilities', []),
                'scan_time': result.get('scan_time', 0),
                'language': data.get('language', 'python')
            }
            
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_response = {
                'error': str(e),
                'message': 'Internal server error during scanning'
            }
            self.wfile.write(json.dumps(error_response).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
```

### Create `api/learn.py` (Adaptive Learning)

```python
from http.server import BaseHTTPRequestHandler
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from backend.adaptive_learning.adaptive_learning_service.src.routes.learning import LearningService

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length:
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
            else:
                data = {}
            
            # Route based on path
            path = self.path
            learning_service = LearningService()
            
            if '/preferences' in path:
                # Handle user preferences
                user_id = data.get('user_id')
                result = learning_service.get_user_preferences(user_id)
            elif '/feedback' in path:
                # Handle feedback submission
                result = learning_service.process_feedback(data)
            else:
                result = {'error': 'Unknown endpoint'}
            
            self.wfile.write(json.dumps(result).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_response = {'error': str(e)}
            self.wfile.write(json.dumps(error_response).encode())
    
    def do_GET(self):
        try:
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            # Handle GET requests for user preferences
            query_params = parse_qs(self.path.split('?')[1] if '?' in self.path else '')
            user_id = query_params.get('user_id', [None])[0]
            
            learning_service = LearningService()
            result = learning_service.get_user_preferences(user_id)
            
            self.wfile.write(json.dumps(result).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_response = {'error': str(e)}
            self.wfile.write(json.dumps(error_response).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
```

### Create `api/monitor.py` (Real-time Monitoring)

```python
from http.server import BaseHTTPRequestHandler
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from backend.code_scanner.code_scanner_service.src.realtime_monitor import RealTimeMonitor

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length:
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
            else:
                data = {}
            
            monitor = RealTimeMonitor()
            
            if '/start' in self.path:
                # Start monitoring
                result = monitor.start_monitoring(
                    directory=data.get('directory'),
                    file_patterns=data.get('file_patterns', ['*.py', '*.js']),
                    scan_interval=data.get('scan_interval', 300)
                )
            elif '/stop' in self.path:
                # Stop monitoring
                result = monitor.stop_monitoring(data.get('monitor_id'))
            elif '/status' in self.path:
                # Get monitoring status
                result = monitor.get_status()
            else:
                result = {'error': 'Unknown monitoring endpoint'}
            
            self.wfile.write(json.dumps(result).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_response = {'error': str(e)}
            self.wfile.write(json.dumps(error_response).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
```

### Create `api/compliance.py` (Compliance Scanning)

```python
from http.server import BaseHTTPRequestHandler
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from backend.code_scanner.code_scanner_service.src.routes.compliance import ComplianceScanner

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length:
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
            else:
                data = {}
            
            compliance_scanner = ComplianceScanner()
            
            if '/scan' in self.path:
                # Perform compliance scan
                result = compliance_scanner.scan_compliance(
                    code=data.get('code', ''),
                    regulations=data.get('regulations', ['GDPR', 'CCPA']),
                    language=data.get('language', 'python')
                )
            elif '/regulations' in self.path:
                # Get available regulations
                result = compliance_scanner.get_available_regulations()
            else:
                result = {'error': 'Unknown compliance endpoint'}
            
            self.wfile.write(json.dumps(result).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_response = {'error': str(e)}
            self.wfile.write(json.dumps(error_response).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
```

### Create `api/health.py` (Health Check)

```python
from http.server import BaseHTTPRequestHandler
import json
from datetime import datetime

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        health_data = {
            'status': 'healthy',
            'service': 'ai-guardian-vercel',
            'timestamp': datetime.utcnow().isoformat(),
            'version': '1.0.0',
            'platform': 'vercel-serverless'
        }
        
        self.wfile.write(json.dumps(health_data).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
```

## 📦 **Step 3: Create Requirements File**

Create `requirements.txt` in project root:

```txt
flask==3.1.1
flask-cors==6.0.0
flask-sqlalchemy==3.1.1
bandit==1.8.3
semgrep==1.125.0
requests==2.32.4
pyyaml==6.0.2
psycopg2-binary==2.9.9
python-dotenv==1.0.0
```

## 🔐 **Step 4: Environment Variables**

In your Vercel dashboard, add these environment variables:

```bash
SECRET_KEY=your-secure-secret-key-here-32-chars
DATABASE_URL=postgresql://username:password@host:5432/database
NEON_PROJECT_ID=your-neon-project-id
CORS_ORIGINS=https://your-vercel-app.vercel.app
```

## 🚀 **Step 5: Deploy to Vercel**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel --prod
```

## 🌐 **Step 6: Update Frontend URLs**

Update your frontend environment variables:

```bash
# frontend/web-dashboard/web-dashboard/.env
VITE_API_BASE_URL=https://your-vercel-app.vercel.app
VITE_WEBSOCKET_URL=wss://your-vercel-app.vercel.app
```

## 💾 **Step 7: Neon Database Integration**

Since you're using Vercel serverless functions, you'll want to use connection pooling with Neon:

```python
# lib/database.py
import os
import psycopg2
from psycopg2.pool import SimpleConnectionPool

# Use Neon connection string
DATABASE_URL = os.getenv('DATABASE_URL')

# Create connection pool for serverless
pool = SimpleConnectionPool(1, 20, DATABASE_URL)

def get_db_connection():
    return pool.getconn()

def return_db_connection(conn):
    pool.putconn(conn)
```

## ✅ **Advantages of Full Vercel Deployment**

- ✅ **Single platform** - Everything on Vercel
- ✅ **Auto-scaling** - Serverless functions scale automatically  
- ✅ **Global CDN** - Fast worldwide performance
- ✅ **Easy deployment** - `vercel --prod` and done
- ✅ **Environment management** - Built-in env var management
- ✅ **Monitoring** - Built-in analytics and logs

## 💰 **Cost Structure**

- **Hobby Plan**: $0 (with generous limits)
- **Pro Plan**: $20/month (for production workloads)
- **Function executions**: Included in plans
- **Database**: $0 (Neon free tier)

## 🎯 **Next Steps**

1. **Restructure project** with the new folder layout
2. **Create API functions** using the code above
3. **Update vercel.json** configuration
4. **Set environment variables** in Vercel dashboard
5. **Deploy with `vercel --prod`**

This gives you a fully serverless, scalable AI Guardian platform entirely on Vercel! 
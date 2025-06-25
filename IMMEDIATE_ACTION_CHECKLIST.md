# AI Guardian - Immediate Action Checklist

## 🚨 CRITICAL SECURITY FIXES (Complete TODAY)

### 1. Fix Hardcoded Secrets
**Priority**: 🔴 CRITICAL

```bash
# Create environment files for each service
# backend/code-scanner/code-scanner-service/.env
SECRET_KEY=your-secure-random-key-here-32-chars-min
DATABASE_URL=sqlite:///database/app.db
EXTERNAL_SCANNERS_ENABLED=true
CORS_ORIGINS=http://localhost:5173,https://yourdomain.com

# backend/adaptive-learning/adaptive-learning-service/.env  
SECRET_KEY=different-secure-random-key-32-chars-min
DATABASE_URL=sqlite:///database/app.db

# backend/api-gateway/api-gateway-service/.env
SECRET_KEY=another-secure-random-key-32-chars-min
DATABASE_URL=sqlite:///database/app.db
SCANNER_SERVICE_URL=http://localhost:5001
LEARNING_SERVICE_URL=http://localhost:5003
```

**Code Changes Required:**
```python
# Update each main.py file to use environment variables
import os
from dotenv import load_dotenv

load_dotenv()

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
if not app.config['SECRET_KEY']:
    raise ValueError("SECRET_KEY environment variable is required")
```

### 2. Disable Debug Mode
**Priority**: 🔴 CRITICAL

```python
# Replace in ALL main.py files:
# OLD: app.run(host='0.0.0.0', port=5001, debug=True)
# NEW:
if __name__ == '__main__':
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=5001, debug=debug_mode)
```

### 3. Fix Frontend URLs
**Priority**: 🟡 HIGH

```javascript
// Create frontend/.env file
VITE_API_BASE_URL=http://localhost:5004
VITE_WEBSOCKET_URL=ws://localhost:8765

// Update App.jsx and all components to use:
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5004';
const WS_URL = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8765';

// Replace hardcoded URLs with variables:
const ws = new WebSocket(WS_URL);
fetch(`${API_BASE_URL}/api/scan`)
```

---

## 🐳 CONTAINERIZATION (Complete THIS WEEK)

### 1. Create Dockerfiles
**Priority**: 🟡 HIGH

```dockerfile
# backend/code-scanner/code-scanner-service/Dockerfile
FROM python:3.11-alpine
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 5001
CMD ["python", "src/main.py"]
```

```dockerfile
# frontend/web-dashboard/web-dashboard/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build
EXPOSE 5173
CMD ["pnpm", "preview", "--host", "0.0.0.0"]
```

### 2. Docker Compose
**Priority**: 🟡 HIGH

```yaml
# docker-compose.yml
version: '3.8'
services:
  code-scanner:
    build: ./backend/code-scanner/code-scanner-service
    ports:
      - "5001:5001"
    environment:
      - SECRET_KEY=${SCANNER_SECRET_KEY}
      - FLASK_DEBUG=false
    volumes:
      - ./backend/code-scanner/code-scanner-service/database:/app/database

  adaptive-learning:
    build: ./backend/adaptive-learning/adaptive-learning-service
    ports:
      - "5003:5003"
    environment:
      - SECRET_KEY=${LEARNING_SECRET_KEY}
      - FLASK_DEBUG=false

  api-gateway:
    build: ./backend/api-gateway/api-gateway-service
    ports:
      - "5004:5004"
    environment:
      - SECRET_KEY=${GATEWAY_SECRET_KEY}
      - SCANNER_SERVICE_URL=http://code-scanner:5001
      - LEARNING_SERVICE_URL=http://adaptive-learning:5003
      - FLASK_DEBUG=false
    depends_on:
      - code-scanner
      - adaptive-learning

  frontend:
    build: ./frontend/web-dashboard/web-dashboard
    ports:
      - "5173:5173"
    environment:
      - VITE_API_BASE_URL=http://localhost:5004
      - VITE_WEBSOCKET_URL=ws://localhost:8765
    depends_on:
      - api-gateway
```

---

## 🔐 BASIC AUTHENTICATION (Complete THIS WEEK)

### 1. Add JWT Authentication
**Priority**: 🟡 HIGH

```python
# Add to requirements.txt for all services
PyJWT==2.8.0
flask-jwt-extended==4.5.2

# Add to main.py
from flask_jwt_extended import JWTManager

app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
jwt = JWTManager(app)
```

### 2. Protected Routes
**Priority**: 🟡 HIGH

```python
# Add authentication middleware
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from functools import wraps

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            return f(*args, **kwargs)
        except Exception:
            return {'error': 'Authentication required'}, 401
    return decorated_function

# Apply to routes
@scanner_bp.route('/scan', methods=['POST'])
@require_auth
def scan_code():
    # existing code
```

---

## 📊 BASIC MONITORING (Complete THIS WEEK)

### 1. Health Check Endpoints
**Priority**: 🟡 MEDIUM

```python
# Add to each service main.py
@app.route('/health')
def health_check():
    return {
        'status': 'healthy',
        'service': 'ai-guardian-scanner',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    }

@app.route('/metrics')
def metrics():
    return {
        'uptime': time.time() - start_time,
        'memory_usage': psutil.Process().memory_info().rss / 1024 / 1024,
        'cpu_percent': psutil.cpu_percent()
    }
```

### 2. Structured Logging
**Priority**: 🟡 MEDIUM

```python
# Add to each service
import logging
import json

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('app.log')
    ]
)

def log_json(level, message, **kwargs):
    log_data = {
        'timestamp': datetime.utcnow().isoformat(),
        'level': level,
        'message': message,
        **kwargs
    }
    logging.log(getattr(logging, level.upper()), json.dumps(log_data))
```

---

## 🚀 PRODUCTION DEPLOYMENT

### Option 1: Quick Vercel + Railway Deployment
**Estimated Time**: 2 hours

```bash
# Frontend to Vercel
cd frontend/web-dashboard/web-dashboard
npm install -g vercel
vercel --prod

# Backend to Railway
# 1. Create railway.app account
# 2. Connect GitHub repo
# 3. Deploy each service separately
```

### Option 2: AWS ECS Deployment  
**Estimated Time**: 1-2 days

```bash
# 1. Create ECS cluster
# 2. Build and push Docker images to ECR
# 3. Create ECS services
# 4. Configure ALB for load balancing
# 5. Set up RDS PostgreSQL
```

### Option 3: DigitalOcean Droplet
**Estimated Time**: 4-6 hours

```bash
# 1. Create $20/month droplet
# 2. Install Docker and Docker Compose
# 3. Clone repo and run docker-compose up
# 4. Configure Nginx reverse proxy
# 5. Set up SSL with Let's Encrypt
```

---

## ✅ COMPLETION CHECKLIST

### Day 1: Security Fixes
- [ ] Create .env files for all services
- [ ] Update main.py files to use environment variables
- [ ] Disable debug mode in production
- [ ] Fix hardcoded URLs in frontend
- [ ] Test all services still work

### Day 2-3: Containerization
- [ ] Create Dockerfiles for all services
- [ ] Create docker-compose.yml
- [ ] Test Docker containers locally
- [ ] Fix any container issues

### Day 4-5: Authentication
- [ ] Add JWT authentication to all APIs
- [ ] Create protected routes
- [ ] Test authentication flow
- [ ] Update frontend to handle auth

### Day 6-7: Deployment
- [ ] Choose deployment option
- [ ] Deploy to production environment
- [ ] Configure domain and SSL
- [ ] Test production deployment
- [ ] Set up basic monitoring

---

## 🔥 EMERGENCY CONTACT

If you encounter issues during implementation:

1. **Docker Issues**: Check logs with `docker-compose logs [service-name]`
2. **Environment Variables**: Verify .env files are loaded correctly
3. **Port Conflicts**: Use `lsof -i :5001` to check port usage
4. **Authentication**: Test JWT tokens with online JWT debugger
5. **Frontend Build**: Clear node_modules and reinstall if build fails

Remember: **Security first, functionality second**. It's better to have a secure but limited system than a full-featured but vulnerable one. 
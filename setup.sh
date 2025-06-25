#!/bin/bash

# AI Guardian Development Environment Setup Script

set -e

echo "🚀 Setting up AI Guardian development environment..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists python3.11; then
    echo "❌ Python 3.11 is required but not installed."
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

if ! command_exists pnpm; then
    echo "❌ pnpm is required but not installed."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup backend services
echo "🔧 Setting up backend services..."

BACKEND_SERVICES=("code-scanner" "remediation-engine" "intelligent-analysis" "adaptive-learning" "api-gateway")

for service in "${BACKEND_SERVICES[@]}"; do
    echo "Setting up $service service..."
    cd "backend/$service/${service}-service"
    
    # Activate virtual environment and install dependencies
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    
    # Install additional dependencies for each service
    case $service in
        "code-scanner")
            pip install bandit semgrep tree-sitter
            ;;
        "remediation-engine")
            pip install torch transformers
            ;;
        "intelligent-analysis")
            pip install neo4j-driver networkx
            ;;
        "adaptive-learning")
            pip install scikit-learn numpy pandas
            ;;
        "api-gateway")
            pip install flask-cors flask-jwt-extended
            ;;
    esac
    
    deactivate
    cd ../../..
    echo "✅ $service service setup complete"
done

# Setup frontend
echo "🎨 Setting up frontend..."
cd "frontend/web-dashboard/web-dashboard"
pnpm install
cd ../../..
echo "✅ Frontend setup complete"

# Setup CLI
echo "🖥️ Setting up CLI..."
cd cli
pip install -r requirements.txt
cd ..
echo "✅ CLI setup complete"

# Create test directories
echo "📁 Creating test directories..."
mkdir -p tests/{unit,integration,e2e}
mkdir -p tests/backend/{code-scanner,remediation-engine,intelligent-analysis,adaptive-learning,api-gateway}
mkdir -p tests/frontend
mkdir -p tests/cli

echo "✅ Test directories created"

# Initialize git repository
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit: AI Guardian project setup"
    echo "✅ Git repository initialized"
fi

echo "🎉 AI Guardian development environment setup complete!"
echo ""
echo "📚 Next steps:"
echo "1. Start backend services: cd backend/[service]/[service]-service && source venv/bin/activate && python src/main.py"
echo "2. Start frontend: cd frontend/web-dashboard/web-dashboard && pnpm run dev"
echo "3. Test CLI: cd cli && ./ai-guardian --help"
echo ""
echo "📖 See docs/DEVELOPMENT_SETUP.md for detailed instructions"


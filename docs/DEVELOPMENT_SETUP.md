# AI Guardian Development Environment Setup

This document outlines the development environment setup for the AI Guardian project.

## Project Structure

The project has been organized into the following structure:

```
ai-guardian/
├── backend/                           # Backend microservices
│   ├── code-scanner/
│   │   └── code-scanner-service/      # Flask app for code scanning
│   ├── remediation-engine/
│   │   └── remediation-engine-service/ # Flask app for AI remediation
│   ├── intelligent-analysis/
│   │   └── intelligent-analysis-service/ # Flask app for project analysis
│   ├── adaptive-learning/
│   │   └── adaptive-learning-service/  # Flask app for learning patterns
│   └── api-gateway/
│       └── api-gateway-service/       # Flask app for API gateway
├── frontend/
│   ├── web-dashboard/
│   │   └── web-dashboard/             # React app for web dashboard
│   └── omnipanel-plugin/              # OmnipanelAI plugin (to be developed)
├── cli/                               # Command-line interface (to be developed)
├── docs/                              # Documentation
└── tests/                             # Test suites
```

## Backend Services

All backend services are built using Flask and follow the same structure:

### Code Scanner Service
- **Location**: `backend/code-scanner/code-scanner-service/`
- **Purpose**: Core code scanning engine for vulnerability detection
- **Technology**: Python Flask with AST parsing and SAST tool integration

### Remediation Engine Service
- **Location**: `backend/remediation-engine/remediation-engine-service/`
- **Purpose**: AI-powered fix generation and context-aware remediation
- **Technology**: Python Flask with ML models (PyTorch, Transformers)

### Intelligent Analysis Service
- **Location**: `backend/intelligent-analysis/intelligent-analysis-service/`
- **Purpose**: Project-aware analysis and dependency scanning
- **Technology**: Python Flask with graph database integration

### Adaptive Learning Service
- **Location**: `backend/adaptive-learning/adaptive-learning-service/`
- **Purpose**: Learning user patterns and preferences
- **Technology**: Python Flask with reinforcement learning

### API Gateway Service
- **Location**: `backend/api-gateway/api-gateway-service/`
- **Purpose**: Unified API gateway for all services
- **Technology**: Python Flask with request routing and authentication

## Frontend Components

### Web Dashboard
- **Location**: `frontend/web-dashboard/web-dashboard/`
- **Purpose**: Standalone web dashboard for vulnerability management
- **Technology**: React.js with Tailwind CSS and shadcn/ui components

## Development Commands

### Backend Services
For each Flask service, navigate to the service directory and run:
```bash
cd [service-directory]
source venv/bin/activate
python src/main.py
```

### Frontend Dashboard
For the React dashboard:
```bash
cd frontend/web-dashboard/web-dashboard
pnpm run dev
```

## Next Steps

1. Install additional dependencies for each service
2. Implement core functionality for each microservice
3. Set up inter-service communication
4. Develop the CLI tool
5. Create OmnipanelAI plugin
6. Implement testing suites

## Dependencies

Each service will require specific dependencies:
- **Code Scanner**: AST parsers, SAST tools (Bandit, ESLint, Semgrep)
- **Remediation Engine**: ML frameworks (PyTorch, Transformers)
- **Intelligent Analysis**: Graph database clients, NVD integration
- **Adaptive Learning**: Reinforcement learning libraries
- **API Gateway**: Authentication libraries, request routing
- **Web Dashboard**: React ecosystem, charting libraries


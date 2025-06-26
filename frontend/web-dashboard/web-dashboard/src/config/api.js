// frontend/web-dashboard/web-dashboard/src/config/api.js
// Production API configuration for AI Guardian frontend
// Automatically detects environment and uses appropriate service URLs

const isDevelopment = import.meta.env.MODE === 'development';
const isProduction = import.meta.env.MODE === 'production';

// Production service URLs (Render deployment)
const PRODUCTION_SERVICES = {
  API_GATEWAY: import.meta.env.VITE_API_GATEWAY_URL || 'https://ai-guardian-api-gateway.onrender.com',
  CODE_SCANNER: import.meta.env.VITE_CODE_SCANNER_URL || 'https://ai-guardian-code-scanner.onrender.com',
  INTELLIGENT_ANALYSIS: import.meta.env.VITE_INTELLIGENT_ANALYSIS_URL || 'https://ai-guardian-intelligent-analysis.onrender.com',
  REMEDIATION_ENGINE: import.meta.env.VITE_REMEDIATION_ENGINE_URL || 'https://ai-guardian-remediation-engine.onrender.com',
  ADAPTIVE_LEARNING: import.meta.env.VITE_ADAPTIVE_LEARNING_URL || 'https://ai-guardian-adaptive-learning.onrender.com',
  WEBSOCKET: import.meta.env.VITE_WEBSOCKET_URL || 'wss://ai-guardian-code-scanner.onrender.com/ws'
};

// Development service URLs (localhost)
const DEVELOPMENT_SERVICES = {
  API_GATEWAY: 'http://localhost:5000',
  CODE_SCANNER: 'http://localhost:5001',
  INTELLIGENT_ANALYSIS: 'http://localhost:5002',
  REMEDIATION_ENGINE: 'http://localhost:5003',
  ADAPTIVE_LEARNING: 'http://localhost:5004',
  WEBSOCKET: 'ws://localhost:8765'
};

// Service configuration based on environment
export const API_CONFIG = isProduction ? PRODUCTION_SERVICES : DEVELOPMENT_SERVICES;

// API endpoints for each service
export const API_ENDPOINTS = {
  // API Gateway endpoints
  AUTH: {
    LOGIN: `${API_CONFIG.API_GATEWAY}/api/auth/login`,
    LOGOUT: `${API_CONFIG.API_GATEWAY}/api/auth/logout`,
    REGISTER: `${API_CONFIG.API_GATEWAY}/api/auth/register`,
    PROFILE: `${API_CONFIG.API_GATEWAY}/api/auth/profile`
  },

  // Code Scanner endpoints (core functionality)
  SCANNER: {
    SCAN_CODE: `${API_CONFIG.CODE_SCANNER}/api/scan`,
    SCAN_FILE: `${API_CONFIG.CODE_SCANNER}/api/scan/file`,
    SCAN_REPOSITORY: `${API_CONFIG.CODE_SCANNER}/api/scan/repository`,
    SCAN_HISTORY: `${API_CONFIG.CODE_SCANNER}/api/scan/history`,
    SCAN_RESULTS: `${API_CONFIG.CODE_SCANNER}/api/scan/results`,
    VULNERABILITY_DETAILS: `${API_CONFIG.CODE_SCANNER}/api/vulnerabilities`,
  },

  // Real-time monitoring endpoints
  REALTIME: {
    START_MONITOR: `${API_CONFIG.CODE_SCANNER}/api/monitor/start`,
    STOP_MONITOR: `${API_CONFIG.CODE_SCANNER}/api/monitor/stop`,
    MONITOR_STATUS: `${API_CONFIG.CODE_SCANNER}/api/monitor/status`,
    WEBSOCKET_URL: API_CONFIG.WEBSOCKET
  },

  // Compliance monitoring endpoints
  COMPLIANCE: {
    CHECK_COMPLIANCE: `${API_CONFIG.CODE_SCANNER}/api/compliance/check`,
    COMPLIANCE_REPORTS: `${API_CONFIG.CODE_SCANNER}/api/compliance/reports`,
    COMPLIANCE_RULES: `${API_CONFIG.CODE_SCANNER}/api/compliance/rules`,
    COMPLIANCE_HISTORY: `${API_CONFIG.CODE_SCANNER}/api/compliance/history`
  },

  // Intelligent Analysis endpoints (AI-powered)
  ANALYSIS: {
    ANALYZE_CODE: `${API_CONFIG.INTELLIGENT_ANALYSIS}/api/analyze`,
    ANALYZE_PATTERNS: `${API_CONFIG.INTELLIGENT_ANALYSIS}/api/analyze/patterns`,
    ANALYZE_SECURITY: `${API_CONFIG.INTELLIGENT_ANALYSIS}/api/analyze/security`,
    ANALYSIS_INSIGHTS: `${API_CONFIG.INTELLIGENT_ANALYSIS}/api/insights`,
    AI_RECOMMENDATIONS: `${API_CONFIG.INTELLIGENT_ANALYSIS}/api/recommendations`
  },

  // Remediation Engine endpoints
  REMEDIATION: {
    GET_SUGGESTIONS: `${API_CONFIG.REMEDIATION_ENGINE}/api/remediation/suggestions`,
    APPLY_FIX: `${API_CONFIG.REMEDIATION_ENGINE}/api/remediation/apply`,
    REMEDIATION_HISTORY: `${API_CONFIG.REMEDIATION_ENGINE}/api/remediation/history`,
    AUTO_REMEDIATION: `${API_CONFIG.REMEDIATION_ENGINE}/api/remediation/auto`
  },

  // Adaptive Learning endpoints
  LEARNING: {
    LEARNING_STATUS: `${API_CONFIG.ADAPTIVE_LEARNING}/api/learning/status`,
    LEARNING_INSIGHTS: `${API_CONFIG.ADAPTIVE_LEARNING}/api/learning/insights`,
    UPDATE_PATTERNS: `${API_CONFIG.ADAPTIVE_LEARNING}/api/learning/patterns`,
    LEARNING_HISTORY: `${API_CONFIG.ADAPTIVE_LEARNING}/api/learning/history`
  },

  // Health check endpoints for all services
  HEALTH: {
    API_GATEWAY: `${API_CONFIG.API_GATEWAY}/health`,
    CODE_SCANNER: `${API_CONFIG.CODE_SCANNER}/health`,
    INTELLIGENT_ANALYSIS: `${API_CONFIG.INTELLIGENT_ANALYSIS}/health`,
    REMEDIATION_ENGINE: `${API_CONFIG.REMEDIATION_ENGINE}/health`,
    ADAPTIVE_LEARNING: `${API_CONFIG.ADAPTIVE_LEARNING}/health`
  }
};

// HTTP client configuration
export const HTTP_CONFIG = {
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  credentials: 'include' // Include cookies for authentication
};

// WebSocket configuration
export const WEBSOCKET_CONFIG = {
  url: API_CONFIG.WEBSOCKET,
  reconnectInterval: 5000, // 5 seconds
  maxReconnectAttempts: 10,
  pingInterval: 30000 // 30 seconds
};

// Helper function to get environment info
export const getEnvironmentInfo = () => ({
  mode: import.meta.env.MODE,
  isDevelopment,
  isProduction,
  services: API_CONFIG
});

// Helper function to check if all services are healthy
export const checkServicesHealth = async () => {
  const healthChecks = Object.entries(API_ENDPOINTS.HEALTH).map(async ([service, url]) => {
    try {
      const response = await fetch(url, { 
        ...HTTP_CONFIG, 
        method: 'GET',
        timeout: 5000 
      });
      return {
        service,
        status: response.ok ? 'healthy' : 'unhealthy',
        url
      };
    } catch (error) {
      return {
        service,
        status: 'error',
        error: error.message,
        url
      };
    }
  });

  return Promise.all(healthChecks);
};

// Export individual service URLs for backward compatibility
export const {
  API_GATEWAY_URL,
  CODE_SCANNER_URL,
  INTELLIGENT_ANALYSIS_URL,
  REMEDIATION_ENGINE_URL,
  ADAPTIVE_LEARNING_URL,
  WEBSOCKET_URL
} = API_CONFIG;

// API Configuration for AI Guardian
const isDevelopment = import.meta.env.MODE === 'development';

// Production API endpoints on Render
const PRODUCTION_ENDPOINTS = {
  API_GATEWAY: 'https://ai-guardian-api-gateway.onrender.com',
  CODE_SCANNER: 'https://ai-guardian-code-scanner.onrender.com',
  ADAPTIVE_LEARNING: 'https://adaptive-learning-service.onrender.com',
  REMEDIATION_ENGINE: 'https://ai-guardian-remediation-engine.onrender.com'
};

// Development API endpoints (local)
const DEVELOPMENT_ENDPOINTS = {
  API_GATEWAY: 'http://localhost:5000',
  CODE_SCANNER: 'http://localhost:5001',
  ADAPTIVE_LEARNING: 'http://localhost:5003',
  REMEDIATION_ENGINE: 'http://localhost:5005'
};

// Use production endpoints by default, fallback to development if needed
export const API_ENDPOINTS = isDevelopment ? DEVELOPMENT_ENDPOINTS : PRODUCTION_ENDPOINTS;

// WebSocket endpoints
export const WS_ENDPOINTS = {
  REALTIME_SCANNER: isDevelopment 
    ? 'ws://localhost:8765/' 
    : 'wss://ai-guardian-code-scanner.onrender.com/ws'
};

// API client configuration
export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  retries: 3,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// API client with retry logic
export class APIClient {
  static async request(endpoint, options = {}) {
    const config = {
      ...API_CONFIG.headers,
      ...options.headers
    };

    const requestOptions = {
      method: options.method || 'GET',
      headers: config,
      ...options
    };

    if (options.body && typeof options.body === 'object') {
      requestOptions.body = JSON.stringify(options.body);
    }

    let lastError;
    for (let attempt = 1; attempt <= API_CONFIG.retries; attempt++) {
      try {
        const response = await fetch(endpoint, requestOptions);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        }
        
        return await response.text();
      } catch (error) {
        lastError = error;
        console.warn(`API request attempt ${attempt} failed:`, error);
        
        if (attempt < API_CONFIG.retries) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError;
  }

  static async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  static async post(endpoint, data, options = {}) {
    return this.request(endpoint, { 
      ...options, 
      method: 'POST', 
      body: data 
    });
  }

  static async put(endpoint, data, options = {}) {
    return this.request(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: data 
    });
  }

  static async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

// Service-specific API functions
export const apiService = {
  // Health checks
  async checkHealth() {
    const healthChecks = await Promise.allSettled([
      APIClient.get(`${API_ENDPOINTS.API_GATEWAY}/health`),
      APIClient.get(`${API_ENDPOINTS.CODE_SCANNER}/health`),
      APIClient.get(`${API_ENDPOINTS.ADAPTIVE_LEARNING}/health`),
      APIClient.get(`${API_ENDPOINTS.REMEDIATION_ENGINE}/health`)
    ]);

    return {
      apiGateway: healthChecks[0].status === 'fulfilled' ? healthChecks[0].value : null,
      codeScanner: healthChecks[1].status === 'fulfilled' ? healthChecks[1].value : null,
      adaptiveLearning: healthChecks[2].status === 'fulfilled' ? healthChecks[2].value : null,
      remediationEngine: healthChecks[3].status === 'fulfilled' ? healthChecks[3].value : null
    };
  },

  // Code scanning
  async scanCode(code, language) {
    return APIClient.post(`${API_ENDPOINTS.CODE_SCANNER}/api/scan`, {
      code,
      language,
      timestamp: new Date().toISOString()
    });
  },

  // Get scan results
  async getScanResults(scanId) {
    return APIClient.get(`${API_ENDPOINTS.CODE_SCANNER}/api/scan/${scanId}`);
  },

  // Get dashboard data
  async getDashboardData() {
    return APIClient.get(`${API_ENDPOINTS.API_GATEWAY}/api/dashboard`);
  },

  // User management
  async getUser(userId) {
    return APIClient.get(`${API_ENDPOINTS.API_GATEWAY}/api/user/${userId}`);
  },

  // Learning recommendations
  async getLearningRecommendations(userId) {
    return APIClient.get(`${API_ENDPOINTS.ADAPTIVE_LEARNING}/api/recommendations/${userId}`);
  },

  // Remediation suggestions
  async getRemediationSuggestions(vulnerabilityId) {
    return APIClient.get(`${API_ENDPOINTS.REMEDIATION_ENGINE}/api/remediation/${vulnerabilityId}`);
  }
};

export default apiService; 
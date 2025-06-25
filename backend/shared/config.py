# backend/shared/config.py
# Shared production configuration for all AI Guardian microservices
# Maintains advanced functionality with production security

import os
import secrets
from typing import Optional, Dict, Any
from urllib.parse import urlparse


class Config:
    """Base configuration with production security defaults"""
    
    # =====================================================
    # SECURITY CONFIGURATION
    # =====================================================
    SECRET_KEY: str = os.getenv('SECRET_KEY', secrets.token_urlsafe(32))
    JWT_SECRET_KEY: str = os.getenv('JWT_SECRET_KEY',
                                     secrets.token_urlsafe(32))
    ENCRYPTION_KEY: str = os.getenv('ENCRYPTION_KEY',
                                     secrets.token_urlsafe(32))
    
    # =====================================================
    # ENVIRONMENT SETTINGS
    # =====================================================
    ENVIRONMENT: str = os.getenv('ENVIRONMENT', 'production')
    DEBUG: bool = os.getenv('DEBUG', 'false').lower() == 'true'
    TESTING: bool = os.getenv('TESTING', 'false').lower() == 'true'
    
    # =====================================================
    # DATABASE CONFIGURATION
    # =====================================================
    DATABASE_URL: str = os.getenv('DATABASE_URL', 'sqlite:///./database/app.db')
    DATABASE_POOL_SIZE: int = int(os.getenv('DATABASE_POOL_SIZE', '20'))
    DATABASE_POOL_TIMEOUT: int = int(os.getenv('DATABASE_POOL_TIMEOUT', '30'))
    DATABASE_POOL_RECYCLE: int = int(os.getenv('DATABASE_POOL_RECYCLE', '3600'))
    
    # =====================================================
    # MICROSERVICES URLS
    # =====================================================
    API_GATEWAY_URL: str = os.getenv('API_GATEWAY_URL', 'http://localhost:5000')
    CODE_SCANNER_URL: str = os.getenv('CODE_SCANNER_URL', 'http://localhost:5001')
    INTELLIGENT_ANALYSIS_URL: str = os.getenv('INTELLIGENT_ANALYSIS_URL', 'http://localhost:5002')
    REMEDIATION_ENGINE_URL: str = os.getenv('REMEDIATION_ENGINE_URL', 'http://localhost:5003')
    ADAPTIVE_LEARNING_URL: str = os.getenv('ADAPTIVE_LEARNING_URL', 'http://localhost:5004')
    
    # =====================================================
    # REAL-TIME COMMUNICATION
    # =====================================================
    WEBSOCKET_URL: str = os.getenv('WEBSOCKET_URL', 'ws://localhost:8765')
    WEBSOCKET_SECRET: str = os.getenv('WEBSOCKET_SECRET', secrets.token_urlsafe(32))
    REDIS_URL: str = os.getenv('REDIS_URL', 'redis://localhost:6379')
    
    # =====================================================
    # EXTERNAL API INTEGRATIONS
    # =====================================================
    # AI/ML Services
    OPENAI_API_KEY: Optional[str] = os.getenv('OPENAI_API_KEY')
    ANTHROPIC_API_KEY: Optional[str] = os.getenv('ANTHROPIC_API_KEY')
    HUGGINGFACE_API_TOKEN: Optional[str] = os.getenv('HUGGINGFACE_API_TOKEN')
    
    # Code Analysis Tools
    SONARQUBE_TOKEN: Optional[str] = os.getenv('SONARQUBE_TOKEN')
    SNYK_TOKEN: Optional[str] = os.getenv('SNYK_TOKEN')
    CHECKMARX_API_KEY: Optional[str] = os.getenv('CHECKMARX_API_KEY')
    
    # Version Control Integration
    GITHUB_TOKEN: Optional[str] = os.getenv('GITHUB_TOKEN')
    GITLAB_TOKEN: Optional[str] = os.getenv('GITLAB_TOKEN')
    BITBUCKET_TOKEN: Optional[str] = os.getenv('BITBUCKET_TOKEN')
    
    # =====================================================
    # SECURITY SETTINGS
    # =====================================================
    # CORS Configuration
    ALLOWED_ORIGINS: list = os.getenv('ALLOWED_ORIGINS', '').split(',') if os.getenv('ALLOWED_ORIGINS') else ['*']
    CORS_ALLOW_CREDENTIALS: bool = os.getenv('CORS_ALLOW_CREDENTIALS', 'true').lower() == 'true'
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv('RATE_LIMIT_PER_MINUTE', '100'))
    RATE_LIMIT_BURST: int = int(os.getenv('RATE_LIMIT_BURST', '20'))
    
    # Authentication
    SESSION_TIMEOUT: int = int(os.getenv('SESSION_TIMEOUT', '3600'))
    PASSWORD_MIN_LENGTH: int = int(os.getenv('PASSWORD_MIN_LENGTH', '12'))
    REQUIRE_MFA: bool = os.getenv('REQUIRE_MFA', 'true').lower() == 'true'
    
    # =====================================================
    # PERFORMANCE SETTINGS
    # =====================================================
    # Caching
    CACHE_TTL: int = int(os.getenv('CACHE_TTL', '3600'))
    CACHE_MAX_SIZE: int = int(os.getenv('CACHE_MAX_SIZE', '1000'))
    
    # Async Processing
    WORKER_PROCESSES: int = int(os.getenv('WORKER_PROCESSES', '4'))
    WORKER_THREADS: int = int(os.getenv('WORKER_THREADS', '10'))
    MAX_CONCURRENT_SCANS: int = int(os.getenv('MAX_CONCURRENT_SCANS', '50'))
    
    # =====================================================
    # MONITORING AND LOGGING
    # =====================================================
    LOG_LEVEL: str = os.getenv('LOG_LEVEL', 'INFO')
    SENTRY_DSN: Optional[str] = os.getenv('SENTRY_DSN')
    ENABLE_METRICS: bool = os.getenv('ENABLE_METRICS', 'true').lower() == 'true'
    
    # Health Check Configuration
    HEALTH_CHECK_INTERVAL: int = int(os.getenv('HEALTH_CHECK_INTERVAL', '30'))
    HEALTH_CHECK_TIMEOUT: int = int(os.getenv('HEALTH_CHECK_TIMEOUT', '10'))
    
    # =====================================================
    # FEATURE FLAGS
    # =====================================================
    ENABLE_REAL_TIME_SCANNING: bool = os.getenv('ENABLE_REAL_TIME_SCANNING', 'true').lower() == 'true'
    ENABLE_AI_ANALYSIS: bool = os.getenv('ENABLE_AI_ANALYSIS', 'true').lower() == 'true'
    ENABLE_COMPLIANCE_MONITORING: bool = os.getenv('ENABLE_COMPLIANCE_MONITORING', 'true').lower() == 'true'
    ENABLE_ADAPTIVE_LEARNING: bool = os.getenv('ENABLE_ADAPTIVE_LEARNING', 'true').lower() == 'true'
    ENABLE_TEAM_MANAGEMENT: bool = os.getenv('ENABLE_TEAM_MANAGEMENT', 'true').lower() == 'true'
    ENABLE_API_RATE_LIMITING: bool = os.getenv('ENABLE_API_RATE_LIMITING', 'true').lower() == 'true'
    ENABLE_AUDIT_LOGGING: bool = os.getenv('ENABLE_AUDIT_LOGGING', 'true').lower() == 'true'

    @staticmethod
    def validate_database_url(url: str) -> bool:
        """Validate database URL format"""
        try:
            parsed = urlparse(url)
            return parsed.scheme in ['postgresql', 'sqlite', 'mysql']
        except Exception:
            return False

    @staticmethod
    def get_database_config() -> Dict[str, Any]:
        """Get database configuration based on URL"""
        url = Config.DATABASE_URL
        
        if url.startswith('postgresql'):
            return {
                'type': 'postgresql',
                'url': url,
                'pool_size': Config.DATABASE_POOL_SIZE,
                'pool_timeout': Config.DATABASE_POOL_TIMEOUT,
                'pool_recycle': Config.DATABASE_POOL_RECYCLE,
            }
        elif url.startswith('sqlite'):
            return {
                'type': 'sqlite',
                'url': url,
                'check_same_thread': False,
            }
        else:
            raise ValueError(f"Unsupported database URL: {url}")

    @classmethod
    def get_service_urls(cls) -> Dict[str, str]:
        """Get all microservice URLs for inter-service communication"""
        return {
            'api_gateway': cls.API_GATEWAY_URL,
            'code_scanner': cls.CODE_SCANNER_URL,
            'intelligent_analysis': cls.INTELLIGENT_ANALYSIS_URL,
            'remediation_engine': cls.REMEDIATION_ENGINE_URL,
            'adaptive_learning': cls.ADAPTIVE_LEARNING_URL,
        }

    @classmethod
    def is_production(cls) -> bool:
        """Check if running in production environment"""
        return cls.ENVIRONMENT.lower() == 'production'

    @classmethod
    def get_cors_config(cls) -> Dict[str, Any]:
        """Get CORS configuration"""
        return {
            'origins': cls.ALLOWED_ORIGINS,
            'allow_credentials': cls.CORS_ALLOW_CREDENTIALS,
            'methods': ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            'headers': ['Content-Type', 'Authorization', 'X-Requested-With'],
        }

class DevelopmentConfig(Config):
    """Development configuration with debug enabled"""
    DEBUG = True
    ENVIRONMENT = 'development'
    
class ProductionConfig(Config):
    """Production configuration with all security features enabled"""
    DEBUG = False
    ENVIRONMENT = 'production'
    
    # Override insecure defaults for production
    if not os.getenv('SECRET_KEY'):
        raise ValueError("SECRET_KEY environment variable is required in production")

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    ENVIRONMENT = 'testing'
    DATABASE_URL = 'sqlite:///:memory:'

# Configuration factory
config_map = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
}

def get_config() -> Config:
    """Get configuration based on environment"""
    env = os.getenv('ENVIRONMENT', 'production').lower()
    return config_map.get(env, ProductionConfig)() 
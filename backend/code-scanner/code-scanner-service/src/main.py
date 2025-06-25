import os
import sys
import logging
from sqlalchemy import text

# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.scanner import db
from src.routes.user import user_bp
from src.routes.scanner import scanner_bp
from src.routes.realtime import realtime_bp
from src.routes.compliance import compliance_bp

# Import shared configuration
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'shared'))
try:
    from config import get_config
    config = get_config()
except ImportError:
    # Fallback configuration for development
    class Config:
        SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
        DEBUG = os.getenv('DEBUG', 'false').lower() == 'true'
        DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./database/app.db')
        ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')
        ENABLE_REAL_TIME_SCANNING = True
        MAX_CONCURRENT_SCANS = 50
        @classmethod
        def get_cors_config(cls): 
            return {'origins': ['*']}
    config = Config()

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

# Production-ready configuration
app.config['SECRET_KEY'] = config.SECRET_KEY
app.config['DEBUG'] = config.DEBUG
app.config['TESTING'] = getattr(config, 'TESTING', False)

# Configure logging for production
logging.basicConfig(
    level=getattr(config, 'LOG_LEVEL', 'INFO'),
    format='%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
)

# Production CORS configuration
cors_config = config.get_cors_config()
CORS(app, 
     origins=cors_config.get('origins', ['*']),
     allow_headers=cors_config.get('headers', ['Content-Type', 'Authorization']),
     methods=cors_config.get('methods', ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']))

app.logger.info(f"Starting AI Guardian Code Scanner in {config.ENVIRONMENT} mode")
app.logger.info(f"Real-time scanning: {getattr(config, 'ENABLE_REAL_TIME_SCANNING', True)}")
app.logger.info(f"Max concurrent scans: {getattr(config, 'MAX_CONCURRENT_SCANS', 50)}")

# Register blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(scanner_bp, url_prefix='/api')
app.register_blueprint(realtime_bp, url_prefix='/api')
app.register_blueprint(compliance_bp, url_prefix='/api/compliance')

# Production database configuration
database_url = getattr(config, 'DATABASE_URL', f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}")
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_pre_ping': True,
    'pool_recycle': getattr(config, 'DATABASE_POOL_RECYCLE', 300),
}

db.init_app(app)
with app.app_context():
    try:
        db.create_all()
        app.logger.info("Code Scanner database initialized successfully")
    except Exception as e:
        app.logger.error(f"Database initialization failed: {e}")
        raise

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

@app.route('/health')
def health():
    """Production health check with advanced scanner status"""
    try:
        # Test database connection (SQLAlchemy 2.x compatible)
        with app.app_context():
            with db.engine.connect() as connection:
                connection.execute(text("SELECT 1"))
        
        return {
            'status': 'healthy', 
            'service': 'ai-guardian-code-scanner',
            'environment': config.ENVIRONMENT,
            'version': '1.0.0',
            'features': {
                'real_time_scanning': getattr(config, 'ENABLE_REAL_TIME_SCANNING', True),
                'compliance_monitoring': getattr(config, 'ENABLE_COMPLIANCE_MONITORING', True),
                'ai_analysis': getattr(config, 'ENABLE_AI_ANALYSIS', True),
                'max_concurrent_scans': getattr(config, 'MAX_CONCURRENT_SCANS', 50)
            }
        }
    except Exception as e:
        app.logger.error(f"Health check failed: {e}")
        return {'status': 'unhealthy', 'error': str(e)}, 503

if __name__ == '__main__':
    # Production startup configuration
    port = int(os.getenv('PORT', 5001))
    host = '0.0.0.0'
    debug = config.DEBUG
    
    app.logger.info(f"Starting Code Scanner server on {host}:{port} (debug={debug})")
    app.logger.info("Advanced scanning features enabled:")
    app.logger.info(f"  - Real-time scanning: {getattr(config, 'ENABLE_REAL_TIME_SCANNING', True)}")
    app.logger.info(f"  - Compliance monitoring: {getattr(config, 'ENABLE_COMPLIANCE_MONITORING', True)}")
    app.logger.info(f"  - AI analysis: {getattr(config, 'ENABLE_AI_ANALYSIS', True)}")
    
    app.run(host=host, port=port, debug=debug)

from flask import Blueprint, jsonify, request
from datetime import datetime
import asyncio
import threading
import json

realtime_bp = Blueprint('realtime', __name__)

# Import the realtime monitor components
from src.realtime_monitor import (
    initialize_background_scanner, 
    start_websocket_server, 
    scan_cache,
    WebSocketManager
)

# Global background scanner instance
background_scanner_instance = None
websocket_server = None

@realtime_bp.route('/monitor/start', methods=['POST'])
def start_monitoring():
    """Start real-time monitoring for a file or project"""
    try:
        data = request.json
        
        if not data or 'file_path' not in data:
            return jsonify({'error': 'file_path is required'}), 400
        
        file_path = data['file_path']
        language = data.get('language', 'python')
        scan_interval = data.get('scan_interval', 600)  # 10 minutes default
        
        global background_scanner_instance
        if not background_scanner_instance:
            # Import scanner from routes
            from src.routes.scanner import scanner
            background_scanner_instance = initialize_background_scanner(scanner)
        
        # Add file to monitoring
        job_id = asyncio.run(background_scanner_instance.add_scan_job(file_path, language, priority=1))
        
        return jsonify({
            'status': 'monitoring_started',
            'file_path': file_path,
            'job_id': job_id,
            'scan_interval': scan_interval,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@realtime_bp.route('/monitor/stop', methods=['POST'])
def stop_monitoring():
    """Stop monitoring for a specific file"""
    try:
        data = request.json
        
        if not data or 'file_path' not in data:
            return jsonify({'error': 'file_path is required'}), 400
        
        file_path = data['file_path']
        
        # Remove from cache and monitoring
        scan_cache.invalidate(file_path)
        
        return jsonify({
            'status': 'monitoring_stopped',
            'file_path': file_path,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@realtime_bp.route('/monitor/status', methods=['GET'])
def get_monitoring_status():
    """Get current monitoring status"""
    try:
        global background_scanner_instance
        
        if not background_scanner_instance:
            return jsonify({
                'status': 'not_running',
                'monitored_files': 0,
                'active_scans': 0,
                'cache_size': len(scan_cache.cache)
            }), 200
        
        return jsonify({
            'status': 'running',
            'monitored_files': len(background_scanner_instance.file_hashes),
            'active_scans': len(background_scanner_instance.active_scans),
            'cache_size': len(scan_cache.cache),
            'connected_clients': len(WebSocketManager.connected_clients),
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@realtime_bp.route('/cache/get/<path:file_path>', methods=['GET'])
def get_cached_results(file_path):
    """Get cached scan results for a file"""
    try:
        cached_result = scan_cache.get(file_path)
        
        if cached_result:
            return jsonify({
                'status': 'found',
                'file_path': file_path,
                'result': cached_result,
                'from_cache': True
            }), 200
        else:
            return jsonify({
                'status': 'not_found',
                'file_path': file_path,
                'from_cache': False
            }), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@realtime_bp.route('/cache/clear', methods=['POST'])
def clear_cache():
    """Clear scan results cache"""
    try:
        data = request.json
        
        if data and 'file_path' in data:
            # Clear specific file
            file_path = data['file_path']
            scan_cache.invalidate(file_path)
            return jsonify({
                'status': 'cleared',
                'file_path': file_path,
                'timestamp': datetime.utcnow().isoformat()
            }), 200
        else:
            # Clear all cache
            scan_cache.cache.clear()
            return jsonify({
                'status': 'all_cleared',
                'timestamp': datetime.utcnow().isoformat()
            }), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@realtime_bp.route('/websocket/info', methods=['GET'])
def websocket_info():
    """Get WebSocket connection information"""
    try:
        return jsonify({
            'websocket_url': 'ws://localhost:8765',
            'connected_clients': len(WebSocketManager.connected_clients),
            'supported_messages': [
                'ping',
                'subscribe_file',
                'scan_request'
            ],
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def start_background_services():
    """Start background services in separate threads"""
    def run_websocket_server():
        """Run WebSocket server in event loop"""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        server = start_websocket_server(8765)
        loop.run_until_complete(server)
        loop.run_forever()
    
    def run_background_scanner():
        """Run background scanner in event loop"""
        global background_scanner_instance
        if background_scanner_instance:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(background_scanner_instance.start())
    
    # Start WebSocket server in background thread
    websocket_thread = threading.Thread(target=run_websocket_server, daemon=True)
    websocket_thread.start()
    
    # Start background scanner if initialized
    if background_scanner_instance:
        scanner_thread = threading.Thread(target=run_background_scanner, daemon=True)
        scanner_thread.start()

# Auto-start background services when module is imported
# start_background_services()


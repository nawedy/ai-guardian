import asyncio
import websockets
import json
import threading
import time
from datetime import datetime, timedelta
from typing import Dict, List, Set
from dataclasses import dataclass
import sqlite3
import hashlib

@dataclass
class ScanJob:
    """Represents a background scan job"""
    job_id: str
    file_path: str
    language: str
    priority: int = 1
    created_at: datetime = None
    status: str = 'pending'  # pending, running, completed, failed
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.utcnow()

class BackgroundScanner:
    """Background scanning service for continuous monitoring"""
    
    def __init__(self, scanner_instance):
        self.scanner = scanner_instance
        self.scan_queue = asyncio.Queue()
        self.active_scans: Set[str] = set()
        self.scan_results_cache = {}
        self.file_hashes = {}
        self.running = False
        self.scan_interval = 600  # 10 minutes default
        
    async def start(self):
        """Start the background scanner"""
        self.running = True
        # Start background tasks
        asyncio.create_task(self._process_scan_queue())
        asyncio.create_task(self._periodic_scan_scheduler())
        
    async def stop(self):
        """Stop the background scanner"""
        self.running = False
        
    async def add_scan_job(self, file_path: str, language: str, priority: int = 1) -> str:
        """Add a new scan job to the queue"""
        job_id = hashlib.md5(f"{file_path}_{datetime.utcnow()}".encode()).hexdigest()[:16]
        job = ScanJob(job_id, file_path, language, priority)
        await self.scan_queue.put(job)
        return job_id
        
    async def _process_scan_queue(self):
        """Process scan jobs from the queue"""
        while self.running:
            try:
                # Get job from queue with timeout
                job = await asyncio.wait_for(self.scan_queue.get(), timeout=1.0)
                
                if job.file_path not in self.active_scans:
                    self.active_scans.add(job.file_path)
                    await self._execute_scan_job(job)
                    self.active_scans.discard(job.file_path)
                    
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                print(f"Error processing scan queue: {e}")
                
    async def _execute_scan_job(self, job: ScanJob):
        """Execute a single scan job"""
        try:
            # Check if file has changed since last scan
            if not await self._file_needs_scan(job.file_path):
                return
                
            # Read file content
            with open(job.file_path, 'r', encoding='utf-8') as f:
                code = f.read()
                
            # Perform scan
            vulnerabilities = self.scanner.scan_code(code, job.language, job.file_path)
            
            # Cache results
            self.scan_results_cache[job.file_path] = {
                'vulnerabilities': vulnerabilities,
                'timestamp': datetime.utcnow(),
                'file_hash': hashlib.md5(code.encode()).hexdigest()
            }
            
            # Update file hash
            self.file_hashes[job.file_path] = hashlib.md5(code.encode()).hexdigest()
            
            # Notify connected clients via WebSocket
            await self._notify_scan_complete(job.file_path, vulnerabilities)
            
        except Exception as e:
            print(f"Error executing scan job {job.job_id}: {e}")
            
    async def _file_needs_scan(self, file_path: str) -> bool:
        """Check if file needs to be scanned based on hash"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                current_hash = hashlib.md5(content.encode()).hexdigest()
                
            last_hash = self.file_hashes.get(file_path)
            return current_hash != last_hash
            
        except Exception:
            return True  # Scan if we can't determine
            
    async def _periodic_scan_scheduler(self):
        """Schedule periodic scans for monitored files"""
        while self.running:
            try:
                # Add periodic scan jobs for all monitored files
                for file_path in list(self.file_hashes.keys()):
                    await self.add_scan_job(file_path, 'python', priority=2)
                    
                # Wait for next interval
                await asyncio.sleep(self.scan_interval)
                
            except Exception as e:
                print(f"Error in periodic scanner: {e}")
                await asyncio.sleep(60)  # Wait 1 minute on error
                
    async def _notify_scan_complete(self, file_path: str, vulnerabilities: List):
        """Notify connected WebSocket clients of scan completion"""
        notification = {
            'type': 'scan_complete',
            'file_path': file_path,
            'timestamp': datetime.utcnow().isoformat(),
            'vulnerability_count': len(vulnerabilities),
            'vulnerabilities': vulnerabilities
        }
        
        # Send to all connected WebSocket clients
        await WebSocketManager.broadcast(json.dumps(notification))

class WebSocketManager:
    """Manages WebSocket connections for real-time communication"""
    
    connected_clients: Set[websockets.WebSocketServerProtocol] = set()
    
    @classmethod
    async def register(cls, websocket):
        """Register a new WebSocket connection"""
        cls.connected_clients.add(websocket)
        print(f"Client connected. Total clients: {len(cls.connected_clients)}")
        
    @classmethod
    async def unregister(cls, websocket):
        """Unregister a WebSocket connection"""
        cls.connected_clients.discard(websocket)
        print(f"Client disconnected. Total clients: {len(cls.connected_clients)}")
        
    @classmethod
    async def broadcast(cls, message: str):
        """Broadcast message to all connected clients"""
        if cls.connected_clients:
            await asyncio.gather(
                *[client.send(message) for client in cls.connected_clients.copy()],
                return_exceptions=True
            )
            
    @classmethod
    async def send_to_client(cls, websocket, message: str):
        """Send message to specific client"""
        try:
            await websocket.send(message)
        except websockets.exceptions.ConnectionClosed:
            await cls.unregister(websocket)

async def websocket_handler(websocket, path):
    """Handle WebSocket connections"""
    await WebSocketManager.register(websocket)
    
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                await handle_websocket_message(websocket, data)
            except json.JSONDecodeError:
                await WebSocketManager.send_to_client(
                    websocket, 
                    json.dumps({'error': 'Invalid JSON message'})
                )
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        await WebSocketManager.unregister(websocket)

async def handle_websocket_message(websocket, data: Dict):
    """Handle incoming WebSocket messages"""
    message_type = data.get('type')
    
    if message_type == 'ping':
        await WebSocketManager.send_to_client(
            websocket,
            json.dumps({'type': 'pong', 'timestamp': datetime.utcnow().isoformat()})
        )
    elif message_type == 'subscribe_file':
        file_path = data.get('file_path')
        if file_path:
            # Add file to monitoring
            await background_scanner.add_scan_job(file_path, data.get('language', 'python'))
            await WebSocketManager.send_to_client(
                websocket,
                json.dumps({
                    'type': 'subscription_confirmed',
                    'file_path': file_path
                })
            )
    elif message_type == 'scan_request':
        # Handle real-time scan request
        code = data.get('code')
        language = data.get('language', 'python')
        filename = data.get('filename', 'unknown')
        
        if code:
            # Import scanner here to avoid circular imports
            from src.routes.scanner import scanner
            vulnerabilities = scanner.scan_code(code, language, filename)
            
            await WebSocketManager.send_to_client(
                websocket,
                json.dumps({
                    'type': 'scan_result',
                    'vulnerabilities': vulnerabilities,
                    'timestamp': datetime.utcnow().isoformat()
                })
            )

class ScanResultsCache:
    """Cache for scan results with TTL support"""
    
    def __init__(self, ttl_seconds: int = 3600):
        self.cache = {}
        self.ttl = ttl_seconds
        
    def get(self, key: str) -> Dict:
        """Get cached result if not expired"""
        if key in self.cache:
            result, timestamp = self.cache[key]
            if datetime.utcnow() - timestamp < timedelta(seconds=self.ttl):
                return result
            else:
                del self.cache[key]
        return None
        
    def set(self, key: str, value: Dict):
        """Set cached result with timestamp"""
        self.cache[key] = (value, datetime.utcnow())
        
    def invalidate(self, key: str):
        """Invalidate cached result"""
        if key in self.cache:
            del self.cache[key]
            
    def clear_expired(self):
        """Clear expired cache entries"""
        current_time = datetime.utcnow()
        expired_keys = [
            key for key, (_, timestamp) in self.cache.items()
            if current_time - timestamp >= timedelta(seconds=self.ttl)
        ]
        for key in expired_keys:
            del self.cache[key]

# Global instances
background_scanner = None
scan_cache = ScanResultsCache()

def start_websocket_server(port: int = 8765):
    """Start the WebSocket server"""
    return websockets.serve(websocket_handler, "0.0.0.0", port)

def initialize_background_scanner(scanner_instance):
    """Initialize the background scanner"""
    global background_scanner
    background_scanner = BackgroundScanner(scanner_instance)
    return background_scanner


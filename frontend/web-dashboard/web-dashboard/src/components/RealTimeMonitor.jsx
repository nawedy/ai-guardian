import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Play, 
  Pause, 
  Square, 
  Upload, 
  FolderOpen,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const RealTimeMonitor = ({ currentUser }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [monitoredFiles, setMonitoredFiles] = useState([]);
  const [realtimeResults, setRealtimeResults] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [codeInput, setCodeInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  
  const wsRef = useRef(null);
  const fileInputRef = useRef(null);

  // WebSocket connection management
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket('ws://localhost:8765');
        wsRef.current = ws;
        
        ws.onopen = () => {
          console.log('WebSocket connected for real-time monitoring');
          setIsConnected(true);
          setConnectionStatus('connected');
          
          // Send ping to test connection
          ws.send(JSON.stringify({ type: 'ping' }));
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            switch (data.type) {
              case 'pong':
                console.log('WebSocket ping successful');
                break;
                
              case 'scan_complete':
                setRealtimeResults(prev => [{
                  id: Date.now(),
                  type: 'scan_complete',
                  timestamp: new Date(),
                  data: data
                }, ...prev.slice(0, 49)]); // Keep last 50 results
                break;
                
              case 'scan_result':
                setRealtimeResults(prev => [{
                  id: Date.now(),
                  type: 'scan_result',
                  timestamp: new Date(),
                  data: data
                }, ...prev.slice(0, 49)]);
                break;
                
              case 'subscription_confirmed':
                console.log('File subscription confirmed:', data.file_path);
                break;
                
              default:
                console.log('Unknown WebSocket message type:', data.type);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
          setConnectionStatus('disconnected');
          
          // Attempt to reconnect after 5 seconds
          setTimeout(connectWebSocket, 5000);
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setConnectionStatus('error');
        };
        
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setConnectionStatus('error');
      }
    };

    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const startMonitoring = async (filePath, language = 'python') => {
    try {
      const response = await fetch('http://localhost:5001/api/monitor/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_path: filePath,
          language: language,
          scan_interval: 300 // 5 minutes
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        setMonitoredFiles(prev => [...prev, {
          id: result.job_id,
          path: filePath,
          language: language,
          status: 'monitoring',
          startTime: new Date()
        }]);

        // Subscribe to file updates via WebSocket
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'subscribe_file',
            file_path: filePath,
            language: language
          }));
        }

        setIsMonitoring(true);
      }
    } catch (error) {
      console.error('Error starting monitoring:', error);
    }
  };

  const stopMonitoring = async (filePath) => {
    try {
      const response = await fetch('http://localhost:5001/api/monitor/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_path: filePath
        }),
      });

      if (response.ok) {
        setMonitoredFiles(prev => prev.filter(file => file.path !== filePath));
        
        if (monitoredFiles.length <= 1) {
          setIsMonitoring(false);
        }
      }
    } catch (error) {
      console.error('Error stopping monitoring:', error);
    }
  };

  const scanCodeRealtime = () => {
    if (!codeInput.trim()) return;
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'scan_request',
        code: codeInput,
        language: selectedLanguage,
        filename: 'realtime_input.py'
      }));
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setCodeInput(content);
        
        // Detect language from file extension
        const extension = file.name.split('.').pop().toLowerCase();
        const languageMap = {
          'py': 'python',
          'js': 'javascript',
          'java': 'java',
          'cs': 'csharp',
          'go': 'go',
          'rs': 'rust'
        };
        
        if (languageMap[extension]) {
          setSelectedLanguage(languageMap[extension]);
        }
      };
      reader.readAsText(file);
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'disconnected': return 'text-gray-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <Wifi className="w-4 h-4" />;
      case 'disconnected': return <WifiOff className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <WifiOff className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Real-Time Monitor</h1>
          <p className="text-gray-600 mt-1">
            Monitor code changes and scan in real-time
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${getConnectionStatusColor()}`}>
            {getConnectionIcon()}
            <span className="text-sm font-medium capitalize">
              {connectionStatus}
            </span>
          </div>
          
          <Badge variant={isMonitoring ? 'default' : 'secondary'}>
            {isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive'}
          </Badge>
        </div>
      </div>

      {/* Real-time Code Scanner */}
      <Card>
        <CardHeader>
          <CardTitle>Real-Time Code Scanner</CardTitle>
          <CardDescription>
            Paste or upload code to scan for vulnerabilities instantly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="csharp">C#</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
            </select>
            
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".py,.js,.java,.cs,.go,.rs"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <Button
              onClick={scanCodeRealtime}
              disabled={!isConnected || !codeInput.trim()}
            >
              <Activity className="w-4 h-4 mr-2" />
              Scan Now
            </Button>
          </div>
          
          <Textarea
            placeholder="Paste your code here to scan for vulnerabilities..."
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
          />
        </CardContent>
      </Card>

      {/* File Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>File Monitoring</CardTitle>
            <CardDescription>
              Monitor specific files for changes and automatic scanning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="/path/to/your/file.py"
                id="file-path-input"
              />
              <Button
                onClick={() => {
                  const input = document.getElementById('file-path-input');
                  if (input.value) {
                    startMonitoring(input.value, selectedLanguage);
                    input.value = '';
                  }
                }}
                disabled={!isConnected}
              >
                <Play className="w-4 h-4 mr-2" />
                Monitor
              </Button>
            </div>
            
            <div className="space-y-2">
              {monitoredFiles.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No files being monitored
                </p>
              ) : (
                monitoredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                        <FolderOpen className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {file.path.split('/').pop()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {file.language} • Started {formatTimeAgo(file.startTime)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-green-600">
                        {file.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => stopMonitoring(file.path)}
                      >
                        <Square className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Real-time Results */}
        <Card>
          <CardHeader>
            <CardTitle>Real-Time Results</CardTitle>
            <CardDescription>
              Live scan results and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {realtimeResults.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No real-time results yet
                </p>
              ) : (
                realtimeResults.map((result) => (
                  <div
                    key={result.id}
                    className="p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {result.type === 'scan_complete' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Activity className="w-4 h-4 text-blue-600" />
                        )}
                        <span className="text-sm font-medium">
                          {result.type === 'scan_complete' ? 'Scan Complete' : 'Scan Result'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(result.timestamp)}
                      </span>
                    </div>
                    
                    {result.data.vulnerabilities && (
                      <div className="text-sm text-gray-600">
                        Found {result.data.vulnerabilities.length} vulnerabilities
                        {result.data.file_path && (
                          <span> in {result.data.file_path.split('/').pop()}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealTimeMonitor;


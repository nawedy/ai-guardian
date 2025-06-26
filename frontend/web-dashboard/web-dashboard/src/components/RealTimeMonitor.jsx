import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Play, 
  Square, 
  Upload, 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  CheckCircle, 
  FolderOpen,
  Shield,
  Code,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

const RealTimeMonitor = ({ currentUser }) => {
  const [codeInput, setCodeInput] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('text');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [monitoredFiles, setMonitoredFiles] = useState([]);
  const [realtimeResults, setRealtimeResults] = useState([]);
  const [scanResults, setScanResults] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  
  const wsRef = useRef(null);
  const fileInputRef = useRef(null);

  // Enhanced language detection with more patterns
  const detectLanguageFromCode = (code, filename = '') => {
    if (!code.trim() && !filename) return 'text';
    
    // File extension detection
    if (filename) {
      const ext = filename.split('.').pop()?.toLowerCase();
      const extMap = {
        'py': 'python',
        'js': 'javascript',
        'jsx': 'react',
        'ts': 'typescript',
        'tsx': 'typescript-react',
        'java': 'java',
        'cs': 'csharp',
        'go': 'go',
        'rs': 'rust',
        'cpp': 'cpp',
        'c': 'c',
        'php': 'php',
        'rb': 'ruby',
        'swift': 'swift',
        'kt': 'kotlin',
        'scala': 'scala',
        'html': 'html',
        'css': 'css',
        'sql': 'sql',
        'sh': 'shell',
        'ps1': 'powershell',
        'r': 'r',
        'm': 'matlab',
        'pl': 'perl',
        'lua': 'lua',
        'dart': 'dart'
      };
      
      if (extMap[ext]) {
        return extMap[ext];
      }
    }

    // Content-based detection patterns
    const patterns = {
      'python': [
        /def\s+\w+\s*\(/,
        /import\s+\w+/,
        /from\s+\w+\s+import/,
        /if\s+__name__\s*==\s*['"']__main__['"']/,
        /print\s*\(/,
        /class\s+\w+/
      ],
      'javascript': [
        /function\s+\w+\s*\(/,
        /const\s+\w+\s*=/,
        /let\s+\w+\s*=/,
        /var\s+\w+\s*=/,
        /console\.log\s*\(/,
        /require\s*\(/,
        /module\.exports/
      ],
      'typescript': [
        /interface\s+\w+/,
        /type\s+\w+\s*=/,
        /:\s*string/,
        /:\s*number/,
        /:\s*boolean/,
        /export\s+interface/
      ],
      'react': [
        /import\s+React/,
        /from\s+['"]react['"]/,
        /useState\s*\(/,
        /useEffect\s*\(/,
        /jsx|tsx/i,
        /<\w+.*>/
      ],
      'java': [
        /public\s+class\s+\w+/,
        /public\s+static\s+void\s+main/,
        /System\.out\.println/,
        /import\s+java\./,
        /private\s+\w+\s+\w+/
      ],
      'csharp': [
        /using\s+System/,
        /namespace\s+\w+/,
        /public\s+class\s+\w+/,
        /Console\.WriteLine/,
        /public\s+static\s+void\s+Main/
      ],
      'go': [
        /package\s+main/,
        /import\s+['"]fmt['"]/,
        /func\s+main\s*\(\)/,
        /fmt\.Println/,
        /var\s+\w+\s+\w+/
      ],
      'rust': [
        /fn\s+main\s*\(\)/,
        /println!\s*\(/,
        /use\s+std::/,
        /let\s+mut\s+\w+/,
        /struct\s+\w+/
      ],
      'php': [
        /<\?php/,
        /echo\s+/,
        /\$\w+/,
        /function\s+\w+\s*\(/,
        /class\s+\w+/
      ],
      'ruby': [
        /def\s+\w+/,
        /puts\s+/,
        /class\s+\w+/,
        /require\s+['"].*['"]/,
        /end$/m
      ],
      'sql': [
        /SELECT\s+.*\s+FROM/i,
        /INSERT\s+INTO/i,
        /UPDATE\s+.*\s+SET/i,
        /DELETE\s+FROM/i,
        /CREATE\s+TABLE/i
      ],
      'html': [
        /<html/i,
        /<head/i,
        /<body/i,
        /<div/i,
        /<!DOCTYPE/i
      ],
      'css': [
        /\.\w+\s*\{/,
        /#\w+\s*\{/,
        /\w+\s*:\s*\w+;/,
        /@media/,
        /@import/,
        /rgba?\(/
      ]
    };

    // Score each language based on pattern matches
    const scores = {};
    for (const [language, languagePatterns] of Object.entries(patterns)) {
      let score = 0;
      for (const pattern of languagePatterns) {
        const matches = code.match(pattern);
        if (matches) {
          score += matches.length;
        }
      }
      if (score > 0) {
        scores[language] = score;
      }
    }

    // Return the language with the highest score, or default to 'text'
    if (Object.keys(scores).length === 0) {
      return 'text';
    }

    return Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
  };

  // Map detected languages to backend-supported languages
  const mapToBackendLanguage = (detectedLang) => {
    const mapping = {
      'typescript': 'javascript', // Backend treats TS as JS for now
      'typescript-react': 'javascript',
      'react': 'javascript',
      'cpp': 'c',
      'text': 'python', // Default fallback
      'html': 'javascript',
      'css': 'javascript',
      'json': 'javascript',
      'yaml': 'javascript',
      'xml': 'javascript'
    };
    
    return mapping[detectedLang] || detectedLang;
  };

  // WebSocket connection management
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        // Use production WebSocket endpoint
        const isDevelopment = import.meta.env.MODE === 'development';
        const wsUrl = isDevelopment 
          ? 'ws://localhost:8765/' 
          : 'wss://ai-guardian-code-scanner.onrender.com/ws';
        const ws = new WebSocket(wsUrl);
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
                
                // Add to scan results
                setScanResults(prev => [{
                  id: Date.now(),
                  filename: data.filename || 'realtime_scan',
                  language: data.language || detectedLanguage,
                  vulnerabilities: data.vulnerabilities || [],
                  timestamp: new Date(),
                  status: 'completed'
                }, ...prev.slice(0, 19)]); // Keep last 20 scan results
                setIsScanning(false);
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

  const scanCodeRealtime = async () => {
    if (!codeInput.trim()) return;
    
    setIsScanning(true);
    
    // Detect language from code content
    const detectedLang = detectLanguageFromCode(codeInput, 'realtime_input');
    const backendLanguage = mapToBackendLanguage(detectedLang);
    setDetectedLanguage(detectedLang);
    
    try {
      // Try API endpoint first
      const response = await fetch('http://localhost:5001/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: codeInput,
          language: backendLanguage,
          filename: `realtime_input.${getFileExtension(detectedLang)}`
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Add to scan results
        setScanResults(prev => [{
          id: Date.now(),
          filename: `realtime_input.${getFileExtension(detectedLang)}`,
          language: detectedLang,
          vulnerabilities: result.vulnerabilities || [],
          timestamp: new Date(),
          status: 'completed'
        }, ...prev.slice(0, 19)]);
        
        setIsScanning(false);
        return;
      }
    } catch (error) {
      console.log('API endpoint not available, trying WebSocket...');
    }
    
    // Fallback to WebSocket if API is not available
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'scan_request',
        code: codeInput,
        language: backendLanguage,
        filename: `realtime_input.${getFileExtension(detectedLang)}`
      }));
    } else {
      // If neither API nor WebSocket is available, simulate a scan result
      setTimeout(() => {
        setScanResults(prev => [{
          id: Date.now(),
          filename: `realtime_input.${getFileExtension(detectedLang)}`,
          language: detectedLang,
          vulnerabilities: [
            {
              type: 'demo_vulnerability',
              severity: 'medium',
              line: 1,
              description: 'Demo mode: Backend services not available. This is a simulated vulnerability for testing purposes.'
            }
          ],
          timestamp: new Date(),
          status: 'completed'
        }, ...prev.slice(0, 19)]);
        setIsScanning(false);
      }, 2000);
    }
  };

  const getFileExtension = (language) => {
    const extensionMap = {
      'python': 'py',
      'javascript': 'js',
      'typescript': 'ts',
      'react': 'jsx',
      'typescript-react': 'tsx',
      'java': 'java',
      'csharp': 'cs',
      'go': 'go',
      'rust': 'rs',
      'cpp': 'cpp',
      'c': 'c',
      'php': 'php',
      'ruby': 'rb',
      'html': 'html',
      'css': 'css',
      'sql': 'sql'
    };
    return extensionMap[language] || 'txt';
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setCodeInput(content);
        
        // Enhanced language detection
        const detectedLang = detectLanguageFromCode(content, file.name);
        setDetectedLanguage(detectedLang);
      };
      reader.readAsText(file);
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-app-success';
      case 'disconnected': return 'text-medium-contrast';
      case 'error': return 'text-app-error';
      default: return 'text-medium-contrast';
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

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="p-6 space-y-6 text-high-contrast">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-high-contrast">Real-Time Monitor</h1>
          <p className="text-medium-contrast mt-1">
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
          
          <Badge variant={isMonitoring ? 'default' : 'secondary'} className="text-high-contrast">
            {isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive'}
          </Badge>
        </div>
      </div>

      {/* Real-time Code Scanner */}
      <Card className="theme-card">
        <CardHeader>
          <CardTitle className="text-high-contrast">Real-Time Code Scanner</CardTitle>
          <CardDescription className="text-medium-contrast">
            Paste or upload code to scan for vulnerabilities instantly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            {/* Language Detection Display */}
            <div className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-md border border-border">
              <Code className="w-4 h-4 text-medium-contrast" />
              <span className="text-sm text-medium-contrast">Detected:</span>
              <Badge variant="secondary" className="capitalize bg-app-accent text-high-contrast">
                {detectedLanguage}
              </Badge>
            </div>
            
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="text-high-contrast border-border hover:bg-muted"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".py,.js,.jsx,.ts,.tsx,.java,.cs,.go,.rs,.cpp,.c,.php,.rb,.html,.css,.sql,.json,.xml,.yaml,.yml,.sh,.ps1,.r,.m,.pl,.lua,.dart,.vue,.svelte"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <Button
              onClick={scanCodeRealtime}
              disabled={!codeInput.trim() || isScanning}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Activity className="w-4 h-4 mr-2" />
              {isScanning ? 'Scanning...' : 'Scan Now'}
            </Button>
          </div>
          
          <Textarea
            placeholder="Paste your code here to scan for vulnerabilities... Language will be auto-detected."
            value={codeInput}
            onChange={(e) => {
              setCodeInput(e.target.value);
              // Auto-detect language on typing (debounced)
              const detectedLang = detectLanguageFromCode(e.target.value);
              setDetectedLanguage(detectedLang);
            }}
            className="min-h-[200px] font-mono text-sm bg-muted/50 text-high-contrast border-border"
          />
        </CardContent>
      </Card>

      {/* Scan Results */}
      <Card className="theme-card">
        <CardHeader>
          <CardTitle className="text-high-contrast">Recent Scan Results</CardTitle>
          <CardDescription className="text-medium-contrast">
            Results from your recent code scans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {scanResults.length === 0 ? (
              <p className="text-sm text-medium-contrast text-center py-8">
                No scan results yet. Upload or paste code to start scanning.
              </p>
            ) : (
              scanResults.map((result) => (
                <div
                  key={result.id}
                  className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-app"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-app-info/20 rounded-lg">
                        <FileText className="w-4 h-4 text-app-info" />
                      </div>
                      <div>
                        <p className="font-medium text-high-contrast">{result.filename}</p>
                        <p className="text-sm text-medium-contrast">
                          {formatTimeAgo(result.timestamp)} • {result.language}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-high-contrast border-border">
                      {result.status}
                    </Badge>
                  </div>
                  
                  {result.vulnerabilities && result.vulnerabilities.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-high-contrast">
                        Found {result.vulnerabilities.length} vulnerability{result.vulnerabilities.length !== 1 ? 's' : ''}:
                      </p>
                      {result.vulnerabilities.slice(0, 3).map((vuln, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Badge className={getSeverityColor(vuln.severity)}>
                            {vuln.severity}
                          </Badge>
                          <span className="text-sm text-medium-contrast">
                            Line {vuln.line}: {vuln.description}
                          </span>
                        </div>
                      ))}
                      {result.vulnerabilities.length > 3 && (
                        <p className="text-xs text-medium-contrast">
                          +{result.vulnerabilities.length - 3} more vulnerabilities...
                        </p>
                      )}
                    </div>
                  )}
                  
                  {(!result.vulnerabilities || result.vulnerabilities.length === 0) && (
                    <p className="text-sm text-app-success">No vulnerabilities found!</p>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="theme-card">
          <CardHeader>
            <CardTitle className="text-high-contrast">File Monitoring</CardTitle>
            <CardDescription className="text-medium-contrast">
              Monitor specific files for changes and automatic scanning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="/path/to/your/file.py"
                id="file-path-input"
                className="bg-muted/50 text-high-contrast border-border"
              />
              <Button
                onClick={() => {
                  const input = document.getElementById('file-path-input');
                  if (input.value) {
                    // Auto-detect language from file path
                    const detectedLang = detectLanguageFromCode('', input.value);
                    const backendLang = mapToBackendLanguage(detectedLang);
                    startMonitoring(input.value, backendLang);
                    input.value = '';
                  }
                }}
                disabled={!isConnected}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Play className="w-4 h-4 mr-2" />
                Monitor
              </Button>
            </div>
            
            <div className="space-y-2">
              {monitoredFiles.length === 0 ? (
                <p className="text-sm text-medium-contrast text-center py-4">
                  No files being monitored
                </p>
              ) : (
                monitoredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-app-info/20 rounded-lg">
                        <FolderOpen className="w-4 h-4 text-app-info" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-high-contrast">
                          {file.path.split('/').pop()}
                        </p>
                        <p className="text-xs text-medium-contrast">
                          {file.language} • Started {formatTimeAgo(file.startTime)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-app-success border-app-success/30">
                        {file.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => stopMonitoring(file.path)}
                        className="text-medium-contrast hover:text-high-contrast"
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
        <Card className="theme-card">
          <CardHeader>
            <CardTitle className="text-high-contrast">Real-Time Results</CardTitle>
            <CardDescription className="text-medium-contrast">
              Live scan results and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {realtimeResults.length === 0 ? (
                <p className="text-sm text-medium-contrast text-center py-8">
                  No real-time results yet
                </p>
              ) : (
                realtimeResults.map((result) => (
                  <div
                    key={result.id}
                    className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-app"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {result.type === 'scan_complete' ? (
                          <CheckCircle className="w-4 h-4 text-app-success" />
                        ) : (
                          <Activity className="w-4 h-4 text-app-info" />
                        )}
                        <span className="text-sm font-medium text-high-contrast">
                          {result.type === 'scan_complete' ? 'Scan Complete' : 'Scan Result'}
                        </span>
                      </div>
                      <span className="text-xs text-medium-contrast">
                        {formatTimeAgo(result.timestamp)}
                      </span>
                    </div>
                    
                    {result.data.vulnerabilities && (
                      <div className="text-sm text-medium-contrast">
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


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
  const [detectedLanguage, setDetectedLanguage] = useState('auto-detect');
  
  const wsRef = useRef(null);
  const fileInputRef = useRef(null);

  // Enhanced language detection patterns
  const detectLanguageFromCode = (code, filename = '') => {
    // File extension mapping
    const extensionMap = {
      '.py': 'python',
      '.js': 'javascript',
      '.jsx': 'react',
      '.ts': 'typescript',
      '.tsx': 'typescript-react',
      '.java': 'java',
      '.cs': 'csharp',
      '.go': 'go',
      '.rs': 'rust',
      '.cpp': 'cpp',
      '.c': 'c',
      '.php': 'php',
      '.rb': 'ruby',
      '.swift': 'swift',
      '.kt': 'kotlin',
      '.scala': 'scala',
      '.html': 'html',
      '.css': 'css',
      '.sql': 'sql',
      '.json': 'json',
      '.xml': 'xml',
      '.yaml': 'yaml',
      '.yml': 'yaml',
      '.sh': 'shell',
      '.ps1': 'powershell',
      '.r': 'r',
      '.m': 'matlab',
      '.pl': 'perl',
      '.lua': 'lua',
      '.dart': 'dart',
      '.vue': 'vue',
      '.svelte': 'svelte'
    };

    // Check file extension first
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    if (extensionMap[extension]) {
      return extensionMap[extension];
    }

    // Content-based detection patterns
    const patterns = {
      'typescript': [
        /interface\s+\w+/,
        /type\s+\w+\s*=/,
        /:\s*(string|number|boolean|any|void|never)/,
        /import.*from.*['"][^'"]*['"]/,
        /export\s+(interface|type|enum)/,
        /<.*>/  // Generic types
      ],
      'react': [
        /import.*React/,
        /from\s+['"]react['"]/,
        /jsx|tsx/,
        /<\w+.*>/,
        /useState|useEffect|useContext/,
        /className=/,
        /onClick=/,
        /props\./
      ],
      'typescript-react': [
        /import.*React/,
        /interface.*Props/,
        /:\s*React\./,
        /FC<|FunctionComponent</,
        /useState<|useEffect</
      ],
      'python': [
        /def\s+\w+\s*\(/,
        /class\s+\w+/,
        /import\s+\w+/,
        /from\s+\w+\s+import/,
        /if\s+__name__\s*==\s*['""]__main__['""]:/,
        /@\w+/,  // Decorators
        /print\s*\(/
      ],
      'javascript': [
        /function\s+\w+\s*\(/,
        /const\s+\w+\s*=/,
        /let\s+\w+\s*=/,
        /var\s+\w+\s*=/,
        /console\.log/,
        /require\s*\(/,
        /module\.exports/,
        /=>\s*{/  // Arrow functions
      ],
      'java': [
        /public\s+class\s+\w+/,
        /public\s+static\s+void\s+main/,
        /import\s+java\./,
        /System\.out\.println/,
        /private\s+\w+\s+\w+/,
        /public\s+\w+\s+\w+\s*\(/
      ],
      'csharp': [
        /using\s+System/,
        /namespace\s+\w+/,
        /public\s+class\s+\w+/,
        /Console\.WriteLine/,
        /public\s+static\s+void\s+Main/,
        /\[.*\]/  // Attributes
      ],
      'go': [
        /package\s+\w+/,
        /func\s+\w+\s*\(/,
        /import\s+[("]/,
        /fmt\.Print/,
        /var\s+\w+\s+\w+/,
        /:=/
      ],
      'rust': [
        /fn\s+\w+\s*\(/,
        /let\s+mut\s+\w+/,
        /use\s+std::/,
        /println!/,
        /struct\s+\w+/,
        /impl\s+\w+/
      ],
      'php': [
        /<\?php/,
        /\$\w+/,
        /echo\s+/,
        /function\s+\w+\s*\(/,
        /class\s+\w+/,
        /include\s+/
      ],
      'ruby': [
        /def\s+\w+/,
        /class\s+\w+/,
        /puts\s+/,
        /require\s+/,
        /end$/m,
        /@\w+/  // Instance variables
      ],
      'cpp': [
        /#include\s*<.*>/,
        /using\s+namespace\s+std/,
        /int\s+main\s*\(/,
        /cout\s*<<|cin\s*>>/,
        /std::/,
        /class\s+\w+/
      ],
      'sql': [
        /SELECT\s+.*FROM/i,
        /INSERT\s+INTO/i,
        /UPDATE\s+.*SET/i,
        /DELETE\s+FROM/i,
        /CREATE\s+TABLE/i,
        /ALTER\s+TABLE/i
      ],
      'html': [
        /<html/i,
        /<head>/i,
        /<body>/i,
        /<div/i,
        /<script/i,
        /<!DOCTYPE/i
      ],
      'css': [
        /\w+\s*{/,
        /[.#]\w+\s*{/,
        /:\s*\w+;/,
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
    
    // Detect language from code content
    const detectedLang = detectLanguageFromCode(codeInput, 'realtime_input');
    const backendLanguage = mapToBackendLanguage(detectedLang);
    setDetectedLanguage(detectedLang);
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'scan_request',
        code: codeInput,
        language: backendLanguage,
        filename: `realtime_input.${getFileExtension(detectedLang)}`
      }));
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
                         {/* Language Detection Display */}
             <div className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-md border border-border">
               <span className="text-sm text-muted-foreground">Detected:</span>
               <Badge variant="secondary" className="capitalize bg-app-accent text-accent-foreground">
                 {detectedLanguage}
               </Badge>
             </div>
            
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
              accept=".py,.js,.jsx,.ts,.tsx,.java,.cs,.go,.rs,.cpp,.c,.php,.rb,.html,.css,.sql,.json,.xml,.yaml,.yml,.sh,.ps1,.r,.m,.pl,.lua,.dart,.vue,.svelte"
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
            placeholder="Paste your code here to scan for vulnerabilities... Language will be auto-detected."
            value={codeInput}
            onChange={(e) => {
              setCodeInput(e.target.value);
              // Auto-detect language on typing (debounced)
              const detectedLang = detectLanguageFromCode(e.target.value);
              setDetectedLanguage(detectedLang);
            }}
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
                    // Auto-detect language from file path
                    const detectedLang = detectLanguageFromCode('', input.value);
                    const backendLang = mapToBackendLanguage(detectedLang);
                    startMonitoring(input.value, backendLang);
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


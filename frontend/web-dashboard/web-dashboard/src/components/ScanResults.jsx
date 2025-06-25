import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  FileText,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ScanResults = ({ currentUser }) => {
  const [scanResults, setScanResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp');

  // Fetch scan results
  useEffect(() => {
    const fetchScanResults = async () => {
      try {
        setLoading(true);
        
        // Mock data - in real app, this would be an API call
        const mockResults = [
          {
            id: 'scan_001',
            filename: 'auth.py',
            language: 'python',
            timestamp: new Date(Date.now() - 1000 * 60 * 15),
            vulnerabilities: [
              {
                id: 'vuln_001',
                type: 'HARDCODED_SECRET',
                severity: 'CRITICAL',
                line: 23,
                description: 'Hardcoded API key detected',
                status: 'open'
              },
              {
                id: 'vuln_002',
                type: 'SQL_INJECTION',
                severity: 'HIGH',
                line: 45,
                description: 'Potential SQL injection vulnerability',
                status: 'fixed'
              }
            ],
            status: 'completed',
            scanDuration: 1.2
          },
          {
            id: 'scan_002',
            filename: 'api.js',
            language: 'javascript',
            timestamp: new Date(Date.now() - 1000 * 60 * 45),
            vulnerabilities: [
              {
                id: 'vuln_003',
                type: 'XSS',
                severity: 'MEDIUM',
                line: 67,
                description: 'Potential XSS vulnerability via innerHTML',
                status: 'open'
              }
            ],
            status: 'completed',
            scanDuration: 0.8
          },
          {
            id: 'scan_003',
            filename: 'database.py',
            language: 'python',
            timestamp: new Date(Date.now() - 1000 * 60 * 120),
            vulnerabilities: [
              {
                id: 'vuln_004',
                type: 'HARDCODED_SECRET',
                severity: 'CRITICAL',
                line: 12,
                description: 'Database password in source code',
                status: 'open'
              },
              {
                id: 'vuln_005',
                type: 'CODE_INJECTION',
                severity: 'HIGH',
                line: 89,
                description: 'Use of eval() with user input',
                status: 'open'
              }
            ],
            status: 'completed',
            scanDuration: 2.1
          }
        ];
        
        setScanResults(mockResults);
      } catch (error) {
        console.error('Error fetching scan results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScanResults();
  }, []);

  // Filter and sort results
  const filteredResults = scanResults
    .filter(result => {
      const matchesSearch = result.filename.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity = severityFilter === 'all' || 
        result.vulnerabilities.some(v => v.severity.toLowerCase() === severityFilter);
      const matchesStatus = statusFilter === 'all' || result.status === statusFilter;
      
      return matchesSearch && matchesSeverity && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'timestamp':
          return new Date(b.timestamp) - new Date(a.timestamp);
        case 'filename':
          return a.filename.localeCompare(b.filename);
        case 'vulnerabilities':
          return b.vulnerabilities.length - a.vulnerabilities.length;
        default:
          return 0;
      }
    });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'running': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const exportResults = () => {
    const csvContent = [
      ['Filename', 'Language', 'Timestamp', 'Vulnerabilities', 'Status', 'Duration'],
      ...filteredResults.map(result => [
        result.filename,
        result.language,
        result.timestamp.toISOString(),
        result.vulnerabilities.length,
        result.status,
        `${result.scanDuration}s`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scan-results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scan Results</h1>
          <p className="text-gray-600 mt-1">
            Review and manage security scan results
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={exportResults}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timestamp">Latest First</SelectItem>
                <SelectItem value="filename">Filename</SelectItem>
                <SelectItem value="vulnerabilities">Vulnerability Count</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {filteredResults.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No scan results found</h3>
                <p className="text-gray-600">
                  {searchTerm || severityFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your filters to see more results.'
                    : 'Start scanning your code to see results here.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredResults.map((result) => (
            <Card key={result.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{result.filename}</h3>
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <span>{result.language}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(result.timestamp)}</span>
                        <span>•</span>
                        <span>{result.scanDuration}s scan time</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(result.status)}
                    <Badge variant="outline">
                      {result.vulnerabilities.length} vulnerabilities
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>

                {/* Vulnerabilities */}
                {result.vulnerabilities.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Vulnerabilities Found:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {result.vulnerabilities.map((vuln) => (
                        <div
                          key={vuln.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge className={getSeverityColor(vuln.severity)}>
                                {vuln.severity}
                              </Badge>
                              <span className="text-sm font-medium text-gray-900">
                                {vuln.type.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">
                              Line {vuln.line}: {vuln.description}
                            </p>
                          </div>
                          <Badge 
                            variant={vuln.status === 'fixed' ? 'default' : 'secondary'}
                            className={vuln.status === 'fixed' ? 'bg-green-100 text-green-800' : ''}
                          >
                            {vuln.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ScanResults;


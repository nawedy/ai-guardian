import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  FileText,
  Users,
  Activity,
  Bell,
  X,
  GlobeIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const Dashboard = ({ currentUser, notifications = [], setNotifications = () => {} }) => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalScans: 0,
      vulnerabilitiesFound: 0,
      criticalIssues: 0,
      fixedIssues: 0
    },
    recentScans: [],
    vulnerabilityTrends: [],
    severityDistribution: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API calls to get dashboard data
        const mockData = {
          stats: {
            totalScans: 1247,
            vulnerabilitiesFound: 89,
            criticalIssues: 12,
            fixedIssues: 67
          },
          recentScans: [
            {
              id: 'scan_001',
              filename: 'auth.py',
              timestamp: new Date(Date.now() - 1000 * 60 * 15),
              vulnerabilities: 3,
              status: 'completed',
              severity: 'high'
            },
            {
              id: 'scan_002',
              filename: 'api.js',
              timestamp: new Date(Date.now() - 1000 * 60 * 45),
              vulnerabilities: 1,
              status: 'completed',
              severity: 'medium'
            },
            {
              id: 'scan_003',
              filename: 'database.py',
              timestamp: new Date(Date.now() - 1000 * 60 * 120),
              vulnerabilities: 5,
              status: 'completed',
              severity: 'critical'
            }
          ],
          vulnerabilityTrends: [
            { date: '2025-06-10', vulnerabilities: 45, fixed: 32 },
            { date: '2025-06-11', vulnerabilities: 52, fixed: 38 },
            { date: '2025-06-12', vulnerabilities: 38, fixed: 41 },
            { date: '2025-06-13', vulnerabilities: 61, fixed: 35 },
            { date: '2025-06-14', vulnerabilities: 43, fixed: 48 },
            { date: '2025-06-15', vulnerabilities: 39, fixed: 42 },
            { date: '2025-06-16', vulnerabilities: 47, fixed: 39 },
            { date: '2025-06-17', vulnerabilities: 35, fixed: 44 }
          ],
          severityDistribution: [
            { name: 'Critical', value: 12, color: 'hsl(var(--app-error))' },
            { name: 'High', value: 23, color: 'hsl(var(--app-warning))' },
            { name: 'Medium', value: 34, color: 'hsl(var(--app-info))' },
            { name: 'Low', value: 20, color: 'hsl(var(--app-success))' }
          ]
        };
        
        // Ensure all arrays are properly initialized
        setDashboardData({
          stats: mockData.stats || { totalScans: 0, vulnerabilitiesFound: 0, criticalIssues: 0, fixedIssues: 0 },
          recentScans: Array.isArray(mockData.recentScans) ? mockData.recentScans : [],
          vulnerabilityTrends: Array.isArray(mockData.vulnerabilityTrends) ? mockData.vulnerabilityTrends : [],
          severityDistribution: Array.isArray(mockData.severityDistribution) ? mockData.severityDistribution : []
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
        // Set safe fallback data
        setDashboardData({
          stats: { totalScans: 0, vulnerabilitiesFound: 0, criticalIssues: 0, fixedIssues: 0 },
          recentScans: [],
          vulnerabilityTrends: [],
          severityDistribution: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const dismissNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-high-contrast">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-high-contrast">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-high-contrast">
        <div className="text-center">
          <p className="text-app-error mb-4 text-high-contrast">{error}</p>
          <p className="text-medium-contrast">Running in demo mode with sample data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 text-high-contrast">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-high-contrast">Security Dashboard</h1>
          <p className="text-medium-contrast mt-1">
            Welcome back, {currentUser.name}. Here's your security overview.
          </p>
        </div>
        
        {/* Notifications */}
        {(notifications || []).length > 0 && (
          <div className="relative">
            <Button variant="outline" className="relative text-high-contrast border-border hover:bg-muted">
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-2 -right-2 px-1 min-w-[1.25rem] h-5 bg-primary text-primary-foreground">
                {(notifications || []).length}
              </Badge>
            </Button>
          </div>
        )}
      </div>

      {/* Notifications Panel */}
      {(notifications || []).length > 0 && (
        <div className="space-y-2">
          {(notifications || []).slice(0, 3).map((notification) => (
            <div
              key={notification.id}
              className="flex items-center justify-between p-3 bg-app-info/10 border border-app-info/20 rounded-lg theme-card"
            >
              <div className="flex items-center space-x-3">
                <Activity className="w-5 h-5 text-app-info" />
                <div>
                  <p className="text-sm font-medium text-high-contrast">
                    {notification.message}
                  </p>
                  <p className="text-xs text-medium-contrast">
                    {formatTimeAgo(notification.timestamp)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissNotification(notification.id)}
                className="text-medium-contrast hover:text-high-contrast"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="theme-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-high-contrast">Total Scans</CardTitle>
            <Shield className="h-4 w-4 text-app-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-high-contrast">
              {(dashboardData.stats.totalScans || 0).toLocaleString()}
            </div>
            <p className="text-xs text-medium-contrast">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="theme-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-high-contrast">Vulnerabilities</CardTitle>
            <AlertTriangle className="h-4 w-4 text-app-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-high-contrast">
              {(dashboardData.stats.vulnerabilitiesFound || 0).toLocaleString()}
            </div>
            <p className="text-xs text-medium-contrast">
              -8% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="theme-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-high-contrast">Critical Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-app-error" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-high-contrast">
              {(dashboardData.stats.criticalIssues || 0).toLocaleString()}
            </div>
            <p className="text-xs text-medium-contrast">
              -15% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="theme-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-high-contrast">Fixed Issues</CardTitle>
            <CheckCircle className="h-4 w-4 text-app-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-high-contrast">
              {(dashboardData.stats.fixedIssues || 0).toLocaleString()}
            </div>
            <p className="text-xs text-medium-contrast">
              +23% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vulnerability Trends */}
        <Card className="theme-card">
          <CardHeader>
            <CardTitle className="text-high-contrast">Vulnerability Trends</CardTitle>
            <CardDescription className="text-medium-contrast">
              Daily vulnerability detection and resolution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.vulnerabilityTrends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--card-foreground))'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="vulnerabilities" 
                  stroke="hsl(var(--app-error))" 
                  strokeWidth={2}
                  name="Found"
                />
                <Line 
                  type="monotone" 
                  dataKey="fixed" 
                  stroke="hsl(var(--app-success))" 
                  strokeWidth={2}
                  name="Fixed"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card className="theme-card">
          <CardHeader>
            <CardTitle className="text-high-contrast">Severity Distribution</CardTitle>
            <CardDescription className="text-medium-contrast">
              Current vulnerability breakdown by severity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.severityDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(dashboardData.severityDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--card-foreground))'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Scans, Org Threats, Global Threats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Recent Scans */}
        <Card className="theme-card">
          <CardHeader>
            <CardTitle className="text-high-contrast">Recent Scans</CardTitle>
            <CardDescription className="text-medium-contrast">
              Latest security scans and their results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(dashboardData.recentScans || []).length === 0 ? (
                <p className="text-center text-medium-contrast py-8">No recent scans available</p>
              ) : (
                (dashboardData.recentScans || []).map((scan) => (
                  <div
                    key={scan.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-app"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-app-info/20 rounded-lg">
                        <FileText className="w-5 h-5 text-app-info" />
                      </div>
                      <div>
                        <p className="font-medium text-high-contrast">{scan.filename}</p>
                        <p className="text-sm text-medium-contrast">
                          {formatTimeAgo(scan.timestamp)} • {scan.vulnerabilities} issues found
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getSeverityColor(scan.severity)}>
                        {scan.severity}
                      </Badge>
                      <Badge variant="outline" className="text-high-contrast border-border">
                        {scan.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Org Threats */}
        <Card className="theme-card">
          <CardHeader>
            <CardTitle className="text-high-contrast">Newly Found Threats in Your Organization</CardTitle>
            <CardDescription className="text-medium-contrast">
              Most recent critical and high vulnerabilities detected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                // Filter for critical/high vulnerabilities from recent scans
                const orgThreats = (dashboardData.recentScans || [])
                  .filter(scan => ['critical', 'high'].includes((scan.severity || '').toLowerCase()))
                  .slice(0, 5);
                if (orgThreats.length === 0) {
                  return <p className="text-center text-medium-contrast py-8">No new critical or high threats found</p>;
                }
                return orgThreats.map((threat) => (
                  <div key={threat.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-app-error/10 transition-app">
                    <div className="flex items-center space-x-4">
                      <AlertTriangle className="w-6 h-6 text-app-error" />
                      <div>
                        <p className="font-medium text-high-contrast">{threat.filename}</p>
                        <p className="text-sm text-medium-contrast">
                          {formatTimeAgo(threat.timestamp)} • Severity: <span className="capitalize">{threat.severity}</span>
                        </p>
                      </div>
                    </div>
                    <Badge className={getSeverityColor(threat.severity)}>
                      {threat.severity}
                    </Badge>
                  </div>
                ));
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Global Threats */}
        <Card className="theme-card">
          <CardHeader>
            <CardTitle className="text-high-contrast">Newly Identified Threats Around the World</CardTitle>
            <CardDescription className="text-medium-contrast">
              Global threat intelligence (last 24h)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                // Mock global threats data
                const globalThreats = [
                  {
                    id: 'global_001',
                    type: 'Zero-Day Exploit',
                    severity: 'critical',
                    date: new Date(Date.now() - 1000 * 60 * 60 * 2),
                    description: 'Critical zero-day vulnerability in widely used web server software. CVE-2025-12345.'
                  },
                  {
                    id: 'global_002',
                    type: 'Ransomware Campaign',
                    severity: 'high',
                    date: new Date(Date.now() - 1000 * 60 * 60 * 5),
                    description: 'Large-scale ransomware attacks targeting cloud storage providers.'
                  },
                  {
                    id: 'global_003',
                    type: 'Supply Chain Attack',
                    severity: 'high',
                    date: new Date(Date.now() - 1000 * 60 * 60 * 8),
                    description: 'Malicious package discovered in popular open-source library.'
                  },
                  {
                    id: 'global_004',
                    type: 'Phishing Campaign',
                    severity: 'medium',
                    date: new Date(Date.now() - 1000 * 60 * 60 * 12),
                    description: 'Sophisticated phishing emails targeting financial institutions.'
                  }
                ];
                return globalThreats.map((threat) => (
                  <div key={threat.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-app-warning/10 transition-app">
                    <div className="flex items-center space-x-4">
                      <GlobeIcon className="w-6 h-6 text-app-warning" />
                      <div>
                        <p className="font-medium text-high-contrast">{threat.type}</p>
                        <p className="text-sm text-medium-contrast">
                          {formatTimeAgo(threat.date)} • Severity: <span className="capitalize">{threat.severity}</span>
                        </p>
                        <p className="text-xs text-medium-contrast mt-1">{threat.description}</p>
                      </div>
                    </div>
                    <Badge className={getSeverityColor(threat.severity)}>
                      {threat.severity}
                    </Badge>
                  </div>
                ));
              })()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;


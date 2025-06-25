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
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const Dashboard = ({ currentUser, notifications, setNotifications }) => {
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

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
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
            { name: 'Critical', value: 12, color: '#ef4444' },
            { name: 'High', value: 23, color: '#f97316' },
            { name: 'Medium', value: 34, color: '#eab308' },
            { name: 'Low', value: 20, color: '#22c55e' }
          ]
        };
        
        setDashboardData(mockData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
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
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Security Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {currentUser.name}. Here's your security overview.
          </p>
        </div>
        
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="relative">
            <Button variant="outline" className="relative">
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-2 -right-2 px-1 min-w-[1.25rem] h-5">
                {notifications.length}
              </Badge>
            </Button>
          </div>
        )}
      </div>

      {/* Notifications Panel */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.slice(0, 3).map((notification) => (
            <div
              key={notification.id}
              className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <Activity className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    {notification.message}
                  </p>
                  <p className="text-xs text-blue-600">
                    {formatTimeAgo(notification.timestamp)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissNotification(notification.id)}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.totalScans.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vulnerabilities Found</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.vulnerabilitiesFound}</div>
            <p className="text-xs text-muted-foreground">
              -8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dashboardData.stats.criticalIssues}</div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues Fixed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dashboardData.stats.fixedIssues}</div>
            <p className="text-xs text-muted-foreground">
              +23% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vulnerability Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Vulnerability Trends</CardTitle>
            <CardDescription>
              Daily vulnerability detection and resolution over the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.vulnerabilityTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="vulnerabilities" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Found"
                />
                <Line 
                  type="monotone" 
                  dataKey="fixed" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  name="Fixed"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Severity Distribution</CardTitle>
            <CardDescription>
              Current vulnerability breakdown by severity level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.severityDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dashboardData.severityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Scans */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
          <CardDescription>
            Latest security scans and their results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.recentScans.map((scan) => (
              <div
                key={scan.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{scan.filename}</h4>
                    <p className="text-sm text-gray-500">
                      Scanned {formatTimeAgo(scan.timestamp)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge className={getSeverityColor(scan.severity)}>
                    {scan.severity}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {scan.vulnerabilities} issues
                  </span>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    {scan.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;


import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Database,
  Key,
  Save,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const SettingsPage = ({ currentUser }) => {
  const [settings, setSettings] = useState({
    profile: {
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
      timezone: 'UTC',
      language: 'en'
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
      passwordExpiry: 90
    },
    notifications: {
      emailAlerts: true,
      pushNotifications: true,
      weeklyReports: true,
      criticalOnly: false
    },
    scanning: {
      autoScan: true,
      scanInterval: 10,
      maxConcurrentScans: 3,
      retainResults: 30
    },
    thresholds: {
      critical: 0.9,
      high: 0.8,
      medium: 0.6,
      low: 0.4
    }
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Fetch user preferences from adaptive learning service
  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const response = await fetch(`http://localhost:5003/api/preferences/${currentUser.id}`);
        if (response.ok) {
          const preferences = await response.json();
          
          // Update thresholds with learned preferences
          setSettings(prev => ({
            ...prev,
            thresholds: {
              ...prev.thresholds,
              ...preferences.thresholds
            }
          }));
        }
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      }
    };

    fetchUserPreferences();
  }, [currentUser.id]);

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would send settings to your backend
      console.log('Saving settings:', settings);
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      profile: {
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        timezone: 'UTC',
        language: 'en'
      },
      security: {
        twoFactorEnabled: false,
        sessionTimeout: 30,
        passwordExpiry: 90
      },
      notifications: {
        emailAlerts: true,
        pushNotifications: true,
        weeklyReports: true,
        criticalOnly: false
      },
      scanning: {
        autoScan: true,
        scanInterval: 10,
        maxConcurrentScans: 3,
        retainResults: 30
      },
      thresholds: {
        critical: 0.9,
        high: 0.8,
        medium: 0.6,
        low: 0.4
      }
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your account and application preferences
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {saved && (
            <Badge className="bg-green-100 text-green-800">
              Settings saved!
            </Badge>
          )}
          <Button variant="outline" onClick={resetToDefaults}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSaveSettings} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Profile Settings
          </CardTitle>
          <CardDescription>
            Update your personal information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Full Name
              </label>
              <Input
                value={settings.profile.name}
                onChange={(e) => handleSettingChange('profile', 'name', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Email Address
              </label>
              <Input
                type="email"
                value={settings.profile.email}
                onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Timezone
              </label>
              <Select 
                value={settings.profile.timezone}
                onValueChange={(value) => handleSettingChange('profile', 'timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="EST">Eastern Time</SelectItem>
                  <SelectItem value="PST">Pacific Time</SelectItem>
                  <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Language
              </label>
              <Select 
                value={settings.profile.language}
                onValueChange={(value) => handleSettingChange('profile', 'language', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Configure security and authentication options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <Switch
              checked={settings.security.twoFactorEnabled}
              onCheckedChange={(checked) => handleSettingChange('security', 'twoFactorEnabled', checked)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Session Timeout (minutes)
              </label>
              <Input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Password Expiry (days)
              </label>
              <Input
                type="number"
                value={settings.security.passwordExpiry}
                onChange={(e) => handleSettingChange('security', 'passwordExpiry', parseInt(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Choose how you want to be notified about security events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Email Alerts</h4>
                <p className="text-sm text-gray-600">Receive email notifications for security events</p>
              </div>
              <Switch
                checked={settings.notifications.emailAlerts}
                onCheckedChange={(checked) => handleSettingChange('notifications', 'emailAlerts', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Push Notifications</h4>
                <p className="text-sm text-gray-600">Get real-time notifications in your browser</p>
              </div>
              <Switch
                checked={settings.notifications.pushNotifications}
                onCheckedChange={(checked) => handleSettingChange('notifications', 'pushNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Weekly Reports</h4>
                <p className="text-sm text-gray-600">Receive weekly security summary reports</p>
              </div>
              <Switch
                checked={settings.notifications.weeklyReports}
                onCheckedChange={(checked) => handleSettingChange('notifications', 'weeklyReports', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Critical Issues Only</h4>
                <p className="text-sm text-gray-600">Only notify for critical security issues</p>
              </div>
              <Switch
                checked={settings.notifications.criticalOnly}
                onCheckedChange={(checked) => handleSettingChange('notifications', 'criticalOnly', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scanning Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Scanning Settings
          </CardTitle>
          <CardDescription>
            Configure automatic scanning and performance options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Auto Scan</h4>
              <p className="text-sm text-gray-600">Automatically scan files when they change</p>
            </div>
            <Switch
              checked={settings.scanning.autoScan}
              onCheckedChange={(checked) => handleSettingChange('scanning', 'autoScan', checked)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Scan Interval (minutes)
              </label>
              <Input
                type="number"
                value={settings.scanning.scanInterval}
                onChange={(e) => handleSettingChange('scanning', 'scanInterval', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Max Concurrent Scans
              </label>
              <Input
                type="number"
                value={settings.scanning.maxConcurrentScans}
                onChange={(e) => handleSettingChange('scanning', 'maxConcurrentScans', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Retain Results (days)
              </label>
              <Input
                type="number"
                value={settings.scanning.retainResults}
                onChange={(e) => handleSettingChange('scanning', 'retainResults', parseInt(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vulnerability Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="w-5 h-5 mr-2" />
            Vulnerability Thresholds
          </CardTitle>
          <CardDescription>
            Customize detection sensitivity for different vulnerability types
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Critical Threshold
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={settings.thresholds.critical}
                onChange={(e) => handleSettingChange('thresholds', 'critical', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                High Threshold
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={settings.thresholds.high}
                onChange={(e) => handleSettingChange('thresholds', 'high', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Medium Threshold
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={settings.thresholds.medium}
                onChange={(e) => handleSettingChange('thresholds', 'medium', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Low Threshold
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={settings.thresholds.low}
                onChange={(e) => handleSettingChange('thresholds', 'low', parseFloat(e.target.value))}
              />
            </div>
          </div>
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> These thresholds are automatically adjusted based on your feedback and usage patterns through our adaptive learning system.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;


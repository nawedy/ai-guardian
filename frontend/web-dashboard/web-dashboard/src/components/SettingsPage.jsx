import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Database,
  Key,
  Save,
  RefreshCw,
  Upload,
  Phone,
  Mail,
  Building,
  Globe,
  Slack,
  MessageSquare,
  Camera,
  X,
  Check,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const SettingsPage = ({ currentUser, updateUserProfile }) => {
  const [settings, setSettings] = useState({
    profile: {
      name: currentUser.name || '',
      email: currentUser.email || '',
      role: currentUser.role || '',
      title: currentUser.title || '',
      phone: currentUser.phone || '',
      company: currentUser.company || '',
      bio: currentUser.bio || '',
      timezone: currentUser.timezone || 'UTC',
      language: currentUser.language || 'en',
      avatar: currentUser.avatar || ''
    },
    security: {
      twoFactorEnabled: currentUser.security?.twoFactorEnabled || false,
      sessionTimeout: currentUser.security?.sessionTimeout || 30,
      passwordExpiry: currentUser.security?.passwordExpiry || 90
    },
    notifications: {
      email: currentUser.notifications?.email || true,
      sms: currentUser.notifications?.sms || false,
      slack: currentUser.notifications?.slack || false,
      teams: currentUser.notifications?.teams || false,
      pushNotifications: true,
      weeklyReports: true,
      criticalOnly: false
    },
    integrations: {
      slack: {
        enabled: currentUser.integrations?.slack?.enabled || false,
        webhook: currentUser.integrations?.slack?.webhook || '',
        channel: currentUser.integrations?.slack?.channel || ''
      },
      teams: {
        enabled: currentUser.integrations?.teams?.enabled || false,
        webhook: currentUser.integrations?.teams?.webhook || ''
      }
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
  const [avatarPreview, setAvatarPreview] = useState(currentUser.avatar || '');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleNestedSettingChange = (category, subcategory, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subcategory]: {
          ...prev[category][subcategory],
          [key]: value
        }
      }
    }));
  };

  const handleAvatarUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newAvatarUrl = e.target.result;
        setAvatarPreview(newAvatarUrl);
        handleSettingChange('profile', 'avatar', newAvatarUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleAvatarUpload(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleAvatarUpload(file);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    
    try {
      // Update the parent component's user state
      updateUserProfile(settings.profile);
      updateUserProfile({
        notifications: settings.notifications,
        integrations: settings.integrations,
        security: settings.security
      });
      
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
        name: currentUser.name || '',
        email: currentUser.email || '',
        role: currentUser.role || '',
        title: currentUser.title || '',
        phone: currentUser.phone || '',
        company: currentUser.company || '',
        bio: currentUser.bio || '',
        timezone: 'UTC',
        language: 'en',
        avatar: currentUser.avatar || ''
      },
      security: {
        twoFactorEnabled: false,
        sessionTimeout: 30,
        passwordExpiry: 90
      },
      notifications: {
        email: true,
        sms: false,
        slack: false,
        teams: false,
        pushNotifications: true,
        weeklyReports: true,
        criticalOnly: false
      },
      integrations: {
        slack: {
          enabled: false,
          webhook: '',
          channel: ''
        },
        teams: {
          enabled: false,
          webhook: ''
        }
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
    setAvatarPreview(currentUser.avatar || '');
  };

  return (
    <div className="flex justify-center w-full min-h-screen">
      <div className="w-full max-w-5xl mx-auto p-6 space-y-6 text-high-contrast" style={{ width: '90%' }}>
        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="text-3xl font-bold text-high-contrast">Settings</h1>
          <p className="text-medium-contrast mt-1">
            Manage your account and application preferences
          </p>
        </div>
        <div className="flex items-center justify-center space-x-3">
          {saved && (
            <Badge className="bg-app-success/20 text-app-success border-app-success/30">
              <Check className="w-3 h-3 mr-1" />
              Settings saved!
            </Badge>
          )}
          <Button 
            variant="outline" 
            onClick={resetToDefaults}
            className="text-high-contrast border-border hover:bg-muted"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button 
            onClick={handleSaveSettings} 
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
        {/* All settings cards */}
        <div className="space-y-6 flex flex-col items-center">
          {/* Profile Settings */}
          <div className="w-full flex justify-center">
            <Card className="glass-effect shadow-app-lg w-full max-w-3xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-high-contrast">
                  <User className="w-5 h-5 mr-2" />
                  Profile Settings
                </CardTitle>
                <CardDescription className="text-medium-contrast">
                  Update your personal information and profile details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex items-start space-x-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div 
                        className={`w-24 h-24 rounded-full border-2 border-dashed border-border flex items-center justify-center cursor-pointer transition-app ${
                          isDragging ? 'border-primary bg-primary/10' : 'hover:border-primary hover:bg-muted/50'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {avatarPreview ? (
                          <img 
                            src={avatarPreview} 
                            alt="Avatar preview"
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <div className="text-center">
                            <Camera className="w-6 h-6 text-medium-contrast mx-auto mb-1" />
                            <span className="text-xs text-medium-contrast">Upload</span>
                          </div>
                        )}
                      </div>
                      {avatarPreview && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-app-error text-white hover:bg-app-error/80"
                          onClick={() => {
                            setAvatarPreview('');
                            handleSettingChange('profile', 'avatar', '');
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-high-contrast border-border hover:bg-muted"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Choose File
                    </Button>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-high-contrast mb-2 block">
                        Full Name
                      </label>
                      <Input
                        value={settings.profile.name}
                        onChange={(e) => handleSettingChange('profile', 'name', e.target.value)}
                        className="bg-muted/50 text-high-contrast border-border"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-high-contrast mb-2 block">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={settings.profile.email}
                        onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
                        className="bg-muted/50 text-high-contrast border-border"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-high-contrast mb-2 block">
                        Job Title
                      </label>
                      <Input
                        value={settings.profile.title}
                        onChange={(e) => handleSettingChange('profile', 'title', e.target.value)}
                        placeholder="Senior Security Engineer"
                        className="bg-muted/50 text-high-contrast border-border"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-high-contrast mb-2 block">
                        Role
                      </label>
                      <Select 
                        value={settings.profile.role} 
                        onValueChange={(value) => handleSettingChange('profile', 'role', value)}
                      >
                        <SelectTrigger className="bg-muted/50 text-high-contrast border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Security Manager">Security Manager</SelectItem>
                          <SelectItem value="Security Engineer">Security Engineer</SelectItem>
                          <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
                          <SelectItem value="Developer">Developer</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-high-contrast mb-2 block">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        value={settings.profile.phone}
                        onChange={(e) => handleSettingChange('profile', 'phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="bg-muted/50 text-high-contrast border-border"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-high-contrast mb-2 block">
                        Company
                      </label>
                      <Input
                        value={settings.profile.company}
                        onChange={(e) => handleSettingChange('profile', 'company', e.target.value)}
                        placeholder="Your Company Name"
                        className="bg-muted/50 text-high-contrast border-border"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="text-sm font-medium text-high-contrast mb-2 block">
                    Bio
                  </label>
                  <Textarea
                    value={settings.profile.bio}
                    onChange={(e) => handleSettingChange('profile', 'bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="bg-muted/50 text-high-contrast border-border"
                    rows={3}
                  />
                </div>

                {/* Timezone and Language */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-high-contrast mb-2 block">
                      Timezone
                    </label>
                    <Select 
                      value={settings.profile.timezone} 
                      onValueChange={(value) => handleSettingChange('profile', 'timezone', value)}
                    >
                      <SelectTrigger className="bg-muted/50 text-high-contrast border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Paris">Paris</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-high-contrast mb-2 block">
                      Language
                    </label>
                    <Select 
                      value={settings.profile.language} 
                      onValueChange={(value) => handleSettingChange('profile', 'language', value)}
                    >
                      <SelectTrigger className="bg-muted/50 text-high-contrast border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="it">Italian</SelectItem>
                        <SelectItem value="pt">Portuguese</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="ko">Korean</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Notification Settings */}
          <div className="w-full flex justify-center">
            <Card className="glass-effect shadow-app-lg w-full max-w-3xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-high-contrast">
                  <Bell className="w-5 h-5 mr-2" />
                  Notification Preferences
                </CardTitle>
                <CardDescription className="text-medium-contrast">
                  Choose how you want to be notified about security events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-app-info" />
                      <div>
                        <p className="text-sm font-medium text-high-contrast">Email Notifications</p>
                        <p className="text-xs text-medium-contrast">Receive alerts via email</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.notifications.email}
                      onCheckedChange={(checked) => handleSettingChange('notifications', 'email', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-app-success" />
                      <div>
                        <p className="text-sm font-medium text-high-contrast">SMS Notifications</p>
                        <p className="text-xs text-medium-contrast">Receive critical alerts via SMS</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.notifications.sms}
                      onCheckedChange={(checked) => handleSettingChange('notifications', 'sms', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Slack className="w-4 h-4 text-app-warning" />
                      <div>
                        <p className="text-sm font-medium text-high-contrast">Slack Notifications</p>
                        <p className="text-xs text-medium-contrast">Send alerts to Slack channels</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.notifications.slack}
                      onCheckedChange={(checked) => handleSettingChange('notifications', 'slack', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="w-4 h-4 text-app-info" />
                      <div>
                        <p className="text-sm font-medium text-high-contrast">Microsoft Teams</p>
                        <p className="text-xs text-medium-contrast">Send alerts to Teams channels</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.notifications.teams}
                      onCheckedChange={(checked) => handleSettingChange('notifications', 'teams', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Integration Settings */}
          <div className="w-full flex justify-center">
            <Card className="glass-effect shadow-app-lg w-full max-w-3xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-high-contrast">
                  <Globe className="w-5 h-5 mr-2" />
                  Integrations
                </CardTitle>
                <CardDescription className="text-medium-contrast">
                  Configure external service integrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Slack Integration */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Slack className="w-5 h-5 text-app-warning" />
                      <div>
                        <p className="text-base font-medium text-high-contrast">Slack Integration</p>
                        <p className="text-sm text-medium-contrast">Connect with your Slack workspace</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.integrations.slack.enabled}
                      onCheckedChange={(checked) => handleNestedSettingChange('integrations', 'slack', 'enabled', checked)}
                    />
                  </div>
                  
                  {settings.integrations.slack.enabled && (
                    <div className="ml-8 space-y-3">
                      <div>
                        <label className="text-sm font-medium text-high-contrast mb-2 block">
                          Webhook URL
                        </label>
                        <Input
                          value={settings.integrations.slack.webhook}
                          onChange={(e) => handleNestedSettingChange('integrations', 'slack', 'webhook', e.target.value)}
                          placeholder="https://hooks.slack.com/services/..."
                          className="bg-muted/50 text-high-contrast border-border"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-high-contrast mb-2 block">
                          Channel
                        </label>
                        <Input
                          value={settings.integrations.slack.channel}
                          onChange={(e) => handleNestedSettingChange('integrations', 'slack', 'channel', e.target.value)}
                          placeholder="#security-alerts"
                          className="bg-muted/50 text-high-contrast border-border"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Teams Integration */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="w-5 h-5 text-app-info" />
                      <div>
                        <p className="text-base font-medium text-high-contrast">Microsoft Teams</p>
                        <p className="text-sm text-medium-contrast">Connect with your Teams workspace</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.integrations.teams.enabled}
                      onCheckedChange={(checked) => handleNestedSettingChange('integrations', 'teams', 'enabled', checked)}
                    />
                  </div>
                  
                  {settings.integrations.teams.enabled && (
                    <div className="ml-8 space-y-3">
                      <div>
                        <label className="text-sm font-medium text-high-contrast mb-2 block">
                          Webhook URL
                        </label>
                        <Input
                          value={settings.integrations.teams.webhook}
                          onChange={(e) => handleNestedSettingChange('integrations', 'teams', 'webhook', e.target.value)}
                          placeholder="https://outlook.office.com/webhook/..."
                          className="bg-muted/50 text-high-contrast border-border"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Security Settings */}
          <div className="w-full flex justify-center">
            <Card className="glass-effect shadow-app-lg w-full max-w-3xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-high-contrast">
                  <Shield className="w-5 h-5 mr-2" />
                  Security Settings
                </CardTitle>
                <CardDescription className="text-medium-contrast">
                  Configure security and authentication preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-high-contrast">Two-Factor Authentication</p>
                    <p className="text-xs text-medium-contrast">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    checked={settings.security.twoFactorEnabled}
                    onCheckedChange={(checked) => handleSettingChange('security', 'twoFactorEnabled', checked)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-high-contrast mb-2 block">
                      Session Timeout (minutes)
                    </label>
                    <Input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                      className="bg-muted/50 text-high-contrast border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-high-contrast mb-2 block">
                      Password Expiry (days)
                    </label>
                    <Input
                      type="number"
                      value={settings.security.passwordExpiry}
                      onChange={(e) => handleSettingChange('security', 'passwordExpiry', parseInt(e.target.value))}
                      className="bg-muted/50 text-high-contrast border-border"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Scanning Preferences */}
          <div className="w-full flex justify-center">
            <Card className="glass-effect shadow-app-lg w-full max-w-3xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-high-contrast">
                  <Database className="w-5 h-5 mr-2" />
                  Scanning Preferences
                </CardTitle>
                <CardDescription className="text-medium-contrast">
                  Configure automatic scanning and detection thresholds
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-high-contrast">Auto-Scan</p>
                    <p className="text-xs text-medium-contrast">Automatically scan uploaded files</p>
                  </div>
                  <Switch
                    checked={settings.scanning.autoScan}
                    onCheckedChange={(checked) => handleSettingChange('scanning', 'autoScan', checked)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-high-contrast mb-2 block">
                      Scan Interval (minutes)
                    </label>
                    <Input
                      type="number"
                      value={settings.scanning.scanInterval}
                      onChange={(e) => handleSettingChange('scanning', 'scanInterval', parseInt(e.target.value))}
                      className="bg-muted/50 text-high-contrast border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-high-contrast mb-2 block">
                      Max Concurrent Scans
                    </label>
                    <Input
                      type="number"
                      value={settings.scanning.maxConcurrentScans}
                      onChange={(e) => handleSettingChange('scanning', 'maxConcurrentScans', parseInt(e.target.value))}
                      className="bg-muted/50 text-high-contrast border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-high-contrast mb-2 block">
                      Retain Results (days)
                    </label>
                    <Input
                      type="number"
                      value={settings.scanning.retainResults}
                      onChange={(e) => handleSettingChange('scanning', 'retainResults', parseInt(e.target.value))}
                      className="bg-muted/50 text-high-contrast border-border"
                    />
                  </div>
                </div>

                {/* Vulnerability Thresholds */}
                <div>
                  <h4 className="text-sm font-medium text-high-contrast mb-4">Vulnerability Detection Thresholds</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium text-app-error mb-2 block">
                        Critical
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={settings.thresholds.critical}
                        onChange={(e) => handleSettingChange('thresholds', 'critical', parseFloat(e.target.value))}
                        className="bg-muted/50 text-high-contrast border-border"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-app-warning mb-2 block">
                        High
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={settings.thresholds.high}
                        onChange={(e) => handleSettingChange('thresholds', 'high', parseFloat(e.target.value))}
                        className="bg-muted/50 text-high-contrast border-border"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-app-info mb-2 block">
                        Medium
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={settings.thresholds.medium}
                        onChange={(e) => handleSettingChange('thresholds', 'medium', parseFloat(e.target.value))}
                        className="bg-muted/50 text-high-contrast border-border"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-app-success mb-2 block">
                        Low
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={settings.thresholds.low}
                        onChange={(e) => handleSettingChange('thresholds', 'low', parseFloat(e.target.value))}
                        className="bg-muted/50 text-high-contrast border-border"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;


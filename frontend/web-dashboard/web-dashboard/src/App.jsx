import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Shield, Activity, Users, Settings, FileText, AlertTriangle } from 'lucide-react';
import './App.css';

// Import components
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ScanResults from './components/ScanResults';
import RealTimeMonitor from './components/RealTimeMonitor';
import TeamManagement from './components/TeamManagement';
import SettingsPage from './components/SettingsPage';
import VulnerabilityDetails from './components/VulnerabilityDetails';

function App() {
  const [currentUser, setCurrentUser] = useState({
    id: 1,
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'Security Manager',
    title: 'Senior Security Engineer',
    phone: '+1 (555) 123-4567',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    notifications: {
      email: true,
      sms: true,
      slack: false,
      teams: false
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
    }
  });

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Function to update user profile
  const updateUserProfile = (updates) => {
    setCurrentUser(prev => ({
      ...prev,
      ...updates
    }));
  };

  useEffect(() => {
    // Apply OmniPanelAI workspace theme
    document.documentElement.classList.toggle('dark', isDarkMode);
    // Ensure body has proper background
    document.body.style.backgroundColor = isDarkMode 
      ? 'hsl(222.2 84% 4.9%)' 
      : 'hsl(0 0% 100%)';
    document.body.style.color = isDarkMode 
      ? 'hsl(0 0% 95%)' 
      : 'hsl(222.2 84% 8%)';
  }, [isDarkMode]);

  // WebSocket connection for real-time notifications (optional - backend not required)
  useEffect(() => {
    let ws = null;
    let retryCount = 0;
    const maxRetries = 3; // Limit retries to prevent infinite loops

    const connectWebSocket = () => {
      // Only attempt connection if we haven't exceeded max retries
      if (retryCount >= maxRetries) {
        console.log('Max WebSocket retry attempts reached. Backend may not be available.');
        return null;
      }

      try {
        ws = new WebSocket('ws://localhost:8765');
        
        ws.onopen = () => {
          console.log('WebSocket connected for notifications');
          retryCount = 0; // Reset retry count on successful connection
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'scan_complete') {
              setNotifications(prev => [...prev, {
                id: Date.now(),
                type: 'scan_complete',
                message: `Scan completed for ${data.file_path || 'unknown file'}`,
                timestamp: new Date(),
                data: data
              }]);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        ws.onclose = () => {
          console.log('WebSocket disconnected');
          retryCount++;
          
          // Only retry if we haven't exceeded max retries
          if (retryCount < maxRetries) {
            console.log(`Attempting to reconnect... (${retryCount}/${maxRetries})`);
            setTimeout(connectWebSocket, 5000);
          } else {
            console.log('WebSocket connection failed. Running in offline mode.');
          }
        };
        
        ws.onerror = (error) => {
          console.log('WebSocket connection failed - backend may not be available');
          retryCount++;
        };
        
        return ws;
      } catch (error) {
        console.log('WebSocket not available - running in offline mode');
        retryCount = maxRetries; // Stop retrying
        return null;
      }
    };

    // Attempt initial connection
    ws = connectWebSocket();
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Navigation items
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Activity,
      path: '/dashboard'
    },
    {
      id: 'scan-results',
      label: 'Scan Results',
      icon: FileText,
      path: '/scan-results'
    },
    {
      id: 'real-time',
      label: 'Real-Time Monitor',
      icon: Shield,
      path: '/real-time'
    },
    {
      id: 'team',
      label: 'Team Management',
      icon: Users,
      path: '/team'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/settings'
    }
  ];

  return (
    <div className={`min-h-screen transition-app ${isDarkMode ? 'dark' : ''}`}>
      <Router>
        <div className="flex h-screen bg-background text-foreground text-high-contrast overflow-hidden">
          {/* Fixed Sidebar */}
          <div className="flex-shrink-0">
            <Sidebar 
              currentUser={currentUser} 
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
              navigationItems={navigationItems}
            />
          </div>
          
          {/* Main Content Panel - Scrollable */}
          <main className="flex-1 overflow-y-auto bg-background text-high-contrast">
            <div className="bg-app-gradient min-h-full">
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <Dashboard 
                      currentUser={currentUser} 
                      notifications={notifications}
                      setNotifications={setNotifications}
                    />
                  } 
                />
                <Route 
                  path="/scan-results" 
                  element={<ScanResults currentUser={currentUser} />} 
                />
                <Route 
                  path="/real-time" 
                  element={<RealTimeMonitor currentUser={currentUser} />} 
                />
                <Route 
                  path="/vulnerability/:id" 
                  element={<VulnerabilityDetails currentUser={currentUser} />} 
                />
                <Route 
                  path="/team" 
                  element={<TeamManagement currentUser={currentUser} />} 
                />
                <Route 
                  path="/settings" 
                  element={
                    <SettingsPage 
                      currentUser={currentUser} 
                      updateUserProfile={updateUserProfile}
                    />
                  } 
                />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </div>
  );
}

export default App;


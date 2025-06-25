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
  const [currentUser] = useState({
    id: 1,
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'Security Manager',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  });

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Apply OmniPanelAI workspace theme
    document.documentElement.classList.toggle('dark', isDarkMode);
    // Ensure body has proper background
    document.body.style.backgroundColor = isDarkMode 
      ? 'hsl(222.2 84% 4.9%)' 
      : 'hsl(0 0% 100%)';
    document.body.style.color = isDarkMode 
      ? 'hsl(210 40% 98%)' 
      : 'hsl(222.2 84% 4.9%)';
  }, [isDarkMode]);

  // WebSocket connection for real-time notifications
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket('ws://localhost:8765');
        
        ws.onopen = () => {
          console.log('WebSocket connected for notifications');
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
          // Attempt to reconnect after 5 seconds
          setTimeout(connectWebSocket, 5000);
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
        
        return ws;
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        return null;
      }
    };

    const ws = connectWebSocket();
    
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
        <div className="flex bg-background text-foreground visible-text">
          {/* Sidebar */}
          <Sidebar 
            currentUser={currentUser} 
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            navigationItems={navigationItems}
          />
          
          {/* Main Content */}
          <main className="flex-1 bg-background visible-text">
            <div className="bg-app-gradient min-h-screen">
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
                  element={<SettingsPage currentUser={currentUser} />} 
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


import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
    id: 'user_001',
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'developer'
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);

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

  // WebSocket connection for real-time updates
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket('ws://localhost:8765');
        
        ws.onopen = () => {
          console.log('WebSocket connected');
          // Send ping to test connection
          ws.send(JSON.stringify({ type: 'ping' }));
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'scan_complete') {
              setNotifications(prev => [...prev, {
                id: Date.now(),
                type: 'scan_complete',
                message: `Scan completed for ${data.file_path}`,
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

  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        <Sidebar
          navigationItems={navigationItems}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          currentUser={currentUser}
        />
        
        <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="h-full overflow-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route 
                path="/dashboard" 
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
                path="/team" 
                element={<TeamManagement currentUser={currentUser} />} 
              />
              <Route 
                path="/settings" 
                element={<SettingsPage currentUser={currentUser} />} 
              />
              <Route 
                path="/vulnerability/:id" 
                element={<VulnerabilityDetails currentUser={currentUser} />} 
              />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;


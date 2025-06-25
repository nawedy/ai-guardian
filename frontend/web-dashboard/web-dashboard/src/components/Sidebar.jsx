import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Shield, 
  User, 
  LogOut, 
  Moon, 
  Sun,
  Home,
  FileText,
  Activity,
  Users,
  Settings,
  AlertTriangle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Sidebar = ({ currentUser, isDarkMode, setIsDarkMode }) => {
  const location = useLocation();

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/',
      icon: Home
    },
    {
      id: 'scan-results',
      label: 'Scan Results',
      path: '/scan-results',
      icon: FileText
    },
    {
      id: 'real-time',
      label: 'Real-Time Monitor',
      path: '/real-time',
      icon: Activity
    },
    {
      id: 'team',
      label: 'Team Management',
      path: '/team',
      icon: Users
    },
    {
      id: 'settings',
      label: 'Settings',
      path: '/settings',
      icon: Settings
    }
  ];

  return (
    <div className="w-64 h-screen bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 bg-app-primary rounded-lg">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">AI Guardian</h1>
            <p className="text-xs text-muted-foreground">OmniPanelAI Integration</p>
          </div>
        </div>
        
        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 hover:bg-muted transition-app"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Moon className="w-4 h-4 text-muted-foreground" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-app ${
                    isActive
                      ? 'bg-app-accent text-accent-foreground border border-border shadow-app-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-accent-foreground' : 'text-muted-foreground'}`} />
                  <span className={`font-medium ${isActive ? 'text-accent-foreground' : 'text-muted-foreground'}`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="border-t border-border p-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full">
              {currentUser.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {currentUser.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {currentUser.role}
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted transition-app"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;


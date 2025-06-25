import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Settings, 
  Shield, 
  Mail, 
  Phone,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TeamManagement = ({ currentUser }) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'developer'
  });

  // Fetch team members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        
        // Mock data - in real app, this would be an API call
        const mockMembers = [
          {
            id: 'user_001',
            name: 'John Doe',
            email: 'john.doe@company.com',
            role: 'admin',
            status: 'active',
            lastActive: new Date(Date.now() - 1000 * 60 * 30),
            scansCompleted: 45,
            vulnerabilitiesFound: 12
          },
          {
            id: 'user_002',
            name: 'Jane Smith',
            email: 'jane.smith@company.com',
            role: 'developer',
            status: 'active',
            lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2),
            scansCompleted: 32,
            vulnerabilitiesFound: 8
          },
          {
            id: 'user_003',
            name: 'Mike Johnson',
            email: 'mike.johnson@company.com',
            role: 'security_analyst',
            status: 'active',
            lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24),
            scansCompleted: 67,
            vulnerabilitiesFound: 23
          },
          {
            id: 'user_004',
            name: 'Sarah Wilson',
            email: 'sarah.wilson@company.com',
            role: 'developer',
            status: 'inactive',
            lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
            scansCompleted: 18,
            vulnerabilitiesFound: 5
          }
        ];
        
        setTeamMembers(mockMembers);
      } catch (error) {
        console.error('Error fetching team members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'security_analyst': return 'bg-red-100 text-red-800 border-red-200';
      case 'developer': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'viewer': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const handleAddMember = () => {
    if (newMember.name && newMember.email) {
      const member = {
        id: `user_${Date.now()}`,
        ...newMember,
        status: 'active',
        lastActive: new Date(),
        scansCompleted: 0,
        vulnerabilitiesFound: 0
      };
      
      setTeamMembers(prev => [...prev, member]);
      setNewMember({ name: '', email: '', role: 'developer' });
      setShowAddMember(false);
    }
  };

  const handleRemoveMember = (memberId) => {
    setTeamMembers(prev => prev.filter(member => member.id !== memberId));
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
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-1">
            Manage team members and their access permissions
          </p>
        </div>
        
        <Button onClick={() => setShowAddMember(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <p className="text-xs text-muted-foreground">
              {teamMembers.filter(m => m.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers.reduce((sum, member) => sum + member.scansCompleted, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vulnerabilities Found</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers.reduce((sum, member) => sum + member.vulnerabilitiesFound, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total discovered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. per Member</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers.length > 0 
                ? Math.round(teamMembers.reduce((sum, member) => sum + member.scansCompleted, 0) / teamMembers.length)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Scans per member
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Member Form */}
      {showAddMember && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Team Member</CardTitle>
            <CardDescription>
              Invite a new member to join your security team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Full Name"
                value={newMember.name}
                onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                placeholder="Email Address"
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
              />
              <Select 
                value={newMember.role} 
                onValueChange={(value) => setNewMember(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="security_analyst">Security Analyst</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex space-x-3">
              <Button onClick={handleAddMember}>
                Add Member
              </Button>
              <Button variant="outline" onClick={() => setShowAddMember(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage your team members and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{member.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {member.email}
                      </span>
                      <span>Last active {formatTimeAgo(member.lastActive)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right text-sm">
                    <div className="font-medium text-gray-900">
                      {member.scansCompleted} scans
                    </div>
                    <div className="text-gray-500">
                      {member.vulnerabilitiesFound} vulnerabilities
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    <Badge className={getRoleColor(member.role)}>
                      {member.role.replace('_', ' ')}
                    </Badge>
                    <Badge className={getStatusColor(member.status)}>
                      {member.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamManagement;


import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Grid, List, Users, MoreVertical, Phone, Mail, Calendar, MapPin, Star, UserCheck, Clock, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { BulkOperations } from '@/components/shared/bulk-operations';
import { WorkflowIntegration } from '@/components/shared/workflow-integration';
import { ExportService } from '@/components/shared/export-service';

interface Staff {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'on_leave';
  qualifications?: string[];
  location?: string;
  joinDate: string;
  avatarUrl?: string;
  rating?: number;
  currentParticipants?: number;
  maxCapacity?: number;
  lastActive?: string;
  specializations?: string[];
}

type ViewMode = 'list' | 'grid' | 'card';
type SortOption = 'name' | 'role' | 'department' | 'status' | 'joinDate' | 'rating';

export function StaffListView() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ['/api/staff'],
    queryFn: async () => {
      const response = await fetch('/api/staff');
      return response.json();
    }
  });

  const filteredAndSortedStaff = useMemo(() => {
    let filtered = staff.filter((member: Staff) => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (member.role?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesDepartment = departmentFilter === 'all' || member.department === departmentFilter;
      const matchesRole = roleFilter === 'all' || member.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      
      return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
    });

    filtered.sort((a: Staff, b: Staff) => {
      let aValue: any = a[sortBy as keyof Staff];
      let bValue: any = b[sortBy as keyof Staff];
      
      if (sortBy === 'rating') {
        aValue = a.rating || 0;
        bValue = b.rating || 0;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue === undefined) aValue = '';
      if (bValue === undefined) bValue = '';
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [staff, searchTerm, departmentFilter, roleFilter, statusFilter, sortBy, sortOrder]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'support_coordinator': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'support_worker': return 'bg-green-100 text-green-800 border-green-200';
      case 'case_manager': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDepartment = (department: string) => {
    return department.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredAndSortedStaff.map((member: Staff) => member.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(item => item !== id));
    }
  };

  const handleBulkAction = async (action: string, data?: any) => {
    switch (action) {
      case 'export':
        await ExportService.exportData({
          format: data.format,
          items: data.items,
          itemType: 'staff',
          data: staff
        });
        break;
      case 'email':
        await ExportService.bulkEmail(data.items, data.subject, data.message, 'staff');
        break;
      case 'updateStatus':
        await ExportService.bulkStatusUpdate(data.items, data.status, 'staff');
        break;
      case 'delete':
        await ExportService.bulkDelete(data.items, 'staff');
        break;
      default:
        console.log('Unknown bulk action:', action);
    }
  };

  const handleWorkflowAction = async (action: string, data: any) => {
    // Implementation for workflow actions
    console.log('Workflow action:', action, data);
  };

  const renderListView = () => (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b font-medium text-sm text-gray-700">
        <div className="col-span-3 flex items-center space-x-2">
          <Checkbox
            checked={selectedItems.length === filteredAndSortedStaff.length && filteredAndSortedStaff.length > 0}
            onCheckedChange={handleSelectAll}
            data-testid="checkbox-select-all"
          />
          <span>Staff Member</span>
        </div>
        <div className="col-span-2">Role</div>
        <div className="col-span-2">Department</div>
        <div className="col-span-1">Status</div>
        <div className="col-span-2">Contact</div>
        <div className="col-span-1">Rating</div>
        <div className="col-span-1">Actions</div>
      </div>
      
      {filteredAndSortedStaff.map((member: Staff) => (
        <div key={member.id} className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-gray-50 transition-colors">
          <div className="col-span-3 flex items-center space-x-3">
            <Checkbox
              checked={selectedItems.includes(member.id)}
              onCheckedChange={(checked) => handleSelectItem(member.id, !!checked)}
              data-testid={`checkbox-staff-${member.id}`}
            />
            <Avatar className="h-10 w-10">
              <AvatarImage src={member.avatarUrl} alt={member.name} />
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-gray-900" data-testid={`text-staff-name-${member.id}`}>
                {member.name}
              </p>
              <p className="text-sm text-gray-500">ID: {member.id.slice(0, 8)}</p>
            </div>
          </div>
          
          <div className="col-span-2 flex items-center">
            <Badge className={getRoleColor(member.role)} data-testid={`badge-role-${member.id}`}>
              {formatRole(member.role)}
            </Badge>
          </div>
          
          <div className="col-span-2 flex items-center">
            <span className="text-gray-700">{formatDepartment(member.department)}</span>
          </div>
          
          <div className="col-span-1 flex items-center">
            <Badge className={getStatusColor(member.status)} data-testid={`badge-status-${member.id}`}>
              {member.status.replace('_', ' ')}
            </Badge>
          </div>
          
          <div className="col-span-2 flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" data-testid={`button-email-${member.id}`}>
                    <Mail className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{member.email}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {member.phone && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" data-testid={`button-phone-${member.id}`}>
                      <Phone className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{member.phone}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          <div className="col-span-1 flex items-center">
            {member.rating && (
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">{member.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          <div className="col-span-1 flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" data-testid={`button-actions-${member.id}`}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Profile</DropdownMenuItem>
                <DropdownMenuItem>Edit Details</DropdownMenuItem>
                <DropdownMenuItem>View Schedule</DropdownMenuItem>
                <DropdownMenuItem>Assign Participants</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredAndSortedStaff.map((member: Staff) => (
        <Card key={member.id} className="hover:shadow-md transition-shadow cursor-pointer" data-testid={`card-staff-${member.id}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Avatar className="h-12 w-12">
                <AvatarImage src={member.avatarUrl} alt={member.name} />
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Badge className={getStatusColor(member.status)}>
                {member.status.replace('_', ' ')}
              </Badge>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{member.name}</h3>
              <p className="text-sm text-gray-500">{formatRole(member.role)}</p>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{formatDepartment(member.department)}</span>
              </div>
              
              {member.location && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{member.location}</span>
                </div>
              )}
              
              {member.rating && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span>{member.rating.toFixed(1)} rating</span>
                </div>
              )}
              
              {member.currentParticipants !== undefined && member.maxCapacity && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <UserCheck className="h-4 w-4" />
                  <span>{member.currentParticipants}/{member.maxCapacity} participants</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <div className="flex space-x-1">
                <Button variant="ghost" size="sm">
                  <Mail className="h-4 w-4" />
                </Button>
                {member.phone && (
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Button variant="outline" size="sm">View Profile</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderCardView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {filteredAndSortedStaff.map((member: Staff) => (
        <Card key={member.id} className="hover:shadow-lg transition-shadow" data-testid={`card-detailed-${member.id}`}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={member.avatarUrl} alt={member.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
                    {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={getRoleColor(member.role)}>{formatRole(member.role)}</Badge>
                    <Badge className={getStatusColor(member.status)}>{member.status.replace('_', ' ')}</Badge>
                  </div>
                </div>
              </div>
              {member.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="font-medium">{member.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium">{formatDepartment(member.department)}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{member.email}</span>
                </div>
                
                {member.phone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{member.phone}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                {member.location && (
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{member.location}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Joined:</span>
                  <span className="font-medium">{new Date(member.joinDate).toLocaleDateString()}</span>
                </div>
                
                {member.lastActive && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Last Active:</span>
                    <span className="font-medium">{new Date(member.lastActive).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
            
            {member.specializations && member.specializations.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Specializations:</p>
                <div className="flex flex-wrap gap-1">
                  {member.specializations.map((spec, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {member.currentParticipants !== undefined && member.maxCapacity && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Participant Load:</span>
                  <span className="font-medium">{member.currentParticipants}/{member.maxCapacity}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(member.currentParticipants / member.maxCapacity) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm">
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </Button>
                {member.phone && (
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                )}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">View Schedule</Button>
                <Button size="sm">View Profile</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="staff-list-view">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-testid="text-page-title">
            Staff Directory
          </h1>
          <p className="text-gray-600">
            Manage and view all staff members ({filteredAndSortedStaff.length} total)
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {selectedItems.length > 0 && (
            <WorkflowIntegration
              selectedItems={selectedItems}
              itemType="staff"
              onWorkflowAction={handleWorkflowAction}
            />
          )}
          <Button 
            variant={viewMode === 'list' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('list')}
            data-testid="button-view-list"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewMode === 'grid' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('grid')}
            data-testid="button-view-grid"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewMode === 'card' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('card')}
            data-testid="button-view-card"
          >
            <Users className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-staff"
            />
          </div>
        </div>
        
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger data-testid="select-department-filter">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="intake">Intake</SelectItem>
            <SelectItem value="hr">HR</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="service_delivery">Service Delivery</SelectItem>
            <SelectItem value="compliance">Compliance</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger data-testid="select-role-filter">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="support_coordinator">Support Coordinator</SelectItem>
            <SelectItem value="support_worker">Support Worker</SelectItem>
            <SelectItem value="case_manager">Case Manager</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger data-testid="select-status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="on_leave">On Leave</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
          const [sort, order] = value.split('-');
          setSortBy(sort as SortOption);
          setSortOrder(order as 'asc' | 'desc');
        }}>
          <SelectTrigger data-testid="select-sort">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name A-Z</SelectItem>
            <SelectItem value="name-desc">Name Z-A</SelectItem>
            <SelectItem value="role-asc">Role A-Z</SelectItem>
            <SelectItem value="department-asc">Department A-Z</SelectItem>
            <SelectItem value="status-asc">Status</SelectItem>
            <SelectItem value="joinDate-desc">Newest First</SelectItem>
            <SelectItem value="joinDate-asc">Oldest First</SelectItem>
            <SelectItem value="rating-desc">Highest Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {viewMode === 'list' && renderListView()}
      {viewMode === 'grid' && renderGridView()}
      {viewMode === 'card' && renderCardView()}
      
      {filteredAndSortedStaff.length === 0 && (
        <div className="text-center py-12" data-testid="empty-state">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No staff found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* Bulk Operations */}
      <BulkOperations
        selectedItems={selectedItems}
        onClearSelection={() => setSelectedItems([])}
        itemType="staff"
        onBulkAction={handleBulkAction}
      />
    </div>
  );
}
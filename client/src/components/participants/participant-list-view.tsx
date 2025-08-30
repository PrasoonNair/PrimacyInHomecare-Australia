import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Grid, List, Users, MoreVertical, Phone, Mail, Calendar, MapPin, FileText, AlertCircle, CheckCircle, Clock, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { BulkOperations } from '@/components/shared/bulk-operations';
import { WorkflowIntegration } from '@/components/shared/workflow-integration';
import { ExportService } from '@/components/shared/export-service';
import { InlineWorkflowActions } from '@/components/shared/inline-workflow-actions';

interface Participant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  ndisNumber: string;
  dateOfBirth: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  state?: string;
  city?: string;
  planStatus?: 'active' | 'expired' | 'pending' | 'none';
  planStartDate?: string;
  planEndDate?: string;
  totalBudget?: number;
  usedBudget?: number;
  primarySupport?: string;
  lastService?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  communicationPreference?: string;
  culturalBackground?: string;
  disabilities?: string[];
  goals?: number;
  completedGoals?: number;
}

type ViewMode = 'list' | 'grid' | 'card';
type SortOption = 'name' | 'ndisNumber' | 'status' | 'planStatus' | 'lastService' | 'budget';

export function ParticipantListView() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planStatusFilter, setPlanStatusFilter] = useState('all');
  const [riskLevelFilter, setRiskLevelFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const { data: participants = [], isLoading } = useQuery({
    queryKey: ['/api/participants'],
    queryFn: async () => {
      const response = await fetch('/api/participants');
      return response.json();
    }
  });

  const filteredAndSortedParticipants = useMemo(() => {
    let filtered = participants.filter((participant: Participant) => {
      const matchesSearch = participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           participant.ndisNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesState = stateFilter === 'all' || participant.state === stateFilter;
      const matchesStatus = statusFilter === 'all' || participant.status === statusFilter;
      const matchesPlanStatus = planStatusFilter === 'all' || participant.planStatus === planStatusFilter;
      const matchesRiskLevel = riskLevelFilter === 'all' || participant.riskLevel === riskLevelFilter;
      
      return matchesSearch && matchesState && matchesStatus && matchesPlanStatus && matchesRiskLevel;
    });

    filtered.sort((a: Participant, b: Participant) => {
      let aValue: any;
      let bValue: any;
      
      if (sortBy === 'budget') {
        aValue = a.totalBudget || 0;
        bValue = b.totalBudget || 0;
      } else if (sortBy === 'lastService') {
        aValue = a.lastService ? new Date(a.lastService).getTime() : 0;
        bValue = b.lastService ? new Date(b.lastService).getTime() : 0;
      } else {
        aValue = a[sortBy as keyof Participant];
        bValue = b[sortBy as keyof Participant];
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
  }, [participants, searchTerm, stateFilter, statusFilter, planStatusFilter, riskLevelFilter, sortBy, sortOrder]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPlanStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'none': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle className="h-4 w-4" />;
      case 'medium': return <AlertCircle className="h-4 w-4" />;
      case 'high': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateBudgetUsage = (participant: Participant) => {
    if (!participant.totalBudget || !participant.usedBudget) return 0;
    return (participant.usedBudget / participant.totalBudget) * 100;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredAndSortedParticipants.map((participant: Participant) => participant.id));
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
          itemType: 'participants',
          data: participants
        });
        break;
      case 'email':
        await ExportService.bulkEmail(data.items, data.subject, data.message, 'participants');
        break;
      case 'updateStatus':
        await ExportService.bulkStatusUpdate(data.items, data.status, 'participants');
        break;
      case 'delete':
        await ExportService.bulkDelete(data.items, 'participants');
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
            checked={selectedItems.length === filteredAndSortedParticipants.length && filteredAndSortedParticipants.length > 0}
            onCheckedChange={handleSelectAll}
            data-testid="checkbox-select-all"
          />
          <span>Participant</span>
        </div>
        <div className="col-span-2">NDIS Number</div>
        <div className="col-span-1">Status</div>
        <div className="col-span-1">Plan</div>
        <div className="col-span-2">Budget Usage</div>
        <div className="col-span-1">Risk Level</div>
        <div className="col-span-1">Location</div>
        <div className="col-span-1">Actions</div>
      </div>
      
      {filteredAndSortedParticipants.map((participant: Participant) => (
        <div key={participant.id} className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-gray-50 transition-colors">
          <div className="col-span-3 flex items-center space-x-3">
            <Checkbox
              checked={selectedItems.includes(participant.id)}
              onCheckedChange={(checked) => handleSelectItem(participant.id, !!checked)}
              data-testid={`checkbox-participant-${participant.id}`}
            />
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-purple-100 text-purple-700">
                {participant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-gray-900" data-testid={`text-participant-name-${participant.id}`}>
                {participant.name}
              </p>
              <p className="text-sm text-gray-500">Age: {calculateAge(participant.dateOfBirth)}</p>
            </div>
          </div>
          
          <div className="col-span-2 flex items-center">
            <span className="font-mono text-sm text-gray-700" data-testid={`text-ndis-number-${participant.id}`}>
              {participant.ndisNumber}
            </span>
          </div>
          
          <div className="col-span-1 flex items-center">
            <Badge className={getStatusColor(participant.status)} data-testid={`badge-status-${participant.id}`}>
              {participant.status}
            </Badge>
          </div>
          
          <div className="col-span-1 flex items-center">
            {participant.planStatus && (
              <Badge className={getPlanStatusColor(participant.planStatus)} data-testid={`badge-plan-status-${participant.id}`}>
                {participant.planStatus}
              </Badge>
            )}
          </div>
          
          <div className="col-span-2 flex items-center">
            {participant.totalBudget && participant.usedBudget !== undefined ? (
              <div className="w-full">
                <div className="flex justify-between text-sm mb-1">
                  <span>{formatCurrency(participant.usedBudget)}</span>
                  <span>{formatCurrency(participant.totalBudget)}</span>
                </div>
                <Progress value={calculateBudgetUsage(participant)} className="h-2" />
              </div>
            ) : (
              <span className="text-sm text-gray-500">No budget data</span>
            )}
          </div>
          
          <div className="col-span-1 flex items-center">
            {participant.riskLevel && (
              <div className="flex items-center space-x-1">
                <Badge className={getRiskLevelColor(participant.riskLevel)}>
                  {getRiskIcon(participant.riskLevel)}
                  {participant.riskLevel}
                </Badge>
              </div>
            )}
          </div>
          
          <div className="col-span-1 flex items-center">
            <span className="text-sm text-gray-600">
              {participant.city}, {participant.state}
            </span>
          </div>
          
          <div className="col-span-1 flex items-center justify-between">
            <InlineWorkflowActions
              itemId={participant.id}
              itemType="participant"
              context="list"
              itemData={participant}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" data-testid={`button-actions-${participant.id}`}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Profile</DropdownMenuItem>
                <DropdownMenuItem>Edit Details</DropdownMenuItem>
                <DropdownMenuItem>View Plan</DropdownMenuItem>
                <DropdownMenuItem>View Services</DropdownMenuItem>
                <DropdownMenuItem>Contact</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredAndSortedParticipants.map((participant: Participant) => (
        <Card key={participant.id} className="hover:shadow-md transition-shadow cursor-pointer" data-testid={`card-participant-${participant.id}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-purple-100 text-purple-700">
                  {participant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Badge className={getStatusColor(participant.status)}>
                {participant.status}
              </Badge>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{participant.name}</h3>
              <p className="text-sm text-gray-500">Age: {calculateAge(participant.dateOfBirth)}</p>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                <span className="font-mono">{participant.ndisNumber}</span>
              </div>
              
              {participant.planStatus && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <Badge className={getPlanStatusColor(participant.planStatus)} variant="outline">
                    Plan {participant.planStatus}
                  </Badge>
                </div>
              )}
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{participant.city}, {participant.state}</span>
              </div>
              
              {participant.riskLevel && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  {getRiskIcon(participant.riskLevel)}
                  <Badge className={getRiskLevelColor(participant.riskLevel)} variant="outline">
                    {participant.riskLevel} risk
                  </Badge>
                </div>
              )}
            </div>
            
            {participant.totalBudget && participant.usedBudget !== undefined && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Budget Usage</span>
                  <span className="font-medium">{calculateBudgetUsage(participant).toFixed(1)}%</span>
                </div>
                <Progress value={calculateBudgetUsage(participant)} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{formatCurrency(participant.usedBudget)}</span>
                  <span>{formatCurrency(participant.totalBudget)}</span>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <InlineWorkflowActions
                itemId={participant.id}
                itemType="participant"
                context="grid"
                itemData={participant}
              />
              <Button variant="outline" size="sm">View Profile</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderCardView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {filteredAndSortedParticipants.map((participant: Participant) => (
        <Card key={participant.id} className="hover:shadow-lg transition-shadow" data-testid={`card-detailed-${participant.id}`}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-purple-100 text-purple-700 text-lg">
                    {participant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{participant.name}</h3>
                  <p className="text-sm text-gray-500">Age: {calculateAge(participant.dateOfBirth)}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={getStatusColor(participant.status)}>{participant.status}</Badge>
                    {participant.planStatus && (
                      <Badge className={getPlanStatusColor(participant.planStatus)}>
                        Plan {participant.planStatus}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {participant.riskLevel && (
                <div className="flex items-center space-x-1">
                  <Badge className={getRiskLevelColor(participant.riskLevel)}>
                    {getRiskIcon(participant.riskLevel)}
                    {participant.riskLevel}
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">NDIS:</span>
                  <span className="font-mono font-medium">{participant.ndisNumber}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{participant.email}</span>
                </div>
                
                {participant.phone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{participant.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{participant.city}, {participant.state}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {participant.planStartDate && participant.planEndDate && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Plan Period:</span>
                    <span className="font-medium">
                      {new Date(participant.planStartDate).toLocaleDateString()} - {new Date(participant.planEndDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {participant.primarySupport && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Primary Support:</span>
                    <span className="font-medium">{participant.primarySupport}</span>
                  </div>
                )}
                
                {participant.lastService && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Last Service:</span>
                    <span className="font-medium">{new Date(participant.lastService).toLocaleDateString()}</span>
                  </div>
                )}
                
                {participant.communicationPreference && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Preferred Contact:</span>
                    <span className="font-medium">{participant.communicationPreference}</span>
                  </div>
                )}
              </div>
            </div>
            
            {participant.disabilities && participant.disabilities.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Disabilities:</p>
                <div className="flex flex-wrap gap-1">
                  {participant.disabilities.map((disability, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {disability}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {participant.goals && participant.completedGoals !== undefined && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-gray-600">Goal Progress:</span>
                  <span className="font-medium">{participant.completedGoals}/{participant.goals} completed</span>
                </div>
                <Progress value={(participant.completedGoals / participant.goals) * 100} className="h-2" />
              </div>
            )}
            
            {participant.totalBudget && participant.usedBudget !== undefined && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-gray-600">Budget Usage:</span>
                  <span className="font-medium">{calculateBudgetUsage(participant).toFixed(1)}%</span>
                </div>
                <Progress value={calculateBudgetUsage(participant)} className="h-2" />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>Used: {formatCurrency(participant.usedBudget)}</span>
                  <span>Total: {formatCurrency(participant.totalBudget)}</span>
                </div>
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t">
              <InlineWorkflowActions
                itemId={participant.id}
                itemType="participant"
                context="card"
                itemData={participant}
              />
              <div className="flex justify-between items-center mt-3">
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </Button>
                  {participant.phone && (
                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">View Plan</Button>
                  <Button size="sm">View Profile</Button>
                </div>
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
    <div className="space-y-6" data-testid="participant-list-view">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-testid="text-page-title">
            Participant Directory
          </h1>
          <p className="text-gray-600">
            Manage and view all NDIS participants ({filteredAndSortedParticipants.length} total)
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {selectedItems.length > 0 && (
            <WorkflowIntegration
              selectedItems={selectedItems}
              itemType="participants"
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
              placeholder="Search participants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-participants"
            />
          </div>
        </div>
        
        <Select value={stateFilter} onValueChange={setStateFilter}>
          <SelectTrigger data-testid="select-state-filter">
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            <SelectItem value="NSW">NSW</SelectItem>
            <SelectItem value="VIC">VIC</SelectItem>
            <SelectItem value="QLD">QLD</SelectItem>
            <SelectItem value="SA">SA</SelectItem>
            <SelectItem value="WA">WA</SelectItem>
            <SelectItem value="TAS">TAS</SelectItem>
            <SelectItem value="NT">NT</SelectItem>
            <SelectItem value="ACT">ACT</SelectItem>
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
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={planStatusFilter} onValueChange={setPlanStatusFilter}>
          <SelectTrigger data-testid="select-plan-status-filter">
            <SelectValue placeholder="Plan Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plan Status</SelectItem>
            <SelectItem value="active">Active Plan</SelectItem>
            <SelectItem value="expired">Expired Plan</SelectItem>
            <SelectItem value="pending">Pending Plan</SelectItem>
            <SelectItem value="none">No Plan</SelectItem>
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
            <SelectItem value="ndisNumber-asc">NDIS Number</SelectItem>
            <SelectItem value="status-asc">Status</SelectItem>
            <SelectItem value="planStatus-asc">Plan Status</SelectItem>
            <SelectItem value="lastService-desc">Recent Service</SelectItem>
            <SelectItem value="budget-desc">Highest Budget</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {viewMode === 'list' && renderListView()}
      {viewMode === 'grid' && renderGridView()}
      {viewMode === 'card' && renderCardView()}
      
      {filteredAndSortedParticipants.length === 0 && (
        <div className="text-center py-12" data-testid="empty-state">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No participants found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* Bulk Operations */}
      <BulkOperations
        selectedItems={selectedItems}
        onClearSelection={() => setSelectedItems([])}
        itemType="participants"
        onBulkAction={handleBulkAction}
      />
    </div>
  );
}
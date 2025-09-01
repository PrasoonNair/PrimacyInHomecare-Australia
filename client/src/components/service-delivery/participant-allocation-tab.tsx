import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  User, 
  Users, 
  Calendar, 
  MapPin, 
  Clock, 
  AlertCircle,
  CheckCircle,
  UserPlus,
  Filter,
  RefreshCw,
  Star,
  Phone,
  Mail
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Participant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  ndisNumber: string;
  location: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  serviceType: string;
  status: 'active' | 'pending_allocation' | 'allocated' | 'inactive';
  currentStaff?: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
  };
  nextService?: string;
  planBudget: number;
  usedBudget: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  culturalRequirements?: string[];
  preferences?: string;
  lastContact?: string;
}

interface Staff {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  rating: number;
  qualifications: string[];
  location: string;
  availability: 'available' | 'busy' | 'unavailable';
  currentCaseload: number;
  maxCaseload: number;
  specializations: string[];
  hourlyRate: number;
  reliability: number;
}

interface AllocationData {
  participantId: string;
  staffId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: string;
  notes?: string;
}

export function ParticipantAllocationTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [isAllocationDialogOpen, setIsAllocationDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'pending' | 'allocated'>('overview');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch participants data
  const { data: participants = [], isLoading: loadingParticipants } = useQuery({
    queryKey: ['/api/participants'],
    select: (data: any[]) => data.map(p => ({
      id: p.id,
      name: p.name || `${p.firstName} ${p.lastName}`,
      email: p.email,
      phone: p.phone,
      ndisNumber: p.ndisNumber,
      location: `${p.city || ''}, ${p.state || ''}`.trim().replace(/^,\s*/, ''),
      riskLevel: p.riskLevel || 'low',
      serviceType: p.primarySupport || 'Support Coordination',
      status: p.currentStaff ? 'allocated' : 'pending_allocation',
      currentStaff: p.currentStaff,
      nextService: p.lastService,
      planBudget: p.totalBudget || 0,
      usedBudget: p.usedBudget || 0,
      urgencyLevel: p.urgencyLevel || 'medium',
      culturalRequirements: p.culturalBackground ? [p.culturalBackground] : [],
      preferences: p.communicationPreference,
      lastContact: p.lastService
    }))
  });

  // Fetch staff data
  const { data: staff = [], isLoading: loadingStaff } = useQuery({
    queryKey: ['/api/staff'],
    select: (data: any[]) => data.map(s => ({
      id: s.id,
      name: `${s.firstName} ${s.lastName}`,
      email: s.email,
      phone: s.phone,
      avatar: s.avatar,
      rating: s.reliabilityScore || 85,
      qualifications: s.qualifications || ['Basic Support'],
      location: s.location || 'Not specified',
      availability: s.isActive ? 'available' : 'unavailable',
      currentCaseload: Math.floor(Math.random() * 8) + 2, // Mock data
      maxCaseload: 12,
      specializations: s.specializations || [],
      hourlyRate: s.hourlyRate || 65,
      reliability: s.reliabilityScore || 85
    }))
  });

  // Mutation for staff allocation
  const allocateStaffMutation = useMutation({
    mutationFn: async (allocationData: AllocationData) => {
      const response = await fetch('/api/workflow/staff/intelligent-matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: allocationData.participantId,
          serviceRequirements: {
            serviceType: selectedParticipant?.serviceType,
            urgency: allocationData.priority,
            preferredStaffId: allocationData.staffId
          }
        })
      });
      
      if (!response.ok) throw new Error('Failed to allocate staff');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Staff Allocated Successfully",
        description: "The staff member has been assigned to the participant.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/participants'] });
      setIsAllocationDialogOpen(false);
      setSelectedParticipant(null);
    },
    onError: (error) => {
      toast({
        title: "Allocation Failed",
        description: "There was an error allocating the staff member. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Filter participants based on search and filters
  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.ndisNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || participant.status === statusFilter;
    const matchesRisk = riskFilter === 'all' || participant.riskLevel === riskFilter;
    
    const matchesViewMode = viewMode === 'overview' || 
                           (viewMode === 'pending' && participant.status === 'pending_allocation') ||
                           (viewMode === 'allocated' && participant.status === 'allocated');

    return matchesSearch && matchesStatus && matchesRisk && matchesViewMode;
  });

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'allocated': return 'bg-green-100 text-green-800';
      case 'pending_allocation': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailableStaff = () => {
    return staff.filter(s => s.availability === 'available' && s.currentCaseload < s.maxCaseload);
  };

  const handleAllocateStaff = (staffId: string, priority: 'low' | 'medium' | 'high' | 'urgent') => {
    if (!selectedParticipant) return;
    
    allocateStaffMutation.mutate({
      participantId: selectedParticipant.id,
      staffId,
      priority,
      startDate: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="p-6 space-y-6" data-testid="participant-allocation-tab">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Participant Allocation</h1>
          <p className="text-gray-600">Manage staff allocation and participant assignments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-refresh">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button data-testid="button-bulk-allocate">
            <UserPlus className="h-4 w-4 mr-2" />
            Bulk Allocate
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Participants</p>
                <p className="text-2xl font-bold text-gray-900">{participants.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Allocation</p>
                <p className="text-2xl font-bold text-orange-500">
                  {participants.filter(p => p.status === 'pending_allocation').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Allocated</p>
                <p className="text-2xl font-bold text-green-500">
                  {participants.filter(p => p.status === 'allocated').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Staff</p>
                <p className="text-2xl font-bold text-blue-500">{getAvailableStaff().length}</p>
              </div>
              <User className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search participants by name, NDIS number, or service type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                data-testid="input-search"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-status">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending_allocation">Pending Allocation</SelectItem>
                <SelectItem value="allocated">Allocated</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-risk">
                <SelectValue placeholder="All Risk Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="critical">Critical Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending">
            Pending ({participants.filter(p => p.status === 'pending_allocation').length})
          </TabsTrigger>
          <TabsTrigger value="allocated" data-testid="tab-allocated">
            Allocated ({participants.filter(p => p.status === 'allocated').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={viewMode}>
          {/* Participants Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                {viewMode === 'overview' && 'All Participants'}
                {viewMode === 'pending' && 'Participants Pending Allocation'}
                {viewMode === 'allocated' && 'Allocated Participants'}
              </CardTitle>
              <CardDescription>
                {filteredParticipants.length} participant{filteredParticipants.length !== 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingParticipants ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Participant</TableHead>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Current Staff</TableHead>
                      <TableHead>Budget Progress</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParticipants.map((participant) => (
                      <TableRow key={participant.id} data-testid={`row-participant-${participant.id}`}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{participant.name}</div>
                            <div className="text-sm text-gray-500">{participant.ndisNumber}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {participant.location}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{participant.serviceType}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRiskBadgeColor(participant.riskLevel)}>
                            {participant.riskLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(participant.status)}>
                            {participant.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {participant.currentStaff ? (
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={participant.currentStaff.avatar} />
                                <AvatarFallback>
                                  {participant.currentStaff.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-sm font-medium">{participant.currentStaff.name}</div>
                                <div className="flex items-center text-xs text-gray-500">
                                  <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                                  {participant.currentStaff.rating}%
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">Not allocated</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Used:</span>
                              <span>${participant.usedBudget.toLocaleString()}</span>
                            </div>
                            <Progress 
                              value={(participant.usedBudget / participant.planBudget) * 100} 
                              className="h-2"
                            />
                            <div className="text-xs text-gray-500">
                              of ${participant.planBudget.toLocaleString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {participant.status === 'pending_allocation' ? (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedParticipant(participant);
                                  setIsAllocationDialogOpen(true);
                                }}
                                data-testid={`button-allocate-${participant.id}`}
                              >
                                <UserPlus className="h-4 w-4 mr-1" />
                                Allocate
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedParticipant(participant);
                                  setIsAllocationDialogOpen(true);
                                }}
                                data-testid={`button-reassign-${participant.id}`}
                              >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Reassign
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" data-testid={`button-view-${participant.id}`}>
                              View Details
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Staff Allocation Dialog */}
      <Dialog open={isAllocationDialogOpen} onOpenChange={setIsAllocationDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedParticipant?.status === 'allocated' ? 'Reassign Staff' : 'Allocate Staff'}
            </DialogTitle>
            <DialogDescription>
              {selectedParticipant && (
                <>
                  Participant: {selectedParticipant.name} | Service: {selectedParticipant.serviceType}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedParticipant && (
            <div className="space-y-6">
              {/* Participant Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Participant Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Name</label>
                      <p className="text-sm">{selectedParticipant.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">NDIS Number</label>
                      <p className="text-sm">{selectedParticipant.ndisNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Location</label>
                      <p className="text-sm">{selectedParticipant.location}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Risk Level</label>
                      <Badge className={getRiskBadgeColor(selectedParticipant.riskLevel)}>
                        {selectedParticipant.riskLevel}
                      </Badge>
                    </div>
                    {selectedParticipant.culturalRequirements && selectedParticipant.culturalRequirements.length > 0 && (
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-600">Cultural Requirements</label>
                        <p className="text-sm">{selectedParticipant.culturalRequirements.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Available Staff */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Available Staff ({getAvailableStaff().length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingStaff ? (
                    <div className="flex justify-center py-4">
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    </div>
                  ) : getAvailableStaff().length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No available staff members found.</p>
                  ) : (
                    <div className="grid gap-4">
                      {getAvailableStaff().map((staffMember) => (
                        <div key={staffMember.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={staffMember.avatar} />
                                <AvatarFallback>
                                  {staffMember.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium">{staffMember.name}</h4>
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                                    {staffMember.reliability}%
                                  </div>
                                </div>
                                <div className="text-sm text-gray-600">
                                  {staffMember.qualifications.join(', ')}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Caseload: {staffMember.currentCaseload}/{staffMember.maxCaseload} | 
                                  Rate: ${staffMember.hourlyRate}/hr
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAllocateStaff(staffMember.id, 'medium')}
                                disabled={allocateStaffMutation.isPending}
                                data-testid={`button-assign-${staffMember.id}`}
                              >
                                {allocateStaffMutation.isPending ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <UserPlus className="h-4 w-4 mr-1" />
                                    Assign
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAllocationDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
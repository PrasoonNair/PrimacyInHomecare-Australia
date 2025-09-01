import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, differenceInBusinessDays, addDays, isWeekend } from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  CheckCircle2,
  XCircle,
  Clock4,
  FileText,
  Download,
  Upload,
  AlertTriangle,
  Users,
  TrendingUp,
  Settings,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  Filter,
  Search,
  Calendar as CalendarDays,
  UserCheck,
  Mail,
  Phone
} from 'lucide-react';

interface LeaveType {
  id: string;
  name: string;
  description: string;
  maxDaysPerYear: number;
  paidLeave: boolean;
  requiresMedicalCertificate: boolean;
  medicalCertificateThreshold: number;
  advanceNoticeRequired: number;
}

interface LeaveBalance {
  id: string;
  leaveType: LeaveType;
  totalEntitlement: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
  carryOverDays: number;
  financialYear: string;
}

interface LeaveRequest {
  id: string;
  staff: {
    id: string;
    firstName: string;
    lastName: string;
    position: string;
    department: string;
  };
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  submittedAt: string;
  currentApprover?: {
    id: string;
    name: string;
    role: string;
  };
  approvalLevel: number;
  handoverNotes?: string;
  coveringStaff?: {
    id: string;
    name: string;
  };
}

const leaveRequestSchema = z.object({
  leaveTypeId: z.string().min(1, "Leave type is required"),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
  halfDayType: z.string().optional(),
  emergencyContact: z.string().optional(),
  handoverNotes: z.string().optional(),
  coveringStaffId: z.string().optional(),
});

export function LeaveManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Fetch leave balances for current user
  const { data: leaveBalances = [] } = useQuery<LeaveBalance[]>({
    queryKey: ['/api/leave/balances'],
    queryFn: () => apiRequest('/api/leave/balances')
  });

  // Fetch leave requests
  const { data: leaveRequests = [] } = useQuery<LeaveRequest[]>({
    queryKey: ['/api/leave/requests', filterStatus],
    queryFn: () => apiRequest(`/api/leave/requests?status=${filterStatus}&search=${searchTerm}`)
  });

  // Fetch leave types
  const { data: leaveTypes = [] } = useQuery<LeaveType[]>({
    queryKey: ['/api/leave/types'],
    queryFn: () => apiRequest('/api/leave/types')
  });

  // Fetch staff for covering assignments
  const { data: staff = [] } = useQuery({
    queryKey: ['/api/staff'],
    queryFn: () => apiRequest('/api/staff')
  });

  // Fetch pending approvals for current user
  const { data: pendingApprovals = [] } = useQuery<LeaveRequest[]>({
    queryKey: ['/api/leave/pending-approvals'],
    queryFn: () => apiRequest('/api/leave/pending-approvals')
  });

  const form = useForm<z.infer<typeof leaveRequestSchema>>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      reason: '',
      halfDayType: '',
      emergencyContact: '',
      handoverNotes: '',
      coveringStaffId: '',
    }
  });

  // Submit leave request mutation
  const submitRequestMutation = useMutation({
    mutationFn: (data: z.infer<typeof leaveRequestSchema>) =>
      apiRequest('/api/leave/requests', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leave/requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/leave/balances'] });
      setShowRequestDialog(false);
      form.reset();
      toast({
        title: "Leave Request Submitted",
        description: "Your leave request has been submitted for approval.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit leave request. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Approve/reject leave mutation
  const approvalMutation = useMutation({
    mutationFn: ({ requestId, action, comments }: { requestId: string; action: 'approve' | 'reject'; comments?: string }) =>
      apiRequest(`/api/leave/requests/${requestId}/approval`, {
        method: 'POST',
        body: JSON.stringify({ action, comments })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leave/requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/leave/pending-approvals'] });
      toast({
        title: "Request Updated",
        description: "Leave request has been processed successfully.",
      });
    }
  });

  const calculateBusinessDays = (startDate: Date, endDate: Date) => {
    return differenceInBusinessDays(endDate, startDate) + 1;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Rejected</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const onSubmit = (data: z.infer<typeof leaveRequestSchema>) => {
    const businessDays = calculateBusinessDays(data.startDate, data.endDate);
    const submitData = {
      ...data,
      totalDays: businessDays,
      startDate: format(data.startDate, 'yyyy-MM-dd'),
      endDate: format(data.endDate, 'yyyy-MM-dd'),
    };
    submitRequestMutation.mutate(submitData as any);
  };

  const handleApproval = (requestId: string, action: 'approve' | 'reject', comments?: string) => {
    approvalMutation.mutate({ requestId, action, comments });
  };

  const filteredRequests = leaveRequests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      request.staff.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.staff.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.leaveType.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6" data-testid="leave-management">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarDays className="h-5 w-5" />
            <span>Leave Management System</span>
            <Badge variant="outline">Hierarchical Approval</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              Request leave, track balances, and manage approvals through the organizational hierarchy
            </p>
            <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
              <DialogTrigger asChild>
                <Button data-testid="request-leave-button">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Request Leave
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Submit Leave Request</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="leaveTypeId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Leave Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="leave-type-select">
                                  <SelectValue placeholder="Select leave type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {leaveTypes.map(type => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.name} ({type.paidLeave ? 'Paid' : 'Unpaid'})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="halfDayType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="duration-select">
                                  <SelectValue placeholder="Full day" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">Full Day</SelectItem>
                                <SelectItem value="morning">Half Day (Morning)</SelectItem>
                                <SelectItem value="afternoon">Half Day (Afternoon)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Start Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                    data-testid="start-date-picker"
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick start date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date < new Date() || date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>End Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                    data-testid="end-date-picker"
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick end date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date < new Date() || date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason for Leave</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field}
                              rows={3}
                              placeholder="Please provide detailed reason for your leave request..."
                              data-testid="reason-textarea"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="coveringStaffId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Covering Staff (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="covering-staff-select">
                                  <SelectValue placeholder="Select covering staff" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {staff.map((member: any) => (
                                  <SelectItem key={member.id} value={member.id}>
                                    {member.firstName} {member.lastName} - {member.position}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="emergencyContact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Emergency Contact (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="Name and phone number"
                                data-testid="emergency-contact-input"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="handoverNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Handover Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field}
                              rows={3}
                              placeholder="Important tasks, deadlines, or information for your absence..."
                              data-testid="handover-notes-textarea"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-4 pt-4">
                      <Button 
                        type="submit" 
                        disabled={submitRequestMutation.isPending}
                        data-testid="submit-request-button"
                      >
                        {submitRequestMutation.isPending ? "Submitting..." : "Submit Request"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowRequestDialog(false)}
                        data-testid="cancel-request-button"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="requests" data-testid="tab-requests">My Requests</TabsTrigger>
          <TabsTrigger value="approvals" data-testid="tab-approvals">Approvals</TabsTrigger>
          <TabsTrigger value="balances" data-testid="tab-balances">Leave Balances</TabsTrigger>
          <TabsTrigger value="calendar" data-testid="tab-calendar">Leave Calendar</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Leave Balance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaveBalances.slice(0, 3).map(balance => (
                    <div key={balance.id} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{balance.leaveType.name}</span>
                      <Badge variant="outline">
                        {balance.remainingDays} days left
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{pendingApprovals.length}</div>
                  <p className="text-sm text-gray-600">Requests awaiting your approval</p>
                  {pendingApprovals.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setActiveTab('approvals')}
                    >
                      Review Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {leaveRequests.slice(0, 3).map(request => (
                    <div key={request.id} className="text-sm">
                      <div className="flex justify-between">
                        <span>{request.leaveType.name}</span>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-gray-500">{format(new Date(request.startDate), 'MMM dd')}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* My Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaveRequests.filter(req => req.staff.id === 'current-user-id').map(request => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{request.leaveType.name}</h4>
                        <p className="text-sm text-gray-600">
                          {format(new Date(request.startDate), 'MMM dd')} - {format(new Date(request.endDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm mb-2">{request.reason}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Submitted: {format(new Date(request.submittedAt), 'MMM dd, yyyy')}</span>
                      <span>{request.totalDays} day(s)</span>
                    </div>
                    {request.currentApprover && (
                      <p className="text-xs text-blue-600 mt-1">
                        Awaiting approval from: {request.currentApprover.name} ({request.currentApprover.role})
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <p className="text-sm text-gray-600">
                Leave requests requiring your approval
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingApprovals.map(request => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">
                          {request.staff.firstName} {request.staff.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {request.staff.position} • {request.staff.department}
                        </p>
                        <p className="text-sm font-medium mt-1">
                          {request.leaveType.name} • {request.totalDays} day(s)
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                        Level {request.approvalLevel} Approval
                      </Badge>
                    </div>
                    
                    <div className="bg-gray-50 rounded p-3 mb-3">
                      <p className="text-sm"><strong>Dates:</strong> {format(new Date(request.startDate), 'MMM dd')} - {format(new Date(request.endDate), 'MMM dd, yyyy')}</p>
                      <p className="text-sm mt-1"><strong>Reason:</strong> {request.reason}</p>
                      {request.handoverNotes && (
                        <p className="text-sm mt-1"><strong>Handover Notes:</strong> {request.handoverNotes}</p>
                      )}
                      {request.coveringStaff && (
                        <p className="text-sm mt-1"><strong>Covering Staff:</strong> {request.coveringStaff.name}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleApproval(request.id, 'approve')}
                        disabled={approvalMutation.isPending}
                        data-testid={`approve-${request.id}`}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleApproval(request.id, 'reject')}
                        disabled={approvalMutation.isPending}
                        data-testid={`reject-${request.id}`}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        data-testid={`view-details-${request.id}`}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
                
                {pendingApprovals.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
                    <p>No pending approvals</p>
                    <p className="text-sm">All leave requests have been processed</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leave Balances Tab */}
        <TabsContent value="balances" className="space-y-6">
          <div className="grid gap-4">
            {leaveBalances.map(balance => (
              <Card key={balance.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{balance.leaveType.name}</span>
                    <Badge variant={balance.remainingDays > 5 ? "default" : "destructive"}>
                      {balance.remainingDays} days remaining
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-600">{balance.leaveType.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Entitlement</p>
                      <p className="text-lg font-semibold">{balance.totalEntitlement} days</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Used</p>
                      <p className="text-lg font-semibold text-red-600">{balance.usedDays} days</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pending</p>
                      <p className="text-lg font-semibold text-yellow-600">{balance.pendingDays} days</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Carry Over</p>
                      <p className="text-lg font-semibold text-blue-600">{balance.carryOverDays} days</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(balance.usedDays / balance.totalEntitlement) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {((balance.usedDays / balance.totalEntitlement) * 100).toFixed(1)}% used
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Leave Calendar Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Leave Calendar</CardTitle>
              <p className="text-sm text-gray-600">
                View upcoming leave across your team and organization
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {leaveRequests
                  .filter(req => req.status === 'approved')
                  .slice(0, 10)
                  .map(request => (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">
                        {request.staff.firstName} {request.staff.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {request.staff.position} • {request.leaveType.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(request.startDate), 'MMM dd')} - {format(new Date(request.endDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {request.totalDays} day(s)
                      </Badge>
                      {request.coveringStaff && (
                        <p className="text-xs text-gray-500 mt-1">
                          Covered by: {request.coveringStaff.name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
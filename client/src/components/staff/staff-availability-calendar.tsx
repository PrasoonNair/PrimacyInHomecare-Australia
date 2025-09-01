import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Filter,
  Download,
  Upload,
  Settings,
  Bell,
  Eye,
  UserCheck,
  UserX,
  CalendarDays,
  RefreshCw
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, parseISO, startOfDay } from 'date-fns';

interface StaffAvailability {
  id: string;
  staffId: string;
  staffName: string;
  employmentType: string; // permanent, casual, contract
  date: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  unavailabilityReason?: string;
  isRecurring: boolean;
  recurringPattern?: string; // weekly, fortnightly, monthly
  submissionPeriod: string; // "2025-01-01_2025-01-14"
  lastSubmitted: string;
  isEditable: boolean;
  createdAt: string;
}

interface AvailabilitySubmission {
  id: string;
  staffId: string;
  staffName: string;
  submissionPeriod: string;
  startDate: string;
  endDate: string;
  submittedAt: string;
  status: string; // pending, submitted, approved, rejected
  totalAvailableHours: number;
  totalUnavailableHours: number;
  mandatorySubmission: boolean;
}

interface ShiftRequirement {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  participantId: string;
  participantName: string;
  serviceType: string;
  requiredSkills: string[];
  staffAssigned?: string;
  status: string; // open, assigned, confirmed, completed
}

export function StaffAvailabilityCalendar() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'week' | 'fortnight' | 'month'>('week');
  const [showUnavailabilityDialog, setShowUnavailabilityDialog] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ date: string; hour: number } | null>(null);
  const [editingAvailability, setEditingAvailability] = useState<StaffAvailability | null>(null);
  const { toast } = useToast();

  // Get current submission period (fortnightly)
  const getCurrentSubmissionPeriod = () => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday start
    
    // Calculate which fortnight we're in
    const daysSinceEpoch = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
    const fortnightNumber = Math.floor(daysSinceEpoch / 14);
    const fortnightStart = new Date((fortnightNumber * 14) * 24 * 60 * 60 * 1000);
    const fortnightEnd = addDays(fortnightStart, 13);
    
    return {
      start: fortnightStart,
      end: fortnightEnd,
      period: `${format(fortnightStart, 'yyyy-MM-dd')}_${format(fortnightEnd, 'yyyy-MM-dd')}`
    };
  };

  const currentPeriod = getCurrentSubmissionPeriod();

  // Fetch staff list
  const { data: staff = [] } = useQuery({
    queryKey: ['/api/staff'],
    queryFn: () => apiRequest('/api/staff')
  });

  // Fetch staff availability
  const { data: availability = [] } = useQuery<StaffAvailability[]>({
    queryKey: ['/api/staff-availability', selectedStaff, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: () => apiRequest(`/api/staff-availability?staffId=${selectedStaff}&date=${format(selectedDate, 'yyyy-MM-dd')}`)
  });

  // Fetch availability submissions
  const { data: submissions = [] } = useQuery<AvailabilitySubmission[]>({
    queryKey: ['/api/staff-availability/submissions', currentPeriod.period],
    queryFn: () => apiRequest(`/api/staff-availability/submissions?period=${currentPeriod.period}`)
  });

  // Fetch shift requirements
  const { data: shiftRequirements = [] } = useQuery<ShiftRequirement[]>({
    queryKey: ['/api/shift-requirements', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: () => apiRequest(`/api/shift-requirements?date=${format(selectedDate, 'yyyy-MM-dd')}`)
  });

  // Create/update availability mutation
  const updateAvailabilityMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest('/api/staff-availability', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff-availability'] });
      setShowUnavailabilityDialog(false);
      setEditingAvailability(null);
      toast({
        title: "Availability Updated",
        description: "Staff availability has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update availability.",
        variant: "destructive"
      });
    }
  });

  // Submit fortnightly availability mutation
  const submitFortnightlyMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest('/api/staff-availability/submit-fortnight', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff-availability'] });
      queryClient.invalidateQueries({ queryKey: ['/api/staff-availability/submissions'] });
      toast({
        title: "Fortnightly Availability Submitted",
        description: "Your availability for the next fortnight has been submitted successfully.",
      });
    }
  });

  // Bulk assign staff to shifts mutation
  const bulkAssignMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest('/api/staff-availability/bulk-assign', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shift-requirements'] });
      toast({
        title: "Staff Assigned",
        description: "Staff have been assigned to shifts based on availability.",
      });
    }
  });

  // Get calendar view dates
  const getCalendarDates = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    switch (viewMode) {
      case 'week':
        return eachDayOfInterval({ start, end: addDays(start, 6) });
      case 'fortnight':
        return eachDayOfInterval({ start, end: addDays(start, 13) });
      case 'month':
        return eachDayOfInterval({ 
          start: startOfWeek(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1), { weekStartsOn: 1 }), 
          end: endOfWeek(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0), { weekStartsOn: 1 }) 
        });
      default:
        return eachDayOfInterval({ start, end: addDays(start, 6) });
    }
  };

  const calendarDates = getCalendarDates();

  // Get availability for specific date and time
  const getAvailabilityForSlot = (date: Date, hour: number) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availability.filter(a => 
      a.date === dateStr && 
      hour >= parseInt(a.startTime.split(':')[0]) && 
      hour < parseInt(a.endTime.split(':')[0])
    );
  };

  // Get shift requirements for specific date and time
  const getShiftsForSlot = (date: Date, hour: number) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return shiftRequirements.filter(s => 
      s.date === dateStr && 
      hour >= parseInt(s.startTime.split(':')[0]) && 
      hour < parseInt(s.endTime.split(':')[0])
    );
  };

  // Filter staff by employment type
  const casualStaff = staff.filter((s: any) => s.employmentType === 'casual');
  const permanentStaff = staff.filter((s: any) => s.employmentType === 'permanent');

  // Check if staff has submitted this fortnight
  const hasSubmittedThisFortnight = (staffId: string) => {
    return submissions.some((s: any) => s.staffId === staffId && s.submissionPeriod === currentPeriod.period);
  };

  // Time slots for calendar (6 AM to 10 PM)
  const timeSlots = Array.from({ length: 16 }, (_, i) => i + 6);

  const getStaffAvailabilityColor = (availability: StaffAvailability[]) => {
    if (availability.length === 0) return 'bg-gray-100';
    const available = availability.filter(a => a.isAvailable).length;
    const total = availability.length;
    if (available === total) return 'bg-green-200 text-green-800';
    if (available > 0) return 'bg-yellow-200 text-yellow-800';
    return 'bg-red-200 text-red-800';
  };

  const getShiftStatusColor = (shifts: ShiftRequirement[]) => {
    if (shifts.length === 0) return '';
    const assigned = shifts.filter(s => s.status === 'assigned' || s.status === 'confirmed').length;
    const total = shifts.length;
    if (assigned === total) return 'border-l-4 border-l-green-500';
    if (assigned > 0) return 'border-l-4 border-l-yellow-500';
    return 'border-l-4 border-l-red-500';
  };

  return (
    <div className="space-y-6" data-testid="staff-availability-calendar">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5" />
            <span>Staff Availability Calendar</span>
            <Badge variant="outline">Fortnightly Submissions</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Bell className="h-4 w-4" />
            <AlertDescription>
              <strong>Casual Staff:</strong> You must submit your availability every fortnight. 
              Current submission period: {format(currentPeriod.start, 'MMM dd')} - {format(currentPeriod.end, 'MMM dd, yyyy')}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calendar" data-testid="tab-calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="submissions" data-testid="tab-submissions">Submissions</TabsTrigger>
          <TabsTrigger value="assignments" data-testid="tab-assignments">Shift Assignments</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Calendar View Tab */}
        <TabsContent value="calendar" className="space-y-6">
          {/* Controls */}
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center space-x-4">
              <div>
                <Label htmlFor="staff-filter">Filter by Staff</Label>
                <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                  <SelectTrigger className="w-48" data-testid="staff-filter">
                    <SelectValue placeholder="All Staff" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Staff</SelectItem>
                    <SelectItem value="casual">Casual Staff Only</SelectItem>
                    <SelectItem value="permanent">Permanent Staff Only</SelectItem>
                    {staff.map((member: any) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.firstName} {member.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="view-mode">View Mode</Label>
                <Select value={viewMode} onValueChange={(value: 'week' | 'fortnight' | 'month') => setViewMode(value)}>
                  <SelectTrigger className="w-32" data-testid="view-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="fortnight">Fortnight</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                data-testid="previous-period"
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedDate(new Date())}
                data-testid="today"
              >
                Today
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                data-testid="next-period"
              >
                Next
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <Card>
            <CardHeader>
              <CardTitle>
                {format(calendarDates[0], 'MMM dd')} - {format(calendarDates[calendarDates.length - 1], 'MMM dd, yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-8 gap-1 min-w-[800px]">
                  {/* Header row */}
                  <div className="p-2 font-medium text-center">Time</div>
                  {calendarDates.map(date => (
                    <div key={date.toISOString()} className="p-2 font-medium text-center">
                      <div className={`${isToday(date) ? 'text-blue-600 font-bold' : ''}`}>
                        {format(date, 'EEE dd')}
                      </div>
                    </div>
                  ))}

                  {/* Time slots */}
                  {timeSlots.map(hour => (
                    <React.Fragment key={hour}>
                      <div className="p-2 text-sm text-gray-600 text-center border-r">
                        {String(hour).padStart(2, '0')}:00
                      </div>
                      {calendarDates.map(date => {
                        const availability = getAvailabilityForSlot(date, hour);
                        const shifts = getShiftsForSlot(date, hour);
                        const colorClass = getStaffAvailabilityColor(availability);
                        const borderClass = getShiftStatusColor(shifts);
                        
                        return (
                          <div
                            key={`${date.toISOString()}-${hour}`}
                            className={`p-1 min-h-[60px] cursor-pointer border hover:shadow-md transition-all ${colorClass} ${borderClass}`}
                            onClick={() => {
                              setSelectedTimeSlot({ date: format(date, 'yyyy-MM-dd'), hour });
                              setShowUnavailabilityDialog(true);
                            }}
                            data-testid={`time-slot-${format(date, 'yyyy-MM-dd')}-${hour}`}
                          >
                            {/* Available staff count */}
                            {availability.length > 0 && (
                              <div className="text-xs mb-1">
                                <UserCheck className="h-3 w-3 inline mr-1" />
                                {availability.filter(a => a.isAvailable).length}/{availability.length}
                              </div>
                            )}
                            
                            {/* Shift requirements */}
                            {shifts.length > 0 && (
                              <div className="text-xs">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {shifts.length} shifts
                              </div>
                            )}

                            {/* Unavailable staff */}
                            {availability.some(a => !a.isAvailable) && (
                              <div className="text-xs text-red-600">
                                <UserX className="h-3 w-3 inline mr-1" />
                                {availability.filter(a => !a.isAvailable).length} unavailable
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle>Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-200 border"></div>
                  <span>Fully Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-200 border"></div>
                  <span>Partially Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-200 border"></div>
                  <span>Unavailable</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-100 border"></div>
                  <span>No Data</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-l-4 border-l-green-500 bg-white"></div>
                  <span>Shifts Assigned</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-l-4 border-l-yellow-500 bg-white"></div>
                  <span>Shifts Partially Assigned</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-l-4 border-l-red-500 bg-white"></div>
                  <span>Shifts Unassigned</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Fortnightly Availability Submissions</h2>
            <Button 
              onClick={() => submitFortnightlyMutation.mutate({ 
                staffId: 'current-user', 
                period: currentPeriod.period 
              })}
              disabled={submitFortnightlyMutation.isPending}
              data-testid="submit-availability"
            >
              <Upload className="h-4 w-4 mr-2" />
              Submit This Fortnight
            </Button>
          </div>

          {/* Current Period Status */}
          <Card>
            <CardHeader>
              <CardTitle>Current Submission Period</CardTitle>
              <div className="text-sm text-gray-600">
                {format(currentPeriod.start, 'EEEE, MMMM dd')} - {format(currentPeriod.end, 'EEEE, MMMM dd, yyyy')}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {submissions.filter(s => s.status === 'submitted').length}
                  </div>
                  <p className="text-sm text-gray-600">Submitted</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {submissions.filter(s => s.status === 'pending').length}
                  </div>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {casualStaff.length - submissions.length}
                  </div>
                  <p className="text-sm text-gray-600">Not Submitted</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submission List */}
          <div className="grid gap-4">
            {/* Missing submissions first */}
            {casualStaff
              .filter((staff: any) => !hasSubmittedThisFortnight(staff.id))
              .map((staff: any) => (
                <Card key={`missing-${staff.id}`} className="border-l-4 border-l-red-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-red-800">{staff.firstName} {staff.lastName}</h4>
                        <p className="text-sm text-red-600">Availability not submitted - {staff.employmentType}</p>
                      </div>
                      <Badge variant="destructive">
                        Overdue
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}

            {/* Submitted submissions */}
            {submissions.map(submission => (
              <Card key={submission.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{submission.staffName}</h4>
                      <p className="text-sm text-gray-600">
                        Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                      <div className="mt-2 text-sm">
                        <span className="text-green-600">Available: {submission.totalAvailableHours}h</span>
                        <span className="mx-2">•</span>
                        <span className="text-red-600">Unavailable: {submission.totalUnavailableHours}h</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant={
                        submission.status === 'submitted' ? 'default' :
                        submission.status === 'approved' ? 'default' :
                        submission.status === 'rejected' ? 'destructive' : 'secondary'
                      }>
                        {submission.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Shift Assignments Tab */}
        <TabsContent value="assignments" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Shift Assignments Based on Availability</h2>
            <Button 
              onClick={() => bulkAssignMutation.mutate({ 
                period: currentPeriod.period,
                autoAssign: true
              })}
              disabled={bulkAssignMutation.isPending}
              data-testid="auto-assign"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Auto-Assign Available Staff
            </Button>
          </div>

          {/* Unassigned Shifts */}
          <Card>
            <CardHeader>
              <CardTitle>Unassigned Shifts Requiring Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shiftRequirements
                  .filter(shift => !shift.staffAssigned)
                  .map(shift => {
                    const availableStaff = availability.filter(a => 
                      a.date === shift.date && 
                      a.isAvailable &&
                      parseInt(a.startTime.split(':')[0]) <= parseInt(shift.startTime.split(':')[0]) &&
                      parseInt(a.endTime.split(':')[0]) >= parseInt(shift.endTime.split(':')[0])
                    );

                    return (
                      <div key={shift.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{shift.participantName}</h4>
                            <p className="text-sm text-gray-600">
                              {shift.serviceType} • {new Date(shift.date).toLocaleDateString()} • {shift.startTime} - {shift.endTime}
                            </p>
                            {shift.requiredSkills.length > 0 && (
                              <div className="mt-2">
                                <span className="text-xs text-gray-500">Required skills:</span>
                                <div className="flex space-x-1 mt-1">
                                  {shift.requiredSkills.map(skill => (
                                    <Badge key={skill} variant="outline" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <Badge variant={availableStaff.length > 0 ? "default" : "destructive"}>
                              {availableStaff.length} Available
                            </Badge>
                          </div>
                        </div>
                        
                        {availableStaff.length > 0 && (
                          <div className="mt-3">
                            <span className="text-sm font-medium">Available Staff:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {availableStaff.map(staff => (
                                <Button
                                  key={staff.id}
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    // Assign staff to shift
                                    bulkAssignMutation.mutate({
                                      shiftId: shift.id,
                                      staffId: staff.staffId
                                    });
                                  }}
                                >
                                  Assign {staff.staffName}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <h2 className="text-2xl font-semibold">Availability Analytics</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Staff Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Average Availability</span>
                    <span className="font-medium">73%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Peak Hours (9AM-3PM)</span>
                    <span className="font-medium">89%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Evening Hours (5PM-9PM)</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weekend Availability</span>
                    <span className="font-medium">32%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Submission Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>On-Time Submissions</span>
                    <span className="font-medium text-green-600">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Late Submissions</span>
                    <span className="font-medium text-yellow-600">10%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Missing Submissions</span>
                    <span className="font-medium text-red-600">5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Casual Staff Compliance</span>
                    <span className="font-medium">90%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shift Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Fully Covered Shifts</span>
                    <span className="font-medium text-green-600">78%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Partially Covered</span>
                    <span className="font-medium text-yellow-600">15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uncovered Shifts</span>
                    <span className="font-medium text-red-600">7%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Auto-Assignment Rate</span>
                    <span className="font-medium">92%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Availability/Unavailability Dialog */}
      {showUnavailabilityDialog && selectedTimeSlot && (
        <Dialog open={showUnavailabilityDialog} onOpenChange={setShowUnavailabilityDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Manage Availability - {selectedTimeSlot.date} at {selectedTimeSlot.hour}:00
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="staff-select">Staff Member</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((member: any) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.firstName} {member.lastName} ({member.employmentType})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input type="time" defaultValue={`${String(selectedTimeSlot.hour).padStart(2, '0')}:00`} />
                </div>
                <div>
                  <Label htmlFor="end-time">End Time</Label>
                  <Input type="time" defaultValue={`${String(selectedTimeSlot.hour + 1).padStart(2, '0')}:00`} />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="is-available" />
                <Label htmlFor="is-available">Staff member is available during this time</Label>
              </div>

              <div>
                <Label htmlFor="unavailability-reason">Reason for unavailability (if applicable)</Label>
                <Textarea 
                  id="unavailability-reason" 
                  placeholder="e.g., Medical appointment, personal commitment, etc."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="is-recurring" />
                <Label htmlFor="is-recurring">Apply to recurring schedule (weekly/fortnightly)</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowUnavailabilityDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => updateAvailabilityMutation.mutate({
                    date: selectedTimeSlot.date,
                    hour: selectedTimeSlot.hour,
                    // Additional form data would be collected here
                  })}
                  disabled={updateAvailabilityMutation.isPending}
                >
                  Save Availability
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertShiftCaseNoteSchema } from "@shared/schema";
import { z } from "zod";
import { 
  Clock, 
  MapPin, 
  User, 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  Calendar,
  Filter,
  Timer,
  UserCheck,
  Clipboard,
  CalendarDays
} from "lucide-react";
import { StaffAvailabilityCalendar } from "@/components/staff/staff-availability-calendar";

interface Shift {
  id: string;
  participantId: string;
  participantName: string;
  assignedStaffId: string;
  staffName: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  location: string;
  participantAddress: string;
  status: string;
  clockInTime: string | null;
  clockOutTime: string | null;
  actualDuration: number | null;
  hourlyRate: number;
  totalAmount: number;
  caseNoteCompleted: boolean;
  billingStatus: string;
  ndisSupportItemNumber: string;
}

interface ShiftCaseNote {
  id: string;
  shiftId: string;
  goalProgress: string;
  activitiesCompleted: string;
  supportProvided: string;
  participantMood: string;
  participantEngagement: string;
  outcomes: string;
  nextSteps: string;
  participantFeedback: string;
  qualityRating: number;
}

const caseNoteSchema = insertShiftCaseNoteSchema.extend({
  goalProgress: z.string().min(1, "Goal progress is required"),
  activitiesCompleted: z.string().min(1, "Activities completed is required"),
  supportProvided: z.string().min(1, "Support provided is required"),
  outcomes: z.string().min(1, "Outcomes is required"),
});

export default function ShiftManagementPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("shifts");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [showCaseNoteDialog, setShowCaseNoteDialog] = useState(false);

  // Fetch shifts
  const { data: shifts = [] } = useQuery<Shift[]>({
    queryKey: ["/api/shifts"]
  });

  // Filter shifts based on status
  const filteredShifts = shifts.filter(shift => {
    if (statusFilter === "all") return true;
    return shift.status === statusFilter;
  });

  const clockInMutation = useMutation({
    mutationFn: (shiftId: string) => 
      apiRequest(`/api/shifts/${shiftId}/clock-in`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
      toast({ title: "Clocked in successfully" });
    },
    onError: () => {
      toast({ 
        title: "Failed to clock in", 
        description: "Please try again",
        variant: "destructive" 
      });
    }
  });

  const clockOutMutation = useMutation({
    mutationFn: (shiftId: string) => 
      apiRequest(`/api/shifts/${shiftId}/clock-out`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
      toast({ title: "Clocked out successfully" });
    },
    onError: () => {
      toast({ 
        title: "Failed to clock out", 
        description: "Please try again",
        variant: "destructive" 
      });
    }
  });

  const caseNoteForm = useForm<z.infer<typeof caseNoteSchema>>({
    resolver: zodResolver(caseNoteSchema),
    defaultValues: {
      shiftId: "",
      participantId: "",
      staffId: "",
      goalProgress: "",
      activitiesCompleted: "",
      supportProvided: "",
      participantMood: "good",
      participantEngagement: "high",
      outcomes: "",
      nextSteps: "",
      participantFeedback: "",
      qualityRating: 5,
      medicationGiven: false,
      incidentOccurred: false,
      supervisorReviewed: false
    }
  });

  const createCaseNoteMutation = useMutation({
    mutationFn: (data: z.infer<typeof caseNoteSchema>) => 
      apiRequest("/api/shift-case-notes", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shift-case-notes"] });
      setShowCaseNoteDialog(false);
      caseNoteForm.reset();
      toast({ title: "Case note completed successfully" });
    },
    onError: () => {
      toast({ 
        title: "Failed to create case note", 
        description: "Please check all fields and try again",
        variant: "destructive" 
      });
    }
  });

  const handleClockIn = (shiftId: string) => {
    clockInMutation.mutate(shiftId);
  };

  const handleClockOut = (shiftId: string) => {
    clockOutMutation.mutate(shiftId);
  };

  const handleCreateCaseNote = (shift: Shift) => {
    setSelectedShift(shift);
    caseNoteForm.setValue("shiftId", shift.id);
    caseNoteForm.setValue("participantId", shift.participantId);
    caseNoteForm.setValue("staffId", shift.assignedStaffId);
    setShowCaseNoteDialog(true);
  };

  const onSubmitCaseNote = (data: z.infer<typeof caseNoteSchema>) => {
    createCaseNoteMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Scheduled</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">In Progress</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700">Completed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getBillingStatusBadge = (billingStatus: string, caseNoteCompleted: boolean) => {
    if (!caseNoteCompleted) {
      return <Badge variant="outline" className="bg-orange-50 text-orange-700">Case Note Pending</Badge>;
    }
    
    switch (billingStatus) {
      case "pending":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Billing Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700">Approved</Badge>;
      case "invoiced":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700">Invoiced</Badge>;
      case "paid":
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700">Paid</Badge>;
      default:
        return <Badge variant="outline">{billingStatus}</Badge>;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">NDIS Shift Management</h1>
        <p className="text-gray-600">
          Track shifts, manage staff availability, and optimize scheduling
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="shifts">Shift Schedule</TabsTrigger>
          <TabsTrigger value="availability">Staff Availability</TabsTrigger>
          <TabsTrigger value="assignments">Auto-Assignments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Shifts Tab */}
        <TabsContent value="shifts" className="space-y-6">

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="select-status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shifts</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shifts List */}
      <div className="grid gap-4">
        {filteredShifts.map((shift) => (
          <Card key={shift.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {shift.participantName}
                  </h3>
                  <p className="text-gray-600">Staff: {shift.staffName}</p>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(shift.status)}
                  {getBillingStatusBadge(shift.billingStatus, shift.caseNoteCompleted)}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{shift.shiftDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{shift.startTime} - {shift.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{formatDuration(shift.duration)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">${shift.totalAmount}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{shift.participantAddress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">NDIS Item: {shift.ndisSupportItemNumber}</span>
                </div>
              </div>

              {/* Clock Status */}
              <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  <span className="text-sm font-medium">Clock Status:</span>
                </div>
                {shift.clockInTime ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">In: {new Date(shift.clockInTime).toLocaleTimeString()}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-500">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Not clocked in</span>
                  </div>
                )}
                {shift.clockOutTime ? (
                  <div className="flex items-center gap-2 text-blue-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Out: {new Date(shift.clockOutTime).toLocaleTimeString()}</span>
                  </div>
                ) : shift.clockInTime ? (
                  <div className="flex items-center gap-2 text-yellow-600">
                    <Timer className="h-4 w-4" />
                    <span className="text-sm">Still working</span>
                  </div>
                ) : null}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {!shift.clockInTime && shift.status === "scheduled" && (
                  <Button 
                    onClick={() => handleClockIn(shift.id)}
                    disabled={clockInMutation.isPending}
                    size="sm"
                    data-testid={`button-clock-in-${shift.id}`}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Clock In
                  </Button>
                )}
                
                {shift.clockInTime && !shift.clockOutTime && (
                  <Button 
                    onClick={() => handleClockOut(shift.id)}
                    disabled={clockOutMutation.isPending}
                    variant="outline"
                    size="sm"
                    data-testid={`button-clock-out-${shift.id}`}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Clock Out
                  </Button>
                )}

                {shift.clockOutTime && !shift.caseNoteCompleted && (
                  <Button 
                    onClick={() => handleCreateCaseNote(shift)}
                    size="sm"
                    data-testid={`button-case-note-${shift.id}`}
                  >
                    <Clipboard className="h-4 w-4 mr-2" />
                    Complete Case Note
                  </Button>
                )}

                {shift.caseNoteCompleted && (
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Case Note Complete
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Case Note Dialog */}
      <Dialog open={showCaseNoteDialog} onOpenChange={setShowCaseNoteDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Case Note</DialogTitle>
            <DialogDescription>
              Document the shift activities and outcomes for NDIS compliance
            </DialogDescription>
          </DialogHeader>

          <Form {...caseNoteForm}>
            <form onSubmit={caseNoteForm.handleSubmit(onSubmitCaseNote)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={caseNoteForm.control}
                  name="goalProgress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Progress</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          value={field.value || ""}
                          rows={3}
                          placeholder="Describe progress towards participant goals..."
                          data-testid="input-goal-progress"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={caseNoteForm.control}
                  name="activitiesCompleted"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activities Completed</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          value={field.value || ""}
                          rows={3}
                          placeholder="List all activities completed during shift..."
                          data-testid="input-activities"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={caseNoteForm.control}
                name="supportProvided"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Support Provided</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        value={field.value || ""}
                        rows={3}
                        placeholder="Detail the support provided to the participant..."
                        data-testid="input-support"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={caseNoteForm.control}
                  name="participantMood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Participant Mood</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-mood">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={caseNoteForm.control}
                  name="participantEngagement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Participant Engagement</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-engagement">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={caseNoteForm.control}
                  name="outcomes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Outcomes</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          value={field.value || ""}
                          rows={3}
                          placeholder="Describe the outcomes achieved..."
                          data-testid="input-outcomes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={caseNoteForm.control}
                  name="nextSteps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Steps</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          value={field.value || ""}
                          rows={3}
                          placeholder="Plan for next session..."
                          data-testid="input-next-steps"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={caseNoteForm.control}
                name="participantFeedback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Participant Feedback</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        value={field.value || ""}
                        rows={2}
                        placeholder="Any feedback from the participant..."
                        data-testid="input-feedback"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={createCaseNoteMutation.isPending}
                  data-testid="button-submit-case-note"
                >
                  {createCaseNoteMutation.isPending ? "Saving..." : "Complete Case Note"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCaseNoteDialog(false)}
                  data-testid="button-cancel-case-note"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
        </TabsContent>

        {/* Staff Availability Tab */}
        <TabsContent value="availability" className="space-y-6">
          <StaffAvailabilityCalendar />
        </TabsContent>

        {/* Auto-Assignments Tab */}
        <TabsContent value="assignments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Auto-Assignment Engine
              </CardTitle>
              <CardDescription>
                Intelligent staff assignment based on availability, skills, and proximity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Auto-assignment features are integrated with the Staff Availability Calendar. 
                Use the "Auto-Assign Available Staff" button in the Availability tab to automatically 
                assign staff to open shifts based on their submitted availability.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Availability Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">92%</div>
                <p className="text-sm text-gray-600">Staff submitting on time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Auto-Assignment Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">78%</div>
                <p className="text-sm text-gray-600">Shifts auto-assigned</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Coverage Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">95%</div>
                <p className="text-sm text-gray-600">Shifts with staff assigned</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Availability Management Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Submission Deadlines</h4>
                  <p className="text-sm text-gray-600">
                    Casual staff must submit availability by Friday 5 PM for the following fortnight.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Auto-Assignment</h4>
                  <p className="text-sm text-gray-600">
                    Automatic staff assignment runs every Monday at 9 AM for the upcoming week.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Reminder Schedule</h4>
                  <p className="text-sm text-gray-600">
                    Reminders sent on Tuesday, Thursday, and Friday if availability not submitted.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
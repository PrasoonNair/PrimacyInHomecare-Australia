import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { 
  Users, 
  MapPin, 
  Clock, 
  UserCheck, 
  AlertCircle, 
  Calendar,
  Navigation,
  Star,
  TrendingUp,
  CheckCircle,
  XCircle,
  Phone,
  User
} from "lucide-react";

interface StaffScore {
  staffId: string;
  staffName: string;
  distanceKm: number;
  totalScore: number;
  rank: number;
  scores: {
    distance: number;
    skills: number;
    preference: number;
    continuity: number;
    reliability: number;
    cost: number;
  };
}

export default function ServiceDeliveryDashboard() {
  const { toast } = useToast();
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [showAllocationDialog, setShowAllocationDialog] = useState(false);
  const [showClockInDialog, setShowClockInDialog] = useState(false);

  // Fetch allocation dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/service-delivery/dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/service-delivery/dashboard");
      if (!response.ok) throw new Error("Failed to fetch dashboard data");
      return response.json();
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch staff scores for selected shift
  const { data: staffScores } = useQuery({
    queryKey: ["/api/service-delivery/allocation-scores", selectedShift?.id],
    enabled: !!selectedShift?.id,
    queryFn: async () => {
      const response = await fetch(`/api/service-delivery/allocation-scores/${selectedShift.id}`);
      if (!response.ok) throw new Error("Failed to fetch staff scores");
      return response.json();
    }
  });

  // Auto-allocate mutation
  const autoAllocateMutation = useMutation({
    mutationFn: async (shiftId: string) => {
      const response = await fetch(`/api/service-delivery/shifts/${shiftId}/allocate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Failed to allocate staff");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Staff Allocated",
        description: `Successfully sent offers to ${data.offerssSent} staff members`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/service-delivery"] });
      setShowAllocationDialog(false);
    }
  });

  // Clock-in mutation
  const clockInMutation = useMutation({
    mutationFn: async (data: { shiftId: string; staffId: string; location: any }) => {
      const response = await fetch("/api/service-delivery/clock-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to clock in");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.geoFenceViolation) {
        toast({
          title: "Clock-In Recorded",
          description: "Warning: Outside geo-fence area",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Clock-In Successful",
          description: "Staff member has clocked in successfully"
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/service-delivery"] });
    }
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Service Delivery Dashboard</h1>
          <p className="text-muted-foreground">Smart allocation, shift management, and workforce optimization</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            View Roster
          </Button>
          <Button>
            <Users className="mr-2 h-4 w-4" />
            Allocate Shifts
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fill Rate</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.stats?.fillRate || 0}%
            </div>
            <Progress value={dashboardData?.stats?.fillRate || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unallocated Shifts</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.unallocatedCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg time to fill: {dashboardData?.stats?.averageTimeToFill || 0} hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.stats?.staffUtilization || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Billable hours today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.inProgressShifts?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active shifts right now
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="allocation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="allocation">Smart Allocation</TabsTrigger>
          <TabsTrigger value="live-board">Live Shift Board</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="unavailability">Unavailability</TabsTrigger>
        </TabsList>

        <TabsContent value="allocation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Unallocated Shifts</CardTitle>
              <CardDescription>Click on a shift to view staff recommendations and allocate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.unallocatedShifts?.map((shift: any) => (
                  <div
                    key={shift.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => {
                      setSelectedShift(shift);
                      setShowAllocationDialog(true);
                    }}
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{shift.participantName}</p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {shift.shiftDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {shift.startTime} - {shift.endTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {shift.location}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {shift.isUrgent && (
                        <Badge variant="destructive">Urgent</Badge>
                      )}
                      <Button size="sm">Allocate</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live-board" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* In Progress Shifts */}
            <Card>
              <CardHeader>
                <CardTitle>In Progress</CardTitle>
                <CardDescription>{dashboardData?.inProgressShifts?.length || 0} active shifts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData?.inProgressShifts?.map((shift: any) => (
                    <div key={shift.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium text-sm">{shift.staffName}</p>
                        <p className="text-sm text-muted-foreground">{shift.participantName}</p>
                        <p className="text-xs text-green-600">Clocked in: {shift.clockInTime}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Phone className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Shifts */}
            <Card>
              <CardHeader>
                <CardTitle>Starting Soon</CardTitle>
                <CardDescription>Next 2 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData?.upcomingShifts?.map((shift: any) => (
                    <div key={shift.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium text-sm">{shift.staffName || 'Unallocated'}</p>
                        <p className="text-sm text-muted-foreground">{shift.participantName}</p>
                        <p className="text-xs">Starts: {shift.startTime}</p>
                      </div>
                      <Badge variant={shift.status === 'confirmed' ? 'default' : 'secondary'}>
                        {shift.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Attendance</CardTitle>
              <CardDescription>Clock-in/out tracking with geo-fence compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-green-600">87%</p>
                    <p className="text-sm text-muted-foreground">On-time arrivals</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">124</p>
                    <p className="text-sm text-muted-foreground">Shifts today</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-yellow-600">3</p>
                    <p className="text-sm text-muted-foreground">Geo-fence alerts</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-red-600">2</p>
                    <p className="text-sm text-muted-foreground">No-shows</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unavailability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fortnightly Unavailability</CardTitle>
              <CardDescription>Submission deadline: Friday 5pm</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                  <div>
                    <p className="font-medium">Current Period: Week 5-6</p>
                    <p className="text-sm text-muted-foreground">42 staff submitted, 15 pending</p>
                  </div>
                  <Button>Send Reminders</Button>
                </div>
                <Progress value={74} className="h-3" />
                <p className="text-sm text-center text-muted-foreground">74% submission rate</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Allocation Dialog */}
      <Dialog open={showAllocationDialog} onOpenChange={setShowAllocationDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Smart Staff Allocation</DialogTitle>
            <DialogDescription>
              Shift: {selectedShift?.participantName} - {selectedShift?.shiftDate} {selectedShift?.startTime}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Allocation Criteria */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Distance</label>
                <Select defaultValue="30">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 km</SelectItem>
                    <SelectItem value="20">20 km</SelectItem>
                    <SelectItem value="30">30 km</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select defaultValue="balanced">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="continuity">Continuity</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Required Skills</label>
                <Badge>Medication Support</Badge>
              </div>
            </div>

            {/* Staff Recommendations */}
            <div className="border rounded-lg">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-3">Rank</th>
                    <th className="text-left p-3">Staff Member</th>
                    <th className="text-left p-3">Distance</th>
                    <th className="text-left p-3">Score</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staffScores?.slice(0, 5).map((score: StaffScore) => (
                    <tr key={score.staffId} className="border-b">
                      <td className="p-3">
                        <Badge variant="outline">#{score.rank}</Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {score.staffName}
                        </div>
                        <div className="flex gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.round(score.scores.reliability / 20)
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Navigation className="h-3 w-3" />
                          {score.distanceKm.toFixed(1)} km
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <Progress value={score.totalScore} className="h-2" />
                          <p className="text-xs text-muted-foreground">{score.totalScore}/100</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <Button size="sm" variant="outline">Offer</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAllocationDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedShift && autoAllocateMutation.mutate(selectedShift.id)}
              disabled={autoAllocateMutation.isPending}
            >
              Auto-Allocate Top 3
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
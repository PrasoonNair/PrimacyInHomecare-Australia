import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertShiftSchema, insertStaffAvailabilitySchema, type Shift, type StaffAvailability, type Staff, type Participant } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { 
  CalendarIcon, ClockIcon, UserCheckIcon, AlertCircleIcon, MapPinIcon, UsersIcon,
  TrendingUp, Filter, Download, MoreVertical, Search, Plus, Eye, Edit, Trash2,
  Users, Activity, Target, CheckCircle2, AlertTriangle, Clock, DollarSign
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { format } from "date-fns";

// Sample data for analytics - In real app, this would come from your API
const staffUtilizationData = [
  { name: 'Mon', scheduled: 85, actual: 82, capacity: 100 },
  { name: 'Tue', scheduled: 92, actual: 89, capacity: 100 },
  { name: 'Wed', scheduled: 78, actual: 75, capacity: 100 },
  { name: 'Thu', scheduled: 95, actual: 91, capacity: 100 },
  { name: 'Fri', scheduled: 88, actual: 86, capacity: 100 },
  { name: 'Sat', scheduled: 65, actual: 63, capacity: 100 },
  { name: 'Sun', scheduled: 45, actual: 42, capacity: 100 },
];

const serviceTypeDistribution = [
  { type: 'Personal Care', value: 35, color: '#3b82f6' },
  { type: 'Community Access', value: 25, color: '#10b981' },
  { type: 'Daily Living Skills', value: 20, color: '#f59e0b' },
  { type: 'Transport', value: 12, color: '#8b5cf6' },
  { type: 'Other', value: 8, color: '#ef4444' },
];

export default function ServiceDelivery() {
  const [activeTab, setActiveTab] = useState("overview");
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [availabilityDialogOpen, setAvailabilityDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Authentication check
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: shifts = [], isLoading: shiftsLoading } = useQuery<Shift[]>({
    queryKey: ["/api/shifts"],
    enabled: isAuthenticated,
  });

  const { data: availability = [], isLoading: availabilityLoading } = useQuery<StaffAvailability[]>({
    queryKey: ["/api/staff-availability"],
    enabled: isAuthenticated,
  });

  const { data: staff = [] } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
    enabled: isAuthenticated,
  });

  const { data: participants = [] } = useQuery<Participant[]>({
    queryKey: ["/api/participants"],
    enabled: isAuthenticated,
  });

  const shiftForm = useForm({
    resolver: zodResolver(insertShiftSchema),
    defaultValues: {
      shiftType: "regular",
      status: "scheduled",
      isUrgent: false,
    },
  });

  const availabilityForm = useForm({
    resolver: zodResolver(insertStaffAvailabilitySchema),
    defaultValues: {
      isAvailable: true,
      maxHoursPerDay: 8,
    },
  });

  const createShiftMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create shift");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
      setShiftDialogOpen(false);
      shiftForm.reset();
      toast({
        title: "Success",
        description: "Shift created successfully",
      });
    },
  });

  const createAvailabilityMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/staff-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create availability record");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff-availability"] });
      setAvailabilityDialogOpen(false);
      availabilityForm.reset();
      toast({
        title: "Success",
        description: "Availability record created successfully",
      });
    },
  });

  const getShiftStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "in_progress": return "secondary";
      case "confirmed": return "outline";
      case "scheduled": return "outline";
      case "cancelled": return "destructive";
      case "no_show": return "destructive";
      default: return "outline";
    }
  };

  const getShiftTypeColor = (type: string) => {
    switch (type) {
      case "emergency": return "destructive";
      case "cover": return "secondary";
      case "overnight": return "outline";
      case "regular": return "default";
      default: return "outline";
    }
  };

  const getDayName = (dayNumber: number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[dayNumber] || "Unknown";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading Service Delivery Portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Advanced KPI Cards
  const KPICards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Active Shifts</p>
              <p className="text-3xl font-bold">{shifts?.filter(s => s.status === 'in_progress').length || 24}</p>
              <p className="text-blue-100 text-sm flex items-center mt-2">
                <Activity className="w-4 h-4 mr-1" />
                8 starting soon
              </p>
            </div>
            <CalendarIcon className="w-12 h-12 text-blue-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Staff Utilization</p>
              <p className="text-3xl font-bold">87.3%</p>
              <p className="text-green-100 text-sm flex items-center mt-2">
                <TrendingUp className="w-4 h-4 mr-1" />
                +5.2% from last week
              </p>
            </div>
            <Users className="w-12 h-12 text-green-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Service Quality</p>
              <p className="text-3xl font-bold">96.2%</p>
              <p className="text-orange-100 text-sm flex items-center mt-2">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Above target 95%
              </p>
            </div>
            <Target className="w-12 h-12 text-orange-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Revenue Today</p>
              <p className="text-3xl font-bold">$12.4K</p>
              <p className="text-purple-100 text-sm flex items-center mt-2">
                <DollarSign className="w-4 h-4 mr-1" />
                On track for target
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-purple-200" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <Header title="Service Delivery Management" subtitle="Advanced Staff Allocation & Operations Control" />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <KPICards />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full max-w-4xl">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="allocation" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Staff Allocation
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Admin Controls
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab - Real-time Analytics & Monitoring */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Staff Utilization Chart */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      Staff Utilization Trends
                    </CardTitle>
                    <CardDescription>Weekly performance and capacity analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={staffUtilizationData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="capacity" fill="#e5e7eb" name="Capacity" />
                        <Bar dataKey="scheduled" fill="#3b82f6" name="Scheduled" />
                        <Bar dataKey="actual" fill="#10b981" name="Actual" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Service Type Distribution */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-500" />
                      Service Distribution
                    </CardTitle>
                    <CardDescription>Current service type breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={serviceTypeDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ type, value }) => `${type}: ${value}%`}
                        >
                          {serviceTypeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Real-time Operations Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-l-4 border-l-green-500 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-700 font-medium">Active Services</p>
                        <p className="text-2xl font-bold text-green-800">142</p>
                      </div>
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-700 font-medium">Pending Assignments</p>
                        <p className="text-2xl font-bold text-orange-800">8</p>
                      </div>
                      <Clock className="w-8 h-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-700 font-medium">Urgent Attention</p>
                        <p className="text-2xl font-bold text-red-800">3</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Staff Allocation Tab - Advanced Assignment Management */}
            <TabsContent value="allocation" className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-semibold">Staff Allocation Management</h3>
                  <p className="text-muted-foreground">Advanced staff-to-service assignment and optimization</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Advanced Filter
                  </Button>
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Bulk Assignment
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Available Staff */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Available Staff</CardTitle>
                    <CardDescription>Ready for assignment</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                    {staff?.slice(0, 6).map((member) => (
                      <div 
                        key={member.id} 
                        className="p-3 bg-green-50 border border-green-200 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                        data-testid={`staff-available-${member.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-green-800">{member.firstName} {member.lastName}</p>
                            <p className="text-sm text-green-600">{member.position}</p>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            Available
                          </Badge>
                        </div>
                        <div className="mt-2 text-xs text-green-600">
                          Specializations: Personal Care, Community Access
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Current Assignments */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Current Assignments</CardTitle>
                    <CardDescription>Active staff allocations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                    {shifts?.slice(0, 5).map((shift) => (
                      <div 
                        key={shift.id} 
                        className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                        data-testid={`assignment-${shift.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-blue-800">
                              {staff?.find(s => s.id === shift.assignedStaffId)?.firstName || 'Staff'} - 
                              {participants?.find(p => p.id === shift.participantId)?.firstName || 'Participant'}
                            </p>
                            <p className="text-sm text-blue-600">
                              {shift.shiftDate} • {shift.startTime} - {shift.endTime}
                            </p>
                          </div>
                          <Badge className="bg-blue-100 text-blue-700">
                            {shift.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Pending Requests */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Pending Requests</CardTitle>
                    <CardDescription>Awaiting staff assignment</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                    {participants?.slice(0, 4).map((participant) => (
                      <div 
                        key={participant.id} 
                        className="p-3 bg-orange-50 border border-orange-200 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
                        data-testid={`request-${participant.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-orange-800">
                              {participant.firstName} {participant.lastName}
                            </p>
                            <p className="text-sm text-orange-600">Personal Care Support</p>
                          </div>
                          <Badge variant="outline" className="border-orange-300 text-orange-700">
                            Urgent
                          </Badge>
                        </div>
                        <div className="mt-2 text-xs text-orange-600">
                          Preferred: Weekday mornings • Location: {participant.address || 'Sydney'}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Performance Tab - Analytics & Metrics */}
            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">94.2%</div>
                    <p className="text-sm text-gray-600">Service Completion Rate</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-xs text-green-600">+2.1% from last month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">4.8/5</div>
                    <p className="text-sm text-gray-600">Avg Service Rating</p>
                    <div className="flex items-center mt-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-xs text-green-600">Above target</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-purple-600">87.3%</div>
                    <p className="text-sm text-gray-600">Staff Efficiency</p>
                    <div className="flex items-center mt-2">
                      <Activity className="w-4 h-4 text-purple-500 mr-1" />
                      <span className="text-xs text-purple-600">Optimal range</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-orange-600">$2.1M</div>
                    <p className="text-sm text-gray-600">Monthly Revenue</p>
                    <div className="flex items-center mt-2">
                      <DollarSign className="w-4 h-4 text-orange-500 mr-1" />
                      <span className="text-xs text-orange-600">On track</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Analytics Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Staff Performance Trends</CardTitle>
                    <CardDescription>Individual and team performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={staffUtilizationData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} />
                        <Line type="monotone" dataKey="scheduled" stroke="#10b981" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Service Quality Metrics</CardTitle>
                    <CardDescription>Quality scores and participant satisfaction</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { metric: 'Service Delivery', score: 96, target: 95 },
                        { metric: 'Timeliness', score: 94, target: 90 },
                        { metric: 'Communication', score: 98, target: 95 },
                        { metric: 'Professional Standards', score: 97, target: 95 },
                      ].map((item) => (
                        <div key={item.metric} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">{item.metric}</span>
                            <span className="text-sm text-gray-600">{item.score}%</span>
                          </div>
                          <Progress 
                            value={item.score} 
                            className="h-2" 
                          />
                          <div className="text-xs text-gray-500">Target: {item.target}%</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Admin Controls Tab - Bulk Operations & Management */}
            <TabsContent value="admin" className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-semibold">Administrative Controls</h3>
                  <p className="text-muted-foreground">Bulk operations and system management</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Data
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Advanced Filters
                  </Button>
                </div>
              </div>

              {/* Search and Filter Controls */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Search & Filter Controls</CardTitle>
                  <CardDescription>Advanced search and filtering options</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        placeholder="Search services, staff, participants..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        data-testid="search-services"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger data-testid="filter-status">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger data-testid="filter-service-type">
                        <SelectValue placeholder="Service type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal_care">Personal Care</SelectItem>
                        <SelectItem value="community_access">Community Access</SelectItem>
                        <SelectItem value="daily_living">Daily Living</SelectItem>
                        <SelectItem value="transport">Transport</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger data-testid="filter-region">
                        <SelectValue placeholder="Region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sydney">Sydney</SelectItem>
                        <SelectItem value="melbourne">Melbourne</SelectItem>
                        <SelectItem value="brisbane">Brisbane</SelectItem>
                        <SelectItem value="perth">Perth</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Bulk Operations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Bulk Operations</CardTitle>
                    <CardDescription>Perform actions on multiple items</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm font-medium">Selected Items: {selectedStaff.length}</span>
                      <Button size="sm" variant="outline" onClick={() => setSelectedStaff([])}>
                        Clear Selection
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="flex items-center gap-2" data-testid="bulk-assign">
                        <UserCheckIcon className="w-4 h-4" />
                        Bulk Assign
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2" data-testid="bulk-schedule">
                        <CalendarIcon className="w-4 h-4" />
                        Bulk Schedule
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2" data-testid="bulk-notify">
                        <AlertCircleIcon className="w-4 h-4" />
                        Send Notifications
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2" data-testid="bulk-export">
                        <Download className="w-4 h-4" />
                        Export Selected
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>System Operations</CardTitle>
                    <CardDescription>Administrative system controls</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full flex items-center justify-between" data-testid="sync-calendars">
                        <span>Sync All Calendars</span>
                        <Activity className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" className="w-full flex items-center justify-between" data-testid="generate-reports">
                        <span>Generate Monthly Reports</span>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" className="w-full flex items-center justify-between" data-testid="optimize-schedules">
                        <span>Optimize Schedules</span>
                        <Target className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" className="w-full flex items-center justify-between text-red-600 hover:text-red-700 border-red-200 hover:border-red-300" data-testid="emergency-override">
                        <span>Emergency Override</span>
                        <AlertTriangle className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

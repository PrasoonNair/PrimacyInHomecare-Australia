import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import ParticipantForm from "@/components/forms/participant-form";
import { 
  Users, UserPlus, Search, Filter, Download, MoreVertical, Eye, Edit, Trash2,
  Calendar, MapPin, Phone, Mail, AlertCircle, CheckCircle2, Clock, TrendingUp,
  Activity, Target, BarChart3, PieChart as PieChartIcon, FileText, Settings, DollarSign
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import type { Participant, NdisPlan } from "@shared/schema";

// Sample data for participant analytics
const participantStatusData = [
  { status: 'Active', count: 284, color: '#10b981' },
  { status: 'Pending', count: 42, color: '#f59e0b' },
  { status: 'Review', count: 18, color: '#ef4444' },
  { status: 'Inactive', count: 23, color: '#6b7280' },
];

const participantDemographics = [
  { age: '18-25', count: 45 },
  { age: '26-35', count: 78 },
  { age: '36-45', count: 92 },
  { age: '46-55', count: 67 },
  { age: '56-65', count: 43 },
  { age: '65+', count: 42 },
];

const planUtilizationData = [
  { month: 'Jan', utilized: 78, allocated: 100 },
  { month: 'Feb', utilized: 82, allocated: 100 },
  { month: 'Mar', utilized: 85, allocated: 100 },
  { month: 'Apr', utilized: 79, allocated: 100 },
  { month: 'May', utilized: 88, allocated: 100 },
  { month: 'Jun', utilized: 91, allocated: 100 },
];

export default function Participants() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlanType, setFilterPlanType] = useState("all");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const queryClient = useQueryClient();

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

  const { data: participants = [], isLoading: participantsLoading } = useQuery<Participant[]>({
    queryKey: ["/api/participants"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: ndisPlans = [] } = useQuery<NdisPlan[]>({
    queryKey: ["/api/ndis-plans"],
    enabled: isAuthenticated,
  });

  const deleteParticipantMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/participants/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/participants"] });
      toast({
        title: "Success",
        description: "Participant deactivated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to deactivate participant",
        variant: "destructive",
      });
    },
  });



  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading Participants Portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Filter participants based on search and filters
  const filteredParticipants = participants?.filter((participant: Participant) => {
    const matchesSearch = searchTerm === "" || 
      `${participant.firstName} ${participant.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.ndisNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || participant.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  }) || [];

  // Advanced KPI Cards
  const KPICards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Participants</p>
              <p className="text-3xl font-bold">{participants?.length || 367}</p>
              <p className="text-blue-100 text-sm flex items-center mt-2">
                <UserPlus className="w-4 h-4 mr-1" />
                +12 this month
              </p>
            </div>
            <Users className="w-12 h-12 text-blue-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Active Plans</p>
              <p className="text-3xl font-bold">{ndisPlans?.filter(p => p.status === 'active').length || 284}</p>
              <p className="text-green-100 text-sm flex items-center mt-2">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                77.4% utilization
              </p>
            </div>
            <FileText className="w-12 h-12 text-green-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Plan Value</p>
              <p className="text-3xl font-bold">$8.4M</p>
              <p className="text-orange-100 text-sm flex items-center mt-2">
                <DollarSign className="w-4 h-4 mr-1" />
                Total allocated
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-orange-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Avg Satisfaction</p>
              <p className="text-3xl font-bold">4.7/5</p>
              <p className="text-purple-100 text-sm flex items-center mt-2">
                <TrendingUp className="w-4 h-4 mr-1" />
                +0.3 this quarter
              </p>
            </div>
            <Activity className="w-12 h-12 text-purple-200" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <Header title="Participant Management" subtitle="Comprehensive Participant Lifecycle & Analytics" />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <KPICards />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full max-w-4xl">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="management" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Management
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Admin Controls
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab - Analytics & Insights */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Participant Status Distribution */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="w-5 h-5 text-blue-500" />
                      Participant Status
                    </CardTitle>
                    <CardDescription>Current status distribution across all participants</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={participantStatusData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="count"
                          label={({ status, count }) => `${status}: ${count}`}
                        >
                          {participantStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Demographics Analysis */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-green-500" />
                      Age Demographics
                    </CardTitle>
                    <CardDescription>Participant age distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={participantDemographics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="age" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Plan Utilization Trends */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                    NDIS Plan Utilization Trends
                  </CardTitle>
                  <CardDescription>Monthly plan utilization vs allocation</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={planUtilizationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="allocated" 
                        stroke="#e5e7eb" 
                        strokeWidth={2} 
                        name="Allocated Budget"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="utilized" 
                        stroke="#8b5cf6" 
                        strokeWidth={3} 
                        name="Utilized Budget"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Quick Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">96.2%</div>
                    <p className="text-sm text-gray-600">Plan Management Compliance</p>
                    <div className="flex items-center mt-1">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-xs text-green-600">Above target</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">18</div>
                    <p className="text-sm text-gray-600">New Onboardings</p>
                    <div className="flex items-center mt-1">
                      <UserPlus className="w-4 h-4 text-blue-500 mr-1" />
                      <span className="text-xs text-blue-600">This month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-orange-600">$2.1M</div>
                    <p className="text-sm text-gray-600">Active Plan Value</p>
                    <div className="flex items-center mt-1">
                      <DollarSign className="w-4 h-4 text-orange-500 mr-1" />
                      <span className="text-xs text-orange-600">Current month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-red-600">7</div>
                    <p className="text-sm text-gray-600">Plans Requiring Review</p>
                    <div className="flex items-center mt-1">
                      <AlertCircle className="w-4 h-4 text-red-500 mr-1" />
                      <span className="text-xs text-red-600">Action needed</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Management Tab - Participant Operations */}
            <TabsContent value="management" className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-semibold">Participant Management</h3>
                  <p className="text-muted-foreground">Comprehensive participant lifecycle management</p>
                </div>
                <div className="flex gap-2">
                  <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2" data-testid="button-add-participant">
                        <UserPlus className="w-4 h-4" />
                        Add Participant
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingParticipant ? 'Edit Participant' : 'Add New Participant'}
                        </DialogTitle>
                      </DialogHeader>
                      <ParticipantForm 
                        participant={editingParticipant} 
                        onClose={() => {
                          setIsFormOpen(false);
                          setEditingParticipant(null);
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Data
                  </Button>
                </div>
              </div>

              {/* Advanced Search and Filter Controls */}
              <Card className="border-0 shadow-lg mb-6">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        placeholder="Search participants..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        data-testid="search-participants"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger data-testid="filter-status">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="review">Under Review</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterPlanType} onValueChange={setFilterPlanType}>
                      <SelectTrigger data-testid="filter-plan-type">
                        <SelectValue placeholder="Plan type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Plans</SelectItem>
                        <SelectItem value="core">Core Support</SelectItem>
                        <SelectItem value="capacity">Capacity Building</SelectItem>
                        <SelectItem value="capital">Capital Support</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Advanced Filter
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2" onClick={() => setSelectedParticipants([])}>
                      <Trash2 className="w-4 h-4" />
                      Clear Selection ({selectedParticipants.length})
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Participant Data Table */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Participant Directory</span>
                    <Badge variant="outline">{filteredParticipants.length} participants</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <div className="space-y-4">
                      {participantsLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto"></div>
                          <p className="mt-2 text-gray-600">Loading participants...</p>
                        </div>
                      ) : filteredParticipants.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No participants found</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding your first participant.'}
                          </p>
                        </div>
                      ) : (
                        filteredParticipants.map((participant) => (
                          <Card key={participant.id} className="hover:shadow-md transition-shadow" data-testid={`participant-card-${participant.id}`}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <Checkbox 
                                    checked={selectedParticipants.includes(participant.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedParticipants([...selectedParticipants, participant.id]);
                                      } else {
                                        setSelectedParticipants(selectedParticipants.filter(id => id !== participant.id));
                                      }
                                    }}
                                    data-testid={`checkbox-participant-${participant.id}`}
                                  />
                                  <div>
                                    <h3 className="font-semibold text-lg">
                                      {participant.firstName} {participant.lastName}
                                    </h3>
                                    <p className="text-sm text-gray-600">NDIS: {participant.ndisNumber}</p>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        DOB: {participant.dateOfBirth}
                                      </span>
                                      {participant.phone && (
                                        <span className="flex items-center gap-1">
                                          <Phone className="w-4 h-4" />
                                          {participant.phone}
                                        </span>
                                      )}
                                      {participant.email && (
                                        <span className="flex items-center gap-1">
                                          <Mail className="w-4 h-4" />
                                          {participant.email}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge 
                                    variant={participant.status === 'active' ? 'default' : 
                                           participant.status === 'pending' ? 'secondary' : 'outline'}
                                  >
                                    {participant.status}
                                  </Badge>
                                  <div className="flex items-center gap-1">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => {/* View details */}}
                                      data-testid={`button-view-${participant.id}`}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => {
                                        setEditingParticipant(participant);
                                        setIsFormOpen(true);
                                      }}
                                      data-testid={`button-edit-${participant.id}`}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => {
                                        if (confirm("Are you sure you want to deactivate this participant?")) {
                                          deleteParticipantMutation.mutate(participant.id);
                                        }
                                      }}
                                      data-testid={`button-delete-${participant.id}`}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              {participant.address && (
                                <div className="mt-3 flex items-center gap-1 text-sm text-gray-500">
                                  <MapPin className="w-4 h-4" />
                                  {participant.address}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab - Advanced Reporting */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">84.3%</div>
                    <p className="text-sm text-gray-600">Plan Utilization Rate</p>
                    <div className="flex items-center mt-2">
                      <Progress value={84.3} className="flex-1 mr-2" />
                      <span className="text-xs text-gray-500">Target: 80%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">92.1%</div>
                    <p className="text-sm text-gray-600">Service Satisfaction</p>
                    <div className="flex items-center mt-2">
                      <Progress value={92.1} className="flex-1 mr-2" />
                      <span className="text-xs text-gray-500">Target: 90%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-purple-600">$23.7K</div>
                    <p className="text-sm text-gray-600">Avg Plan Value</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-purple-500 mr-1" />
                      <span className="text-xs text-purple-600">+8.2% vs last quarter</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Service Category Preferences */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Service Category Distribution</CardTitle>
                    <CardDescription>Most requested service categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { category: 'Core Supports', percentage: 42, color: 'bg-blue-500' },
                        { category: 'Capacity Building', percentage: 31, color: 'bg-green-500' },
                        { category: 'Capital Supports', percentage: 18, color: 'bg-orange-500' },
                        { category: 'Other', percentage: 9, color: 'bg-gray-500' },
                      ].map((item) => (
                        <div key={item.category} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.category}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${item.color}`}
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold w-12 text-right">{item.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Geographic Distribution */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Geographic Distribution</CardTitle>
                    <CardDescription>Participant locations by region</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { region: 'Sydney Metro', count: 142, percentage: 38.7 },
                        { region: 'Melbourne Metro', count: 89, percentage: 24.3 },
                        { region: 'Brisbane', count: 67, percentage: 18.3 },
                        { region: 'Perth', count: 43, percentage: 11.7 },
                        { region: 'Adelaide', count: 26, percentage: 7.1 },
                      ].map((item) => (
                        <div key={item.region} className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium">{item.region}</span>
                            <div className="text-xs text-gray-500">{item.count} participants</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 bg-indigo-500 rounded-full"
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold w-12 text-right">{item.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Admin Controls Tab - Bulk Operations */}
            <TabsContent value="admin" className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-semibold">Administrative Controls</h3>
                  <p className="text-muted-foreground">Bulk operations and system management</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export All Data
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Advanced Reports
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bulk Operations */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Bulk Operations</CardTitle>
                    <CardDescription>Perform actions on multiple participants</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm font-medium">Selected: {selectedParticipants.length} participants</span>
                      <Button size="sm" variant="outline" onClick={() => setSelectedParticipants([])}>
                        Clear Selection
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="flex items-center gap-2" data-testid="bulk-update-status">
                        <Users className="w-4 h-4" />
                        Update Status
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2" data-testid="bulk-assign-worker">
                        <UserPlus className="w-4 h-4" />
                        Assign Worker
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2" data-testid="bulk-send-notifications">
                        <Mail className="w-4 h-4" />
                        Send Notifications
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2" data-testid="bulk-export-selected">
                        <Download className="w-4 h-4" />
                        Export Selected
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* System Operations */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>System Operations</CardTitle>
                    <CardDescription>Administrative system controls</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full flex items-center justify-between" data-testid="sync-ndis-portal">
                        <span>Sync with NDIS Portal</span>
                        <Activity className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" className="w-full flex items-center justify-between" data-testid="generate-compliance-report">
                        <span>Generate Compliance Reports</span>
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" className="w-full flex items-center justify-between" data-testid="validate-plan-budgets">
                        <span>Validate Plan Budgets</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" className="w-full flex items-center justify-between text-red-600 hover:text-red-700 border-red-200 hover:border-red-300" data-testid="audit-data-integrity">
                        <span>Audit Data Integrity</span>
                        <AlertCircle className="w-4 h-4" />
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

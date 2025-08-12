import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart, RadialBarChart, RadialBar, Legend } from 'recharts';
import { 
  TrendingUp, Users, DollarSign, Calendar, FileText, CheckCircle, Activity, Target, Zap,
  ArrowUp, ArrowDown, Clock, AlertCircle, Award, Briefcase, Heart, Shield, Download,
  RefreshCw, Filter, ChevronRight, Bell, Settings, HelpCircle, BarChart3, PieChart as PieChartIcon,
  UserPlus, FileSignature, CreditCard, Truck, ClipboardCheck, Star
} from "lucide-react";

// Sample data for charts and analytics - In real app, this would come from your API
const revenueData = [
  { month: 'Jan', revenue: 125000, target: 120000 },
  { month: 'Feb', revenue: 132000, target: 125000 },
  { month: 'Mar', revenue: 145000, target: 130000 },
  { month: 'Apr', revenue: 158000, target: 135000 },
  { month: 'May', revenue: 162000, target: 140000 },
  { month: 'Jun', revenue: 178000, target: 145000 },
];

const departmentPerformance = [
  { department: 'Intake', efficiency: 92, satisfaction: 88 },
  { department: 'HR', efficiency: 85, satisfaction: 91 },
  { department: 'Finance', efficiency: 96, satisfaction: 89 },
  { department: 'Service Delivery', efficiency: 89, satisfaction: 94 },
  { department: 'Compliance', efficiency: 94, satisfaction: 87 },
];

const participantDistribution = [
  { category: 'Core Support', value: 45, color: '#3b82f6' },
  { category: 'Capital Support', value: 25, color: '#10b981' },
  { category: 'Capacity Building', value: 30, color: '#f59e0b' },
];

const complianceMetrics = [
  { metric: 'NDIS Standards', status: 'Compliant', score: 96, trend: '+2%' },
  { metric: 'Financial Audits', status: 'Compliant', score: 94, trend: '+1%' },
  { metric: 'Staff Qualifications', status: 'Warning', score: 87, trend: '-3%' },
  { metric: 'Service Quality', status: 'Compliant', score: 92, trend: '+5%' },
];

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("7d");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard stats
  const { data: dashboardStats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: isAuthenticated,
  });

  const { data: participants, isLoading: participantsLoading } = useQuery({
    queryKey: ["/api/participants"],
    enabled: isAuthenticated,
  });

  const { data: staff, isLoading: staffLoading } = useQuery({
    queryKey: ["/api/staff"],
    enabled: isAuthenticated,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchStats();
    setTimeout(() => setRefreshing(false), 1000);
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading Super Admin Portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Enhanced KPI Cards with better animations and interactivity
  const KPICards = () => {
    const kpiData = [
      {
        title: "Monthly Revenue",
        value: "$178K",
        change: "+12%",
        trend: "up",
        icon: DollarSign,
        gradient: "from-blue-600 to-cyan-600",
        lightGradient: "from-blue-50 to-cyan-50",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        sparklineData: [30, 40, 35, 50, 49, 60, 70, 91, 125]
      },
      {
        title: "Active Participants", 
        value: dashboardStats?.activeParticipants || 0,
        change: "+18",
        trend: "up",
        icon: Users,
        gradient: "from-emerald-600 to-green-600",
        lightGradient: "from-emerald-50 to-green-50",
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
        sparklineData: [20, 25, 30, 35, 40, 45, 50, 52, 58]
      },
      {
        title: "Services This Week",
        value: dashboardStats?.servicesThisWeek || 0,
        change: "+24%",
        trend: "up",
        icon: Calendar,
        gradient: "from-violet-600 to-purple-600",
        lightGradient: "from-violet-50 to-purple-50",
        iconBg: "bg-violet-100",
        iconColor: "text-violet-600",
        sparklineData: [10, 15, 12, 20, 18, 25, 22, 28, 30]
      },
      {
        title: "Compliance Score",
        value: "96.8%",
        change: "+2.3%",
        trend: "up",
        icon: Shield,
        gradient: "from-orange-600 to-red-600",
        lightGradient: "from-orange-50 to-red-50",
        iconBg: "bg-orange-100",
        iconColor: "text-orange-600",
        sparklineData: [80, 82, 85, 88, 90, 92, 94, 95, 96.8]
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <Card 
            key={index} 
            className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border-0 bg-gradient-to-br from-white to-gray-50/50 overflow-hidden"
          >
            <div className={`h-1 bg-gradient-to-r ${kpi.gradient}`} />
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${kpi.iconBg} ${kpi.iconColor} transition-transform group-hover:scale-110`}>
                  <kpi.icon className="w-6 h-6" />
                </div>
                <Badge 
                  variant="secondary" 
                  className={`${kpi.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                >
                  {kpi.trend === 'up' ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                  {kpi.change}
                </Badge>
              </div>
              
              <h3 className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</h3>
              <p className="text-3xl font-bold text-gray-900 mb-3">{kpi.value}</p>
              
              {/* Mini sparkline chart */}
              <div className="h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={kpi.sparklineData.map((value, i) => ({ value, index: i }))}>
                    <defs>
                      <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={index === 0 ? "#3b82f6" : index === 1 ? "#10b981" : index === 2 ? "#8b5cf6" : "#f97316"} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={index === 0 ? "#3b82f6" : index === 1 ? "#10b981" : index === 2 ? "#8b5cf6" : "#f97316"} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke="none" fill={`url(#gradient-${index})`} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <Header title="NDIS Manager Dashboard" subtitle="Real-time Business Intelligence & Analytics" />
        <main className="flex-1 overflow-y-auto">
          {/* Welcome Section with Quick Actions */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white px-6 py-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-white/20">
                    <AvatarImage src={user?.profileImageUrl || ''} />
                    <AvatarFallback className="bg-white/20 text-white text-xl">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl font-bold">Welcome back, {user?.firstName || 'Admin'}!</h1>
                    <p className="text-blue-100 mt-1">Here's your operational overview for today</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Participant
                  </Button>
                  <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                    <FileSignature className="w-4 h-4 mr-2" />
                    New Service
                  </Button>
                  <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Generate Invoice
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-white hover:bg-white/10"
                    onClick={handleRefresh}
                  >
                    <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>

              {/* Quick Stats Bar */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Today's Services</p>
                      <p className="text-2xl font-bold">28</p>
                    </div>
                    <Truck className="w-8 h-8 text-blue-200" />
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Pending Tasks</p>
                      <p className="text-2xl font-bold">12</p>
                    </div>
                    <ClipboardCheck className="w-8 h-8 text-blue-200" />
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Staff Online</p>
                      <p className="text-2xl font-bold">35/42</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-200" />
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Response Time</p>
                      <p className="text-2xl font-bold">2.4h</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="p-6 max-w-7xl mx-auto">
            {/* Date Range Selector and Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-900">Performance Metrics</h2>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Bell className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              </div>
              <div className="flex gap-3">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="90d">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <KPICards />

            {/* Enhanced Tabs with Icons and Better Styling */}
            <div className="mt-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full bg-white shadow-sm border">
                  <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                    <BarChart3 className="w-4 h-4" />
                    <span className="hidden sm:inline">Overview</span>
                  </TabsTrigger>
                  <TabsTrigger value="financial" className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                    <DollarSign className="w-4 h-4" />
                    <span className="hidden sm:inline">Financial</span>
                  </TabsTrigger>
                  <TabsTrigger value="operations" className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                    <Briefcase className="w-4 h-4" />
                    <span className="hidden sm:inline">Operations</span>
                  </TabsTrigger>
                  <TabsTrigger value="compliance" className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                    <Shield className="w-4 h-4" />
                    <span className="hidden sm:inline">Compliance</span>
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                    <PieChartIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Analytics</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 animate-fadeIn">
                  {/* Revenue and Department Performance Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <TrendingUp className="w-5 h-5 text-blue-600" />
                              Revenue Performance
                            </CardTitle>
                            <CardDescription>Monthly revenue vs targets</CardDescription>
                          </div>
                          <Select defaultValue="6m">
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3m">3 Months</SelectItem>
                              <SelectItem value="6m">6 Months</SelectItem>
                              <SelectItem value="1y">1 Year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={revenueData}>
                            <defs>
                              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip 
                              formatter={(value: any) => [`$${value.toLocaleString()}`, ""]}
                              contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} />
                            <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" />
                          </LineChart>
                        </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full justify-start" variant="outline" data-testid="button-add-participant">
                        <Users className="w-4 h-4 mr-2" />
                        Add New Participant
                      </Button>
                      <Button className="w-full justify-start" variant="outline" data-testid="button-schedule-service">
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Service
                      </Button>
                      <Button className="w-full justify-start" variant="outline" data-testid="button-generate-report">
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Report
                      </Button>
                      <Button className="w-full justify-start" variant="outline" data-testid="button-audit-trail">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        View Audit Trail
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">System Health</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Database</span>
                        <Badge variant="success" className="bg-green-100 text-green-800">
                          Healthy
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">API Performance</span>
                        <Badge variant="success" className="bg-green-100 text-green-800">
                          Optimal
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Security</span>
                        <Badge variant="success" className="bg-green-100 text-green-800">
                          Secure
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Department Performance</CardTitle>
                    <CardDescription>Efficiency and satisfaction metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={departmentPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="department" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="efficiency" fill="#3b82f6" name="Efficiency %" />
                        <Bar dataKey="satisfaction" fill="#10b981" name="Satisfaction %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Participant Distribution</CardTitle>
                    <CardDescription>By NDIS support category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={participantDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {participantDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, ""]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center space-x-4 mt-4">
                      {participantDistribution.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-sm">{item.category}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="financial" className="space-y-6 animate-fadeIn">
              {/* Financial Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-700">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-900">$1.2M</p>
                        <p className="text-xs text-green-600 mt-1">+15% from last quarter</p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-xl">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-700">Outstanding Invoices</p>
                        <p className="text-2xl font-bold text-blue-900">$89K</p>
                        <p className="text-xs text-blue-600 mt-1">42 pending invoices</p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <CreditCard className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-700">Profit Margin</p>
                        <p className="text-2xl font-bold text-purple-900">24.3%</p>
                        <p className="text-xs text-purple-600 mt-1">Above industry average</p>
                      </div>
                      <div className="p-3 bg-purple-100 rounded-xl">
                        <Award className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>Budget Allocation by Department</CardTitle>
                    <CardDescription>Current quarter spending analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        { department: 'Service Delivery', budget: 450000, spent: 380000 },
                        { department: 'HR & Recruitment', budget: 120000, spent: 95000 },
                        { department: 'Compliance', budget: 80000, spent: 72000 },
                        { department: 'Finance', budget: 60000, spent: 52000 },
                        { department: 'Intake', budget: 40000, spent: 31000 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="department" angle={-20} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                        <Bar dataKey="budget" fill="#94a3b8" name="Budget" />
                        <Bar dataKey="spent" fill="#3b82f6" name="Spent" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Cash Flow Analysis</CardTitle>
                    <CardDescription>Income vs Expenses (Last 6 months)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Outstanding Invoices</span>
                        <span className="text-2xl font-bold text-orange-600">$12,340</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Pending Payments</span>
                        <span className="text-2xl font-bold text-blue-600">$8,750</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Net Profit Margin</span>
                        <span className="text-2xl font-bold text-green-600">23.4%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Operating Costs</span>
                        <span className="text-2xl font-bold text-gray-600">$892,000</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="operations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Operational Metrics</CardTitle>
                  <CardDescription>Real-time service delivery performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-2">Service Delivery</h4>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Weekly Services</span>
                          <span className="text-xl font-bold">{dashboardStats?.servicesThisWeek || 156}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-600">Completion Rate</span>
                          <span className="text-xl font-bold text-green-600">94%</span>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-2">Staff Performance</h4>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Utilization Rate</span>
                          <span className="text-xl font-bold">87.3%</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-600">Average Response Time</span>
                          <span className="text-xl font-bold">2.4h</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-2">Client Metrics</h4>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Satisfaction Score</span>
                          <span className="text-xl font-bold">4.8/5</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-600">Net Promoter Score</span>
                          <span className="text-xl font-bold text-green-600">+72</span>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-2">Resource Management</h4>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Vehicle Fleet Utilization</span>
                          <span className="text-xl font-bold">78%</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-600">Equipment Availability</span>
                          <span className="text-xl font-bold">95%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Dashboard</CardTitle>
                  <CardDescription>Real-time compliance monitoring and alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {complianceMetrics.map((metric, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{metric.metric}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant={metric.status === 'Compliant' ? 'success' : 'warning'}
                                className={metric.status === 'Compliant' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                              >
                                {metric.status}
                              </Badge>
                              <span className="text-sm text-gray-500">{metric.trend}</span>
                            </div>
                          </div>
                          <Progress value={metric.score} className="h-2" />
                          <p className="text-sm text-gray-500 mt-1">{metric.score}% compliance</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Analytics</CardTitle>
                  <CardDescription>Deep insights into business performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-6 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-blue-900">Forecast Accuracy</h4>
                          <div className="text-2xl font-bold text-blue-600">94.2%</div>
                        </div>
                        <TrendingUp className="w-8 h-8 text-blue-500" />
                      </div>
                    </div>
                    <div className="p-6 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-green-900">Cost Efficiency</h4>
                          <div className="text-2xl font-bold text-green-600">+15.3%</div>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-500" />
                      </div>
                    </div>
                    <div className="p-6 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-purple-900">Quality Score</h4>
                          <div className="text-2xl font-bold text-purple-600">9.1/10</div>
                        </div>
                        <Zap className="w-8 h-8 text-purple-500" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          </div>
          </div>
        </main>
      </div>
    </div>
  );
}

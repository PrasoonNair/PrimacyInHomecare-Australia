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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Calendar, FileText, CheckCircle, Activity, Target, Zap } from "lucide-react";

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
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch dashboard stats
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
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

  // KPI Cards Component
  const KPICards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white border-0 shadow-xl card-hover overflow-hidden relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-semibold">Monthly Revenue</p>
              <p className="text-3xl font-bold mb-1">$178K</p>
              <p className="text-blue-100 text-sm flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12% from last month
              </p>
            </div>
            <div className="p-3 bg-white/20 rounded-2xl">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 text-white border-0 shadow-xl card-hover overflow-hidden relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-semibold">Total Participants</p>
              <p className="text-3xl font-bold mb-1">{dashboardStats?.activeParticipants || 0}</p>
              <p className="text-green-100 text-sm flex items-center">
                <Users className="w-4 h-4 mr-1" />
                Active in system
              </p>
            </div>
            <div className="p-3 bg-white/20 rounded-2xl">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 text-white border-0 shadow-xl card-hover overflow-hidden relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-semibold">Active Services</p>
              <p className="text-3xl font-bold mb-1">{dashboardStats?.servicesThisWeek || 0}</p>
              <p className="text-purple-100 text-sm flex items-center">
                <Activity className="w-4 h-4 mr-1" />
                This week
              </p>
            </div>
            <div className="p-3 bg-white/20 rounded-2xl">
              <Calendar className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white border-0 shadow-xl card-hover overflow-hidden relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-semibold">Quality Score</p>
              <p className="text-3xl font-bold mb-1">96.8%</p>
              <p className="text-orange-100 text-sm flex items-center">
                <Zap className="w-4 h-4 mr-1" />
                Excellence rating
              </p>
            </div>
            <div className="p-3 bg-white/20 rounded-2xl">
              <Target className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <Header title="Super Admin Portal" subtitle="Comprehensive Business Intelligence Dashboard" />
        <main className="flex-1 overflow-y-auto p-6">
          <KPICards />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-5 w-full max-w-3xl">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="financial" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Financial
              </TabsTrigger>
              <TabsTrigger value="operations" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Operations
              </TabsTrigger>
              <TabsTrigger value="compliance" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Compliance
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Revenue Performance
                    </CardTitle>
                    <CardDescription>Monthly revenue vs targets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, ""]} />
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

            <TabsContent value="financial" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
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
        </main>
      </div>
    </div>
  );
}

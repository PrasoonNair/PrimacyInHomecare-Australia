import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUpIcon,
  DollarSignIcon,
  UsersIcon,
  ActivityIcon,
  BarChart3Icon,
  PieChartIcon,
  BriefcaseIcon,
  TrophyIcon
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function CEODashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("executive");

  // Mock data for charts
  const revenueData = [
    { month: 'Jan', revenue: 245000, expenses: 180000 },
    { month: 'Feb', revenue: 265000, expenses: 195000 },
    { month: 'Mar', revenue: 280000, expenses: 200000 },
    { month: 'Apr', revenue: 295000, expenses: 210000 },
    { month: 'May', revenue: 310000, expenses: 220000 },
    { month: 'Jun', revenue: 325000, expenses: 230000 },
  ];

  const departmentPerformance = [
    { name: 'Intake', value: 92, fill: '#0088FE' },
    { name: 'Service Delivery', value: 88, fill: '#00C49F' },
    { name: 'Finance', value: 95, fill: '#FFBB28' },
    { name: 'HR', value: 87, fill: '#FF8042' },
    { name: 'Quality', value: 91, fill: '#8884D8' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            CEO Dashboard
          </h1>
          <p className="text-muted-foreground">
            Executive Overview - Primacy Care Australia
          </p>
        </div>

        {/* Executive KPIs */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$325,000</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Participants</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">486</div>
              <p className="text-xs text-muted-foreground">+23 this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Staff Utilization</CardTitle>
              <ActivityIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">Target: 85%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28.5%</div>
              <p className="text-xs text-muted-foreground">+2.3% from last quarter</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="executive">Executive Summary</TabsTrigger>
            <TabsTrigger value="financial">Financial Performance</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="strategic">Strategic Initiatives</TabsTrigger>
          </TabsList>

          <TabsContent value="executive" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue vs Expenses</CardTitle>
                  <CardDescription>6-month financial overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#0088FE" name="Revenue" />
                      <Line type="monotone" dataKey="expenses" stroke="#FF8042" name="Expenses" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Department Performance</CardTitle>
                  <CardDescription>KPI achievement by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={departmentPerformance}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {departmentPerformance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Key Business Metrics</CardTitle>
                <CardDescription>Critical performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Customer Satisfaction Score</p>
                      <p className="text-sm text-muted-foreground">Based on recent surveys</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">4.7/5.0</p>
                      <p className="text-xs text-muted-foreground">+0.2 from last quarter</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Staff Retention Rate</p>
                      <p className="text-sm text-muted-foreground">Annual retention</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">92%</p>
                      <p className="text-xs text-muted-foreground">Industry avg: 78%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">NDIS Compliance Score</p>
                      <p className="text-sm text-muted-foreground">Latest audit result</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">98%</p>
                      <p className="text-xs text-muted-foreground">Exceeds standards</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Financial Dashboard</CardTitle>
                <CardDescription>Comprehensive financial metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">YTD Revenue</p>
                    <p className="text-2xl font-bold">$1.72M</p>
                    <p className="text-xs text-green-600">+18% vs last year</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Operating Costs</p>
                    <p className="text-2xl font-bold">$1.23M</p>
                    <p className="text-xs text-orange-600">+8% vs last year</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                    <p className="text-2xl font-bold">$490K</p>
                    <p className="text-xs text-green-600">+42% vs last year</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="operations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Operational Excellence</CardTitle>
                <CardDescription>Service delivery and efficiency metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Service Delivery</h4>
                      <Badge className="bg-green-500">On Track</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Services Delivered</p>
                        <p className="font-medium">2,847 this month</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">On-Time Rate</p>
                        <p className="font-medium">96.5%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Cancellation Rate</p>
                        <p className="font-medium">3.2%</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Workforce Management</h4>
                      <Badge className="bg-blue-500">Optimal</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Staff</p>
                        <p className="font-medium">127 employees</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Productivity</p>
                        <p className="font-medium">89% utilization</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Training Hours</p>
                        <p className="font-medium">1,240 this quarter</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strategic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Strategic Initiatives</CardTitle>
                <CardDescription>Key projects and growth opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">Digital Transformation</p>
                        <p className="text-sm text-muted-foreground">Modernizing service delivery platform</p>
                      </div>
                      <Badge>75% Complete</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">Market Expansion</p>
                        <p className="text-sm text-muted-foreground">New service areas in regional Victoria</p>
                      </div>
                      <Badge>Planning Phase</Badge>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">Quality Certification</p>
                        <p className="text-sm text-muted-foreground">ISO 9001:2015 certification process</p>
                      </div>
                      <Badge>60% Complete</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '60%'}}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
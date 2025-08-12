import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUpIcon,
  UsersIcon,
  ActivityIcon,
  BriefcaseIcon,
  BarChart3Icon,
  AlertCircleIcon,
  CheckCircleIcon,
  ClipboardListIcon
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function GeneralManagerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("operations");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            General Manager Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName} - Operations Overview
          </p>
        </div>

        {/* Operations KPIs */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Operational Efficiency</CardTitle>
              <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">91%</div>
              <p className="text-xs text-muted-foreground">+3% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Department Performance</CardTitle>
              <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.4/5.0</div>
              <p className="text-xs text-muted-foreground">Average score</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">3 critical</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Staff Productivity</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89%</div>
              <p className="text-xs text-muted-foreground">Target: 85%</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="operations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Operations Dashboard</CardTitle>
                <CardDescription>Cross-departmental operational status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Service Delivery</h4>
                        <Badge className="bg-green-500">On Track</Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Weekly Target</span>
                          <span className="font-medium">350 services</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivered</span>
                          <span className="font-medium">342 (98%)</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Financial Performance</h4>
                        <Badge className="bg-green-500">Positive</Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Monthly Budget</span>
                          <span className="font-medium">$850K</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Utilization</span>
                          <span className="font-medium">78%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-yellow-50">
                    <h4 className="font-medium mb-3">Action Items</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircleIcon className="h-4 w-4 text-orange-500" />
                          <span className="text-sm">Review Q2 budget allocation</span>
                        </div>
                        <Button size="sm">Review</Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ClipboardListIcon className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Approve department reports</span>
                        </div>
                        <Button size="sm" variant="outline">View</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Department Overview</CardTitle>
                <CardDescription>Performance metrics by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Intake Department</h4>
                      <Badge>92% KPI Achievement</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">New Referrals</p>
                        <p className="font-medium">23 this week</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Processing Time</p>
                        <p className="font-medium">2.1 days avg</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Conversion Rate</p>
                        <p className="font-medium">87%</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Service Delivery</h4>
                      <Badge>88% KPI Achievement</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Services/Week</p>
                        <p className="font-medium">342</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Staff Utilization</p>
                        <p className="font-medium">87%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Quality Score</p>
                        <p className="font-medium">4.6/5.0</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Finance</h4>
                      <Badge>95% KPI Achievement</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Invoice Accuracy</p>
                        <p className="font-medium">99.2%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Collection Rate</p>
                        <p className="font-medium">96%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Cost Savings</p>
                        <p className="font-medium">$45K MTD</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Strategic Projects</CardTitle>
                <CardDescription>Key initiatives and their progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">Digital Transformation Phase 2</p>
                        <p className="text-sm text-muted-foreground">Lead: IT Department</p>
                      </div>
                      <Badge className="bg-blue-500">In Progress</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>65%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '65%'}}></div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">Service Expansion - Western Region</p>
                        <p className="text-sm text-muted-foreground">Lead: Service Delivery</p>
                      </div>
                      <Badge className="bg-yellow-500">Planning</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>25%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-600 h-2 rounded-full" style={{width: '25%'}}></div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">Quality Certification ISO 9001</p>
                        <p className="text-sm text-muted-foreground">Lead: Quality Department</p>
                      </div>
                      <Badge className="bg-green-500">On Track</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>80%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: '80%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Organizational performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Customer Satisfaction</p>
                    <p className="text-3xl font-bold">4.7/5.0</p>
                    <p className="text-xs text-green-600">+0.2 from last quarter</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Employee Engagement</p>
                    <p className="text-3xl font-bold">82%</p>
                    <p className="text-xs text-green-600">+5% from last survey</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Process Efficiency</p>
                    <p className="text-3xl font-bold">91%</p>
                    <p className="text-xs text-green-600">Exceeds target</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Compliance Rate</p>
                    <p className="text-3xl font-bold">98%</p>
                    <p className="text-xs text-green-600">NDIS compliant</p>
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
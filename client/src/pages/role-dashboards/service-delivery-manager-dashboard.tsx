import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  CalendarIcon,
  UsersIcon,
  ActivityIcon,
  TrendingUpIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  BarChart3Icon,
  ShieldCheckIcon
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getRoleEfficiencyMetrics } from "@/lib/ndis-compliance";

export default function ServiceDeliveryManagerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: services = [] } = useQuery({
    queryKey: ["/api/services"],
  });

  const { data: shifts = [] } = useQuery({
    queryKey: ["/api/shifts"],
  });

  const efficiencyMetrics = getRoleEfficiencyMetrics('service_delivery_manager');
  
  // Mock current performance data
  const currentPerformance = {
    serviceUtilization: 87,
    staffProductivity: 82,
    qualityScore: 4.6
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Service Delivery Manager Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName} - Service Operations Management
          </p>
        </div>

        {/* Service Metrics */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Services This Week</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">342</div>
              <p className="text-xs text-muted-foreground">98% completion rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Participants</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">+8 this month</p>
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
              <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
              <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.6/5.0</div>
              <p className="text-xs text-muted-foreground">From feedback</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="allocation">Staff Allocation</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Service Delivery Overview</CardTitle>
                <CardDescription>Today's operational status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        <p className="font-medium">Completed Today</p>
                      </div>
                      <p className="text-2xl font-bold">48</p>
                      <p className="text-xs text-muted-foreground">services delivered</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <ClockIcon className="h-5 w-5 text-blue-500" />
                        <p className="font-medium">In Progress</p>
                      </div>
                      <p className="text-2xl font-bold">12</p>
                      <p className="text-xs text-muted-foreground">active services</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircleIcon className="h-5 w-5 text-orange-500" />
                        <p className="font-medium">Pending</p>
                      </div>
                      <p className="text-2xl font-bold">8</p>
                      <p className="text-xs text-muted-foreground">awaiting allocation</p>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-yellow-50">
                    <h4 className="font-medium mb-2">Critical Alerts</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircleIcon className="h-4 w-4 text-red-500" />
                          <span className="text-sm">Staff shortage - Richmond area (2 PM shift)</span>
                        </div>
                        <Button size="sm">Resolve</Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircleIcon className="h-4 w-4 text-orange-500" />
                          <span className="text-sm">Late clock-in reported - John Smith</span>
                        </div>
                        <Button size="sm" variant="outline">Review</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
                <CardDescription>Support worker performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">On-Time Performance</p>
                      <p className="text-sm text-muted-foreground">Punctuality rate</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">96.5%</p>
                      <p className="text-xs text-green-600">Above target</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Documentation Compliance</p>
                      <p className="text-sm text-muted-foreground">Progress notes completion</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">88%</p>
                      <p className="text-xs text-orange-600">Needs improvement</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="operations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Operations</CardTitle>
                <CardDescription>Service delivery management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button>View Today's Roster</Button>
                    <Button variant="outline">Generate Reports</Button>
                    <Button variant="outline">Shift Handover Notes</Button>
                    <Button variant="outline">Incident Reports</Button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Recent Service Updates</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Service completed - Sarah Johnson (Community Access)</span>
                        <span className="text-muted-foreground">10 mins ago</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Shift started - Michael Brown (Personal Care)</span>
                        <span className="text-muted-foreground">30 mins ago</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Service rescheduled - Emma Wilson</span>
                        <span className="text-muted-foreground">1 hour ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="allocation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Staff Allocation</CardTitle>
                <CardDescription>Optimize support worker assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Unallocated Shifts - Next 7 Days</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">Monday - Morning Shift</p>
                          <p className="text-sm text-muted-foreground">Personal Care - Melbourne CBD</p>
                        </div>
                        <Button size="sm">Allocate</Button>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">Tuesday - Afternoon Shift</p>
                          <p className="text-sm text-muted-foreground">Community Access - Richmond</p>
                        </div>
                        <Button size="sm">Allocate</Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Staff Availability</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Available Today</p>
                        <p className="font-bold text-lg">23 workers</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">On Leave</p>
                        <p className="font-bold text-lg">5 workers</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quality Assurance</CardTitle>
                <CardDescription>Service quality monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground">Participant Satisfaction</p>
                      <p className="text-2xl font-bold">4.6/5.0</p>
                      <p className="text-xs">Based on 48 reviews this month</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground">Complaint Rate</p>
                      <p className="text-2xl font-bold">0.8%</p>
                      <p className="text-xs text-green-600">Below threshold</p>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Recent Feedback</h4>
                    <div className="space-y-2">
                      <div className="p-2 border rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">John Smith</span>
                          <Badge className="bg-green-500">Positive</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          "Excellent support from the team, very professional"
                        </p>
                      </div>
                      <div className="p-2 border rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Sarah Johnson</span>
                          <Badge className="bg-yellow-500">Neutral</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          "Service was good but timing could be improved"
                        </p>
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
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheckIcon className="h-5 w-5" />
                  NDIS Service Delivery Compliance & Efficiency
                </CardTitle>
                <CardDescription>Performance against NDIS standards and efficiency targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Efficiency Metrics vs Targets */}
                  <div>
                    <h4 className="font-medium mb-4">Efficiency Performance vs NDIS Targets</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Service Utilization</span>
                          <span className="text-sm">
                            {currentPerformance.serviceUtilization}% / {efficiencyMetrics.serviceUtilization?.target}% target
                          </span>
                        </div>
                        <Progress 
                          value={(currentPerformance.serviceUtilization / efficiencyMetrics.serviceUtilization?.target) * 100} 
                          className="h-2"
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Staff Productivity</span>
                          <span className="text-sm">
                            {currentPerformance.staffProductivity}% / {efficiencyMetrics.staffProductivity?.target}% target
                          </span>
                        </div>
                        <Progress 
                          value={(currentPerformance.staffProductivity / efficiencyMetrics.staffProductivity?.target) * 100} 
                          className="h-2"
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Quality Score</span>
                          <span className="text-sm">
                            {currentPerformance.qualityScore} / {efficiencyMetrics.qualityScore?.target} target
                          </span>
                        </div>
                        <Progress 
                          value={(currentPerformance.qualityScore / efficiencyMetrics.qualityScore?.target) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* NDIS Compliance Workflow */}
                  <div className="p-4 border rounded-lg bg-green-50">
                    <h4 className="font-medium mb-3">NDIS Service Delivery Workflow Compliance</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Support worker qualifications verified</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Service agreements in place</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Progress notes completed timely</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Incident reporting within 24hrs</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertCircleIcon className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">Supervision notes pending (2)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Participant feedback collected</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key Performance Indicators */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground">Weekly Services</p>
                      <p className="text-xl font-bold">342</p>
                      <p className="text-xs text-green-600">+12% vs last week</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground">NDIS Compliance Rate</p>
                      <p className="text-xl font-bold">96.5%</p>
                      <p className="text-xs text-green-600">Exceeds requirement</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground">Cost Efficiency</p>
                      <p className="text-xl font-bold">$127/service</p>
                      <p className="text-xs text-green-600">-3% improvement</p>
                    </div>
                  </div>

                  <Button className="w-full">Generate NDIS Compliance Report</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
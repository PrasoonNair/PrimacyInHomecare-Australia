import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircleIcon,
  AlertCircleIcon,
  ClipboardCheckIcon,
  FileTextIcon,
  TrendingUpIcon,
  ShieldCheckIcon,
  BarChart3Icon,
  AlertTriangleIcon
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function QualityManagerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: audits = [] } = useQuery({
    queryKey: ["/api/audits"],
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Quality Manager Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName} - Quality & Compliance Management
          </p>
        </div>

        {/* Quality Metrics */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
              <ShieldCheckIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98%</div>
              <p className="text-xs text-muted-foreground">NDIS Standards</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Incidents</CardTitle>
              <AlertCircleIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">1 critical</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Audits This Month</CardTitle>
              <ClipboardCheckIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">8 completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
              <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8/5.0</div>
              <p className="text-xs text-muted-foreground">+0.1 this quarter</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="audits">Audits</TabsTrigger>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quality Dashboard</CardTitle>
                <CardDescription>Current quality and compliance status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-red-50">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <AlertTriangleIcon className="h-5 w-5 text-red-500" />
                      Critical Issues Requiring Attention
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Medication Error - High Priority</p>
                          <p className="text-sm text-muted-foreground">Reported 2 days ago</p>
                        </div>
                        <Button size="sm" variant="destructive">Investigate</Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-3">NDIS Practice Standards</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Rights & Responsibilities</span>
                          <Badge className="bg-green-500">100%</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Governance & Operations</span>
                          <Badge className="bg-green-500">98%</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Service Provision</span>
                          <Badge className="bg-green-500">96%</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Service Environment</span>
                          <Badge className="bg-green-500">99%</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-3">Recent Quality Activities</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Internal audit completed</span>
                          <span className="text-muted-foreground">Today</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Staff training conducted</span>
                          <span className="text-muted-foreground">Yesterday</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Policy review completed</span>
                          <span className="text-muted-foreground">3 days ago</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Incident investigation closed</span>
                          <span className="text-muted-foreground">5 days ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audits" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Audit Management</CardTitle>
                <CardDescription>Internal and external audit tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Button>Schedule New Audit</Button>
                    <Button variant="outline">Audit Calendar</Button>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">Service Delivery Audit</p>
                          <p className="text-sm text-muted-foreground">Scheduled for Monday</p>
                        </div>
                        <Badge>Upcoming</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm">View Checklist</Button>
                        <Button size="sm" variant="outline">Assign Auditor</Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">Documentation Review</p>
                          <p className="text-sm text-muted-foreground">In progress - 60% complete</p>
                        </div>
                        <Badge className="bg-blue-500">In Progress</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm">Continue Audit</Button>
                        <Button size="sm" variant="outline">View Findings</Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">NDIS Compliance Audit</p>
                          <p className="text-sm text-muted-foreground">Completed last week</p>
                        </div>
                        <Badge className="bg-green-500">Completed</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View Report</Button>
                        <Button size="sm" variant="outline">Action Plan</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incidents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Incident Management</CardTitle>
                <CardDescription>Track and investigate quality incidents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground">Open Incidents</p>
                      <p className="text-2xl font-bold">3</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground">Under Investigation</p>
                      <p className="text-2xl font-bold">2</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground">Closed This Month</p>
                      <p className="text-2xl font-bold">8</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg border-red-200">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">INC-2024-045: Medication Error</p>
                          <p className="text-sm text-muted-foreground">Severity: High | Status: Investigation</p>
                        </div>
                        <Badge className="bg-red-500">Critical</Badge>
                      </div>
                      <Button size="sm">View Details</Button>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">INC-2024-044: Fall Incident</p>
                          <p className="text-sm text-muted-foreground">Severity: Medium | Status: Review</p>
                        </div>
                        <Badge className="bg-yellow-500">Medium</Badge>
                      </div>
                      <Button size="sm">View Details</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Monitoring</CardTitle>
                <CardDescription>Regulatory compliance tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-green-50">
                    <h4 className="font-medium mb-3">NDIS Compliance Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Worker Screening</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{width: '100%'}}></div>
                          </div>
                          <span className="text-sm font-medium">100%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Documentation</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{width: '96%'}}></div>
                          </div>
                          <span className="text-sm font-medium">96%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Training Requirements</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{width: '94%'}}></div>
                          </div>
                          <span className="text-sm font-medium">94%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button>Compliance Checklist</Button>
                    <Button variant="outline">Policy Review</Button>
                    <Button variant="outline">Training Matrix</Button>
                    <Button variant="outline">Risk Register</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quality Reports</CardTitle>
                <CardDescription>Generate and download quality reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline">Monthly Quality Report</Button>
                  <Button variant="outline">Incident Analysis</Button>
                  <Button variant="outline">Audit Summary</Button>
                  <Button variant="outline">Compliance Dashboard</Button>
                  <Button variant="outline">Risk Assessment</Button>
                  <Button variant="outline">Training Compliance</Button>
                  <Button variant="outline">Customer Feedback</Button>
                  <Button variant="outline">NDIS Compliance Report</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
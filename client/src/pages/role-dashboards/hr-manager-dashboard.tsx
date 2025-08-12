import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UsersIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  ClipboardCheckIcon,
  TrendingUpIcon,
  CalendarIcon,
  UserPlusIcon,
  AlertCircleIcon
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function HRManagerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: staff = [] } = useQuery({
    queryKey: ["/api/staff"],
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            HR Manager Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName} - Human Resources Management
          </p>
        </div>

        {/* HR Metrics */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127</div>
              <p className="text-xs text-muted-foreground">+5 this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
              <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">3 urgent</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Training Due</CardTitle>
              <GraduationCapIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
              <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92%</div>
              <p className="text-xs text-muted-foreground">Annual average</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
            <TabsTrigger value="staff">Staff Management</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>HR Priorities</CardTitle>
                <CardDescription>Critical HR tasks requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertCircleIcon className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="font-medium">Urgent: Support Worker Positions</p>
                        <p className="text-sm text-muted-foreground">3 positions need immediate filling</p>
                      </div>
                    </div>
                    <Button size="sm">Review</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <GraduationCapIcon className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="font-medium">Mandatory Training Expiring</p>
                        <p className="text-sm text-muted-foreground">12 staff - Manual Handling certification</p>
                      </div>
                    </div>
                    <Button size="sm">Schedule</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <ClipboardCheckIcon className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Performance Reviews Due</p>
                        <p className="text-sm text-muted-foreground">8 staff members this week</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">View List</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workforce Analytics</CardTitle>
                <CardDescription>Key HR metrics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Average Tenure</p>
                    <p className="text-2xl font-bold">3.2 years</p>
                    <p className="text-xs text-green-600">+6 months vs last year</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Staff Satisfaction</p>
                    <p className="text-2xl font-bold">4.3/5.0</p>
                    <p className="text-xs text-green-600">+0.2 from last survey</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Time to Hire</p>
                    <p className="text-2xl font-bold">18 days</p>
                    <p className="text-xs text-orange-600">Target: 14 days</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Training Completion</p>
                    <p className="text-2xl font-bold">87%</p>
                    <p className="text-xs text-green-600">Above target</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recruitment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Recruitment</CardTitle>
                <CardDescription>Current open positions and pipeline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">Senior Support Worker</p>
                        <p className="text-sm text-muted-foreground">Melbourne Region - Full Time</p>
                      </div>
                      <Badge className="bg-red-500">Urgent</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span>12 applicants</span>
                      <span>3 interviews scheduled</span>
                      <Button size="sm">Review Candidates</Button>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">Service Coordinator</p>
                        <p className="text-sm text-muted-foreground">Head Office - Full Time</p>
                      </div>
                      <Badge>Active</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span>8 applicants</span>
                      <span>2 interviews scheduled</span>
                      <Button size="sm">Review Candidates</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Staff Management</CardTitle>
                <CardDescription>Employee records and administration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Button>Add New Employee</Button>
                    <Button variant="outline">Export Staff List</Button>
                  </div>
                  <div className="space-y-3">
                    {staff.slice(0, 5).map((member: any) => (
                      <div key={member.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{member.firstName} {member.lastName}</p>
                            <p className="text-sm text-muted-foreground">
                              {member.position} - {member.department}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">View Profile</Button>
                            <Button size="sm" variant="outline">Edit</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="training" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Training Management</CardTitle>
                <CardDescription>Staff training and development programs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-yellow-50">
                    <h4 className="font-medium mb-2">Upcoming Training Sessions</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Manual Handling Certification</p>
                          <p className="text-sm text-muted-foreground">Tomorrow, 9:00 AM - 12 participants</p>
                        </div>
                        <Button size="sm">Manage</Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">NDIS Code of Conduct</p>
                          <p className="text-sm text-muted-foreground">Friday, 2:00 PM - 8 participants</p>
                        </div>
                        <Button size="sm">Manage</Button>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full">Schedule New Training</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Dashboard</CardTitle>
                <CardDescription>Staff compliance and certification tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">NDIS Worker Screening</p>
                      <Badge className="bg-green-500">98% Compliant</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      124 of 127 staff have valid clearances
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">First Aid Certification</p>
                      <Badge className="bg-yellow-500">85% Compliant</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      19 staff need renewal within 30 days
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Police Checks</p>
                      <Badge className="bg-green-500">100% Compliant</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      All staff have current police checks
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
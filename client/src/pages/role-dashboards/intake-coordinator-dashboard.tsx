import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UserPlusIcon, 
  PhoneIcon,
  FileTextIcon,
  ClipboardListIcon,
  CalendarIcon,
  UsersIcon,
  TrendingUpIcon,
  AlertCircleIcon
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

export default function IntakeCoordinatorDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch dashboard data
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/intake-coordinator"],
  });

  const { data: referrals = [] } = useQuery({
    queryKey: ["/api/referrals"],
  });

  const { data: participants = [] } = useQuery({
    queryKey: ["/api/participants"],
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Intake Coordinator Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName} - Manage new referrals and participant intake
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Referrals</CardTitle>
              <AlertCircleIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {referrals.filter((r: any) => r.status === "pending").length}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting initial contact</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week's Intakes</CardTitle>
              <UserPlusIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+3 from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled Assessments</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Next 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documentation Pending</CardTitle>
              <FileTextIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">Requires completion</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="tasks">My Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Today's Priority Actions</CardTitle>
                <CardDescription>Tasks requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <PhoneIcon className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Contact John Smith</p>
                        <p className="text-sm text-muted-foreground">New referral - Initial phone assessment</p>
                      </div>
                    </div>
                    <Button size="sm">Start Call</Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileTextIcon className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="font-medium">Complete Intake Form</p>
                        <p className="text-sm text-muted-foreground">Sarah Johnson - Missing documentation</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Complete</Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">Schedule Assessment</p>
                        <p className="text-sm text-muted-foreground">Michael Brown - Awaiting appointment</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Schedule</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest intake activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Completed initial assessment for Emma Wilson</span>
                    <span className="text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Scheduled home visit for Robert Davis</span>
                    <span className="text-muted-foreground">4 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Updated referral status for Lisa Anderson</span>
                    <span className="text-muted-foreground">Yesterday</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Referrals</CardTitle>
                <CardDescription>Manage incoming participant referrals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {referrals.slice(0, 5).map((referral: any) => (
                    <div key={referral.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{referral.participantName || "New Referral"}</p>
                          <p className="text-sm text-muted-foreground">
                            Source: {referral.referralSource} | Date: {format(new Date(referral.referralDate), "dd/MM/yyyy")}
                          </p>
                        </div>
                        <Badge variant={referral.status === "pending" ? "secondary" : "default"}>
                          {referral.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm">Contact</Button>
                        <Button size="sm" variant="outline">View Details</Button>
                        <Button size="sm" variant="outline">Schedule Assessment</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assessments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Assessments</CardTitle>
                <CardDescription>Scheduled participant assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Initial Needs Assessment - John Smith</p>
                        <p className="text-sm text-muted-foreground">Tomorrow at 10:00 AM - Home Visit</p>
                      </div>
                      <Button size="sm">Prepare</Button>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Support Needs Review - Sarah Johnson</p>
                        <p className="text-sm text-muted-foreground">Thursday at 2:00 PM - Office</p>
                      </div>
                      <Button size="sm">Prepare</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Tasks</CardTitle>
                <CardDescription>Your pending intake tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <ClipboardListIcon className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Complete eligibility checklist</p>
                        <p className="text-sm text-muted-foreground">For: Michael Brown - Due today</p>
                      </div>
                    </div>
                    <Button size="sm">Complete</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <PhoneIcon className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Follow-up call with family</p>
                        <p className="text-sm text-muted-foreground">For: Emma Wilson - Due tomorrow</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Schedule</Button>
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
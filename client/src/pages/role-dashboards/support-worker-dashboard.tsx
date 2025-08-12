import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CalendarIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  FileTextIcon,
  PhoneIcon,
  CheckCircleIcon,
  AlertCircleIcon
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

export default function SupportWorkerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("today");

  // Mock shift data
  const todayShifts = [
    {
      id: 1,
      participant: "John Smith",
      time: "9:00 AM - 1:00 PM",
      location: "123 Main St, Melbourne",
      service: "Personal Care",
      status: "upcoming"
    },
    {
      id: 2,
      participant: "Sarah Johnson",
      time: "2:00 PM - 6:00 PM", 
      location: "456 Oak Ave, Richmond",
      service: "Community Access",
      status: "upcoming"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Support Worker Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName} - Your daily schedule and participant support
          </p>
        </div>

        {/* Daily Summary */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Shifts</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">8 hours total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">38 hrs</div>
              <p className="text-xs text-muted-foreground">5 participants</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notes Pending</CardTitle>
              <FileTextIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Complete after shift</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Training</CardTitle>
              <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">Manual Handling</div>
              <p className="text-xs text-muted-foreground">Due in 14 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="today">Today's Schedule</TabsTrigger>
            <TabsTrigger value="participants">My Participants</TabsTrigger>
            <TabsTrigger value="notes">Progress Notes</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Today's Shifts - {format(new Date(), "EEEE, dd MMMM yyyy")}</CardTitle>
                <CardDescription>Your scheduled support sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todayShifts.map((shift) => (
                    <div key={shift.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-lg">{shift.participant}</p>
                          <p className="text-sm text-muted-foreground">{shift.service}</p>
                        </div>
                        <Badge variant="outline">{shift.status}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-muted-foreground" />
                          <span>{shift.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                          <span>{shift.location}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm">Clock In</Button>
                        <Button size="sm" variant="outline">View Details</Button>
                        <Button size="sm" variant="outline">Contact Participant</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Frequently used functions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button className="h-20" variant="outline">
                    <div className="flex flex-col items-center">
                      <ClockIcon className="h-5 w-5 mb-1" />
                      <span>Clock In/Out</span>
                    </div>
                  </Button>
                  <Button className="h-20" variant="outline">
                    <div className="flex flex-col items-center">
                      <FileTextIcon className="h-5 w-5 mb-1" />
                      <span>Write Note</span>
                    </div>
                  </Button>
                  <Button className="h-20" variant="outline">
                    <div className="flex flex-col items-center">
                      <AlertCircleIcon className="h-5 w-5 mb-1" />
                      <span>Report Incident</span>
                    </div>
                  </Button>
                  <Button className="h-20" variant="outline">
                    <div className="flex flex-col items-center">
                      <PhoneIcon className="h-5 w-5 mb-1" />
                      <span>Emergency Contact</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="participants" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Regular Participants</CardTitle>
                <CardDescription>Participants you regularly support</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">John Smith</p>
                        <p className="text-sm text-muted-foreground">NDIS #: 430000123</p>
                        <p className="text-sm">Primary needs: Personal care, community access</p>
                      </div>
                      <div className="text-right">
                        <Button size="sm">View Profile</Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Sarah Johnson</p>
                        <p className="text-sm text-muted-foreground">NDIS #: 430000124</p>
                        <p className="text-sm">Primary needs: Social support, skill development</p>
                      </div>
                      <div className="text-right">
                        <Button size="sm">View Profile</Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Michael Brown</p>
                        <p className="text-sm text-muted-foreground">NDIS #: 430000125</p>
                        <p className="text-sm">Primary needs: Daily living assistance</p>
                      </div>
                      <div className="text-right">
                        <Button size="sm">View Profile</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Progress Notes</CardTitle>
                <CardDescription>Document participant support sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg bg-yellow-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircleIcon className="h-4 w-4 text-yellow-600" />
                          <p className="font-medium">Pending Note Required</p>
                        </div>
                        <p className="text-sm">John Smith - Morning shift (9:00 AM - 1:00 PM)</p>
                        <p className="text-sm text-muted-foreground">Date: {format(new Date(), "dd/MM/yyyy")}</p>
                      </div>
                      <Button size="sm">Write Note</Button>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Recent Note Submitted</p>
                        <p className="text-sm">Sarah Johnson - Community access</p>
                        <p className="text-sm text-muted-foreground">Submitted: Yesterday at 6:15 PM</p>
                      </div>
                      <Badge className="bg-green-500">Completed</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Support Resources</CardTitle>
                <CardDescription>Important documents and contacts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-3">Emergency Contacts</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span>On-Call Manager</span>
                        <Button size="sm" variant="outline">
                          <PhoneIcon className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span>Office Support</span>
                        <Button size="sm" variant="outline">
                          <PhoneIcon className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Quick Reference</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm">Incident Reporting Guide</Button>
                      <Button variant="outline" size="sm">Medication Procedures</Button>
                      <Button variant="outline" size="sm">NDIS Code of Conduct</Button>
                      <Button variant="outline" size="sm">Privacy Guidelines</Button>
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
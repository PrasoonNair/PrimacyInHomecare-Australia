import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  User, Calendar as CalendarIcon, FileText, DollarSign, 
  Target, MessageSquare, Download, Clock, CheckCircle,
  AlertCircle, TrendingUp, Users, Home, Phone, Mail,
  MapPin, Heart, Activity, BookOpen, Settings
} from "lucide-react";
import { format } from "date-fns";

export function ParticipantPortal() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch participant data
  const { data: participant } = useQuery({
    queryKey: ["/api/participant-portal/profile"],
    enabled: true
  });

  const { data: planDetails } = useQuery({
    queryKey: ["/api/participant-portal/plan"],
    enabled: true
  });

  const { data: upcomingServices } = useQuery({
    queryKey: ["/api/participant-portal/services/upcoming"],
    enabled: true
  });

  const { data: goals } = useQuery({
    queryKey: ["/api/participant-portal/goals"],
    enabled: true
  });

  const { data: documents } = useQuery({
    queryKey: ["/api/participant-portal/documents"],
    enabled: true
  });

  // Calculate budget usage
  const calculateBudgetUsage = (category: any) => {
    if (!category) return 0;
    const used = parseFloat(category.used || "0");
    const total = parseFloat(category.total || "0");
    return total > 0 ? (used / total) * 100 : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      {/* Header */}
      <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback>
                {participant?.firstName?.[0]}{participant?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {participant?.firstName}!
              </h1>
              <p className="text-gray-600">NDIS Number: {participant?.ndisNumber}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button variant="outline" size="sm">
              <MessageSquare className="mr-2 h-4 w-4" />
              Messages
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full bg-white">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plan">My Plan</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Quick Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Plan Status</CardTitle>
                <Activity className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Active</div>
                <p className="text-xs text-muted-foreground">
                  Expires {planDetails?.endDate ? format(new Date(planDetails.endDate), "PPP") : "N/A"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Services This Week</CardTitle>
                <CalendarIcon className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingServices?.thisWeek || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Next: {upcomingServices?.next?.service || "No upcoming services"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Goals Progress</CardTitle>
                <Target className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{goals?.completed || 0}/{goals?.total || 0}</div>
                <Progress value={(goals?.completed / goals?.total) * 100 || 0} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Services */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Services</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {upcomingServices?.services?.map((service: any) => (
                    <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{service.serviceType}</p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(service.date), "PPP")} at {service.time}
                          </p>
                          <p className="text-sm text-gray-500">
                            Support Worker: {service.staffName}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">Reschedule</Button>
                        <Button size="sm" variant="outline">Cancel</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Goal Achieved: Daily Living Skills</p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Progress Note Added</p>
                    <p className="text-xs text-gray-500">3 days ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Users className="h-5 w-5 text-purple-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">New Support Worker Assigned</p>
                    <p className="text-xs text-gray-500">1 week ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Plan Tab */}
        <TabsContent value="plan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>NDIS Plan Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Plan Start Date</p>
                  <p className="font-medium">{planDetails?.startDate ? format(new Date(planDetails.startDate), "PPP") : "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Plan End Date</p>
                  <p className="font-medium">{planDetails?.endDate ? format(new Date(planDetails.endDate), "PPP") : "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Budget</p>
                  <p className="font-medium text-green-600">${planDetails?.totalBudget || "0"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Plan Manager</p>
                  <p className="font-medium">{planDetails?.planManager || "Self-Managed"}</p>
                </div>
              </div>

              {/* Budget Categories */}
              <div className="space-y-4">
                <h3 className="font-semibold">Budget Categories</h3>
                {planDetails?.categories?.map((category: any) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-gray-600">
                        ${category.used} / ${category.total}
                      </span>
                    </div>
                    <Progress value={calculateBudgetUsage(category)} className="h-2" />
                    <p className="text-xs text-gray-500">
                      ${category.remaining} remaining ({100 - calculateBudgetUsage(category)}%)
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Support Items */}
          <Card>
            <CardHeader>
              <CardTitle>Approved Support Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {planDetails?.supportItems?.map((item: any) => (
                  <div key={item.code} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">Code: {item.code}</p>
                    </div>
                    <Badge>{item.category}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Service Calendar */}
            <Card>
              <CardHeader>
                <CardTitle>Service Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            {/* Service Details */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Services on {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Service items would be mapped here */}
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Personal Care</p>
                        <p className="text-sm text-gray-600">9:00 AM - 11:00 AM</p>
                        <p className="text-sm text-gray-500">Sarah Johnson</p>
                      </div>
                      <Badge variant="outline">Confirmed</Badge>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Community Access</p>
                        <p className="text-sm text-gray-600">2:00 PM - 4:00 PM</p>
                        <p className="text-sm text-gray-500">Mike Wilson</p>
                      </div>
                      <Badge variant="outline">Confirmed</Badge>
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-4">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Request New Service
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Service History */}
          <Card>
            <CardHeader>
              <CardTitle>Service History</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {/* Service history items would be mapped here */}
                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">Daily Living Support</p>
                        <p className="text-sm text-gray-600">January 10, 2025 - 2 hours</p>
                        <p className="text-sm text-gray-500">Completed by: Emma Brown</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <FileText className="mr-2 h-4 w-4" />
                        View Notes
                      </Button>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals?.items?.map((goal: any) => (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                    <Badge variant={goal.status === "completed" ? "default" : "secondary"}>
                      {goal.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{goal.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} />
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">Next Steps:</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {goal.nextSteps?.map((step: string, index: number) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      Target: {goal.targetDate ? format(new Date(goal.targetDate), "PPP") : "No target set"}
                    </p>
                    <Button size="sm" variant="outline">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Update Progress
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add New Goal */}
          <Card>
            <CardHeader>
              <CardTitle>Request New Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Work with your support coordinator to add new goals to your plan.
              </p>
              <Button>
                <Target className="mr-2 h-4 w-4" />
                Request Goal Discussion
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>My Documents</CardTitle>
                <Button size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {documents?.items?.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-gray-600">
                          {doc.type} • {doc.size} • {format(new Date(doc.uploadedAt), "PPP")}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">View</Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Document Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">NDIS Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-gray-600">Documents</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Service Agreements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-gray-600">Documents</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Progress Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-gray-600">Documents</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Support Tab */}
        <TabsContent value="support" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact Support Team */}
            <Card>
              <CardHeader>
                <CardTitle>Your Support Team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>SC</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">Sarah Chen</p>
                      <p className="text-sm text-gray-600">Support Coordinator</p>
                      <div className="flex space-x-4 mt-2">
                        <Button size="sm" variant="outline">
                          <Phone className="mr-2 h-4 w-4" />
                          Call
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="mr-2 h-4 w-4" />
                          Email
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>PM</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">Peter Mitchell</p>
                      <p className="text-sm text-gray-600">Plan Manager</p>
                      <div className="flex space-x-4 mt-2">
                        <Button size="sm" variant="outline">
                          <Phone className="mr-2 h-4 w-4" />
                          Call
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="mr-2 h-4 w-4" />
                          Email
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button className="w-full justify-start" variant="outline">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Report an Incident
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Submit Feedback
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Heart className="mr-2 h-4 w-4" />
                    Request Support Change
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Access Resources
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Contacts */}
          <Card>
            <CardHeader className="bg-red-50">
              <CardTitle className="text-red-700">Emergency Contacts</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Phone className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <p className="font-semibold">Emergency</p>
                  <p className="text-2xl font-bold text-red-600">000</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Phone className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="font-semibold">After Hours Support</p>
                  <p className="text-xl font-bold text-orange-600">1300 XXX XXX</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Phone className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-semibold">NDIS Helpline</p>
                  <p className="text-xl font-bold text-blue-600">1800 800 110</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Helpful Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a href="#" className="p-4 border rounded-lg hover:bg-gray-50 flex items-center space-x-3">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">NDIS Participant Handbook</p>
                    <p className="text-sm text-gray-600">Learn about your rights and responsibilities</p>
                  </div>
                </a>
                <a href="#" className="p-4 border rounded-lg hover:bg-gray-50 flex items-center space-x-3">
                  <Users className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Community Groups</p>
                    <p className="text-sm text-gray-600">Connect with local support networks</p>
                  </div>
                </a>
                <a href="#" className="p-4 border rounded-lg hover:bg-gray-50 flex items-center space-x-3">
                  <Heart className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium">Wellbeing Resources</p>
                    <p className="text-sm text-gray-600">Mental health and wellness support</p>
                  </div>
                </a>
                <a href="#" className="p-4 border rounded-lg hover:bg-gray-50 flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Local Services Directory</p>
                    <p className="text-sm text-gray-600">Find services in your area</p>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
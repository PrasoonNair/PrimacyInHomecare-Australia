import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, UserPlus, Award, Calendar, CheckCircle,
  Clock, AlertTriangle, TrendingUp, Shield, BookOpen,
  Briefcase, Star, Target, Zap
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function HRDepartmentDashboard() {
  const [processingScreening, setProcessingScreening] = useState(false);
  const { toast } = useToast();

  // Fetch HR metrics
  const { data: metrics } = useQuery({
    queryKey: ["/api/hr/metrics"],
    enabled: true
  });

  // Fetch staff data
  const { data: staffData } = useQuery({
    queryKey: ["/api/hr/staff"],
    enabled: true
  });

  // NDIS worker screening check
  const workerScreeningMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/hr/worker-screening", {
      method: "POST",
      body: JSON.stringify(data)
    }),
    onSuccess: (result) => {
      toast({
        title: "Screening Complete",
        description: `Worker cleared: ${result.clearance}. NDIS check valid until ${result.expiryDate}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/hr"] });
    }
  });

  // Automated onboarding
  const startOnboardingMutation = useMutation({
    mutationFn: (staffId: string) => apiRequest("/api/hr/onboarding/start", {
      method: "POST",
      body: JSON.stringify({ staffId, automated: true })
    }),
    onSuccess: () => {
      toast({
        title: "Onboarding Initiated",
        description: "Automated onboarding workflow started. Documents sent for signing.",
      });
    }
  });

  // Calculate HR metrics
  const retentionRate = metrics?.retained && metrics?.totalStaff ? 
    ((metrics.retained / metrics.totalStaff) * 100).toFixed(1) : "0";
  
  const complianceRate = metrics?.compliantStaff && metrics?.totalStaff ? 
    ((metrics.compliantStaff / metrics.totalStaff) * 100).toFixed(1) : "0";

  return (
    <div className="p-6 space-y-6">
      {/* Department Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">HR & Recruitment Department</h1>
        <p className="text-orange-100">Automated onboarding, NDIS compliance, and workforce optimization</p>
      </div>

      {/* HR Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalStaff || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active: {metrics?.activeStaff || 0} | On leave: {metrics?.onLeave || 0}
            </p>
            <Badge variant="outline" className="mt-2">+3 this month</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{retentionRate}%</div>
            <Progress value={parseFloat(retentionRate)} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">Industry avg: 75%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceRate}%</div>
            <Progress value={parseFloat(complianceRate)} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">NDIS compliant</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vacancies</CardTitle>
            <Briefcase className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.vacancies || 5}</div>
            <p className="text-xs text-muted-foreground">Urgent: {metrics?.urgentVacancies || 2}</p>
            <Button size="sm" variant="outline" className="mt-2 w-full">
              View Positions
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Automated HR Workflows */}
      <Card>
        <CardHeader>
          <CardTitle>Automated HR Processes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Onboarding</h3>
                <UserPlus className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Digital welcome workflow
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>In progress:</span>
                  <span className="font-medium">3 staff</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg time:</span>
                  <span className="font-medium">2 days</span>
                </div>
              </div>
              <Button size="sm" className="w-full mt-3">
                Start Onboarding
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">NDIS Screening</h3>
                <Shield className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Worker check verification
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Pending:</span>
                  <span className="font-medium">2 checks</span>
                </div>
                <div className="flex justify-between">
                  <span>Expiring:</span>
                  <span className="font-medium text-orange-600">5 soon</span>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full mt-3"
                onClick={() => workerScreeningMutation.mutate({ bulk: true })}
              >
                Check Status
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Training</h3>
                <BookOpen className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Compliance tracking
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Due:</span>
                  <span className="font-medium">8 modules</span>
                </div>
                <div className="flex justify-between">
                  <span>Compliance:</span>
                  <Badge variant="outline" className="text-xs">94%</Badge>
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full mt-3">
                View Training
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Performance</h3>
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Automated reviews
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Reviews due:</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg score:</span>
                  <span className="font-medium">4.3/5</span>
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full mt-3">
                Start Reviews
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HR Management Tabs */}
      <Tabs defaultValue="recruitment" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        <TabsContent value="recruitment" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Active Recruitment Pipeline</CardTitle>
                <Badge variant="outline">5 open positions</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { role: "Support Worker", location: "Western Sydney", applications: 12, urgent: true },
                  { role: "Team Leader", location: "North Shore", applications: 8, urgent: false },
                  { role: "Allied Health Assistant", location: "Inner West", applications: 15, urgent: true }
                ].map((job) => (
                  <div key={job.role} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">{job.role}</h4>
                          {job.urgent && <Badge variant="destructive">Urgent</Badge>}
                        </div>
                        <p className="text-sm text-gray-600">{job.location}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {job.applications} applications received
                        </p>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <Button size="sm">Review</Button>
                        <Button size="sm" variant="outline">Share</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 border rounded-lg bg-blue-50">
                <h4 className="font-semibold mb-2">Recruitment Funnel</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Applications</span>
                    <span className="font-medium">45</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Screening</span>
                    <span className="font-medium">28</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interviews</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Offers</span>
                    <span className="font-medium">3</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="onboarding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Digital Onboarding Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  Automated onboarding reduces time-to-productivity by 60%
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">Sarah Chen</h4>
                        <p className="text-sm text-gray-600">Support Worker • Start date: Monday</p>
                        <div className="mt-2">
                          <Progress value={65} className="w-48" />
                          <p className="text-xs text-gray-500 mt-1">65% complete</p>
                        </div>
                      </div>
                      <div>
                        <div className="space-y-1 text-xs text-right mb-2">
                          <div>✓ Contract signed</div>
                          <div>✓ NDIS check cleared</div>
                          <div>⏳ Training modules</div>
                          <div>⏳ Uniform collection</div>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => startOnboardingMutation.mutate(`staff-${i}`)}
                        >
                          Continue
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Compliance Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-3 border rounded-lg">
                  <p className="text-sm text-gray-600">Mandatory Training</p>
                  <p className="text-xl font-bold">94%</p>
                  <p className="text-xs text-gray-500">Compliance rate</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-sm text-gray-600">Expiring Soon</p>
                  <p className="text-xl font-bold text-orange-600">8</p>
                  <p className="text-xs text-gray-500">Certifications</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-xl font-bold">23</p>
                  <p className="text-xs text-gray-500">Completions</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">Required Training Modules</h4>
                  <div className="space-y-2">
                    {[
                      { module: "NDIS Code of Conduct", completion: 98 },
                      { module: "Manual Handling", completion: 92 },
                      { module: "Medication Management", completion: 87 },
                      { module: "Infection Control", completion: 95 }
                    ].map((training) => (
                      <div key={training.module}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{training.module}</span>
                          <span>{training.completion}%</span>
                        </div>
                        <Progress value={training.completion} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">4.3</div>
                  <p className="text-xs text-gray-600">Avg Rating</p>
                  <div className="flex justify-center mt-1">
                    {[1, 2, 3, 4].map((star) => (
                      <span key={star} className="text-yellow-500">★</span>
                    ))}
                    <span className="text-gray-300">★</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">85%</div>
                  <p className="text-xs text-gray-600">Goals Met</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-gray-600">Reviews Due</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">8</div>
                  <p className="text-xs text-gray-600">Promotions</p>
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-green-50">
                <h4 className="font-semibold mb-2">Top Performers</h4>
                <div className="space-y-2">
                  {[
                    { name: "Michael Johnson", score: 4.8, badge: "Star Performer" },
                    { name: "Lisa Wang", score: 4.7, badge: "Rising Star" },
                    { name: "David Smith", score: 4.6, badge: "Consistent Excellence" }
                  ].map((performer) => (
                    <div key={performer.name} className="flex justify-between items-center">
                      <span className="text-sm">{performer.name}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">{performer.badge}</Badge>
                        <span className="text-sm font-medium">{performer.score}/5</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Availability Optimizer</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4 border-blue-500 bg-blue-50">
                <Calendar className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  AI predicts 92% shift coverage for next week based on current availability
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">This Week</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Available staff</span>
                      <span className="font-medium">39/47</span>
                    </div>
                    <div className="flex justify-between">
                      <span>On leave</span>
                      <span className="font-medium">5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sick leave</span>
                      <span className="font-medium">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coverage</span>
                      <Badge variant="outline">95%</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">Shift Preferences</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Morning shifts</span>
                      <span className="font-medium">28 prefer</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Evening shifts</span>
                      <span className="font-medium">15 prefer</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weekend available</span>
                      <span className="font-medium">22 staff</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Flexible</span>
                      <span className="font-medium">18 staff</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Button className="w-full">
                  <Target className="mr-2 h-4 w-4" />
                  Optimize Next Week's Roster
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
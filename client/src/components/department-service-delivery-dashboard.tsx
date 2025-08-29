import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, Calendar, Activity, Target, MapPin,
  Clock, CheckCircle, AlertTriangle, TrendingUp,
  UserCheck, Zap, BarChart, Shield, Heart
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function ServiceDeliveryDashboard() {
  const [optimizingRoster, setOptimizingRoster] = useState(false);
  const { toast } = useToast();

  // Fetch service metrics
  const { data: metrics } = useQuery({
    queryKey: ["/api/service-delivery/metrics"],
    enabled: true
  });

  // Fetch shifts data
  const { data: shifts } = useQuery({
    queryKey: ["/api/service-delivery/shifts"],
    enabled: true
  });

  // Smart roster optimization
  const optimizeRosterMutation = useMutation({
    mutationFn: () => apiRequest("/api/service-delivery/optimize-roster", {
      method: "POST",
      body: JSON.stringify({ 
        algorithm: "ai-matching",
        factors: ["skills", "location", "preferences", "availability"]
      })
    }),
    onSuccess: (result) => {
      toast({
        title: "Roster Optimized",
        description: `${result.optimized} shifts optimized. Travel time reduced by ${result.travelReduction}%`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/service-delivery"] });
    }
  });

  // Participant matching
  const matchParticipantMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/service-delivery/match-participant", {
      method: "POST",
      body: JSON.stringify(data)
    }),
    onSuccess: (result) => {
      toast({
        title: "Perfect Match Found",
        description: `${result.workerName} matched with ${result.matchScore}% compatibility`,
      });
    }
  });

  // Calculate service metrics
  const utilizationRate = metrics?.hoursDelivered && metrics?.hoursAvailable ? 
    ((metrics.hoursDelivered / metrics.hoursAvailable) * 100).toFixed(1) : "0";
  
  const satisfactionScore = metrics?.satisfactionScore || "4.5";

  return (
    <div className="p-6 space-y-6">
      {/* Department Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Service Delivery Department</h1>
        <p className="text-purple-100">Intelligent roster optimization and participant-centered service coordination</p>
      </div>

      {/* Service Delivery Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activeServices || 0}</div>
            <p className="text-xs text-muted-foreground">This week: {metrics?.servicesThisWeek || 0}</p>
            <Progress value={85} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
            <BarChart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{utilizationRate}%</div>
            <p className="text-xs text-muted-foreground">Target: 85%</p>
            <Progress value={parseFloat(utilizationRate)} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Score</CardTitle>
            <Heart className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{satisfactionScore}/5.0</div>
            <div className="flex space-x-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={star <= parseFloat(satisfactionScore) ? "text-yellow-500" : "text-gray-300"}>
                  ★
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incident Rate</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">0.3%</div>
            <p className="text-xs text-muted-foreground">↓ 25% from last month</p>
            <Badge variant="outline" className="mt-2">Excellent</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Smart Service Optimization */}
      <Card>
        <CardHeader>
          <CardTitle>Intelligent Service Optimization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">AI Roster</h3>
                <Zap className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Smart shift allocation
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Efficiency:</span>
                  <span className="font-medium text-green-600">+28%</span>
                </div>
                <div className="flex justify-between">
                  <span>Travel saved:</span>
                  <span className="font-medium">45 min/day</span>
                </div>
              </div>
              <Button 
                size="sm" 
                className="w-full mt-3"
                onClick={() => optimizeRosterMutation.mutate()}
                disabled={optimizingRoster}
              >
                Optimize Now
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Matching</h3>
                <UserCheck className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Participant compatibility
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Match rate:</span>
                  <span className="font-medium">94%</span>
                </div>
                <div className="flex justify-between">
                  <span>Satisfaction:</span>
                  <span className="font-medium">4.8/5</span>
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full mt-3">
                Find Match
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Gap Analysis</h3>
                <Target className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Service coverage gaps
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Unfilled:</span>
                  <span className="font-medium text-orange-600">3 shifts</span>
                </div>
                <div className="flex justify-between">
                  <span>Coverage:</span>
                  <span className="font-medium">97%</span>
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full mt-3">
                View Gaps
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Quality</h3>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Outcome tracking
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Goals met:</span>
                  <span className="font-medium">82%</span>
                </div>
                <div className="flex justify-between">
                  <span>Progress:</span>
                  <Badge variant="outline" className="text-xs">On Track</Badge>
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full mt-3">
                View Outcomes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Coordination Tabs */}
      <Tabs defaultValue="roster" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="roster">Roster</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="matching">Matching</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
        </TabsList>

        <TabsContent value="roster" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Smart Roster Management</CardTitle>
                <div className="flex space-x-2">
                  <Badge variant="outline">AI Optimization: ON</Badge>
                  <Button size="sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    View Calendar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4 border-green-500 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Roster optimized: 15% reduction in travel time, 98% shift coverage achieved
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {/* Sample roster items */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">Morning Shift - Zone A</h4>
                          <Badge variant="outline">Optimized</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Support Worker: Sarah Johnson • 4 participants
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>
                            <Clock className="inline h-3 w-3 mr-1" />
                            7:00 AM - 3:00 PM
                          </span>
                          <span>
                            <MapPin className="inline h-3 w-3 mr-1" />
                            Travel: 12 min total
                          </span>
                          <span>
                            <Users className="inline h-3 w-3 mr-1" />
                            Utilization: 95%
                          </span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 border rounded-lg bg-blue-50">
                <h4 className="font-semibold mb-2">Optimization Suggestions</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Swap John and Mary's afternoon shifts to reduce travel by 30 minutes</span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mr-2 mt-0.5" />
                    <span>3 workers available for emergency cover this week</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-3 border rounded-lg">
                  <p className="text-sm text-gray-600">Total Staff</p>
                  <p className="text-xl font-bold">47</p>
                  <p className="text-xs text-gray-500">39 active today</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-sm text-gray-600">Hours Available</p>
                  <p className="text-xl font-bold">312</p>
                  <p className="text-xs text-gray-500">280 allocated</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-sm text-gray-600">Efficiency</p>
                  <p className="text-xl font-bold text-green-600">89.7%</p>
                  <p className="text-xs text-gray-500">↑ 5% this week</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">Allocation by Service Type</h4>
                  <div className="space-y-2">
                    {[
                      { type: "Daily Living", allocated: 45, total: 50 },
                      { type: "Community Access", allocated: 28, total: 35 },
                      { type: "Social Support", allocated: 18, total: 20 },
                      { type: "Transport", allocated: 12, total: 15 }
                    ].map((service) => (
                      <div key={service.type}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{service.type}</span>
                          <span>{service.allocated}/{service.total} workers</span>
                        </div>
                        <Progress value={(service.allocated / service.total) * 100} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matching" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Participant-Worker Matching</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <UserCheck className="h-4 w-4" />
                <AlertDescription>
                  AI matching considers: skills, location, availability, preferences, and personality compatibility
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">New Participant: Emma Wilson</h4>
                        <p className="text-sm text-gray-600">Needs: Personal care, community access</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline">Location: Western Sydney</Badge>
                          <Badge variant="outline">Languages: English, Mandarin</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-2">Best Match:</p>
                        <p className="font-semibold text-green-600">Li Chen - 92%</p>
                        <Button 
                          size="sm" 
                          className="mt-2"
                          onClick={() => matchParticipantMutation.mutate({ 
                            participantId: `p-${i}`,
                            workerId: `w-${i}`
                          })}
                        >
                          Assign Match
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Outcomes Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">82%</div>
                  <p className="text-xs text-gray-600">Goals Achieved</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">4.7</div>
                  <p className="text-xs text-gray-600">Quality Score</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">95%</div>
                  <p className="text-xs text-gray-600">On-Time Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">18</div>
                  <p className="text-xs text-gray-600">Improvements</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 border rounded-lg bg-green-50">
                  <h4 className="font-semibold mb-2">Recent Achievements</h4>
                  <ul className="space-y-1 text-sm">
                    <li>✓ John Smith achieved independent shopping goal</li>
                    <li>✓ Sarah Lee completed cooking skills program</li>
                    <li>✓ Michael Chen joined community sports team</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Incident Prevention System</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4 border-green-500 bg-green-50">
                <Shield className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  No critical incidents in the last 30 days. Prevention protocols working effectively.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">Risk Indicators</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Falls Risk</span>
                      <Badge variant="outline" className="text-green-600">Low</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Medication Errors</span>
                      <Badge variant="outline" className="text-green-600">None</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Behavioral Incidents</span>
                      <Badge variant="outline" className="text-yellow-600">Monitor</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">Prevention Actions</h4>
                  <div className="space-y-2">
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      Review High-Risk Participants
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      Schedule Safety Training
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      Update Risk Assessments
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
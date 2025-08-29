import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  UserPlus, FileCheck, Clock, AlertCircle, CheckCircle,
  TrendingUp, Users, Calendar, Search, Filter, Download,
  PhoneCall, Mail, FileText, ChevronRight, Shield
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function IntakeDepartmentDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { toast } = useToast();

  // Fetch referrals data
  const { data: referrals } = useQuery({
    queryKey: ["/api/intake/referrals"],
    enabled: true
  });

  // Fetch intake metrics
  const { data: metrics } = useQuery({
    queryKey: ["/api/intake/metrics"],
    enabled: true
  });

  // NDIS eligibility check mutation
  const checkEligibilityMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/intake/check-eligibility", {
      method: "POST",
      body: JSON.stringify(data)
    }),
    onSuccess: (result) => {
      toast({
        title: "Eligibility Check Complete",
        description: result.eligible ? 
          "Participant is eligible for NDIS services" : 
          "Participant may not meet NDIS eligibility criteria",
        variant: result.eligible ? "default" : "destructive"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/intake/referrals"] });
    }
  });

  // Process referral automation
  const processReferralMutation = useMutation({
    mutationFn: (referralId: string) => apiRequest("/api/intake/process", {
      method: "POST",
      body: JSON.stringify({ referralId })
    }),
    onSuccess: () => {
      toast({
        title: "Referral Processed",
        description: "Service agreement and documents have been generated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/intake/referrals"] });
    }
  });

  // Calculate conversion metrics
  const conversionRate = metrics?.converted && metrics?.total ? 
    ((metrics.converted / metrics.total) * 100).toFixed(1) : "0";
  
  const avgProcessingTime = metrics?.avgProcessingHours || "48";

  return (
    <div className="p-6 space-y-6">
      {/* Department Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Intake Department</h1>
        <p className="text-blue-100">Streamlined referral processing and participant onboarding</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Referrals</CardTitle>
            <UserPlus className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.newThisWeek || 0}</div>
            <p className="text-xs text-muted-foreground">This week</p>
            <Progress value={75} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProcessingTime}h</div>
            <p className="text-xs text-muted-foreground">Average</p>
            <Badge variant="outline" className="mt-2">
              Target: 24h
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">To active participants</p>
            <Progress value={parseFloat(conversionRate)} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waitlist</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.waitlist || 0}</div>
            <p className="text-xs text-muted-foreground">Pending capacity</p>
            <Button size="sm" variant="outline" className="mt-2 w-full">
              Manage Waitlist
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Automated Workflows */}
      <Card>
        <CardHeader>
          <CardTitle>Automated Intake Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">NDIS Eligibility Check</h3>
                <Shield className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Instant verification of NDIS eligibility criteria
              </p>
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => {
                  // Open eligibility checker modal
                  toast({
                    title: "Eligibility Checker",
                    description: "Enter participant details to check NDIS eligibility"
                  });
                }}
              >
                Check Eligibility
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Document Verification</h3>
                <FileCheck className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">
                AI-powered document validation and compliance check
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Verify Documents
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Service Agreement</h3>
                <FileText className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Auto-generate agreements with digital signatures
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Generate Agreement
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Pipeline */}
      <Tabs defaultValue="new" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="new">New ({metrics?.new || 0})</TabsTrigger>
          <TabsTrigger value="screening">Screening ({metrics?.screening || 0})</TabsTrigger>
          <TabsTrigger value="assessment">Assessment ({metrics?.assessment || 0})</TabsTrigger>
          <TabsTrigger value="approval">Approval ({metrics?.approval || 0})</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding ({metrics?.onboarding || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>New Referrals</CardTitle>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Search referrals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Button size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Sample referral cards */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">John Smith</h4>
                          <Badge variant="outline">New</Badge>
                          <Badge variant="secondary">Priority</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Referred by: Local Area Coordinator
                        </p>
                        <p className="text-sm text-gray-500">
                          NDIS Number: 4301234567 | Age: 28 | Location: Sydney
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-500">
                            <Calendar className="inline h-3 w-3 mr-1" />
                            Received: {format(new Date(), "PPP")}
                          </span>
                          <span className="text-xs text-gray-500">
                            <Clock className="inline h-3 w-3 mr-1" />
                            Processing: 2 hours
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Button 
                          size="sm"
                          onClick={() => processReferralMutation.mutate(`ref-${i}`)}
                        >
                          Process
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            <PhoneCall className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="screening" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eligibility Screening</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  3 referrals pending eligibility verification. Average wait: 4 hours.
                </AlertDescription>
              </Alert>
              <div className="mt-4 space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Sarah Johnson</h4>
                        <p className="text-sm text-gray-600">Checking: Disability verification</p>
                        <Progress value={65} className="mt-2 w-48" />
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => checkEligibilityMutation.mutate({ id: `ref-${i}` })}
                      >
                        Complete Check
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Needs Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 border rounded-lg bg-blue-50">
                  <h4 className="font-medium mb-2">Assessment Queue</h4>
                  <p className="text-sm text-gray-600">
                    2 participants scheduled for assessment this week
                  </p>
                  <Button size="sm" className="mt-3">
                    View Assessment Schedule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approval" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Alert className="border-green-500 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    All service agreements are up to date. No pending approvals.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="onboarding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Participant Onboarding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Onboarding Checklist</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Service agreement signed</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">NDIS plan uploaded</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Goals documented</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Circle className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Initial assessment scheduled</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Circle className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Support worker assigned</span>
                    </div>
                  </div>
                  <Progress value={60} className="mt-3" />
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button size="sm" className="w-full justify-start">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Meet & Greet
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      Assign Support Team
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Welcome Pack
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      <Download className="mr-2 h-4 w-4" />
                      Export Onboarding Report
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Referral Source Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Source Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">35%</div>
              <p className="text-sm text-gray-600">Healthcare Providers</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">28%</div>
              <p className="text-sm text-gray-600">NDIS LAC</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">22%</div>
              <p className="text-sm text-gray-600">Self-Referral</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">15%</div>
              <p className="text-sm text-gray-600">Family/Carers</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Add missing import
import { Circle } from "lucide-react";
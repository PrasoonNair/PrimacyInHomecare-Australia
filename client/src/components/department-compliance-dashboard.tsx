import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, FileCheck, AlertTriangle, CheckCircle,
  TrendingUp, Calendar, BarChart, ClipboardCheck,
  Award, Bell, Target, BookOpen, RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function ComplianceDashboard() {
  const [runningAudit, setRunningAudit] = useState(false);
  const { toast } = useToast();

  // Fetch compliance metrics
  const { data: metrics } = useQuery({
    queryKey: ["/api/compliance/metrics"],
    enabled: true
  });

  // Fetch audit data
  const { data: audits } = useQuery({
    queryKey: ["/api/compliance/audits"],
    enabled: true
  });

  // Run automated audit
  const runAuditMutation = useMutation({
    mutationFn: () => apiRequest("/api/compliance/audit/run", {
      method: "POST",
      body: JSON.stringify({ 
        type: "comprehensive",
        automated: true,
        standards: ["NDIS", "Quality", "Safety"]
      })
    }),
    onSuccess: (result) => {
      toast({
        title: "Audit Complete",
        description: `Score: ${result.score}%. ${result.findings} findings identified.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/compliance"] });
    }
  });

  // Submit NDIS report
  const submitNDISReportMutation = useMutation({
    mutationFn: () => apiRequest("/api/compliance/ndis-report", {
      method: "POST",
      body: JSON.stringify({ 
        period: format(new Date(), "yyyy-MM"),
        autoGenerate: true 
      })
    }),
    onSuccess: () => {
      toast({
        title: "Report Submitted",
        description: "Monthly NDIS compliance report submitted successfully",
      });
    }
  });

  // Calculate compliance scores
  const overallCompliance = metrics?.overallScore || "98";
  const riskScore = metrics?.riskScore || "Low";

  return (
    <div className="p-6 space-y-6">
      {/* Department Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Compliance & Quality Department</h1>
        <p className="text-indigo-100">Automated auditing, NDIS compliance, and continuous quality improvement</p>
      </div>

      {/* Compliance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallCompliance}%</div>
            <Progress value={parseFloat(overallCompliance)} className="mt-2" />
            <Badge variant="outline" className="mt-2">Excellent</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{riskScore}</div>
            <p className="text-xs text-muted-foreground">2 medium risks</p>
            <Button size="sm" variant="outline" className="mt-2 w-full">
              View Risks
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Indicators</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12/15</div>
            <p className="text-xs text-muted-foreground">Met this month</p>
            <Progress value={80} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Audit</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7 days</div>
            <p className="text-xs text-muted-foreground">NDIS Quality Review</p>
            <Badge variant="outline" className="mt-2">Scheduled</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Automated Compliance Workflows */}
      <Card>
        <CardHeader>
          <CardTitle>Automated Compliance Systems</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Audit Engine</h3>
                <ClipboardCheck className="h-5 w-5 text-indigo-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Continuous monitoring
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Last run:</span>
                  <span className="font-medium">2 days ago</span>
                </div>
                <div className="flex justify-between">
                  <span>Score:</span>
                  <Badge variant="outline" className="text-xs">98%</Badge>
                </div>
              </div>
              <Button 
                size="sm" 
                className="w-full mt-3"
                onClick={() => runAuditMutation.mutate()}
                disabled={runningAudit}
              >
                Run Audit
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">NDIS Reports</h3>
                <FileCheck className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Auto-submission ready
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Due:</span>
                  <span className="font-medium">5 days</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant="outline" className="text-xs">Draft</Badge>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full mt-3"
                onClick={() => submitNDISReportMutation.mutate()}
              >
                Submit Report
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Risk Matrix</h3>
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Predictive analysis
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Active:</span>
                  <span className="font-medium">8 risks</span>
                </div>
                <div className="flex justify-between">
                  <span>Critical:</span>
                  <span className="font-medium text-green-600">0</span>
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full mt-3">
                View Matrix
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Improvements</h3>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">
                CI tracking
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Active:</span>
                  <span className="font-medium">5 projects</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed:</span>
                  <span className="font-medium">12 YTD</span>
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full mt-3">
                View CI Plan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Management Tabs */}
      <Tabs defaultValue="audits" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="audits">Audits</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="improvements">Improvements</TabsTrigger>
        </TabsList>

        <TabsContent value="audits" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Audit Schedule & Results</CardTitle>
                <Badge variant="outline">100% on schedule</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4 border-green-500 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  All audits completed on time. Next NDIS audit scheduled for {format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "PPP")}
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {[
                  { type: "NDIS Quality Audit", date: "Jan 5, 2025", score: 98, status: "Passed" },
                  { type: "Internal Process Audit", date: "Jan 1, 2025", score: 96, status: "Passed" },
                  { type: "Safety & WHS Audit", date: "Dec 28, 2024", score: 100, status: "Excellent" }
                ].map((audit) => (
                  <div key={audit.type} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{audit.type}</h4>
                        <p className="text-sm text-gray-600">{audit.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">{audit.score}%</p>
                        <Badge variant={audit.status === "Excellent" ? "default" : "outline"}>
                          {audit.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <Button className="w-full">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Next Audit
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Indicators Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">98%</div>
                  <p className="text-xs text-gray-600">Service Quality</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">4.8</div>
                  <p className="text-xs text-gray-600">Satisfaction</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">0.3%</div>
                  <p className="text-xs text-gray-600">Incident Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">95%</div>
                  <p className="text-xs text-gray-600">Goals Met</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">NDIS Practice Standards</h4>
                  <div className="space-y-2">
                    {[
                      { standard: "Rights and Responsibilities", score: 100 },
                      { standard: "Governance and Operational Management", score: 98 },
                      { standard: "Provision of Supports", score: 97 },
                      { standard: "Support Provision Environment", score: 99 }
                    ].map((standard) => (
                      <div key={standard.standard}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{standard.standard}</span>
                          <span>{standard.score}%</span>
                        </div>
                        <Progress value={standard.score} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  2 medium risks require attention. No critical risks identified.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {[
                  { 
                    risk: "Staff certification expiry",
                    likelihood: "Medium",
                    impact: "Medium",
                    mitigation: "Automated reminders set 60 days before expiry"
                  },
                  {
                    risk: "Budget overrun - Community Access",
                    likelihood: "Low",
                    impact: "Medium",
                    mitigation: "Weekly monitoring and alerts at 80% threshold"
                  }
                ].map((risk) => (
                  <div key={risk.risk} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{risk.risk}</h4>
                        <div className="flex space-x-2 mt-1">
                          <Badge variant="outline">L: {risk.likelihood}</Badge>
                          <Badge variant="outline">I: {risk.impact}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Mitigation: {risk.mitigation}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Update
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reassess Risks
                </Button>
                <Button variant="outline">
                  <Target className="mr-2 h-4 w-4" />
                  Add Risk Control
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Certification Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-3 border rounded-lg">
                  <p className="text-sm text-gray-600">Valid Certifications</p>
                  <p className="text-xl font-bold text-green-600">94%</p>
                  <p className="text-xs text-gray-500">44/47 staff compliant</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-sm text-gray-600">Expiring Soon</p>
                  <p className="text-xl font-bold text-orange-600">5</p>
                  <p className="text-xs text-gray-500">Within 30 days</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-xl font-bold text-red-600">0</p>
                  <p className="text-xs text-gray-500">All current</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-3 border rounded-lg bg-orange-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">First Aid Certificates</p>
                      <p className="text-sm text-gray-600">5 expiring in next 30 days</p>
                    </div>
                    <Button size="sm">
                      <Bell className="mr-2 h-4 w-4" />
                      Notify Staff
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="improvements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Continuous Improvement Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    project: "Digital Progress Notes Implementation",
                    progress: 75,
                    impact: "High",
                    completion: "Feb 2025"
                  },
                  {
                    project: "Participant Feedback System Upgrade",
                    progress: 45,
                    impact: "Medium",
                    completion: "Mar 2025"
                  },
                  {
                    project: "Staff Training Platform",
                    progress: 90,
                    impact: "High",
                    completion: "Jan 2025"
                  }
                ].map((project) => (
                  <div key={project.project} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{project.project}</h4>
                        <div className="flex space-x-2 mt-1">
                          <Badge variant="outline">Impact: {project.impact}</Badge>
                          <Badge variant="outline">Due: {project.completion}</Badge>
                        </div>
                      </div>
                    </div>
                    <Progress value={project.progress} className="mt-2" />
                    <p className="text-xs text-gray-500 mt-1">{project.progress}% complete</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 border rounded-lg bg-blue-50">
                <h4 className="font-semibold mb-2">Improvement Metrics</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Projects completed YTD</p>
                    <p className="font-medium">12</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Efficiency gained</p>
                    <p className="font-medium">28%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Cost savings</p>
                    <p className="font-medium">$45,000</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Staff hours saved</p>
                    <p className="font-medium">320 hrs/month</p>
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
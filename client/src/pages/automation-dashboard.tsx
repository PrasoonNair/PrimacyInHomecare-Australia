import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  ActivityIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertTriangleIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  TargetIcon,
  ZapIcon,
  SettingsIcon,
  PlayIcon,
  PauseIcon,
  BarChart3Icon,
  PieChartIcon,
  CalendarIcon,
  UsersIcon,
  FileTextIcon,
  AlertCircleIcon
} from "lucide-react";
import { format } from "date-fns";

interface KPIData {
  id: string;
  kpiName: string;
  kpiCategory: string;
  actualValue: number;
  targetValue: number;
  achievementPercentage: number;
  status: string;
  measurementPeriod: string;
}

interface AutomationData {
  id: string;
  name: string;
  targetProcess: string;
  isActive: boolean;
  executionCount: number;
  successRate: number;
  lastTriggered: string;
}

interface VerificationData {
  id: string;
  checkpointName: string;
  processType: string;
  status: string;
  timeToComplete: number;
  verifiedBy: string;
  createdAt: string;
}

export default function AutomationDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("weekly");

  const { data: kpiData = [], isLoading: kpiLoading } = useQuery<KPIData[]>({
    queryKey: ["/api/automation/kpis", selectedRole, selectedPeriod],
  });

  const { data: automationData = [], isLoading: automationLoading } = useQuery<AutomationData[]>({
    queryKey: ["/api/automation/workflows"],
  });

  const { data: verificationData = [], isLoading: verificationLoading } = useQuery<VerificationData[]>({
    queryKey: ["/api/automation/verifications"],
  });

  const { data: performanceMetrics = [], isLoading: performanceLoading } = useQuery({
    queryKey: ["/api/automation/performance"],
  });

  // Sample data for demo
  const sampleKPIs: KPIData[] = [
    { id: "1", kpiName: "Referrals Processed", kpiCategory: "productivity", actualValue: 18, targetValue: 15, achievementPercentage: 120, status: "above_target", measurementPeriod: "2024-01-01" },
    { id: "2", kpiName: "Verification Accuracy", kpiCategory: "quality", actualValue: 92, targetValue: 95, achievementPercentage: 97, status: "on_target", measurementPeriod: "2024-01-01" },
    { id: "3", kpiName: "Invoice Processing Time", kpiCategory: "efficiency", actualValue: 20, targetValue: 24, achievementPercentage: 120, status: "above_target", measurementPeriod: "2024-01-01" },
    { id: "4", kpiName: "Compliance Score", kpiCategory: "compliance", actualValue: 85, targetValue: 95, achievementPercentage: 89, status: "below_target", measurementPeriod: "2024-01-01" },
  ];

  const sampleAutomations: AutomationData[] = [
    { id: "1", name: "Master Agreement Auto-Approval", targetProcess: "master_agreements", isActive: true, executionCount: 156, successRate: 98.7, lastTriggered: "2024-01-01T10:30:00Z" },
    { id: "2", name: "Travel Calculation Verification", targetProcess: "travel_calculations", isActive: true, executionCount: 89, successRate: 95.5, lastTriggered: "2024-01-01T09:15:00Z" },
    { id: "3", name: "NDIS Plan Analysis", targetProcess: "plan_analysis", isActive: true, executionCount: 67, successRate: 92.5, lastTriggered: "2024-01-01T08:45:00Z" },
    { id: "4", name: "Staff Onboarding Workflow", targetProcess: "staff_onboarding", isActive: false, executionCount: 23, successRate: 100, lastTriggered: "2024-01-01T07:20:00Z" },
  ];

  const sampleVerifications: VerificationData[] = [
    { id: "1", checkpointName: "Document Upload Verification", processType: "master_agreements", status: "approved", timeToComplete: 15, verifiedBy: "system", createdAt: "2024-01-01T10:30:00Z" },
    { id: "2", checkpointName: "Travel Rate Validation", processType: "travel_calculations", status: "approved", timeToComplete: 5, verifiedBy: "system", createdAt: "2024-01-01T10:25:00Z" },
    { id: "3", checkpointName: "Plan Analysis Review", processType: "plan_analysis", status: "pending", timeToComplete: 0, verifiedBy: "", createdAt: "2024-01-01T10:20:00Z" },
    { id: "4", checkpointName: "Compliance Check", processType: "staff_onboarding", status: "rejected", timeToComplete: 45, verifiedBy: "John Smith", createdAt: "2024-01-01T09:30:00Z" },
  ];

  const kpiTrendData = [
    { period: "Week 1", productivity: 85, quality: 92, efficiency: 78, compliance: 95 },
    { period: "Week 2", productivity: 88, quality: 94, efficiency: 82, compliance: 93 },
    { period: "Week 3", productivity: 92, quality: 91, efficiency: 85, compliance: 97 },
    { period: "Week 4", productivity: 95, quality: 96, efficiency: 89, compliance: 94 },
  ];

  const processDistribution = [
    { name: "Master Agreements", value: 35, color: "#8884d8" },
    { name: "Travel Calculations", value: 25, color: "#82ca9d" },
    { name: "Plan Analysis", value: 20, color: "#ffc658" },
    { name: "Staff Onboarding", value: 12, color: "#ff7300" },
    { name: "Service Delivery", value: 8, color: "#0088fe" },
  ];

  const toggleAutomation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      return await apiRequest(`/api/automation/workflows/${id}/toggle`, {
        method: "POST",
        body: JSON.stringify({ active }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automation/workflows"] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "above_target": return "text-green-600 bg-green-100";
      case "on_target": return "text-blue-600 bg-blue-100";
      case "below_target": return "text-orange-600 bg-orange-100";
      case "critical": return "text-red-600 bg-red-100";
      case "approved": return "text-green-600 bg-green-100";
      case "pending": return "text-yellow-600 bg-yellow-100";
      case "rejected": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "above_target": return <TrendingUpIcon className="h-4 w-4" />;
      case "on_target": return <TargetIcon className="h-4 w-4" />;
      case "below_target": return <TrendingDownIcon className="h-4 w-4" />;
      case "critical": return <AlertTriangleIcon className="h-4 w-4" />;
      case "approved": return <CheckCircleIcon className="h-4 w-4" />;
      case "pending": return <ClockIcon className="h-4 w-4" />;
      case "rejected": return <AlertCircleIcon className="h-4 w-4" />;
      default: return <ActivityIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Automation & KPI Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor workflow automation, verification checkpoints, and role-based performance metrics
          </p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-48" data-testid="select-role-filter">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="intake-coordinator">Intake Coordinator</SelectItem>
                <SelectItem value="finance-manager">Finance Manager</SelectItem>
                <SelectItem value="hr-manager">HR Manager</SelectItem>
                <SelectItem value="service-delivery-manager">Service Delivery Manager</SelectItem>
                <SelectItem value="quality-manager">Quality Manager</SelectItem>
                <SelectItem value="support-worker">Support Worker</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-36" data-testid="select-period-filter">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="kpis" data-testid="tab-kpis">KPIs</TabsTrigger>
            <TabsTrigger value="automations" data-testid="tab-automations">Automations</TabsTrigger>
            <TabsTrigger value="verifications" data-testid="tab-verifications">Verifications</TabsTrigger>
            <TabsTrigger value="performance" data-testid="tab-performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card data-testid="card-active-automations">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Automations</CardTitle>
                  <ZapIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {sampleAutomations.filter(a => a.isActive).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {sampleAutomations.length} total automations
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="card-verification-rate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Verification Rate</CardTitle>
                  <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">94.2%</div>
                  <p className="text-xs text-muted-foreground">
                    {sampleVerifications.filter(v => v.status === 'approved').length} of {sampleVerifications.length} verified
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="card-avg-processing-time">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
                  <ClockIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">16 min</div>
                  <p className="text-xs text-muted-foreground">
                    15% faster than last week
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="card-kpi-achievement">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">KPI Achievement</CardTitle>
                  <TargetIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">89.5%</div>
                  <p className="text-xs text-muted-foreground">
                    3 of 4 KPIs on target
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card data-testid="card-kpi-trends">
                <CardHeader>
                  <CardTitle>KPI Trends</CardTitle>
                  <CardDescription>Performance across all categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={kpiTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis domain={[60, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="productivity" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="quality" stroke="#82ca9d" strokeWidth={2} />
                      <Line type="monotone" dataKey="efficiency" stroke="#ffc658" strokeWidth={2} />
                      <Line type="monotone" dataKey="compliance" stroke="#ff7300" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card data-testid="card-process-distribution">
                <CardHeader>
                  <CardTitle>Process Distribution</CardTitle>
                  <CardDescription>Automation usage by process type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={processDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {processDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="kpis" className="space-y-6">
            <div className="grid gap-6">
              {sampleKPIs.map((kpi) => (
                <Card key={kpi.id} data-testid={`kpi-card-${kpi.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{kpi.kpiName}</CardTitle>
                        <CardDescription className="capitalize">{kpi.kpiCategory} KPI</CardDescription>
                      </div>
                      <Badge className={getStatusColor(kpi.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(kpi.status)}
                          {kpi.status.replace('_', ' ')}
                        </span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Actual</p>
                          <p className="text-2xl font-bold text-primary">{kpi.actualValue}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Target</p>
                          <p className="text-2xl font-bold">{kpi.targetValue}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Achievement</p>
                          <p className="text-2xl font-bold">{kpi.achievementPercentage.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress to Target</span>
                          <span>{Math.min(kpi.achievementPercentage, 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={Math.min(kpi.achievementPercentage, 100)} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="automations" className="space-y-6">
            <div className="grid gap-6">
              {sampleAutomations.map((automation) => (
                <Card key={automation.id} data-testid={`automation-card-${automation.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{automation.name}</CardTitle>
                        <CardDescription className="capitalize">{automation.targetProcess.replace('_', ' ')}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={automation.isActive ? "default" : "secondary"}>
                          {automation.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAutomation.mutate({ 
                            id: automation.id, 
                            active: !automation.isActive 
                          })}
                          data-testid={`button-toggle-${automation.id}`}
                        >
                          {automation.isActive ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Executions</p>
                        <p className="text-xl font-semibold">{automation.executionCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                        <p className="text-xl font-semibold">{automation.successRate}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Last Triggered</p>
                        <p className="text-sm">{format(new Date(automation.lastTriggered), "MMM dd, HH:mm")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="verifications" className="space-y-6">
            <div className="grid gap-6">
              {sampleVerifications.map((verification) => (
                <Card key={verification.id} data-testid={`verification-card-${verification.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{verification.checkpointName}</CardTitle>
                        <CardDescription className="capitalize">{verification.processType.replace('_', ' ')}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(verification.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(verification.status)}
                          {verification.status}
                        </span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Time to Complete</p>
                        <p className="text-xl font-semibold">
                          {verification.timeToComplete > 0 ? `${verification.timeToComplete} min` : "Pending"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Verified By</p>
                        <p className="text-sm">{verification.verifiedBy || "Pending"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="text-sm">{format(new Date(verification.createdAt), "MMM dd, HH:mm")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card data-testid="card-automation-success-rate">
                <CardHeader>
                  <CardTitle>Automation Success Rate</CardTitle>
                  <CardDescription>Success rate by process type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sampleAutomations}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis domain={[80, 100]} />
                      <Tooltip />
                      <Bar dataKey="successRate" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card data-testid="card-verification-times">
                <CardHeader>
                  <CardTitle>Verification Times</CardTitle>
                  <CardDescription>Average time to complete by checkpoint type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sampleVerifications.filter(v => v.timeToComplete > 0)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="checkpointName" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="timeToComplete" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card data-testid="card-performance-summary">
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
                <CardDescription>Overall system performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">98.5%</div>
                    <div className="text-sm text-muted-foreground">Automation Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">12.3 min</div>
                    <div className="text-sm text-muted-foreground">Avg Process Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">4.2x</div>
                    <div className="text-sm text-muted-foreground">Efficiency Improvement</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">99.1%</div>
                    <div className="text-sm text-muted-foreground">Compliance Rate</div>
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
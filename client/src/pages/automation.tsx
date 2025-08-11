import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Zap, Bot, TrendingUp, Clock, DollarSign, Target, CheckCircle2, 
  AlertTriangle, Activity, Settings, Play, Pause, Users, FileText,
  Calendar, Calculator, BarChart3, Timer, Shield
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

// Efficiency metrics visualization data
const automationSavingsData = [
  { month: 'Jan', timeSaved: 18, costSaved: 2400, errors: 45 },
  { month: 'Feb', timeSaved: 22, costSaved: 2800, errors: 32 },
  { month: 'Mar', timeSaved: 24, costSaved: 3200, errors: 28 },
  { month: 'Apr', timeSaved: 26, costSaved: 3600, errors: 25 },
  { month: 'May', timeSaved: 28, costSaved: 4000, errors: 18 },
  { month: 'Jun', timeSaved: 30, costSaved: 4400, errors: 12 },
];

const processOptimizationData = [
  { process: 'Invoice Generation', before: 120, after: 20, improvement: 83 },
  { process: 'Staff Scheduling', before: 180, after: 35, improvement: 81 },
  { process: 'Payroll Calculation', before: 240, after: 25, improvement: 90 },
  { process: 'Compliance Reporting', before: 300, after: 30, improvement: 90 },
  { process: 'Goal Tracking', before: 90, after: 18, improvement: 80 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AutomationPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch automation status
  const { data: automationStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/automation/status"],
  });

  // Fetch efficiency metrics
  const { data: efficiencyMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/automation/efficiency-metrics"],
  });

  // Toggle automation task mutation
  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskName, enabled }: { taskName: string; enabled: boolean }) => {
      return apiRequest(`/api/automation/tasks/${taskName}/toggle`, {
        method: "POST",
        body: JSON.stringify({ enabled }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automation/status"] });
      toast({
        title: "Success",
        description: "Automation task updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Generate invoices mutation
  const generateInvoicesMutation = useMutation({
    mutationFn: async ({ month, year }: { month: number; year: number }) => {
      return apiRequest("/api/automation/generate-invoices", {
        method: "POST",
        body: JSON.stringify({ month, year }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invoices generated automatically",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleToggleTask = (taskName: string, enabled: boolean) => {
    toggleTaskMutation.mutate({ taskName, enabled });
  };

  const handleGenerateInvoices = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    generateInvoicesMutation.mutate({ month, year });
  };

  if (statusLoading || metricsLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Automation & Efficiency</h1>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-muted"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="page-title">
            <Bot className="h-8 w-8 text-primary" />
            Automation & Efficiency
          </h1>
          <p className="text-muted-foreground mt-1">
            Advanced automation system optimizing NDIS operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant={automationStatus?.systemHealth === 'operational' ? 'default' : 'destructive'}
            className="flex items-center gap-1"
            data-testid="system-health-badge"
          >
            <Activity className="h-3 w-3" />
            {automationStatus?.systemHealth === 'operational' ? 'Operational' : 'Issues Detected'}
          </Badge>
          <Button onClick={handleGenerateInvoices} data-testid="button-generate-invoices">
            <Zap className="mr-2 h-4 w-4" />
            Run Automation
          </Button>
        </div>
      </div>

      {/* System Performance Alert */}
      {efficiencyMetrics?.systemPerformance?.uptimePercentage < 99 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            System uptime is below optimal levels. Performance monitoring is active.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks" data-testid="tab-tasks">Automation Tasks</TabsTrigger>
          <TabsTrigger value="efficiency" data-testid="tab-efficiency">Efficiency Metrics</TabsTrigger>
          <TabsTrigger value="optimization" data-testid="tab-optimization">Process Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Automation Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card data-testid="card-time-savings">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {efficiencyMetrics?.automationSavings?.timePerWeek || 0}h
                </div>
                <p className="text-xs text-muted-foreground">Per week through automation</p>
              </CardContent>
            </Card>

            <Card data-testid="card-cost-reduction">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cost Reduction</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {efficiencyMetrics?.automationSavings?.costReduction || 0}%
                </div>
                <p className="text-xs text-muted-foreground">Operational cost savings</p>
              </CardContent>
            </Card>

            <Card data-testid="card-error-reduction">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Error Reduction</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {efficiencyMetrics?.automationSavings?.errorReduction || 0}%
                </div>
                <p className="text-xs text-muted-foreground">Fewer manual errors</p>
              </CardContent>
            </Card>

            <Card data-testid="card-automations-run">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Automations Run</CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {efficiencyMetrics?.systemPerformance?.successfulAutomations || 0}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Automation Savings Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Automation Impact Over Time</CardTitle>
              <CardDescription>
                Time saved, cost reduction, and error prevention through automation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={automationSavingsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="timeSaved" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Hours Saved"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="costSaved" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Cost Saved ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Automation Actions</CardTitle>
              <CardDescription>
                Execute common automation tasks instantly
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={handleGenerateInvoices}
                data-testid="button-quick-invoice"
              >
                <FileText className="h-4 w-4" />
                Generate Invoices
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                data-testid="button-quick-schedule"
              >
                <Calendar className="h-4 w-4" />
                Optimize Schedules
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                data-testid="button-quick-payroll"
              >
                <Calculator className="h-4 w-4" />
                Calculate Payroll
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                data-testid="button-quick-compliance"
              >
                <Shield className="h-4 w-4" />
                Run Compliance Check
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automation Tasks</CardTitle>
              <CardDescription>
                Manage and monitor automated background processes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationStatus?.tasks?.map((task: any) => (
                  <div 
                    key={task.name} 
                    className="flex items-center justify-between p-4 border rounded-lg"
                    data-testid={`task-${task.name}`}
                  >
                    <div className="flex-1">
                      <h4 className="font-medium capitalize">
                        {task.name.replace(/_/g, ' ')}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {task.lastRun ? `Last run: ${new Date(task.lastRun).toLocaleString()}` : 'Never run'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={task.enabled ? 'default' : 'secondary'}
                        data-testid={`badge-status-${task.name}`}
                      >
                        {task.enabled ? 'Active' : 'Disabled'}
                      </Badge>
                      <Switch
                        checked={task.enabled}
                        onCheckedChange={(enabled) => handleToggleTask(task.name, enabled)}
                        data-testid={`switch-${task.name}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Process Optimization Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Process Time Improvements</CardTitle>
                <CardDescription>
                  Before vs. after automation implementation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={processOptimizationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="process" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="before" fill="#ef4444" name="Before (minutes)" />
                    <Bar dataKey="after" fill="#10b981" name="After (minutes)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* System Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>
                  Real-time automation system health
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>System Uptime</span>
                    <span>{efficiencyMetrics?.systemPerformance?.uptimePercentage || 0}%</span>
                  </div>
                  <Progress 
                    value={efficiencyMetrics?.systemPerformance?.uptimePercentage || 0} 
                    className="h-2"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Response Time</p>
                    <p className="font-medium">
                      {efficiencyMetrics?.systemPerformance?.averageResponseTime || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Success Rate</p>
                    <p className="font-medium">
                      {efficiencyMetrics?.systemPerformance?.successfulAutomations ? 
                        Math.round((efficiencyMetrics.systemPerformance.successfulAutomations / 
                        (efficiencyMetrics.systemPerformance.successfulAutomations + 
                         efficiencyMetrics.systemPerformance.failedAutomations)) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Efficiency Improvements */}
          <Card>
            <CardHeader>
              <CardTitle>Key Efficiency Improvements</CardTitle>
              <CardDescription>
                Specific process optimizations achieved through automation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(efficiencyMetrics?.processOptimization || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <Badge 
                      variant={value.toString().startsWith('+') ? 'default' : 'secondary'}
                      className={value.toString().startsWith('+') ? 'bg-green-100 text-green-800' : ''}
                    >
                      {value}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <div className="grid gap-6">
            {/* Optimization Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Optimization Recommendations</CardTitle>
                <CardDescription>
                  AI-powered suggestions to further improve efficiency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Staff Allocation Optimization</h4>
                      <p className="text-sm text-muted-foreground">
                        Implement machine learning for predictive staff scheduling to reduce overtime costs by an estimated 12%.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Goal Progress Prediction</h4>
                      <p className="text-sm text-muted-foreground">
                        Use historical data to predict goal completion likelihood and automatically adjust intervention strategies.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <DollarSign className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Dynamic Pricing Integration</h4>
                      <p className="text-sm text-muted-foreground">
                        Implement real-time NDIS price guide updates to ensure accurate billing and maximize budget utilization.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Implementation Roadmap */}
            <Card>
              <CardHeader>
                <CardTitle>Automation Roadmap</CardTitle>
                <CardDescription>
                  Planned enhancements to the automation system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <span className="font-medium">Phase 1: Core Automation</span>
                      <p className="text-sm text-muted-foreground">
                        Invoice generation, payroll calculation, and basic scheduling
                      </p>
                    </div>
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Timer className="h-5 w-5 text-blue-600" />
                    <div>
                      <span className="font-medium">Phase 2: Intelligent Matching</span>
                      <p className="text-sm text-muted-foreground">
                        AI-powered staff-participant matching and predictive analytics
                      </p>
                    </div>
                    <Badge>In Progress</Badge>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-gray-400" />
                    <div>
                      <span className="font-medium">Phase 3: Advanced Analytics</span>
                      <p className="text-sm text-muted-foreground">
                        Predictive modeling and automated decision-making systems
                      </p>
                    </div>
                    <Badge variant="outline">Planned</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
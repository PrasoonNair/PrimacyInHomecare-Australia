import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, TrendingUp, AlertTriangle, CheckCircle,
  Clock, FileText, Download, RefreshCw, Calculator,
  CreditCard, PieChart, BarChart, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function FinanceDepartmentDashboard() {
  const [processingClaims, setProcessingClaims] = useState(false);
  const { toast } = useToast();

  // Fetch financial metrics
  const { data: metrics } = useQuery({
    queryKey: ["/api/finance/metrics"],
    enabled: true
  });

  // Fetch pending claims
  const { data: claims } = useQuery({
    queryKey: ["/api/finance/claims/pending"],
    enabled: true
  });

  // Process NDIS claims automation
  const processClaimsMutation = useMutation({
    mutationFn: () => apiRequest("/api/finance/claims/process-bulk", {
      method: "POST",
      body: JSON.stringify({ autoProcess: true })
    }),
    onSuccess: (result) => {
      toast({
        title: "Claims Processed",
        description: `Successfully processed ${result.processed} claims. Total value: $${result.totalValue}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/finance"] });
    }
  });

  // Run SCHADS payroll
  const runPayrollMutation = useMutation({
    mutationFn: () => apiRequest("/api/finance/payroll/schads", {
      method: "POST",
      body: JSON.stringify({ 
        payPeriod: format(new Date(), "yyyy-MM"),
        includeAllowances: true 
      })
    }),
    onSuccess: (result) => {
      toast({
        title: "Payroll Calculated",
        description: `SCHADS rates applied. Total payroll: $${result.total}`,
      });
    }
  });

  // Calculate key financial indicators
  const claimSuccessRate = metrics?.claimsApproved && metrics?.claimsSubmitted ? 
    ((metrics.claimsApproved / metrics.claimsSubmitted) * 100).toFixed(1) : "0";
  
  const budgetUtilization = metrics?.budgetUsed && metrics?.budgetTotal ? 
    ((metrics.budgetUsed / metrics.budgetTotal) * 100).toFixed(1) : "0";

  return (
    <div className="p-6 space-y-6">
      {/* Department Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Finance Department</h1>
        <p className="text-green-100">Automated NDIS billing, SCHADS payroll, and financial management</p>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics?.revenueMonth || "0"}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              +12.5% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics?.pendingClaimsValue || "0"}</div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {claims?.length || 0} claims
              </span>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => processClaimsMutation.mutate()}
                disabled={processingClaims}
              >
                Process All
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Claim Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{claimSuccessRate}%</div>
            <Progress value={parseFloat(claimSuccessRate)} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Target: 95%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
            <PieChart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgetUtilization}%</div>
            <Progress value={parseFloat(budgetUtilization)} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              ${metrics?.budgetRemaining || "0"} remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Automated Financial Processes */}
      <Card>
        <CardHeader>
          <CardTitle>Automated Financial Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">NDIS Claims</h3>
                <CreditCard className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Auto-submit to NDIS portal
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Today:</span>
                  <span className="font-medium">23 claims</span>
                </div>
                <div className="flex justify-between">
                  <span>Value:</span>
                  <span className="font-medium">$18,450</span>
                </div>
              </div>
              <Button size="sm" className="w-full mt-3">
                Review Claims
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">SCHADS Payroll</h3>
                <Calculator className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Automated award calculations
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Next run:</span>
                  <span className="font-medium">3 days</span>
                </div>
                <div className="flex justify-between">
                  <span>Staff:</span>
                  <span className="font-medium">47 workers</span>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full mt-3"
                onClick={() => runPayrollMutation.mutate()}
              >
                Run Payroll
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Xero Sync</h3>
                <RefreshCw className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Real-time invoice sync
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Last sync:</span>
                  <span className="font-medium">2 min ago</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant="outline" className="text-xs">
                    Connected
                  </Badge>
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full mt-3">
                Sync Now
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Budget Alerts</h3>
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Automated threshold monitoring
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Active alerts:</span>
                  <span className="font-medium text-orange-600">2</span>
                </div>
                <div className="flex justify-between">
                  <span>Threshold:</span>
                  <span className="font-medium">80%</span>
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full mt-3">
                View Alerts
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Operations Tabs */}
      <Tabs defaultValue="claims" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="claims">Claims</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="claims" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>NDIS Claims Processing</CardTitle>
                <div className="flex space-x-2">
                  <Badge variant="outline">Auto-processing: ON</Badge>
                  <Button size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Bulk processing scheduled for 3:00 PM daily. 98.5% success rate this month.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-3">
                {/* Sample claim items */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Claim #{2024000 + i}</span>
                          <Badge variant="outline">Pending</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          John Smith - Daily Activities Support
                        </p>
                        <p className="text-xs text-gray-500">
                          Service Date: {format(new Date(), "PPP")} | 4 hours @ $65.09/hr
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">$260.36</p>
                        <Button size="sm" variant="outline" className="mt-1">
                          Process
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-3 border rounded-lg">
                  <p className="text-sm text-gray-600">Outstanding</p>
                  <p className="text-xl font-bold">$45,230</p>
                  <p className="text-xs text-gray-500">23 invoices</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-xl font-bold text-red-600">$8,450</p>
                  <p className="text-xs text-gray-500">5 invoices</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-xl font-bold text-green-600">$125,000</p>
                  <p className="text-xs text-gray-500">67 invoices</p>
                </div>
              </div>
              
              <Button className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Generate Monthly Invoices
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SCHADS Payroll Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4 border-blue-500 bg-blue-50">
                <Calculator className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Next payroll run: Wednesday, {format(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), "PPP")}
                  <br />
                  Includes: Weekend penalties, public holiday rates, and shift allowances
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Payroll Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Base Hours</p>
                      <p className="font-medium">1,240 hrs</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Penalty Hours</p>
                      <p className="font-medium">320 hrs</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Gross</p>
                      <p className="font-medium">$58,450</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Super</p>
                      <p className="font-medium">$6,429</p>
                    </div>
                  </div>
                  <Button className="w-full mt-4" onClick={() => runPayrollMutation.mutate()}>
                    Calculate Payroll
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Budget categories */}
                {[
                  { name: "Core Supports", used: 65, total: 100, color: "blue" },
                  { name: "Capacity Building", used: 45, total: 80, color: "green" },
                  { name: "Capital", used: 20, total: 50, color: "purple" },
                  { name: "Operations", used: 78, total: 90, color: "orange" }
                ].map((budget) => (
                  <div key={budget.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{budget.name}</span>
                      <span className="text-gray-600">
                        ${budget.used}k / ${budget.total}k
                      </span>
                    </div>
                    <Progress value={(budget.used / budget.total) * 100} />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{((budget.used / budget.total) * 100).toFixed(1)}% used</span>
                      <span>${budget.total - budget.used}k remaining</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Monthly P&L Statement
                </Button>
                <Button variant="outline" className="justify-start">
                  <BarChart className="mr-2 h-4 w-4" />
                  Cash Flow Analysis
                </Button>
                <Button variant="outline" className="justify-start">
                  <PieChart className="mr-2 h-4 w-4" />
                  Department Budget Report
                </Button>
                <Button variant="outline" className="justify-start">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Revenue Forecast
                </Button>
              </div>
              
              <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-semibold mb-2">Scheduled Reports</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Weekly Cash Position</span>
                    <Badge variant="outline">Every Monday</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly NDIS Reconciliation</span>
                    <Badge variant="outline">1st of month</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Quarterly Board Report</span>
                    <Badge variant="outline">Quarterly</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Real-time Financial Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Alerts & Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert className="border-orange-500 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                2 participants approaching 80% budget utilization. Review service plans.
              </AlertDescription>
            </Alert>
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                NDIS bulk payment received: $145,230. 43 claims approved.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
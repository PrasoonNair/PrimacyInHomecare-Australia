import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSignIcon,
  TrendingUpIcon,
  FileTextIcon,
  CreditCardIcon,
  PieChartIcon,
  AlertCircleIcon,
  CalculatorIcon,
  BriefcaseIcon,
  CheckCircleIcon
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ComplianceDashboard } from "@/components/compliance/compliance-dashboard";

export default function FinanceManagerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock financial data
  const financialMetrics = {
    monthlyRevenue: 325000,
    monthlyExpenses: 230000,
    outstandingInvoices: 45000,
    overduePayments: 12000,
    budgetUtilization: 78,
    profitMargin: 28.5
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Finance Manager Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName} - Financial Operations Management
          </p>
        </div>

        {/* Financial KPIs */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${financialMetrics.monthlyRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Invoices</CardTitle>
              <FileTextIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${financialMetrics.outstandingInvoices.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">23 invoices pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
              <PieChartIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{financialMetrics.budgetUtilization}%</div>
              <p className="text-xs text-muted-foreground">Q2 budget</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{financialMetrics.profitMargin}%</div>
              <p className="text-xs text-muted-foreground">Target: 25%</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="compliance">NDIS Compliance</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>Current month financial position</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground">Total Income</p>
                      <p className="text-xl font-bold text-green-600">$325,000</p>
                      <p className="text-xs">NDIS Claims: $280,000</p>
                      <p className="text-xs">Private: $45,000</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                      <p className="text-xl font-bold text-red-600">$230,000</p>
                      <p className="text-xs">Payroll: $180,000</p>
                      <p className="text-xs">Operations: $50,000</p>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg bg-green-50">
                    <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                    <p className="text-2xl font-bold text-green-700">$95,000</p>
                    <p className="text-xs">29.2% profit margin</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Critical Actions Required</CardTitle>
                <CardDescription>Items needing immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertCircleIcon className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="font-medium">Overdue Invoices</p>
                        <p className="text-sm text-muted-foreground">5 invoices over 30 days</p>
                      </div>
                    </div>
                    <Button size="sm">Review</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CalculatorIcon className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="font-medium">Payroll Approval</p>
                        <p className="text-sm text-muted-foreground">Next run: Tomorrow</p>
                      </div>
                    </div>
                    <Button size="sm">Approve</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Billing Management</CardTitle>
                <CardDescription>Invoice generation and tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Button>Generate Monthly Invoices</Button>
                    <Button variant="outline">Export Invoice Report</Button>
                  </div>
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">NDIS Bulk Invoice - June 2024</p>
                          <p className="text-sm text-muted-foreground">Amount: $280,000 | 156 services</p>
                        </div>
                        <Badge>Pending Submission</Badge>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Private Client Invoices</p>
                          <p className="text-sm text-muted-foreground">Amount: $45,000 | 23 clients</p>
                        </div>
                        <Badge className="bg-green-500">Sent</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payroll" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Overview</CardTitle>
                <CardDescription>Staff payments and SCHADS compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <h4 className="font-medium mb-2">Next Payroll Run</h4>
                    <p className="text-2xl font-bold">$92,500</p>
                    <p className="text-sm text-muted-foreground">127 employees | Due: Tomorrow</p>
                    <Button className="mt-3">Review & Approve</Button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">Base Wages</p>
                      <p className="font-bold">$75,000</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">Penalty Rates</p>
                      <p className="font-bold">$12,500</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">Allowances</p>
                      <p className="font-bold">$5,000</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budgets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Department Budgets</CardTitle>
                <CardDescription>Budget allocation and tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Service Delivery</p>
                      <span className="text-sm">$180,000 / $200,000</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '90%'}}></div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Human Resources</p>
                      <span className="text-sm">$22,000 / $30,000</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '73%'}}></div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Operations</p>
                      <span className="text-sm">$28,000 / $50,000</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '56%'}}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>NDIS Financial Compliance</CardTitle>
                <CardDescription>Price guide compliance and billing validation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        <p className="font-medium">Price Guide Compliance</p>
                      </div>
                      <p className="text-2xl font-bold">99.2%</p>
                      <p className="text-xs text-muted-foreground">All invoices within limits</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircleIcon className="h-5 w-5 text-yellow-500" />
                        <p className="font-medium">SCHADS Compliance</p>
                      </div>
                      <p className="text-2xl font-bold">98.5%</p>
                      <p className="text-xs text-muted-foreground">2 payroll reviews pending</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FileTextIcon className="h-5 w-5 text-blue-500" />
                        <p className="font-medium">Audit Trail</p>
                      </div>
                      <p className="text-2xl font-bold">100%</p>
                      <p className="text-xs text-muted-foreground">Complete documentation</p>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-blue-50">
                    <h4 className="font-medium mb-3">NDIS Billing Workflow Checks</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Service agreements verified before billing</span>
                        </div>
                        <Badge className="bg-green-500">Compliant</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Support ratios within NDIS guidelines</span>
                        </div>
                        <Badge className="bg-green-500">Compliant</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Travel claims follow NDIS rules</span>
                        </div>
                        <Badge className="bg-green-500">Compliant</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircleIcon className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">Provider travel documentation</span>
                        </div>
                        <Badge className="bg-yellow-500">Review Required</Badge>
                      </div>
                    </div>
                  </div>

                  <ComplianceDashboard 
                    role="finance_manager" 
                    checks={[
                      {
                        id: 'fm-001',
                        name: 'NDIS Price Guide Adherence',
                        description: 'All billing follows current price guide',
                        category: 'documentation',
                        severity: 'critical',
                        status: 'compliant'
                      },
                      {
                        id: 'fm-002',
                        name: 'Invoice Accuracy',
                        description: '99.5% accuracy target',
                        category: 'service_delivery',
                        severity: 'high',
                        status: 'compliant'
                      },
                      {
                        id: 'fm-003',
                        name: 'Payment Processing',
                        description: 'Within 14-day target',
                        category: 'service_delivery',
                        severity: 'medium',
                        status: 'compliant'
                      },
                      {
                        id: 'fm-004',
                        name: 'Financial Audit Trail',
                        description: '7-year retention policy',
                        category: 'documentation',
                        severity: 'high',
                        status: 'compliant'
                      }
                    ]} 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
                <CardDescription>Generate and download reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline">Monthly P&L Statement</Button>
                  <Button variant="outline">Cash Flow Report</Button>
                  <Button variant="outline">NDIS Claim Summary</Button>
                  <Button variant="outline">Payroll Report</Button>
                  <Button variant="outline">Budget Variance Report</Button>
                  <Button variant="outline">Tax Summary</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { 
  DollarSign, 
  FileText, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  Download, 
  Upload,
  CreditCard,
  Calculator,
  FileSpreadsheet,
  CheckCircle
} from "lucide-react";

export default function FinanceDashboard() {
  const { toast } = useToast();
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showPayRunDialog, setShowPayRunDialog] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(new Date());

  // Fetch financial statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/finance/stats"],
    queryFn: async () => {
      const response = await fetch("/api/finance/stats");
      if (!response.ok) throw new Error("Failed to fetch financial stats");
      return response.json();
    }
  });

  // Fetch pending invoices
  const { data: pendingInvoices } = useQuery({
    queryKey: ["/api/finance/invoices/pending"],
    queryFn: async () => {
      const response = await fetch("/api/finance/invoices/pending");
      if (!response.ok) throw new Error("Failed to fetch pending invoices");
      return response.json();
    }
  });

  // Generate invoices mutation
  const generateInvoicesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/finance/invoices/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          periodStart: new Date(selectedPeriod.getFullYear(), selectedPeriod.getMonth(), 1),
          periodEnd: new Date(selectedPeriod.getFullYear(), selectedPeriod.getMonth() + 1, 0)
        })
      });
      if (!response.ok) throw new Error("Failed to generate invoices");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Invoices Generated",
        description: `Successfully generated ${data.count} invoices totaling $${data.total}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/finance"] });
      setShowInvoiceDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate invoices",
        variant: "destructive",
      });
    }
  });

  // Process pay run mutation
  const processPayRunMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/finance/payrun/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodStart: new Date(selectedPeriod.getFullYear(), selectedPeriod.getMonth(), 1),
          periodEnd: new Date(selectedPeriod.getFullYear(), selectedPeriod.getMonth() + 1, 0)
        })
      });
      if (!response.ok) throw new Error("Failed to process pay run");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Pay Run Processed",
        description: `Successfully processed payroll for ${data.staffCount} staff members`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/finance"] });
      setShowPayRunDialog(false);
    }
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Finance Dashboard</h1>
          <p className="text-muted-foreground">Manage invoicing, payroll, and financial compliance</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowInvoiceDialog(true)}>
            <FileText className="mr-2 h-4 w-4" />
            Generate Invoices
          </Button>
          <Button onClick={() => setShowPayRunDialog(true)} variant="outline">
            <Calculator className="mr-2 h-4 w-4" />
            Process Pay Run
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.totalInvoiced?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.outstandingAmount?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingInvoices?.length || 0} unpaid invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payroll This Fortnight</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.payrollProcessed?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.staffCount || 0} staff processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-muted-foreground">
              STP submitted, Super up to date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="invoicing" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoicing">Invoicing</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
        </TabsList>

        <TabsContent value="invoicing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>Manage participant billing and NDIS claims</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingInvoices?.slice(0, 5).map((invoice: any) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <p className="font-medium">{invoice.participantName}</p>
                      <p className="text-sm text-muted-foreground">Invoice #{invoice.invoiceNumber}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                        {invoice.status}
                      </Badge>
                      <span className="font-bold">${invoice.totalAmount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Processing</CardTitle>
              <CardDescription>SCHADS Award compliant payroll management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Next Pay Date</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">15 Feb 2025</p>
                      <p className="text-sm text-muted-foreground">In 2 days</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Staff to Process</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">127</p>
                      <p className="text-sm text-muted-foreground">All timesheets submitted</p>
                    </CardContent>
                  </Card>
                </div>
                <Button className="w-full">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Generate ABA File
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
              <CardDescription>Track regulatory requirements and submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">STP Submission</p>
                      <p className="text-sm text-muted-foreground">Last submitted: 31 Jan 2025</p>
                    </div>
                  </div>
                  <Badge variant="default">Current</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="font-medium">Super Payment</p>
                      <p className="text-sm text-muted-foreground">Due: 28 Feb 2025</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Due in 15 days</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">BAS Quarter</p>
                      <p className="text-sm text-muted-foreground">Due: 28 Apr 2025</p>
                    </div>
                  </div>
                  <Badge variant="outline">Q3 FY25</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reconciliation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bank Reconciliation</CardTitle>
              <CardDescription>Match payments and reconcile accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">Unreconciled Transactions</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Import Bank Statement
                  </Button>
                </div>
                <div className="border-t pt-4">
                  <Button className="w-full">Start Reconciliation</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generate Invoices Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Participant Invoices</DialogTitle>
            <DialogDescription>
              Select the period to generate invoices for completed services
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Calendar
              mode="single"
              selected={selectedPeriod}
              onSelect={(date) => date && setSelectedPeriod(date)}
              className="rounded-md border"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => generateInvoicesMutation.mutate()}>
              Generate Invoices
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Pay Run Dialog */}
      <Dialog open={showPayRunDialog} onOpenChange={setShowPayRunDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Pay Run</DialogTitle>
            <DialogDescription>
              Process payroll for the selected period with SCHADS Award compliance
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Calendar
              mode="single"
              selected={selectedPeriod}
              onSelect={(date) => date && setSelectedPeriod(date)}
              className="rounded-md border"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayRunDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => processPayRunMutation.mutate()}>
              Process Pay Run
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
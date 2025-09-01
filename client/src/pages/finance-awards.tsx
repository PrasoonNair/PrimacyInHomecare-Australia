import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAwardRateSchema, insertPayrollSchema, type AwardRate, type Payroll, type Staff } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { DollarSignIcon, PlusIcon, FileTextIcon, CalendarIcon, TrendingUpIcon, AlertCircleIcon } from "lucide-react";
import { ShiftAllowanceCalculator } from '@/components/finance/shift-allowance-calculator';
import { PriceGuideManager } from '@/components/finance/price-guide-manager';
import { ProviderTravelCalculator } from '@/components/finance/provider-travel-calculator';
import { format } from "date-fns";

export default function FinanceAwards() {
  const [activeTab, setActiveTab] = useState("awards");
  const [awardDialogOpen, setAwardDialogOpen] = useState(false);
  const [payrollDialogOpen, setPayrollDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: awardRates = [], isLoading: awardsLoading } = useQuery<AwardRate[]>({
    queryKey: ["/api/award-rates"],
  });

  const { data: payrollRecords = [], isLoading: payrollLoading } = useQuery<Payroll[]>({
    queryKey: ["/api/payroll"],
  });

  const { data: staff = [] } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
  });

  const awardForm = useForm({
    resolver: zodResolver(insertAwardRateSchema),
    defaultValues: {
      awardType: "schads",
      casualLoading: "0.25",
      weekendRate: "1.5",
      publicHolidayRate: "2.0",
      overnightRate: "1.0",
      isActive: true,
    },
  });

  const payrollForm = useForm({
    resolver: zodResolver(insertPayrollSchema),
    defaultValues: {
      regularHours: "0",
      overtimeHours: "0",
      weekendHours: "0",
      publicHolidayHours: "0",
      overnightHours: "0",
      status: "pending",
    },
  });

  const createAwardMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/award-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create award rate");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/award-rates"] });
      setAwardDialogOpen(false);
      awardForm.reset();
      toast({
        title: "Success",
        description: "Award rate created successfully",
      });
    },
  });

  const createPayrollMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create payroll record");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      setPayrollDialogOpen(false);
      payrollForm.reset();
      toast({
        title: "Success",
        description: "Payroll record created successfully",
      });
    },
  });

  const getAwardBadgeColor = (awardType: string) => {
    switch (awardType) {
      case "schads": return "default";
      case "healthcare": return "secondary";
      case "general": return "outline";
      case "casual": return "destructive";
      default: return "outline";
    }
  };

  const getPayrollStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "default";
      case "processed": return "secondary";
      case "pending": return "outline";
      case "cancelled": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Finance & Awards</h1>
          <p className="text-muted-foreground">
            Manage SCHADS award rates, payroll processing, and staff payments
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="awards" data-testid="tab-awards">Award Rates</TabsTrigger>
            <TabsTrigger value="calculator" data-testid="tab-calculator">Shift Calculator</TabsTrigger>
            <TabsTrigger value="travel" data-testid="tab-travel">Travel Calculator</TabsTrigger>
            <TabsTrigger value="documents" data-testid="tab-documents">Price Guides</TabsTrigger>
            <TabsTrigger value="payroll" data-testid="tab-payroll">Payroll</TabsTrigger>
          </TabsList>

          <TabsContent value="awards" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Award Rates Management</h2>
              <Dialog open={awardDialogOpen} onOpenChange={setAwardDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-new-award">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    New Award Rate
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create Award Rate</DialogTitle>
                  </DialogHeader>
                  <Form {...awardForm}>
                    <form onSubmit={awardForm.handleSubmit((data) => createAwardMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={awardForm.control}
                        name="awardType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Award Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-award-type">
                                  <SelectValue placeholder="Select award type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="schads">SCHADS Award</SelectItem>
                                <SelectItem value="healthcare">Healthcare Award</SelectItem>
                                <SelectItem value="general">General Award</SelectItem>
                                <SelectItem value="casual">Casual Award</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={awardForm.control}
                          name="level"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Level</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Level 1" data-testid="input-level" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={awardForm.control}
                          name="classification"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Classification</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Support Worker" data-testid="input-classification" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={awardForm.control}
                        name="baseHourlyRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Base Hourly Rate ($)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" step="0.01" data-testid="input-base-rate" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={awardForm.control}
                          name="casualLoading"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Casual Loading (%)</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" step="0.01" data-testid="input-casual-loading" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={awardForm.control}
                          name="weekendRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Weekend Rate (x)</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" step="0.1" data-testid="input-weekend-rate" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={awardForm.control}
                          name="publicHolidayRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Public Holiday Rate (x)</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" step="0.1" data-testid="input-holiday-rate" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={awardForm.control}
                          name="overnightRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Overnight Rate (x)</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" step="0.1" data-testid="input-overnight-rate" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={awardForm.control}
                        name="effectiveFrom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Effective From</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" data-testid="input-effective-from" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full" disabled={createAwardMutation.isPending} data-testid="button-submit-award">
                        {createAwardMutation.isPending ? "Creating..." : "Create Award Rate"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {awardsLoading ? (
                <div className="text-center py-8" data-testid="loading-awards">Loading award rates...</div>
              ) : awardRates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="empty-awards">
                  No award rates found. Create your first award rate to get started.
                </div>
              ) : (
                awardRates.map((award) => (
                  <Card key={award.id} data-testid={`award-card-${award.id}`}>
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {award.awardType?.toUpperCase()} - {award.level}
                          </CardTitle>
                          <CardDescription>{award.classification}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={getAwardBadgeColor(award.awardType || "general")}>
                            {award.awardType}
                          </Badge>
                          <Badge variant={award.isActive ? "default" : "destructive"}>
                            {award.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <DollarSignIcon className="h-4 w-4 text-green-600" />
                            <span className="text-lg font-semibold">${award.baseHourlyRate}/hr</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Casual Loading: {Number(award.casualLoading || 0) * 100}%
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Weekend:</span>
                            <span className="ml-1">{award.weekendRate}x</span>
                          </div>
                          <div>
                            <span className="font-medium">Public Holiday:</span>
                            <span className="ml-1">{award.publicHolidayRate}x</span>
                          </div>
                          <div>
                            <span className="font-medium">Overnight:</span>
                            <span className="ml-1">{award.overnightRate}x</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarIcon className="h-4 w-4" />
                          <span>
                            Effective from: {award.effectiveFrom ? format(new Date(award.effectiveFrom), "MMM dd, yyyy") : "N/A"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="calculator" className="space-y-6">
            <ShiftAllowanceCalculator />
          </TabsContent>

          <TabsContent value="travel" className="space-y-6">
            <ProviderTravelCalculator />
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <PriceGuideManager />
          </TabsContent>

          <TabsContent value="payroll" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Payroll Management</h2>
              <Dialog open={payrollDialogOpen} onOpenChange={setPayrollDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-new-payroll">
                    <FileTextIcon className="mr-2 h-4 w-4" />
                    New Payroll Entry
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create Payroll Record</DialogTitle>
                  </DialogHeader>
                  <Form {...payrollForm}>
                    <form onSubmit={payrollForm.handleSubmit((data) => createPayrollMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={payrollForm.control}
                        name="staffId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Staff Member</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-staff-payroll">
                                  <SelectValue placeholder="Select staff member" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {staff?.map((member) => (
                                  <SelectItem key={member.id} value={member.id}>
                                    {member.firstName} {member.lastName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={payrollForm.control}
                          name="payPeriodStart"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pay Period Start</FormLabel>
                              <FormControl>
                                <Input {...field} type="date" data-testid="input-pay-start" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={payrollForm.control}
                          name="payPeriodEnd"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pay Period End</FormLabel>
                              <FormControl>
                                <Input {...field} type="date" data-testid="input-pay-end" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={payrollForm.control}
                          name="regularHours"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Regular Hours</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" step="0.5" data-testid="input-regular-hours" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={payrollForm.control}
                          name="overtimeHours"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Overtime Hours</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" step="0.5" data-testid="input-overtime-hours" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={payrollForm.control}
                          name="weekendHours"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Weekend</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" step="0.5" data-testid="input-weekend-hours" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={payrollForm.control}
                          name="publicHolidayHours"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Public Holiday</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" step="0.5" data-testid="input-holiday-hours" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={payrollForm.control}
                          name="overnightHours"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Overnight</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" step="0.5" data-testid="input-overnight-hours" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={payrollForm.control}
                        name="awardRateId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Award Rate</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-award-rate">
                                  <SelectValue placeholder="Select award rate" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {awardRates?.map((award) => (
                                  <SelectItem key={award.id} value={award.id}>
                                    {award.awardType} - {award.level} (${award.baseHourlyRate}/hr)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full" disabled={createPayrollMutation.isPending} data-testid="button-submit-payroll">
                        {createPayrollMutation.isPending ? "Creating..." : "Create Payroll Record"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {payrollLoading ? (
                <div className="text-center py-8" data-testid="loading-payroll">Loading payroll records...</div>
              ) : payrollRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="empty-payroll">
                  No payroll records found. Create your first payroll entry to get started.
                </div>
              ) : (
                payrollRecords.map((payroll) => (
                  <Card key={payroll.id} data-testid={`payroll-card-${payroll.id}`}>
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            Pay Period: {payroll.payPeriodStart ? format(new Date(payroll.payPeriodStart), "MMM dd") : "N/A"} - 
                            {payroll.payPeriodEnd ? format(new Date(payroll.payPeriodEnd), "MMM dd, yyyy") : "N/A"}
                          </CardTitle>
                          <CardDescription>Staff ID: {payroll.staffId}</CardDescription>
                        </div>
                        <Badge variant={getPayrollStatusColor(payroll.status || "pending")}>
                          {payroll.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Regular:</span>
                            <span className="ml-1">{payroll.regularHours}h</span>
                          </div>
                          <div>
                            <span className="font-medium">Overtime:</span>
                            <span className="ml-1">{payroll.overtimeHours}h</span>
                          </div>
                          <div>
                            <span className="font-medium">Weekend:</span>
                            <span className="ml-1">{payroll.weekendHours}h</span>
                          </div>
                          <div>
                            <span className="font-medium">Holiday:</span>
                            <span className="ml-1">{payroll.publicHolidayHours}h</span>
                          </div>
                        </div>

                        {payroll.grossPay && (
                          <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded">
                            <div>
                              <div className="flex items-center gap-2">
                                <DollarSignIcon className="h-4 w-4 text-green-600" />
                                <span className="font-semibold">Gross: ${payroll.grossPay}</span>
                              </div>
                              {payroll.superannuation && (
                                <div className="text-sm text-muted-foreground">
                                  Super: ${payroll.superannuation}
                                </div>
                              )}
                            </div>
                            <div>
                              {payroll.netPay && (
                                <div className="flex items-center gap-2">
                                  <TrendingUpIcon className="h-4 w-4 text-blue-600" />
                                  <span className="font-semibold">Net: ${payroll.netPay}</span>
                                </div>
                              )}
                              {payroll.tax && (
                                <div className="text-sm text-muted-foreground">
                                  Tax: ${payroll.tax}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {payroll.payDate && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarIcon className="h-4 w-4" />
                            <span>Pay Date: {format(new Date(payroll.payDate), "MMM dd, yyyy")}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="invoicing" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">NDIS Invoicing</h2>
              <Button data-testid="button-new-invoice">
                <FileTextIcon className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </div>

            <div className="text-center py-8 text-muted-foreground" data-testid="invoicing-placeholder">
              <FileTextIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Invoice management coming soon.</p>
              <p className="text-sm mt-2">This section will handle NDIS claim submissions and invoice generation.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
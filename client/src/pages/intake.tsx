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
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReferralSchema, insertServiceAgreementSchema, type Referral, type ServiceAgreement } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, UserPlusIcon, FileTextIcon, ClockIcon, AlertCircleIcon } from "lucide-react";
import { format } from "date-fns";

export default function Intake() {
  const [activeTab, setActiveTab] = useState("referrals");
  const [referralDialogOpen, setReferralDialogOpen] = useState(false);
  const [agreementDialogOpen, setAgreementDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: referrals = [], isLoading: referralsLoading } = useQuery<Referral[]>({
    queryKey: ["/api/referrals"],
  });

  const { data: serviceAgreements = [], isLoading: agreementsLoading } = useQuery<ServiceAgreement[]>({
    queryKey: ["/api/service-agreements"],
  });

  const { data: participants = [] } = useQuery({
    queryKey: ["/api/participants"],
  });

  const referralForm = useForm({
    resolver: zodResolver(insertReferralSchema),
    defaultValues: {
      referralSource: "ndis_planner",
      referralDate: new Date().toISOString().split('T')[0],
      status: "pending",
      priority: "standard",
    },
  });

  const agreementForm = useForm({
    resolver: zodResolver(insertServiceAgreementSchema),
    defaultValues: {
      status: "draft",
      startDate: new Date().toISOString().split('T')[0],
    },
  });

  const createReferralMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create referral");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/referrals"] });
      setReferralDialogOpen(false);
      referralForm.reset();
      toast({
        title: "Success",
        description: "Referral created successfully",
      });
    },
  });

  const createAgreementMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/service-agreements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create service agreement");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-agreements"] });
      setAgreementDialogOpen(false);
      agreementForm.reset();
      toast({
        title: "Success",
        description: "Service agreement created successfully",
      });
    },
  });

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive";
      case "high": return "secondary";
      case "standard": return "outline";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "pending": return "secondary";
      case "draft": return "outline";
      case "expired": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Intake Department</h1>
          <p className="text-muted-foreground">
            Primacy Care Australia - Manage referrals, participant intake, and service agreements
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="referrals" data-testid="tab-referrals">Referrals</TabsTrigger>
            <TabsTrigger value="agreements" data-testid="tab-agreements">Service Agreements</TabsTrigger>
          </TabsList>

          <TabsContent value="referrals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Referrals Management</h2>
              <Dialog open={referralDialogOpen} onOpenChange={setReferralDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-new-referral">
                    <UserPlusIcon className="mr-2 h-4 w-4" />
                    New Referral
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Referral</DialogTitle>
                  </DialogHeader>
                  <Form {...referralForm}>
                    <form onSubmit={referralForm.handleSubmit((data) => createReferralMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={referralForm.control}
                        name="referrerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Referrer Name</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-referrer-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={referralForm.control}
                        name="referrerContact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Information</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-referrer-contact" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={referralForm.control}
                        name="referralSource"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Referral Source</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-referral-source">
                                  <SelectValue placeholder="Select source" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ndis_planner">NDIS Planner</SelectItem>
                                <SelectItem value="family">Family</SelectItem>
                                <SelectItem value="healthcare_provider">Healthcare Provider</SelectItem>
                                <SelectItem value="self_referral">Self Referral</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={referralForm.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-priority">
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="urgent">Urgent</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={referralForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={3} data-testid="textarea-notes" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full" disabled={createReferralMutation.isPending} data-testid="button-submit-referral">
                        {createReferralMutation.isPending ? "Creating..." : "Create Referral"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {referralsLoading ? (
                <div className="text-center py-8" data-testid="loading-referrals">Loading referrals...</div>
              ) : referrals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="empty-referrals">
                  No referrals found. Create your first referral to get started.
                </div>
              ) : (
                referrals.map((referral) => (
                  <Card key={referral.id} data-testid={`referral-card-${referral.id}`}>
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{referral.referrerName || "Unknown Referrer"}</CardTitle>
                          <CardDescription>
                            Source: {referral.referralSource?.replace("_", " ").toUpperCase()}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={getPriorityBadgeColor(referral.priority || "standard")}>
                            {referral.priority}
                          </Badge>
                          <Badge variant={getStatusBadgeColor(referral.status || "pending")}>
                            {referral.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span>Referred: {referral.referralDate ? format(new Date(referral.referralDate), "MMM dd, yyyy") : "N/A"}</span>
                        </div>
                        {referral.referrerContact && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Contact:</span>
                            <span>{referral.referrerContact}</span>
                          </div>
                        )}
                        {referral.notes && (
                          <div className="mt-3 p-3 bg-muted/50 rounded">
                            <p className="text-sm">{referral.notes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="agreements" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Service Agreements</h2>
              <Dialog open={agreementDialogOpen} onOpenChange={setAgreementDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-new-agreement">
                    <FileTextIcon className="mr-2 h-4 w-4" />
                    New Agreement
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Service Agreement</DialogTitle>
                  </DialogHeader>
                  <Form {...agreementForm}>
                    <form onSubmit={agreementForm.handleSubmit((data) => createAgreementMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={agreementForm.control}
                        name="participantId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Participant</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-participant">
                                  <SelectValue placeholder="Select participant" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {participants?.map((participant: any) => (
                                  <SelectItem key={participant.id} value={participant.id}>
                                    {participant.firstName} {participant.lastName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={agreementForm.control}
                        name="agreementNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Agreement Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="AG-2024-001" data-testid="input-agreement-number" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={agreementForm.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" data-testid="input-start-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={agreementForm.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" data-testid="input-end-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={agreementForm.control}
                        name="specialConditions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Special Conditions</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={3} data-testid="textarea-conditions" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full" disabled={createAgreementMutation.isPending} data-testid="button-submit-agreement">
                        {createAgreementMutation.isPending ? "Creating..." : "Create Agreement"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {agreementsLoading ? (
                <div className="text-center py-8" data-testid="loading-agreements">Loading agreements...</div>
              ) : serviceAgreements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="empty-agreements">
                  No service agreements found. Create your first agreement to get started.
                </div>
              ) : (
                serviceAgreements.map((agreement) => (
                  <Card key={agreement.id} data-testid={`agreement-card-${agreement.id}`}>
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Agreement {agreement.agreementNumber}</CardTitle>
                          <CardDescription>
                            {agreement.startDate ? format(new Date(agreement.startDate), "MMM dd, yyyy") : "N/A"} - 
                            {agreement.endDate ? format(new Date(agreement.endDate), "MMM dd, yyyy") : "N/A"}
                          </CardDescription>
                        </div>
                        <Badge variant={getStatusBadgeColor(agreement.status || "draft")}>
                          {agreement.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {agreement.renewalDate && (
                          <div className="flex items-center gap-2">
                            <AlertCircleIcon className="h-4 w-4 text-orange-500" />
                            <span>Renewal Due: {format(new Date(agreement.renewalDate), "MMM dd, yyyy")}</span>
                          </div>
                        )}
                        {agreement.specialConditions && (
                          <div className="mt-3 p-3 bg-muted/50 rounded">
                            <p className="text-sm font-medium mb-1">Special Conditions:</p>
                            <p className="text-sm">{agreement.specialConditions}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
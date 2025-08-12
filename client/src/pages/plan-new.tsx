import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertNdisplanSchema } from "@shared/schema";
import { z } from "zod";
import { FileText, ArrowLeft, Calendar, DollarSign, Users } from "lucide-react";
import { NdisPlanScanner } from "@/components/ndis-plan-scanner";

const planSchema = insertNdisplanSchema.extend({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

type Participant = {
  id: string;
  firstName: string;
  lastName: string;
  ndisNumber: string;
  isActive: boolean;
};

export default function PlanNewPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch participants for dropdown
  const { data: participants = [] } = useQuery<Participant[]>({
    queryKey: ["/api/participants"]
  });

  const form = useForm<z.infer<typeof planSchema>>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      participantId: "",
      planNumber: "",
      planVersion: "1.0",
      startDate: "",
      endDate: "",
      status: "draft",
      totalBudget: 0,
      coreSupportsbudget: 0,
      capacityBuildingBudget: 0,
      capitalSupportsBudget: 0,
      planManagerName: "",
      planManagerContact: "",
      supportCoordinator: "",
      goals: ""
    }
  });

  const createPlanMutation = useMutation({
    mutationFn: (data: z.infer<typeof planSchema>) => {
      setIsSubmitting(true);
      return apiRequest("/api/plans", "POST", data);
    },
    onSuccess: (newPlan) => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      toast({ 
        title: "Plan created successfully",
        description: `Plan ${newPlan.planNumber} has been created`
      });
      setLocation("/plans");
    },
    onError: (error) => {
      console.error("Error creating plan:", error);
      toast({ 
        title: "Failed to create plan", 
        description: "Please check all fields and try again",
        variant: "destructive" 
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const onSubmit = (data: z.infer<typeof planSchema>) => {
    createPlanMutation.mutate(data);
  };

  const handleCancel = () => {
    setLocation("/plans");
  };

  const handleScanComplete = (planData: any) => {
    // Pre-fill form with scanned data
    if (planData.planData) {
      const plan = planData.planData;
      
      form.setValue("planNumber", plan.planDetails?.planNumber || "");
      form.setValue("totalBudget", plan.planDetails?.totalBudget || 0);
      form.setValue("coreSupportsbudget", plan.budgetBreakdown?.coreSupports || 0);
      form.setValue("capacityBuildingBudget", plan.budgetBreakdown?.capacityBuilding || 0);
      form.setValue("capitalSupportsBudget", plan.budgetBreakdown?.capitalSupports || 0);
      
      if (plan.planDetails?.startDate) {
        form.setValue("startDate", plan.planDetails.startDate);
      }
      if (plan.planDetails?.endDate) {
        form.setValue("endDate", plan.planDetails.endDate);
      }
      
      // Find matching participant by NDIS number
      const matchingParticipant = participants.find(p => 
        p.ndisNumber === plan.participantInfo?.ndisNumber
      );
      if (matchingParticipant) {
        form.setValue("participantId", matchingParticipant.id);
      }
      
      toast({
        title: "Plan Data Imported",
        description: "Form has been pre-filled with scanned plan information",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" onClick={handleCancel} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              Create New NDIS Plan
            </h1>
            <p className="text-gray-600 mt-2">
              Create a comprehensive NDIS plan for participant support and funding
            </p>
          </div>
        </div>
      </div>

      {/* AI Plan Scanner Section */}
      <div className="mb-8">
        <NdisPlanScanner 
          onScanComplete={handleScanComplete}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Details</CardTitle>
          <CardDescription>
            Enter the plan information and budget allocations for NDIS support
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Participant Selection */}
              <FormField
                control={form.control}
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
                        {participants.filter(p => p.isActive).map((participant) => (
                          <SelectItem key={participant.id} value={participant.id}>
                            {participant.firstName} {participant.lastName} - {participant.ndisNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Plan Information */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="planNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., PLAN-2024-001" data-testid="input-plan-number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="planVersion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Version</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 1.0" data-testid="input-plan-version" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Plan Dates */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Plan Start Date
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="date" data-testid="input-start-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Plan End Date
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="date" data-testid="input-end-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Budget Allocations */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Budget Allocations
                </h3>
                
                <FormField
                  control={form.control}
                  name="totalBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Plan Budget ($)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          step="0.01" 
                          min="0"
                          placeholder="0.00"
                          data-testid="input-total-budget"
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="coreSupportsbudget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Core Supports ($)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.01" 
                            min="0"
                            placeholder="0.00"
                            data-testid="input-core-budget"
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="capacityBuildingBudget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity Building ($)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.01" 
                            min="0"
                            placeholder="0.00"
                            data-testid="input-capacity-budget"
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="capitalSupportsBudget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capital Supports ($)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.01" 
                            min="0"
                            placeholder="0.00"
                            data-testid="input-capital-budget"
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Plan Management */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Plan Management
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="planManagerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan Manager Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Plan manager's full name" data-testid="input-plan-manager" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="planManagerContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan Manager Contact</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Email or phone number" data-testid="input-manager-contact" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="supportCoordinator"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Support Coordinator</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Support coordinator's name" data-testid="input-support-coordinator" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Goals */}
              <FormField
                control={form.control}
                name="goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Goals</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={4} 
                        placeholder="Describe the participant's initial goals and objectives..."
                        data-testid="input-goals"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Plan Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || createPlanMutation.isPending}
                  data-testid="button-create-plan"
                >
                  {isSubmitting ? "Creating Plan..." : "Create Plan"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
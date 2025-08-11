import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertParticipantGoalsSchema, insertGoalActionsSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { FileText, Upload, Target, Users, Calendar, DollarSign, Plus, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

type ParticipantGoal = {
  id: string;
  participantId: string;
  planId: string;
  goalDescription: string;
  goalCategory: string;
  priority: "high" | "medium" | "low";
  targetDate: string;
  progress: number;
  assignedStaffId?: string;
  status: "active" | "completed" | "on_hold" | "cancelled";
  createdAt: string;
  updatedAt: string;
};

type GoalAction = {
  id: string;
  goalId: string;
  actionDescription: string;
  frequency: string;
  assignedStaffId?: string;
  supportItemId?: string;
  estimatedCost: number;
  actualCost?: number;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  dueDate?: string;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
};

type NdisPlan = {
  id: string;
  participantId: string;
  planNumber: string;
  planVersion: string;
  startDate: string;
  endDate: string;
  status: "draft" | "active" | "expired" | "cancelled";
  totalBudget: number;
  coreSupportsbudget: number;
  capacityBuildingBudget: number;
  capitalSupportsBudget: number;
  planManagerName?: string;
  planManagerContact?: string;
  supportCoordinator?: string;
  goals?: string;
  documentsPath?: string;
  extractedData?: any;
  createdAt: string;
  updatedAt: string;
};

type Participant = {
  id: string;
  firstName: string;
  lastName: string;
  ndisNumber: string;
  isActive: boolean;
};

const goalSchema = insertParticipantGoalsSchema.extend({
  targetDate: z.string().min(1, "Target date is required"),
});

const actionSchema = insertGoalActionsSchema.extend({
  dueDate: z.string().optional(),
});

export default function PlansPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<NdisPlan | null>(null);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<ParticipantGoal | null>(null);
  const [editingGoal, setEditingGoal] = useState<ParticipantGoal | null>(null);

  // Fetch plans
  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["/api/plans"],
  });

  // Fetch participants for dropdown
  const { data: participants = [] } = useQuery({
    queryKey: ["/api/participants"],
  });

  // Fetch goals for selected plan
  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ["/api/participants", selectedPlan?.participantId, "goals"],
    enabled: !!selectedPlan?.participantId,
  });

  // Fetch staff for dropdown
  const { data: staff = [] } = useQuery({
    queryKey: ["/api/staff"],
  });

  // Form for creating/editing goals
  const goalForm = useForm<z.infer<typeof goalSchema>>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      goalDescription: "",
      goalCategory: "",
      priority: "medium",
      progress: 0,
      status: "active",
    },
  });

  // Form for creating actions
  const actionForm = useForm<z.infer<typeof actionSchema>>({
    resolver: zodResolver(actionSchema),
    defaultValues: {
      actionDescription: "",
      frequency: "",
      estimatedCost: 0,
      status: "pending",
    },
  });

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async (data: z.infer<typeof goalSchema>) => {
      if (!selectedPlan) throw new Error("No plan selected");
      return apiRequest(`/api/plans/${selectedPlan.id}/goals`, {
        method: "POST",
        body: JSON.stringify({
          ...data,
          participantId: selectedPlan.participantId,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/participants"] });
      setIsGoalDialogOpen(false);
      goalForm.reset();
      toast({
        title: "Success",
        description: "Goal created successfully",
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

  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<z.infer<typeof goalSchema>> }) => {
      return apiRequest(`/api/goals/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/participants"] });
      setEditingGoal(null);
      toast({
        title: "Success",
        description: "Goal updated successfully",
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

  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/goals/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/participants"] });
      toast({
        title: "Success",
        description: "Goal deleted successfully",
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

  const onCreateGoal = (data: z.infer<typeof goalSchema>) => {
    createGoalMutation.mutate(data);
  };

  const onUpdateGoal = (data: z.infer<typeof goalSchema>) => {
    if (editingGoal) {
      updateGoalMutation.mutate({ id: editingGoal.id, data });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
  };

  const getParticipantName = (participantId: string) => {
    const participant = participants.find((p: Participant) => p.id === participantId);
    return participant ? `${participant.firstName} ${participant.lastName}` : "Unknown";
  };

  const getStaffName = (staffId?: string) => {
    if (!staffId) return "Unassigned";
    const staffMember = staff.find((s: any) => s.id === staffId);
    return staffMember ? `${staffMember.firstName} ${staffMember.lastName}` : "Unknown";
  };

  const calculateBudgetUsed = (plan: NdisPlan) => {
    return ((plan.totalBudget - (plan.coreSupportsbudget + plan.capacityBuildingBudget + plan.capitalSupportsBudget)) / plan.totalBudget) * 100;
  };

  if (plansLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">NDIS Plans & Goals</h1>
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
        <h1 className="text-3xl font-bold" data-testid="page-title">NDIS Plans & Goals</h1>
        <div className="flex gap-2">
          <Button asChild data-testid="button-create-plan">
            <Link href="/plans/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Plan
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Plans List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              NDIS Plans
            </CardTitle>
            <CardDescription>
              Manage participant NDIS plans and documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {plans.length === 0 ? (
              <div className="text-center py-8" data-testid="empty-plans">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No plans found</p>
                <Button asChild className="mt-4" data-testid="button-add-first-plan">
                  <Link href="/plans/new">Add your first plan</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {plans.map((plan: NdisPlan) => (
                  <Card 
                    key={plan.id} 
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedPlan?.id === plan.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedPlan(plan)}
                    data-testid={`card-plan-${plan.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium" data-testid={`text-plan-number-${plan.id}`}>
                            {plan.planNumber}
                          </h4>
                          <p className="text-sm text-muted-foreground" data-testid={`text-participant-${plan.id}`}>
                            {getParticipantName(plan.participantId)}
                          </p>
                        </div>
                        <Badge className={getStatusColor(plan.status)} data-testid={`badge-status-${plan.id}`}>
                          {plan.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-2">
                        <div data-testid={`text-start-date-${plan.id}`}>
                          Start: {format(new Date(plan.startDate), "dd/MM/yyyy")}
                        </div>
                        <div data-testid={`text-end-date-${plan.id}`}>
                          End: {format(new Date(plan.endDate), "dd/MM/yyyy")}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Budget Used</span>
                          <span data-testid={`text-budget-${plan.id}`}>
                            ${plan.totalBudget.toLocaleString()}
                          </span>
                        </div>
                        <Progress 
                          value={calculateBudgetUsed(plan)} 
                          className="h-2"
                          data-testid={`progress-budget-${plan.id}`}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Goals for Selected Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Participant Goals
              {selectedPlan && (
                <span className="text-sm font-normal text-muted-foreground">
                  - {getParticipantName(selectedPlan.participantId)}
                </span>
              )}
            </CardTitle>
            <CardDescription>
              {selectedPlan 
                ? "Manage goals extracted from NDIS plans" 
                : "Select a plan to view and manage goals"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedPlan ? (
              <div className="text-center py-8" data-testid="select-plan-message">
                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Select a plan to view participant goals</p>
              </div>
            ) : goalsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-muted"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {goals.length} goal{goals.length !== 1 ? 's' : ''} found
                  </p>
                  <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" data-testid="button-add-goal">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Goal
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New Goal</DialogTitle>
                        <DialogDescription>
                          Add a new goal for {getParticipantName(selectedPlan.participantId)}
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...goalForm}>
                        <form onSubmit={goalForm.handleSubmit(onCreateGoal)} className="space-y-4">
                          <FormField
                            control={goalForm.control}
                            name="goalDescription"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Goal Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Describe the participant's goal..."
                                    {...field}
                                    data-testid="input-goal-description"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={goalForm.control}
                              name="goalCategory"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Category</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="e.g., Daily Living, Social Skills"
                                      {...field}
                                      data-testid="input-goal-category"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={goalForm.control}
                              name="priority"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Priority</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger data-testid="select-priority">
                                        <SelectValue placeholder="Select priority" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="high">High</SelectItem>
                                      <SelectItem value="medium">Medium</SelectItem>
                                      <SelectItem value="low">Low</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={goalForm.control}
                              name="targetDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Target Date</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="date"
                                      {...field}
                                      data-testid="input-target-date"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={goalForm.control}
                              name="assignedStaffId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Assigned Staff</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger data-testid="select-assigned-staff">
                                        <SelectValue placeholder="Select staff member" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {staff.map((member: any) => (
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
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setIsGoalDialogOpen(false)}
                              data-testid="button-cancel-goal"
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit" 
                              disabled={createGoalMutation.isPending}
                              data-testid="button-save-goal"
                            >
                              {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>

                {goals.length === 0 ? (
                  <div className="text-center py-8" data-testid="empty-goals">
                    <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No goals found for this participant</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload a plan document or manually add goals
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {goals.map((goal: ParticipantGoal) => (
                      <Card key={goal.id} data-testid={`card-goal-${goal.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium mb-1" data-testid={`text-goal-description-${goal.id}`}>
                                {goal.goalDescription}
                              </h4>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge 
                                  variant="outline" 
                                  className={getPriorityColor(goal.priority)}
                                  data-testid={`badge-priority-${goal.id}`}
                                >
                                  {goal.priority}
                                </Badge>
                                <Badge 
                                  variant="outline"
                                  data-testid={`badge-category-${goal.id}`}
                                >
                                  {goal.goalCategory}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground space-y-1">
                                <div data-testid={`text-assigned-staff-${goal.id}`}>
                                  Assigned: {getStaffName(goal.assignedStaffId)}
                                </div>
                                {goal.targetDate && (
                                  <div data-testid={`text-target-date-${goal.id}`}>
                                    Target: {format(new Date(goal.targetDate), "dd/MM/yyyy")}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingGoal(goal);
                                  goalForm.reset({
                                    goalDescription: goal.goalDescription,
                                    goalCategory: goal.goalCategory,
                                    priority: goal.priority,
                                    targetDate: goal.targetDate ? goal.targetDate.split('T')[0] : '',
                                    assignedStaffId: goal.assignedStaffId,
                                    progress: goal.progress,
                                    status: goal.status,
                                  });
                                  setIsGoalDialogOpen(true);
                                }}
                                data-testid={`button-edit-goal-${goal.id}`}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    data-testid={`button-delete-goal-${goal.id}`}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this goal? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteGoalMutation.mutate(goal.id)}
                                      data-testid="button-confirm-delete"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                          {goal.progress > 0 && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Progress</span>
                                <span data-testid={`text-progress-${goal.id}`}>{goal.progress}%</span>
                              </div>
                              <Progress 
                                value={goal.progress} 
                                className="h-2"
                                data-testid={`progress-goal-${goal.id}`}
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
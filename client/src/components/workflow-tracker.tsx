import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Upload,
  FileCheck,
  FileSignature,
  DollarSign,
  Users,
  Calendar,
  CheckSquare,
  PlayCircle
} from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  status: "pending" | "in_progress" | "completed" | "blocked";
  canAdvance: boolean;
  details?: any;
}

interface WorkflowTrackerProps {
  referralId: string;
  currentStatus: string;
  referralData: any;
  onStatusChange?: (newStatus: string) => void;
}

export function WorkflowTracker({ 
  referralId, 
  currentStatus, 
  referralData,
  onStatusChange 
}: WorkflowTrackerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const workflowSteps: WorkflowStep[] = [
    {
      id: "referral_received",
      name: "Referral Received",
      description: "Initial referral document received",
      icon: Upload,
      status: getStepStatus("referral_received"),
      canAdvance: true,
      details: {
        documentType: referralData.documentType,
        receivedDate: referralData.createdAt
      }
    },
    {
      id: "data_verified",
      name: "Data Verified",
      description: "All mandatory fields verified and complete",
      icon: FileCheck,
      status: getStepStatus("data_verified"),
      canAdvance: referralData.mandatoryFieldsComplete,
      details: {
        verifiedBy: referralData.dataVerifiedBy,
        verifiedAt: referralData.dataVerifiedAt
      }
    },
    {
      id: "pending_service_agreement",
      name: "Service Agreement Prepared",
      description: "Service agreement template selected and prepared",
      icon: FileSignature,
      status: getStepStatus("pending_service_agreement"),
      canAdvance: true,
      details: {
        templateId: referralData.agreementTemplateId
      }
    },
    {
      id: "agreement_sent",
      name: "Agreement Sent",
      description: "Service agreement sent for e-signature",
      icon: FileSignature,
      status: getStepStatus("agreement_sent"),
      canAdvance: true,
      details: {
        sentAt: referralData.agreementSentAt
      }
    },
    {
      id: "agreement_signed",
      name: "Agreement Signed",
      description: "Service agreement signed by all parties",
      icon: CheckSquare,
      status: getStepStatus("agreement_signed"),
      canAdvance: referralData.agreementSignedAt != null,
      details: {
        signedAt: referralData.agreementSignedAt
      }
    },
    {
      id: "pending_funding_verification",
      name: "Funding Verification",
      description: "NDIS funding verification in progress",
      icon: DollarSign,
      status: getStepStatus("pending_funding_verification"),
      canAdvance: true,
      details: {
        planStart: referralData.planStartDate,
        planEnd: referralData.planEndDate
      }
    },
    {
      id: "funding_verified",
      name: "Funding Verified",
      description: "NDIS funding confirmed and available",
      icon: DollarSign,
      status: getStepStatus("funding_verified"),
      canAdvance: referralData.fundingVerified,
      details: {
        fundingNotes: referralData.fundingNotes
      }
    },
    {
      id: "ready_for_allocation",
      name: "Ready for Staff Allocation",
      description: "Ready to match and allocate support workers",
      icon: Users,
      status: getStepStatus("ready_for_allocation"),
      canAdvance: true
    },
    {
      id: "worker_allocated",
      name: "Worker Allocated",
      description: "Support worker matched and allocated",
      icon: Users,
      status: getStepStatus("worker_allocated"),
      canAdvance: referralData.allocatedStaffId != null,
      details: {
        staffId: referralData.allocatedStaffId,
        allocationDate: referralData.allocationDate
      }
    },
    {
      id: "meet_greet_scheduled",
      name: "Meet & Greet Scheduled",
      description: "Initial meeting scheduled between participant and worker",
      icon: Calendar,
      status: getStepStatus("meet_greet_scheduled"),
      canAdvance: true,
      details: {
        scheduledDate: referralData.meetGreetScheduled
      }
    },
    {
      id: "meet_greet_completed",
      name: "Meet & Greet Completed",
      description: "Initial meeting completed successfully",
      icon: CheckCircle2,
      status: getStepStatus("meet_greet_completed"),
      canAdvance: referralData.meetGreetCompleted,
      details: {
        outcome: referralData.meetGreetOutcome
      }
    },
    {
      id: "service_commenced",
      name: "Service Commenced",
      description: "Support services have started",
      icon: PlayCircle,
      status: getStepStatus("service_commenced"),
      canAdvance: false
    }
  ];

  function getStepStatus(stepId: string): "pending" | "in_progress" | "completed" | "blocked" {
    const stepIndex = workflowSteps.findIndex(s => s.id === stepId);
    const currentIndex = workflowSteps.findIndex(s => s.id === currentStatus);
    
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "in_progress";
    return "pending";
  }

  const advanceWorkflowMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/workflow/referral/${referralId}/advance`, {
        method: "POST",
        body: JSON.stringify({ currentStatus }),
      });
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Workflow Advanced",
          description: data.message,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/referrals"] });
        if (onStatusChange) {
          const currentIndex = workflowSteps.findIndex(s => s.id === currentStatus);
          if (currentIndex < workflowSteps.length - 1) {
            onStatusChange(workflowSteps[currentIndex + 1].id);
          }
        }
      } else {
        toast({
          title: "Cannot Advance",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to advance workflow",
        variant: "destructive",
      });
    },
  });

  const currentStepIndex = workflowSteps.findIndex(s => s.id === currentStatus);
  const progressPercentage = ((currentStepIndex + 1) / workflowSteps.length) * 100;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-600 animate-pulse" />;
      case "blocked":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "blocked":
        return <Badge className="bg-red-100 text-red-800">Blocked</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Workflow Progress</span>
          <Badge variant="outline" className="text-lg px-3 py-1">
            {currentStepIndex + 1} / {workflowSteps.length} Steps
          </Badge>
        </CardTitle>
        <Progress value={progressPercentage} className="mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;
            const isExpanded = expandedStep === step.id;
            const isCurrentStep = step.id === currentStatus;
            const canAdvanceNow = isCurrentStep && step.canAdvance && 
              index < workflowSteps.length - 1;

            return (
              <div
                key={step.id}
                className={`border rounded-lg p-4 transition-all cursor-pointer
                  ${isCurrentStep ? 'border-blue-500 bg-blue-50' : ''}
                  ${step.status === 'completed' ? 'bg-green-50' : ''}
                  ${step.status === 'blocked' ? 'bg-red-50' : ''}
                `}
                onClick={() => setExpandedStep(isExpanded ? null : step.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(step.status)}
                    <Icon className="h-5 w-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium">{step.name}</h4>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(step.status)}
                    {canAdvanceNow && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          advanceWorkflowMutation.mutate();
                        }}
                        disabled={advanceWorkflowMutation.isPending}
                      >
                        Advance
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {isExpanded && step.details && (
                  <div className="mt-3 pt-3 border-t space-y-2">
                    {Object.entries(step.details).filter(([_, value]) => value != null).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-600 capitalize">
                          {key.replace(/_/g, ' ')}:
                        </span>
                        <span className="font-medium">
                          {value instanceof Date 
                            ? new Date(value).toLocaleDateString() 
                            : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {currentStatus === "service_commenced" && (
          <div className="mt-4 p-4 bg-green-100 rounded-lg">
            <div className="flex items-center space-x-2 text-green-800">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">
                Workflow Complete! Services have commenced successfully.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
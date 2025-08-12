import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle, XCircle, AlertTriangle, TrendingUp, User, Clock, MessageSquare } from "lucide-react";
import type { IncidentApproval } from "@shared/schema";

interface IncidentApprovalFlowProps {
  incidentId: string;
}

export default function IncidentApprovalFlow({ incidentId }: IncidentApprovalFlowProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [comments, setComments] = useState("");
  const [action, setAction] = useState<"approved" | "rejected" | "escalated" | "request_info" | null>(null);

  const { data: approvals = [], isLoading } = useQuery<IncidentApproval[]>({
    queryKey: [`/api/incidents/${incidentId}/approvals`],
  });

  const { data: incident } = useQuery<{
    id: string;
    currentApprovalLevel: number;
    severity: string;
    ndisNotified: boolean;
    status: string;
  }>({
    queryKey: [`/api/incidents/${incidentId}`],
  });

  const submitApproval = useMutation({
    mutationFn: async (data: {
      action: string;
      comments: string;
      approverName: string;
      approverRole: string;
      approvalLevel: number;
    }) => {
      return await apiRequest(`/api/incidents/${incidentId}/approvals`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/incidents/${incidentId}/approvals`] });
      queryClient.invalidateQueries({ queryKey: [`/api/incidents/${incidentId}`] });
      toast({
        title: "Approval Submitted",
        description: "Your approval decision has been recorded.",
      });
      setComments("");
      setAction(null);
    },
  });

  const handleApprovalSubmit = () => {
    if (!action || !comments.trim()) {
      toast({
        title: "Error",
        description: "Please select an action and provide comments.",
        variant: "destructive",
      });
      return;
    }

    // Determine approval level based on user role (simplified logic)
    const userRole = determineUserRole();
    const approvalLevel = determineApprovalLevel(userRole);

    submitApproval.mutate({
      action,
      comments,
      approverName: (user?.firstName || '') + " " + (user?.lastName || '') || "Unknown",
      approverRole: userRole,
      approvalLevel,
    });
  };

  const determineUserRole = () => {
    // In production, this would be based on actual user roles
    return "Team Leader";
  };

  const determineApprovalLevel = (role: string) => {
    const levels: Record<string, number> = {
      "Team Leader": 1,
      "Manager": 2,
      "Director": 3,
      "CEO": 4,
    };
    return levels[role] || 1;
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "escalated":
        return <TrendingUp className="h-4 w-4 text-orange-600" />;
      case "request_info":
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "escalated":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "request_info":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const approvalProgress = incident ? (incident.currentApprovalLevel / 4) * 100 : 0;

  const approvalLevels = [
    { level: 1, role: "Team Leader", required: true },
    { level: 2, role: "Manager", required: incident?.severity === "high" || incident?.severity === "critical" },
    { level: 3, role: "Director", required: incident?.severity === "critical" },
    { level: 4, role: "CEO", required: incident?.ndisNotified },
  ];

  if (isLoading) {
    return <div className="animate-pulse">Loading approval workflow...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Approval Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Approval Progress</CardTitle>
          <CardDescription>
            Current approval level: {incident?.currentApprovalLevel || 0} of 4
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={approvalProgress} className="h-2" />
          
          <div className="grid grid-cols-4 gap-2">
            {approvalLevels.map((level) => {
              const isCompleted = (incident?.currentApprovalLevel || 0) >= level.level;
              const isCurrent = (incident?.currentApprovalLevel || 0) + 1 === level.level;
              const isRequired = level.required;
              
              return (
                <div
                  key={level.level}
                  className={`text-center p-3 rounded-lg border ${
                    isCompleted
                      ? "bg-green-50 border-green-200"
                      : isCurrent
                      ? "bg-blue-50 border-blue-200"
                      : isRequired
                      ? "bg-gray-50 border-gray-200"
                      : "bg-gray-50 border-gray-100 opacity-50"
                  }`}
                >
                  <div className="text-xs font-medium text-gray-600">Level {level.level}</div>
                  <div className="text-sm font-semibold mt-1">{level.role}</div>
                  {isCompleted && (
                    <CheckCircle className="h-4 w-4 text-green-600 mx-auto mt-2" />
                  )}
                  {isCurrent && !isCompleted && (
                    <Clock className="h-4 w-4 text-blue-600 mx-auto mt-2" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Approval History */}
      <Card>
        <CardHeader>
          <CardTitle>Approval History</CardTitle>
          <CardDescription>
            All approval actions taken for this incident
          </CardDescription>
        </CardHeader>
        <CardContent>
          {approvals.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No approvals yet</p>
          ) : (
            <div className="space-y-4">
              {approvals.map((approval) => (
                <div
                  key={approval.id}
                  className="border rounded-lg p-4"
                  data-testid={`approval-${approval.id}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {getActionIcon(approval.action)}
                      <Badge className={getActionColor(approval.action)}>
                        {approval.action.toUpperCase()}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500">
                      {approval.createdAt ? new Date(approval.createdAt).toLocaleString() : 'Unknown date'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{approval.approverName}</span>
                    <span className="text-gray-500">({approval.approverRole})</span>
                  </div>
                  {approval.comments && (
                    <div className="bg-gray-50 rounded p-3 mt-2">
                      <p className="text-sm text-gray-700">{approval.comments}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Action */}
      {incident?.status !== "closed" && incident?.status !== "approved" && (
        <Card>
          <CardHeader>
            <CardTitle>Take Action</CardTitle>
            <CardDescription>
              Review the incident and provide your approval decision
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                variant={action === "approved" ? "default" : "outline"}
                onClick={() => setAction("approved")}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </Button>
              <Button
                variant={action === "rejected" ? "default" : "outline"}
                onClick={() => setAction("rejected")}
                className="flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
              <Button
                variant={action === "escalated" ? "default" : "outline"}
                onClick={() => setAction("escalated")}
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Escalate
              </Button>
              <Button
                variant={action === "request_info" ? "default" : "outline"}
                onClick={() => setAction("request_info")}
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Request Info
              </Button>
            </div>

            {action && (
              <>
                <Alert className={`${
                  action === "approved" ? "bg-green-50 border-green-200" :
                  action === "rejected" ? "bg-red-50 border-red-200" :
                  action === "escalated" ? "bg-orange-50 border-orange-200" :
                  "bg-blue-50 border-blue-200"
                }`}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    You are about to <strong>{action}</strong> this incident.
                    Please provide detailed comments explaining your decision.
                  </AlertDescription>
                </Alert>

                <div>
                  <Label htmlFor="comments">Comments*</Label>
                  <Textarea
                    id="comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={4}
                    placeholder="Provide detailed reasoning for your decision..."
                    className="mt-1"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAction(null);
                      setComments("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleApprovalSubmit}
                    disabled={!comments.trim() || submitApproval.isPending}
                  >
                    {submitApproval.isPending ? "Submitting..." : `Submit ${action}`}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  UserPlusIcon, 
  FileTextIcon, 
  CalendarIcon, 
  CheckCircleIcon,
  ArrowRightIcon,
  ClockIcon,
  UsersIcon,
  BriefcaseIcon,
  TrendingUpIcon,
  AlertCircleIcon
} from "lucide-react";
import { format } from "date-fns";
import ParticipantForm from "@/components/forms/participant-form";

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  timestamp?: string;
  completedBy?: string;
}

export default function WorkflowManagement() {
  const [activeTab, setActiveTab] = useState("intake");
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [participantDialogOpen, setParticipantDialogOpen] = useState(false);
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<any>(null);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const { toast } = useToast();

  // Fetch data
  const { data: participants = [], isLoading: participantsLoading } = useQuery({
    queryKey: ["/api/participants"],
  });

  const { data: staff = [], isLoading: staffLoading } = useQuery({
    queryKey: ["/api/staff"],
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/services"],
  });

  const { data: shifts = [], isLoading: shiftsLoading } = useQuery({
    queryKey: ["/api/shifts"],
  });

  const { data: referrals = [] } = useQuery({
    queryKey: ["/api/referrals"],
  });

  const { data: audits = [] } = useQuery({
    queryKey: ["/api/audits"],
  });

  // Service allocation mutation
  const allocateServiceMutation = useMutation({
    mutationFn: async ({ serviceId, staffId }: { serviceId: string; staffId: string }) => {
      const response = await fetch(`/api/services/${serviceId}/allocate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId }),
      });
      if (!response.ok) throw new Error("Failed to allocate service");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/audits"] });
      toast({
        title: "Success",
        description: "Service allocated successfully",
      });
    },
  });

  // Workflow progress for participant
  const getParticipantWorkflow = (participantId: string): WorkflowStep[] => {
    const participantAudits = audits.filter((a: any) => {
      const findings = JSON.parse(a.findings || "{}");
      return findings.entityId === participantId && findings.entityType === "participant";
    });

    return [
      {
        id: "referral",
        title: "Initial Referral",
        description: "Participant referred to service",
        status: referrals.some((r: any) => r.participantId === participantId) ? "completed" : "pending",
        timestamp: referrals.find((r: any) => r.participantId === participantId)?.createdAt,
      },
      {
        id: "intake",
        title: "Intake & Registration",
        description: "Participant details registered",
        status: participants.some((p: any) => p.id === participantId) ? "completed" : "pending",
        timestamp: participants.find((p: any) => p.id === participantId)?.createdAt,
      },
      {
        id: "plan",
        title: "NDIS Plan Setup",
        description: "NDIS plan created and activated",
        status: "pending", // Check plans when available
      },
      {
        id: "service",
        title: "Service Allocation",
        description: "Services allocated to participant",
        status: services.some((s: any) => s.participantId === participantId) ? "completed" : "pending",
      },
      {
        id: "shift",
        title: "Shift Management",
        description: "Support worker shifts scheduled",
        status: shifts.some((s: any) => s.participantId === participantId) ? "completed" : "pending",
      },
    ];
  };

  // Staff onboarding workflow
  const getStaffWorkflow = (staffId: string): WorkflowStep[] => {
    const staffAudits = audits.filter((a: any) => {
      const findings = JSON.parse(a.findings || "{}");
      return findings.entityId === staffId && findings.entityType === "staff";
    });

    return [
      {
        id: "registration",
        title: "Staff Registration",
        description: "Basic information collected",
        status: staff.some((s: any) => s.id === staffId) ? "completed" : "pending",
        timestamp: staff.find((s: any) => s.id === staffId)?.createdAt,
      },
      {
        id: "qualifications",
        title: "Qualification Verification",
        description: "Certifications and qualifications verified",
        status: "pending", // Check qualifications when available
      },
      {
        id: "training",
        title: "Training Completion",
        description: "Mandatory training modules completed",
        status: "pending",
      },
      {
        id: "availability",
        title: "Availability Setup",
        description: "Work availability configured",
        status: "pending",
      },
      {
        id: "allocation",
        title: "First Service Allocation",
        description: "Assigned to first participant",
        status: services.some((s: any) => s.assignedTo === staffId) ? "completed" : "pending",
      },
    ];
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Workflow Management</h1>
          <p className="text-muted-foreground">
            Seamless workflow from intake to service delivery with comprehensive audit trails
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="intake">
              <UserPlusIcon className="mr-2 h-4 w-4" />
              Intake & Onboarding
            </TabsTrigger>
            <TabsTrigger value="allocation">
              <BriefcaseIcon className="mr-2 h-4 w-4" />
              Service Allocation
            </TabsTrigger>
            <TabsTrigger value="shifts">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Shift Management
            </TabsTrigger>
            <TabsTrigger value="audit">
              <FileTextIcon className="mr-2 h-4 w-4" />
              Audit Trail
            </TabsTrigger>
          </TabsList>

          {/* Intake & Onboarding Tab */}
          <TabsContent value="intake" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Participant Onboarding */}
              <Card>
                <CardHeader>
                  <CardTitle>Participant Onboarding</CardTitle>
                  <CardDescription>
                    Register and onboard new participants
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => {
                      setEditingParticipant(null);
                      setParticipantDialogOpen(true);
                    }}
                    className="w-full"
                    data-testid="button-add-participant"
                  >
                    <UserPlusIcon className="mr-2 h-4 w-4" />
                    Add New Participant
                  </Button>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Recent Participants</h4>
                    {participantsLoading ? (
                      <p className="text-sm text-muted-foreground">Loading...</p>
                    ) : participants.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No participants yet</p>
                    ) : (
                      participants.slice(0, 3).map((participant: any) => (
                        <div 
                          key={participant.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                          onClick={() => setSelectedParticipant(participant)}
                        >
                          <div>
                            <p className="font-medium">
                              {participant.firstName} {participant.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              NDIS: {participant.ndisNumber}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingParticipant(participant);
                              setParticipantDialogOpen(true);
                            }}
                            data-testid={`button-edit-participant-${participant.id}`}
                          >
                            Edit
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Staff Onboarding */}
              <Card>
                <CardHeader>
                  <CardTitle>Support Worker Onboarding</CardTitle>
                  <CardDescription>
                    Register and onboard support workers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => {
                      setEditingStaff(null);
                      setStaffDialogOpen(true);
                    }}
                    className="w-full"
                    data-testid="button-add-staff"
                  >
                    <UsersIcon className="mr-2 h-4 w-4" />
                    Add Support Worker
                  </Button>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Recent Staff</h4>
                    {staffLoading ? (
                      <p className="text-sm text-muted-foreground">Loading...</p>
                    ) : staff.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No staff yet</p>
                    ) : (
                      staff.slice(0, 3).map((member: any) => (
                        <div 
                          key={member.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                          onClick={() => setSelectedStaff(member)}
                        >
                          <div>
                            <p className="font-medium">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {member.position || "Support Worker"}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingStaff(member);
                              setStaffDialogOpen(true);
                            }}
                            data-testid={`button-edit-staff-${member.id}`}
                          >
                            Edit
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Workflow Progress Display */}
            {selectedParticipant && (
              <Card>
                <CardHeader>
                  <CardTitle>Participant Workflow Progress</CardTitle>
                  <CardDescription>
                    {selectedParticipant.firstName} {selectedParticipant.lastName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getParticipantWorkflow(selectedParticipant.id).map((step, index) => (
                      <div key={step.id} className="flex items-center space-x-4">
                        <div className={`rounded-full p-2 ${
                          step.status === "completed" ? "bg-green-100" : 
                          step.status === "in_progress" ? "bg-yellow-100" : "bg-gray-100"
                        }`}>
                          {step.status === "completed" ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                          ) : step.status === "in_progress" ? (
                            <ClockIcon className="h-5 w-5 text-yellow-600" />
                          ) : (
                            <AlertCircleIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{step.title}</p>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                          {step.timestamp && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Completed: {format(new Date(step.timestamp), "dd/MM/yyyy HH:mm")}
                            </p>
                          )}
                        </div>
                        {index < getParticipantWorkflow(selectedParticipant.id).length - 1 && (
                          <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Service Allocation Tab */}
          <TabsContent value="allocation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Allocation</CardTitle>
                <CardDescription>
                  Allocate services to participants and assign support workers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setServiceDialogOpen(true)}
                  className="mb-4"
                  data-testid="button-allocate-service"
                >
                  <BriefcaseIcon className="mr-2 h-4 w-4" />
                  Allocate New Service
                </Button>
                
                <div className="space-y-3">
                  {servicesLoading ? (
                    <p className="text-sm text-muted-foreground">Loading services...</p>
                  ) : services.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No services allocated yet</p>
                  ) : (
                    services.map((service: any) => (
                      <div key={service.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{service.serviceName}</p>
                            <p className="text-sm text-muted-foreground">
                              Participant: {service.participantId}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Date: {format(new Date(service.scheduledDate), "dd/MM/yyyy")}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              service.status === "completed" ? "default" :
                              service.status === "in_progress" ? "secondary" :
                              service.status === "scheduled" ? "outline" : "destructive"
                            }>
                              {service.status}
                            </Badge>
                            {!service.assignedTo && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  // Open staff selection dialog
                                  const staffId = prompt("Enter staff ID to assign:");
                                  if (staffId) {
                                    allocateServiceMutation.mutate({ 
                                      serviceId: service.id, 
                                      staffId 
                                    });
                                  }
                                }}
                                data-testid={`button-assign-staff-${service.id}`}
                              >
                                Assign Staff
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shift Management Tab */}
          <TabsContent value="shifts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shift Management</CardTitle>
                <CardDescription>
                  Manage support worker shifts and schedules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {shiftsLoading ? (
                    <p className="text-sm text-muted-foreground col-span-full">Loading shifts...</p>
                  ) : shifts.length === 0 ? (
                    <p className="text-sm text-muted-foreground col-span-full">No shifts scheduled</p>
                  ) : (
                    shifts.map((shift: any) => (
                      <Card key={shift.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <Badge variant={
                              shift.status === "completed" ? "default" :
                              shift.status === "approved" ? "secondary" :
                              shift.status === "pending" ? "outline" : "destructive"
                            }>
                              {shift.status}
                            </Badge>
                            <ClockIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm font-medium mb-1">
                            {format(new Date(shift.shiftDate), "dd/MM/yyyy")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {shift.startTime} - {shift.endTime}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Staff: {shift.staffId}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Participant: {shift.participantId}
                          </p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Trail Tab */}
          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Audit Trail</CardTitle>
                <CardDescription>
                  Complete history of all system operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {audits.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No audit records yet</p>
                  ) : (
                    audits.slice(0, 10).map((audit: any) => {
                      const findings = JSON.parse(audit.findings || "{}");
                      return (
                        <div key={audit.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">{findings.action}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(findings.timestamp || audit.createdAt), "dd/MM/yyyy HH:mm")}
                            </span>
                          </div>
                          <p className="text-sm">
                            <span className="font-medium">{audit.auditorName}</span>
                            {" "}{findings.action?.replace(/_/g, " ")}
                            {" "}{findings.entityType}
                          </p>
                          {audit.recommendations && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {audit.recommendations}
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <Dialog open={participantDialogOpen} onOpenChange={setParticipantDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingParticipant ? "Edit Participant" : "Add New Participant"}
              </DialogTitle>
              <DialogDescription>
                {editingParticipant 
                  ? "Update participant information" 
                  : "Enter participant details to begin onboarding"}
              </DialogDescription>
            </DialogHeader>
            <ParticipantForm 
              participant={editingParticipant}
              onClose={() => {
                setParticipantDialogOpen(false);
                setEditingParticipant(null);
              }}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={staffDialogOpen} onOpenChange={setStaffDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingStaff ? "Edit Support Worker" : "Add Support Worker"}
              </DialogTitle>
              <DialogDescription>
                {editingStaff 
                  ? "Update support worker information" 
                  : "Enter support worker details for onboarding"}
              </DialogDescription>
            </DialogHeader>
            <div className="p-4">
              <p className="text-sm text-muted-foreground">
                Staff form will be available soon. Use the Staff page to manage support workers.
              </p>
              <Button 
                onClick={() => setStaffDialogOpen(false)}
                className="mt-4"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Allocate Service</DialogTitle>
              <DialogDescription>
                Create a new service allocation for a participant
              </DialogDescription>
            </DialogHeader>
            <div className="p-4">
              <p className="text-sm text-muted-foreground">
                Service form will be available soon. Use the Services page to manage service allocations.
              </p>
              <Button 
                onClick={() => setServiceDialogOpen(false)}
                className="mt-4"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
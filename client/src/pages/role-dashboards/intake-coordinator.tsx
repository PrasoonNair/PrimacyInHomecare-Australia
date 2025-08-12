import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { UserPlus, Upload, FileText, Send, Users, Clock, CheckCircle } from "lucide-react";

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  ndisNumber: string;
  email: string;
  phone: string;
  primaryDisability: string;
  address: string;
  isActive: boolean;
}

interface WorkflowStage {
  id: string;
  name: string;
  status: "pending" | "in_progress" | "completed";
  description: string;
  automated: boolean;
}

interface ReferralWithWorkflow {
  id: string;
  participantFirstName: string;
  participantLastName: string;
  referralSource: string;
  urgencyLevel: string;
  status: string;
  workflowStatus: string;
  createdAt: string;
}

const workflowStages: WorkflowStage[] = [
  { id: "referral_received", name: "Referral Received", status: "completed", description: "Initial referral intake", automated: false },
  { id: "data_verified", name: "Data Verified", status: "in_progress", description: "Participant information verification", automated: true },
  { id: "service_agreement", name: "Service Agreement", status: "pending", description: "Generate and prepare service agreement", automated: true },
  { id: "agreement_sent", name: "Agreement Sent", status: "pending", description: "Send agreement for digital signature", automated: true },
  { id: "agreement_signed", name: "Agreement Signed", status: "pending", description: "Waiting for participant signature", automated: false },
  { id: "funding_verification", name: "Funding Verification", status: "pending", description: "Verify NDIS funding availability", automated: true },
  { id: "staff_allocation", name: "Staff Allocation", status: "pending", description: "Allocate appropriate support staff", automated: true },
  { id: "meet_greet", name: "Meet & Greet", status: "pending", description: "Schedule initial meeting", automated: false },
  { id: "service_commenced", name: "Service Commenced", status: "pending", description: "Begin service delivery", automated: false }
];

export default function IntakeCoordinatorDashboard() {
  const [activeTab, setActiveTab] = useState("pipeline");
  const [showNewParticipantForm, setShowNewParticipantForm] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<ReferralWithWorkflow | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: referrals = [], isLoading: referralsLoading } = useQuery({
    queryKey: ['/api/referrals']
  });

  const { data: participants = [], isLoading: participantsLoading } = useQuery({
    queryKey: ['/api/participants']
  });

  const createParticipantMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/participants', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/participants'] });
      setShowNewParticipantForm(false);
      toast({
        title: "Success",
        description: "Participant created successfully"
      });
    }
  });

  const advanceWorkflowMutation = useMutation({
    mutationFn: async ({ referralId, stage }: { referralId: string; stage: string }) => {
      return await apiRequest(`/api/workflow/advance/${referralId}`, {
        method: 'POST',
        body: JSON.stringify({ targetStage: stage })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/referrals'] });
      toast({
        title: "Workflow Advanced",
        description: "Workflow stage updated successfully"
      });
    }
  });

  const generateServiceAgreementMutation = useMutation({
    mutationFn: async (participantId: string) => {
      return await apiRequest('/api/service-agreements/generate', {
        method: 'POST',
        body: JSON.stringify({ participantId })
      });
    },
    onSuccess: () => {
      toast({
        title: "Service Agreement Generated",
        description: "Service agreement has been created and is ready to send"
      });
    }
  });

  const handleSubmitParticipant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    createParticipantMutation.mutate({
      ...data,
      ndisNumber: `430${Math.random().toString().substr(2, 6)}`,
      isActive: true
    });
  };

  const getStageIcon = (stage: WorkflowStage) => {
    switch (stage.status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in_progress": return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "pending": return "secondary";
      case "urgent": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Intake Coordinator Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage referrals and participant onboarding workflow</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showNewParticipantForm} onOpenChange={setShowNewParticipantForm}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-participant">
                <UserPlus className="h-4 w-4 mr-2" />
                New Participant
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Participant</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitParticipant} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      name="firstName" 
                      required 
                      data-testid="input-first-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      name="lastName" 
                      required 
                      data-testid="input-last-name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      data-testid="input-email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      data-testid="input-phone"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="primaryDisability">Primary Disability</Label>
                  <Select name="primaryDisability" required>
                    <SelectTrigger data-testid="select-disability">
                      <SelectValue placeholder="Select primary disability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="autism">Autism Spectrum Disorder</SelectItem>
                      <SelectItem value="intellectual">Intellectual Disability</SelectItem>
                      <SelectItem value="physical">Physical Disability</SelectItem>
                      <SelectItem value="sensory">Sensory Disability</SelectItem>
                      <SelectItem value="psychosocial">Psychosocial Disability</SelectItem>
                      <SelectItem value="neurological">Neurological Disability</SelectItem>
                      <SelectItem value="multiple">Multiple Disabilities</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea 
                    id="address" 
                    name="address" 
                    rows={3} 
                    data-testid="textarea-address"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Textarea 
                    id="emergencyContact" 
                    name="emergencyContact" 
                    placeholder="Name, relationship, phone number" 
                    rows={2}
                    data-testid="textarea-emergency-contact"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowNewParticipantForm(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createParticipantMutation.isPending}
                    data-testid="button-create-participant"
                  >
                    {createParticipantMutation.isPending ? "Creating..." : "Create Participant"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pipeline" data-testid="tab-pipeline">Intake Pipeline</TabsTrigger>
          <TabsTrigger value="workflow" data-testid="tab-workflow">Workflow Management</TabsTrigger>
          <TabsTrigger value="agreements" data-testid="tab-agreements">Service Agreements</TabsTrigger>
          <TabsTrigger value="participants" data-testid="tab-participants">Active Participants</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  Urgent Referrals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {referrals.filter((r: any) => r.urgencyLevel === 'urgent').length}
                </div>
                <p className="text-sm text-gray-600">Requiring immediate attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  In Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {referrals.filter((r: any) => r.status === 'in_progress').length}
                </div>
                <p className="text-sm text-gray-600">Currently being processed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  Completed Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {referrals.filter((r: any) => r.status === 'completed').length}
                </div>
                <p className="text-sm text-gray-600">Successfully onboarded</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              {referralsLoading ? (
                <div className="text-center py-8">Loading referrals...</div>
              ) : referrals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No referrals found</div>
              ) : (
                <div className="space-y-3">
                  {referrals.slice(0, 10).map((referral: ReferralWithWorkflow) => (
                    <div 
                      key={referral.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedReferral(referral)}
                      data-testid={`referral-card-${referral.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-medium">
                            {referral.participantFirstName} {referral.participantLastName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            From: {referral.referralSource} • {new Date(referral.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(referral.urgencyLevel)}>
                          {referral.urgencyLevel}
                        </Badge>
                        <Badge variant="outline">
                          {referral.workflowStatus}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automated Workflow Stages</CardTitle>
              <p className="text-sm text-gray-600">
                Track participant journey from referral to service commencement
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflowStages.map((stage, index) => (
                  <div key={stage.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        {getStageIcon(stage)}
                        {index < workflowStages.length - 1 && (
                          <div className="h-8 w-px bg-gray-300 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{stage.name}</h3>
                          {stage.automated && (
                            <Badge variant="secondary" className="text-xs">
                              Automated
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{stage.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {stage.status === "pending" && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => selectedReferral && advanceWorkflowMutation.mutate({
                            referralId: selectedReferral.id,
                            stage: stage.id
                          })}
                          disabled={!selectedReferral}
                          data-testid={`button-advance-${stage.id}`}
                        >
                          Advance
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agreements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Agreement Management</CardTitle>
              <p className="text-sm text-gray-600">
                Generate, send, and track service agreements for participants
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-dashed border-2">
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="font-medium mb-2">Generate New Agreement</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Create a service agreement for a participant
                    </p>
                    <Select onValueChange={(participantId) => {
                      if (participantId) {
                        generateServiceAgreementMutation.mutate(participantId);
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select participant" />
                      </SelectTrigger>
                      <SelectContent>
                        {participants.map((participant: Participant) => (
                          <SelectItem key={participant.id} value={participant.id}>
                            {participant.firstName} {participant.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <h3 className="font-medium">Pending Signatures</h3>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600 mb-2">3</div>
                    <p className="text-sm text-gray-600 mb-4">Agreements awaiting signature</p>
                    <Button size="sm" variant="outline" className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Send Reminders
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <h3 className="font-medium">Signed Today</h3>
                    </div>
                    <div className="text-2xl font-bold text-green-600 mb-2">2</div>
                    <p className="text-sm text-gray-600 mb-4">Agreements signed</p>
                    <Button size="sm" variant="outline" className="w-full">
                      <Users className="h-4 w-4 mr-2" />
                      Allocate Staff
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Participants</CardTitle>
            </CardHeader>
            <CardContent>
              {participantsLoading ? (
                <div className="text-center py-8">Loading participants...</div>
              ) : participants.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No participants found</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {participants.map((participant: Participant) => (
                    <Card key={participant.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {participant.firstName[0]}{participant.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium">
                              {participant.firstName} {participant.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">NDIS: {participant.ndisNumber}</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p><strong>Email:</strong> {participant.email || 'Not provided'}</p>
                          <p><strong>Phone:</strong> {participant.phone || 'Not provided'}</p>
                          <p><strong>Primary Disability:</strong> {participant.primaryDisability}</p>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline" className="flex-1">
                            View Details
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => generateServiceAgreementMutation.mutate(participant.id)}
                            disabled={generateServiceAgreementMutation.isPending}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Agreement
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Selected Referral Details Modal */}
      {selectedReferral && (
        <Dialog open={!!selectedReferral} onOpenChange={() => setSelectedReferral(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                Referral Details: {selectedReferral.participantFirstName} {selectedReferral.participantLastName}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Referral Source</Label>
                  <p className="text-sm">{selectedReferral.referralSource}</p>
                </div>
                <div>
                  <Label>Urgency Level</Label>
                  <Badge variant={getStatusBadgeVariant(selectedReferral.urgencyLevel)}>
                    {selectedReferral.urgencyLevel}
                  </Badge>
                </div>
              </div>
              <div>
                <Label>Current Workflow Stage</Label>
                <p className="text-sm">{selectedReferral.workflowStatus}</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => {
                    setActiveTab("workflow");
                    setSelectedReferral(null);
                  }}
                  data-testid="button-manage-workflow"
                >
                  Manage Workflow
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setSelectedReferral(null)}
                  data-testid="button-close-details"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
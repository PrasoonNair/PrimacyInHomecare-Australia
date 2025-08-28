import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  PlusIcon,
  UsersIcon,
  BriefcaseIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  SendIcon,
  FilterIcon
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface KanbanColumn {
  id: string;
  title: string;
  applications: any[];
  color: string;
}

export default function RecruitmentPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("pipeline");
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [newJobRequisition, setNewJobRequisition] = useState({
    title: "",
    department: "service_delivery",
    awardLevel: "SCHADS Level 2",
    employmentType: "casual",
    locations: [""],
    essentialCriteria: [""],
    requiredChecks: ["WWCC", "NDIS_WS"],
    closeDate: "",
    headcount: 1
  });

  // Fetch recruitment pipeline
  const { data: pipeline = {} } = useQuery({
    queryKey: ["/api/recruitment/pipeline"],
  });

  // Fetch recruitment KPIs
  const { data: kpis = {} } = useQuery({
    queryKey: ["/api/recruitment/kpis"],
  });

  // Fetch active job requisitions
  const { data: jobRequisitions = [] } = useQuery({
    queryKey: ["/api/recruitment/job-requisitions"],
  });

  // Create job requisition mutation
  const createJobRequisition = useMutation({
    mutationFn: (data: any) => 
      fetch("/api/recruitment/job-requisitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    onSuccess: () => {
      toast({ title: "Job requisition created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/recruitment/job-requisitions"] });
      setNewJobRequisition({
        title: "",
        department: "service_delivery", 
        awardLevel: "SCHADS Level 2",
        employmentType: "casual",
        locations: [""],
        essentialCriteria: [""],
        requiredChecks: ["WWCC", "NDIS_WS"],
        closeDate: "",
        headcount: 1
      });
    },
    onError: () => {
      toast({ title: "Failed to create job requisition", variant: "destructive" });
    }
  });

  // Update application status mutation
  const updateApplicationStatus = useMutation({
    mutationFn: ({ applicationId, newState, reason }: any) =>
      fetch(`/api/recruitment/applications/${applicationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: newState, reason })
      }).then(res => res.json()),
    onSuccess: () => {
      toast({ title: "Application status updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/recruitment/pipeline"] });
    }
  });

  // Kanban columns configuration
  const kanbanColumns: KanbanColumn[] = [
    { id: "received", title: "New Applications", applications: pipeline.received || [], color: "blue" },
    { id: "screening", title: "Screening", applications: pipeline.screening || [], color: "yellow" },
    { id: "shortlisted", title: "Shortlisted", applications: pipeline.shortlisted || [], color: "green" },
    { id: "interviewed", title: "Interviewed", applications: pipeline.interviewed || [], color: "purple" },
    { id: "reference_check", title: "Reference Check", applications: pipeline.reference_check || [], color: "orange" },
    { id: "offer", title: "Offer Extended", applications: pipeline.offer || [], color: "pink" },
    { id: "hired", title: "Hired", applications: pipeline.hired || [], color: "emerald" }
  ];

  const handleCreateJobRequisition = () => {
    createJobRequisition.mutate(newJobRequisition);
  };

  const handleStatusUpdate = (applicationId: string, newState: string, reason?: string) => {
    updateApplicationStatus.mutate({ applicationId, newState, reason });
  };

  const getStatusBadgeVariant = (state: string) => {
    const variants = {
      received: "outline",
      screening: "secondary",
      shortlisted: "default",
      interviewed: "outline",
      reference_check: "secondary", 
      offer: "default",
      hired: "default",
      rejected: "destructive"
    };
    return variants[state] || "outline";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Recruitment & Onboarding
          </h1>
          <p className="text-muted-foreground">
            NDIS-compliant recruitment pipeline management
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.totalApplications || 0}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time to Hire</CardTitle>
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.timeToHire || 0} days</div>
              <p className="text-xs text-muted-foreground">Average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Offer Acceptance</CardTitle>
              <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(kpis.offerAcceptanceRate || 0)}%</div>
              <p className="text-xs text-muted-foreground">Success rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobRequisitions.length}</div>
              <p className="text-xs text-muted-foreground">Open positions</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="pipeline">Recruitment Pipeline</TabsTrigger>
            <TabsTrigger value="jobs">Job Requisitions</TabsTrigger>
            <TabsTrigger value="candidates">Candidate Pool</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Recruitment Pipeline - Kanban Board */}
          <TabsContent value="pipeline">
            <div className="grid grid-cols-7 gap-4 overflow-x-auto">
              {kanbanColumns.map((column) => (
                <Card key={column.id} className="min-w-[280px]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      {column.title}
                      <Badge variant="secondary">{column.applications.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {column.applications.map((item) => (
                      <Card key={item.application.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-sm">
                                {item.candidate?.firstName} {item.candidate?.lastName}
                              </h4>
                              <Badge variant={getStatusBadgeVariant(item.application.state)}>
                                {item.application.autoScreeningResult || item.application.state}
                              </Badge>
                            </div>
                            
                            <p className="text-xs text-muted-foreground">
                              {item.job?.title}
                            </p>
                            
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Score: {item.application.score || 0}</span>
                              <span>{new Date(item.application.createdAt).toLocaleDateString()}</span>
                            </div>

                            <div className="flex gap-1 pt-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => setSelectedApplication(item)}
                                data-testid={`button-view-${item.application.id}`}
                              >
                                <EyeIcon className="h-3 w-3" />
                              </Button>
                              
                              {column.id === "shortlisted" && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleStatusUpdate(item.application.id, "interviewed")}
                                  data-testid={`button-interview-${item.application.id}`}
                                >
                                  Interview
                                </Button>
                              )}
                              
                              {column.id === "interviewed" && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleStatusUpdate(item.application.id, "offer")}
                                  data-testid={`button-offer-${item.application.id}`}
                                >
                                  Offer
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Job Requisitions Management */}
          <TabsContent value="jobs">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Job Requisitions</h2>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button data-testid="button-create-job">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create Job Requisition
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Job Requisition</DialogTitle>
                      <DialogDescription>
                        Create a new hiring request for NDIS support worker positions
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="title">Position Title</Label>
                          <Input
                            id="title"
                            value={newJobRequisition.title}
                            onChange={(e) => setNewJobRequisition({...newJobRequisition, title: e.target.value})}
                            placeholder="Support Worker - Community"
                            data-testid="input-job-title"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="awardLevel">Award Level</Label>
                          <Select
                            value={newJobRequisition.awardLevel}
                            onValueChange={(value) => setNewJobRequisition({...newJobRequisition, awardLevel: value})}
                          >
                            <SelectTrigger data-testid="select-award-level">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SCHADS Level 2">SCHADS Level 2</SelectItem>
                              <SelectItem value="SCHADS Level 3">SCHADS Level 3</SelectItem>
                              <SelectItem value="SCHADS Level 4">SCHADS Level 4</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="employmentType">Employment Type</Label>
                          <Select
                            value={newJobRequisition.employmentType}
                            onValueChange={(value) => setNewJobRequisition({...newJobRequisition, employmentType: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="casual">Casual</SelectItem>
                              <SelectItem value="part_time">Part Time</SelectItem>
                              <SelectItem value="full_time">Full Time</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="headcount">Positions</Label>
                          <Input
                            id="headcount"
                            type="number"
                            value={newJobRequisition.headcount}
                            onChange={(e) => setNewJobRequisition({...newJobRequisition, headcount: parseInt(e.target.value)})}
                            min="1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="closeDate">Close Date</Label>
                          <Input
                            id="closeDate"
                            type="date"
                            value={newJobRequisition.closeDate}
                            onChange={(e) => setNewJobRequisition({...newJobRequisition, closeDate: e.target.value})}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Essential Criteria</Label>
                        <Textarea
                          placeholder="• NDIS Worker Screening Check&#10;• Certificate III in Individual Support&#10;• 6 months community care experience"
                          value={newJobRequisition.essentialCriteria.join('\n')}
                          onChange={(e) => setNewJobRequisition({...newJobRequisition, essentialCriteria: e.target.value.split('\n')})}
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline">Save as Draft</Button>
                        <Button onClick={handleCreateJobRequisition} data-testid="button-submit-job">
                          Create & Submit for Approval
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4">
                {jobRequisitions.map((job: any) => (
                  <Card key={job.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{job.title}</CardTitle>
                          <CardDescription>
                            {job.department} • {job.employmentType} • {job.awardLevel}
                          </CardDescription>
                        </div>
                        <Badge variant={job.status === 'approved' ? 'default' : 'secondary'}>
                          {job.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Positions:</span> {job.headcount}
                        </div>
                        <div>
                          <span className="font-medium">Applications:</span> 
                          {/* Would show actual count */}
                        </div>
                        <div>
                          <span className="font-medium">Close Date:</span> {new Date(job.closeDate).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="mt-4 flex gap-2">
                        {job.status === 'draft' && (
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          View Applications
                        </Button>
                        <Button size="sm" variant="outline">
                          Publish to Job Boards
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Candidate Pool */}
          <TabsContent value="candidates">
            <Card>
              <CardHeader>
                <CardTitle>Candidate Database</CardTitle>
                <CardDescription>
                  Search and manage your recruitment candidate pool
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <Input placeholder="Search candidates..." className="flex-1" />
                  <Button variant="outline">
                    <FilterIcon className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>
                
                <div className="text-center text-muted-foreground py-8">
                  Candidate pool will be populated as applications are received
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recruitment Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Source Performance</h4>
                      <div className="space-y-2">
                        {Object.entries(kpis.sourcePerformance || {}).map(([source, count]) => (
                          <div key={source} className="flex justify-between">
                            <span className="capitalize">{source}</span>
                            <span>{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Conversion Funnel</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Applications</span>
                          <span>{kpis.totalApplications || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shortlisted</span>
                          <span>{kpis.shortlistedCandidates || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Interviewed</span>
                          <span>{kpis.interviewsScheduled || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Offers</span>
                          <span>{kpis.offersExtended || 0}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Hired</span>
                          <span>{kpis.hiredCandidates || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
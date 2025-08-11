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
import { insertAuditSchema, insertIncidentSchema, type Audit, type Incident } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheckIcon, AlertTriangleIcon, FileTextIcon, TrendingUpIcon, ClockIcon, CheckCircleIcon } from "lucide-react";
import { format } from "date-fns";

export default function ComplianceQuality() {
  const [activeTab, setActiveTab] = useState("audits");
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [incidentDialogOpen, setIncidentDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: audits = [], isLoading: auditsLoading } = useQuery<Audit[]>({
    queryKey: ["/api/audits"],
  });

  const { data: incidents = [], isLoading: incidentsLoading } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  const auditForm = useForm({
    resolver: zodResolver(insertAuditSchema),
    defaultValues: {
      auditType: "internal",
      status: "pending",
      followUpRequired: false,
    },
  });

  const incidentForm = useForm({
    resolver: zodResolver(insertIncidentSchema),
    defaultValues: {
      severity: "medium",
      reportedToAuthorities: false,
      status: "open",
      followUpRequired: false,
    },
  });

  const createAuditMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create audit");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audits"] });
      setAuditDialogOpen(false);
      auditForm.reset();
      toast({
        title: "Success",
        description: "Audit record created successfully",
      });
    },
  });

  const createIncidentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create incident report");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      setIncidentDialogOpen(false);
      incidentForm.reset();
      toast({
        title: "Success",
        description: "Incident report created successfully",
      });
    },
  });

  const getAuditStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "in_progress": return "secondary";
      case "pending": return "outline";
      case "requires_action": return "destructive";
      default: return "outline";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  const getIncidentStatusColor = (status: string) => {
    switch (status) {
      case "closed": return "default";
      case "investigating": return "secondary";
      case "open": return "outline";
      default: return "outline";
    }
  };

  const getComplianceScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Compliance & Quality</h1>
          <p className="text-muted-foreground">
            Audit management, incident reporting, and quality assurance
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="audits" data-testid="tab-audits">Audits</TabsTrigger>
            <TabsTrigger value="incidents" data-testid="tab-incidents">Incidents</TabsTrigger>
            <TabsTrigger value="quality" data-testid="tab-quality">Quality Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="audits" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Audit Management</h2>
              <Dialog open={auditDialogOpen} onOpenChange={setAuditDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-new-audit">
                    <ShieldCheckIcon className="mr-2 h-4 w-4" />
                    New Audit
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create New Audit</DialogTitle>
                  </DialogHeader>
                  <Form {...auditForm}>
                    <form onSubmit={auditForm.handleSubmit((data) => createAuditMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={auditForm.control}
                        name="auditType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Audit Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-audit-type">
                                  <SelectValue placeholder="Select audit type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="internal">Internal Audit</SelectItem>
                                <SelectItem value="external">External Audit</SelectItem>
                                <SelectItem value="spot_check">Spot Check</SelectItem>
                                <SelectItem value="participant_feedback">Participant Feedback</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={auditForm.control}
                        name="auditDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Audit Date</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" data-testid="input-audit-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={auditForm.control}
                        name="auditorName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Auditor Name</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-auditor-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={auditForm.control}
                        name="departmentAudited"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Department Audited</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-department">
                                  <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="intake">Intake</SelectItem>
                                <SelectItem value="hr_recruitment">HR & Recruitment</SelectItem>
                                <SelectItem value="finance">Finance</SelectItem>
                                <SelectItem value="service_delivery">Service Delivery</SelectItem>
                                <SelectItem value="compliance_quality">Compliance & Quality</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={auditForm.control}
                        name="complianceScore"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Compliance Score (0-100)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min="0" max="100" data-testid="input-compliance-score" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={auditForm.control}
                        name="findings"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Findings</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={3} data-testid="textarea-findings" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={auditForm.control}
                        name="recommendations"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Recommendations</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={3} data-testid="textarea-recommendations" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={auditForm.control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Due Date</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" data-testid="input-due-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full" disabled={createAuditMutation.isPending} data-testid="button-submit-audit">
                        {createAuditMutation.isPending ? "Creating..." : "Create Audit"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {auditsLoading ? (
                <div className="text-center py-8" data-testid="loading-audits">Loading audits...</div>
              ) : audits.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="empty-audits">
                  No audits found. Create your first audit to get started.
                </div>
              ) : (
                audits.map((audit) => (
                  <Card key={audit.id} data-testid={`audit-card-${audit.id}`}>
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {audit.auditType?.replace("_", " ").toUpperCase()} Audit
                          </CardTitle>
                          <CardDescription>
                            Auditor: {audit.auditorName} • {audit.auditDate ? format(new Date(audit.auditDate), "MMM dd, yyyy") : "N/A"}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2 items-center">
                          {audit.complianceScore !== undefined && (
                            <div className={`text-lg font-bold ${getComplianceScoreColor(audit.complianceScore)}`}>
                              {audit.complianceScore}%
                            </div>
                          )}
                          <Badge variant={getAuditStatusColor(audit.status || "pending")}>
                            {audit.status?.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {audit.departmentAudited && (
                          <div>
                            <span className="font-medium">Department:</span>
                            <span className="ml-2">{audit.departmentAudited.replace("_", " ").toUpperCase()}</span>
                          </div>
                        )}

                        {audit.findings && (
                          <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded">
                            <p className="text-sm font-medium mb-1 text-orange-800 dark:text-orange-200">Findings:</p>
                            <p className="text-sm text-orange-700 dark:text-orange-300">{audit.findings}</p>
                          </div>
                        )}

                        {audit.recommendations && (
                          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded">
                            <p className="text-sm font-medium mb-1 text-blue-800 dark:text-blue-200">Recommendations:</p>
                            <p className="text-sm text-blue-700 dark:text-blue-300">{audit.recommendations}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          {audit.dueDate && (
                            <div className="flex items-center gap-2">
                              <ClockIcon className="h-4 w-4" />
                              <span>Due: {format(new Date(audit.dueDate), "MMM dd, yyyy")}</span>
                            </div>
                          )}
                          {audit.followUpRequired && (
                            <Badge variant="outline" className="text-xs">
                              Follow-up Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="incidents" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Incident Management</h2>
              <Dialog open={incidentDialogOpen} onOpenChange={setIncidentDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-new-incident">
                    <AlertTriangleIcon className="mr-2 h-4 w-4" />
                    Report Incident
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Report New Incident</DialogTitle>
                  </DialogHeader>
                  <Form {...incidentForm}>
                    <form onSubmit={incidentForm.handleSubmit((data) => createIncidentMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={incidentForm.control}
                        name="incidentNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Incident Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="INC-2024-001" data-testid="input-incident-number" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={incidentForm.control}
                        name="incidentDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Incident Date & Time</FormLabel>
                            <FormControl>
                              <Input {...field} type="datetime-local" data-testid="input-incident-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={incidentForm.control}
                        name="incidentType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Incident Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-incident-type">
                                  <SelectValue placeholder="Select incident type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="injury">Injury</SelectItem>
                                <SelectItem value="medication_error">Medication Error</SelectItem>
                                <SelectItem value="behavioral">Behavioral</SelectItem>
                                <SelectItem value="safeguarding">Safeguarding</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={incidentForm.control}
                        name="severity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Severity</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-severity">
                                  <SelectValue placeholder="Select severity" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={incidentForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-incident-location" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={incidentForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={4} data-testid="textarea-description" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={incidentForm.control}
                        name="immediateActions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Immediate Actions Taken</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={3} data-testid="textarea-immediate-actions" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full" disabled={createIncidentMutation.isPending} data-testid="button-submit-incident">
                        {createIncidentMutation.isPending ? "Creating..." : "Report Incident"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {incidentsLoading ? (
                <div className="text-center py-8" data-testid="loading-incidents">Loading incidents...</div>
              ) : incidents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="empty-incidents">
                  No incidents reported. This is good news!
                </div>
              ) : (
                incidents.map((incident) => (
                  <Card key={incident.id} data-testid={`incident-card-${incident.id}`}>
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {incident.incidentNumber}
                          </CardTitle>
                          <CardDescription>
                            {incident.incidentType?.replace("_", " ").toUpperCase()} • 
                            {incident.incidentDate ? format(new Date(incident.incidentDate), "MMM dd, yyyy HH:mm") : "N/A"}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={getSeverityColor(incident.severity || "medium")}>
                            {incident.severity}
                          </Badge>
                          <Badge variant={getIncidentStatusColor(incident.status || "open")}>
                            {incident.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {incident.location && (
                          <div>
                            <span className="font-medium">Location:</span>
                            <span className="ml-2">{incident.location}</span>
                          </div>
                        )}

                        <div className="p-3 bg-muted/50 rounded">
                          <p className="text-sm font-medium mb-1">Description:</p>
                          <p className="text-sm">{incident.description}</p>
                        </div>

                        {incident.immediateActions && (
                          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded">
                            <p className="text-sm font-medium mb-1 text-green-800 dark:text-green-200">Immediate Actions:</p>
                            <p className="text-sm text-green-700 dark:text-green-300">{incident.immediateActions}</p>
                          </div>
                        )}

                        {incident.investigation && (
                          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded">
                            <p className="text-sm font-medium mb-1 text-blue-800 dark:text-blue-200">Investigation:</p>
                            <p className="text-sm text-blue-700 dark:text-blue-300">{incident.investigation}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div>
                            Reported by: {incident.reportedBy || "N/A"}
                          </div>
                          {incident.reportedToAuthorities && (
                            <Badge variant="outline" className="text-xs">
                              Authorities Notified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="quality" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Quality Metrics</h2>
            </div>

            <div className="grid gap-6">
              <Card data-testid="compliance-overview">
                <CardHeader>
                  <CardTitle>Compliance Overview</CardTitle>
                  <CardDescription>Overall compliance status across departments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {audits.filter(a => a.complianceScore && a.complianceScore >= 90).length}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">Excellent (90%+)</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded">
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {audits.filter(a => a.complianceScore && a.complianceScore >= 75 && a.complianceScore < 90).length}
                      </div>
                      <div className="text-sm text-yellow-600 dark:text-yellow-400">Good (75-89%)</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {audits.filter(a => a.complianceScore && a.complianceScore < 75).length}
                      </div>
                      <div className="text-sm text-orange-600 dark:text-orange-400">Needs Attention</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {incidents.filter(i => i.status === "open").length}
                      </div>
                      <div className="text-sm text-red-600 dark:text-red-400">Open Incidents</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card data-testid="recent-audits">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUpIcon className="h-5 w-5" />
                      Recent Audit Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {audits.length === 0 ? (
                      <p className="text-center py-4 text-muted-foreground">No audit data available</p>
                    ) : (
                      <div className="space-y-3">
                        {audits.slice(0, 5).map((audit) => (
                          <div key={audit.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <div className="font-medium text-sm">{audit.auditorName}</div>
                              <div className="text-xs text-muted-foreground">
                                {audit.auditDate ? format(new Date(audit.auditDate), "MMM dd") : "N/A"}
                              </div>
                            </div>
                            <div className={`text-lg font-bold ${audit.complianceScore ? getComplianceScoreColor(audit.complianceScore) : ''}`}>
                              {audit.complianceScore ? `${audit.complianceScore}%` : 'N/A'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card data-testid="incident-summary">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangleIcon className="h-5 w-5" />
                      Incident Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Incidents:</span>
                        <span className="font-medium">{incidents.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Critical/High:</span>
                        <span className="font-medium text-red-600">
                          {incidents.filter(i => i.severity === "critical" || i.severity === "high").length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Closed This Month:</span>
                        <span className="font-medium text-green-600">
                          {incidents.filter(i => i.status === "closed").length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Avg Resolution Time:</span>
                        <span className="font-medium">2.3 days</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
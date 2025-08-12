import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Plus, AlertTriangle, CheckCircle, Clock, FileText, Users, TrendingUp, AlertCircle, MessageSquare, Eye, CheckCheck, X, Send, Calendar } from "lucide-react";
import IncidentReportForm from "@/components/forms/incident-report-form";
import IncidentApprovalFlow from "@/components/forms/incident-approval-flow";
import IncidentTimeline from "@/components/incident-timeline";
import type { Incident } from "@shared/schema";

export default function Incidents() {
  const { toast } = useToast();
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedTab, setSelectedTab] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  // Fetch incidents with filters
  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ["/api/incidents", filterSeverity, filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterSeverity) params.append("severity", filterSeverity);
      if (filterStatus) params.append("status", filterStatus);
      const response = await fetch(`/api/incidents?${params}`);
      if (!response.ok) throw new Error("Failed to fetch incidents");
      return response.json();
    },
  });

  // Statistics calculations
  const stats = {
    total: incidents.length,
    pending: incidents.filter((i: Incident) => i.status === "pending").length,
    underReview: incidents.filter((i: Incident) => i.status === "under_review").length,
    critical: incidents.filter((i: Incident) => i.severity === "critical").length,
    ndisReportable: incidents.filter((i: Incident) => i.ndisNotified).length,
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "under_review":
        return <Eye className="h-4 w-4" />;
      case "escalated":
        return <TrendingUp className="h-4 w-4" />;
      case "approved":
        return <CheckCheck className="h-4 w-4" />;
      case "closed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getCategoryDisplay = (category: string) => {
    const categories: Record<string, string> = {
      death: "Death",
      "serious injury": "Serious Injury",
      "abuse/neglect": "Abuse/Neglect",
      "unlawful sexual/physical contact": "Unlawful Contact",
      "unauthorized restrictive practice": "Unauthorized Restrictive Practice",
      other: "Other",
    };
    return categories[category] || category;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Incident Management</h1>
          <p className="text-gray-600 mt-2">NDIS compliant incident reporting and management system</p>
        </div>
        <Button 
          onClick={() => setShowReportDialog(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Report New Incident
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-800">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{stats.pending}</div>
            <p className="text-xs text-yellow-700 mt-1">Awaiting action</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-800">Under Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.underReview}</div>
            <p className="text-xs text-blue-700 mt-1">In progress</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-800">Critical Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{stats.critical}</div>
            <p className="text-xs text-red-700 mt-1">High priority</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-800">NDIS Reportable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{stats.ndisReportable}</div>
            <p className="text-xs text-purple-700 mt-1">Notified to NDIS</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex gap-2">
            <Button
              variant={filterSeverity === null ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterSeverity(null)}
            >
              All Severities
            </Button>
            <Button
              variant={filterSeverity === "critical" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterSeverity("critical")}
            >
              Critical
            </Button>
            <Button
              variant={filterSeverity === "high" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterSeverity("high")}
            >
              High
            </Button>
            <Button
              variant={filterSeverity === "medium" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterSeverity("medium")}
            >
              Medium
            </Button>
            <Button
              variant={filterSeverity === "low" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterSeverity("low")}
            >
              Low
            </Button>
          </div>
          <Separator orientation="vertical" />
          <div className="flex gap-2">
            <Button
              variant={filterStatus === null ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(null)}
            >
              All Status
            </Button>
            <Button
              variant={filterStatus === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("pending")}
            >
              Pending
            </Button>
            <Button
              variant={filterStatus === "under_review" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("under_review")}
            >
              Under Review
            </Button>
            <Button
              variant={filterStatus === "approved" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("approved")}
            >
              Approved
            </Button>
            <Button
              variant={filterStatus === "closed" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("closed")}
            >
              Closed
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Incidents List */}
      <Card>
        <CardHeader>
          <CardTitle>Incident Reports</CardTitle>
          <CardDescription>Click on an incident to view details and approval workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {incidents.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No incidents found</p>
                  <p className="text-sm mt-2">Report a new incident to get started</p>
                </div>
              ) : (
                incidents.map((incident: Incident) => (
                  <div
                    key={incident.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedIncident(incident)}
                    data-testid={`incident-card-${incident.id}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-medium text-gray-500">
                            #{incident.incidentNumber}
                          </span>
                          <Badge className={getSeverityColor(incident.severity)}>
                            {incident.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getStatusIcon(incident.status)}
                            {incident.status.replace("_", " ").toUpperCase()}
                          </Badge>
                          {incident.ndisNotified && (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                              NDIS Notified
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg mb-1">
                          {getCategoryDisplay(incident.category)}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                          {incident.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {incident.participantName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(incident.incidentDate).toLocaleDateString()}
                          </span>
                          <span>
                            Location: {incident.location}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          Reported by: {incident.reportedBy}
                        </p>
                        <p className="text-xs text-gray-400">
                          {incident.reportedByRole}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* New Incident Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report New Incident</DialogTitle>
            <DialogDescription>
              Complete all required fields to submit an NDIS compliant incident report
            </DialogDescription>
          </DialogHeader>
          <IncidentReportForm
            onSuccess={() => {
              setShowReportDialog(false);
              queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
              toast({
                title: "Incident Reported",
                description: "The incident has been successfully reported and notifications sent.",
              });
            }}
            onCancel={() => setShowReportDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Incident Details Dialog */}
      {selectedIncident && (
        <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Incident Details - #{selectedIncident.incidentNumber}</DialogTitle>
              <DialogDescription>
                Review incident details and manage approval workflow
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="details" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="approval">Approval Workflow</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Category</label>
                    <p className="mt-1">{getCategoryDisplay(selectedIncident.category)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Severity</label>
                    <Badge className={`mt-1 ${getSeverityColor(selectedIncident.severity)}`}>
                      {selectedIncident.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Participant</label>
                    <p className="mt-1">{selectedIncident.participantName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Date & Time</label>
                    <p className="mt-1">
                      {new Date(selectedIncident.incidentDate).toLocaleDateString()} at {selectedIncident.incidentTime}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-600">Location</label>
                    <p className="mt-1">{selectedIncident.location}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-600">Description</label>
                    <p className="mt-1 whitespace-pre-wrap">{selectedIncident.description}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-600">Immediate Actions Taken</label>
                    <p className="mt-1 whitespace-pre-wrap">{selectedIncident.immediateAction}</p>
                  </div>
                </div>

                {/* Notification Status */}
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-2">Notifications</label>
                  <div className="flex gap-2 flex-wrap">
                    {selectedIncident.policeNotified && (
                      <Badge variant="outline" className="bg-blue-50">Police Notified</Badge>
                    )}
                    {selectedIncident.familyNotified && (
                      <Badge variant="outline" className="bg-green-50">Family Notified</Badge>
                    )}
                    {selectedIncident.ndisNotified && (
                      <Badge variant="outline" className="bg-purple-50">NDIS Notified</Badge>
                    )}
                    {selectedIncident.worksafeNotified && (
                      <Badge variant="outline" className="bg-orange-50">WorkSafe Notified</Badge>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="approval">
                <IncidentApprovalFlow incidentId={selectedIncident.id} />
              </TabsContent>
              
              <TabsContent value="timeline">
                <IncidentTimeline incidentId={selectedIncident.id} />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
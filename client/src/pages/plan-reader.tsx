import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Participant, NdisPlan, PlanDocument, DigitalServiceAgreement } from "@shared/schema";
import { Upload, FileText, Send, CheckCircle, Clock, AlertCircle, Eye, Download, Target, Users, DollarSign, Calendar, ChevronRight, Brain, Loader2, Mail, MessageSquare, Shield } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Type for extracted goals display
interface ExtractedGoal {
  category: string;
  title: string;
  description: string;
  fundingCategory: string;
  suggestedBudget: number;
  priority: string;
}

export default function PlanReaderPage() {
  const [selectedParticipant, setSelectedParticipant] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<PlanDocument | null>(null);
  const [showAgreementDialog, setShowAgreementDialog] = useState(false);
  const [agreementCommunication, setAgreementCommunication] = useState({
    method: "email",
    recipient: "",
    message: ""
  });
  const queryClient = useQueryClient();

  // Fetch participants
  const { data: participants = [] } = useQuery<Participant[]>({
    queryKey: ["/api/participants"],
  });

  // Fetch NDIS plans for selected participant
  const { data: plans = [] } = useQuery<NdisPlan[]>({
    queryKey: ["/api/ndis-plans", selectedParticipant],
    enabled: !!selectedParticipant,
  });

  // Fetch plan documents
  const { data: planDocuments = [] } = useQuery<PlanDocument[]>({
    queryKey: ["/api/plan-documents", selectedPlan],
    enabled: !!selectedPlan,
  });

  // Fetch service agreements
  const { data: serviceAgreements = [] } = useQuery<DigitalServiceAgreement[]>({
    queryKey: ["/api/service-agreements", selectedParticipant],
    enabled: !!selectedParticipant,
  });

  // Upload and process plan document
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("participantId", selectedParticipant);
      formData.append("planId", selectedPlan);
      
      // Use fetch directly for FormData upload
      const response = await fetch("/api/plan-documents/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "NDIS plan uploaded successfully. Processing will begin shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/plan-documents"] });
      setUploadedFile(null);
      setIsProcessing(true);
      // Start polling for processing status
      pollProcessingStatus();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload NDIS plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Process document with AI
  const processMutation = useMutation({
    mutationFn: async (documentId: string) => {
      return apiRequest(`/api/plan-documents/${documentId}/process`, {
        method: "POST",
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Processing Complete",
        description: "Goals and participant information extracted successfully.",
      });
      setIsProcessing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/plan-documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/participant-goals"] });
    },
    onError: (error) => {
      toast({
        title: "Processing Error",
        description: "Failed to process NDIS plan. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  // Generate service agreement
  const generateAgreementMutation = useMutation({
    mutationFn: async (documentId: string) => {
      return apiRequest("/api/service-agreements/generate", {
        method: "POST",
        body: JSON.stringify({
          participantId: selectedParticipant,
          planId: selectedPlan,
          documentId: documentId,
        }),
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Agreement Generated",
        description: "Service agreement has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/service-agreements"] });
      setShowAgreementDialog(true);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate service agreement.",
        variant: "destructive",
      });
    },
  });

  // Send agreement for signing
  const sendAgreementMutation = useMutation({
    mutationFn: async (data: { agreementId: string; method: string; recipient: string; message: string }) => {
      return apiRequest("/api/service-agreements/send", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Agreement Sent",
        description: `Service agreement sent via ${agreementCommunication.method} successfully.`,
      });
      setShowAgreementDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/service-agreements"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send service agreement.",
        variant: "destructive",
      });
    },
  });

  const pollProcessingStatus = () => {
    const interval = setInterval(async () => {
      const docs = await queryClient.fetchQuery({
        queryKey: ["/api/plan-documents", selectedPlan],
      });
      const processingDoc = (docs as PlanDocument[]).find(
        d => d.processingStatus === "processing" || d.processingStatus === "pending"
      );
      if (!processingDoc) {
        clearInterval(interval);
        setIsProcessing(false);
      }
    }, 3000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
    }
  };

  const handleUploadClick = () => {
    if (uploadedFile && selectedParticipant && selectedPlan) {
      uploadMutation.mutate(uploadedFile);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      processing: "outline",
      completed: "default",
      failed: "destructive",
      draft: "secondary",
      sent: "outline",
      viewed: "outline",
      signed: "default",
    };
    
    const icons: Record<string, JSX.Element> = {
      pending: <Clock className="h-3 w-3 mr-1" />,
      processing: <Loader2 className="h-3 w-3 mr-1 animate-spin" />,
      completed: <CheckCircle className="h-3 w-3 mr-1" />,
      failed: <AlertCircle className="h-3 w-3 mr-1" />,
    };

    return (
      <Badge variant={variants[status] || "default"} className="flex items-center">
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">NDIS Plan Reader</h1>
          <p className="text-gray-500 mt-1">
            AI-powered plan analysis with automated goal extraction and service agreement generation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
            <Brain className="h-4 w-4" />
            AI-Powered
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
            <Shield className="h-4 w-4" />
            Secure Processing
          </Badge>
        </div>
      </div>

      {/* Selection Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Select Participant and Plan</CardTitle>
          <CardDescription>Choose a participant and their NDIS plan to process</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Participant</Label>
              <Select value={selectedParticipant} onValueChange={setSelectedParticipant}>
                <SelectTrigger data-testid="select-participant">
                  <SelectValue placeholder="Select a participant" />
                </SelectTrigger>
                <SelectContent>
                  {participants.map((participant) => (
                    <SelectItem key={participant.id} value={participant.id}>
                      {participant.firstName} {participant.lastName} - {participant.ndisNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>NDIS Plan</Label>
              <Select 
                value={selectedPlan} 
                onValueChange={setSelectedPlan}
                disabled={!selectedParticipant}
              >
                <SelectTrigger data-testid="select-plan">
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      Plan {plan.planNumber} - {plan.status}
                      {plan.startDate && ` (${new Date(plan.startDate as string).toLocaleDateString()})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedPlan && (
        <Tabs defaultValue="upload" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="upload">Upload & Process</TabsTrigger>
            <TabsTrigger value="goals">Extracted Goals</TabsTrigger>
            <TabsTrigger value="agreements">Service Agreements</TabsTrigger>
            <TabsTrigger value="history">Processing History</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload NDIS Plan Document
                </CardTitle>
                <CardDescription>
                  Upload a PDF of the participant's NDIS plan for automated processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    data-testid="file-upload-input"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <FileText className="h-12 w-12 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {uploadedFile ? uploadedFile.name : "Click to upload or drag and drop PDF file"}
                    </span>
                    <span className="text-xs text-gray-500">Maximum file size: 10MB</span>
                  </label>
                </div>

                {uploadedFile && (
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">{uploadedFile.name}</p>
                        <p className="text-xs text-gray-600">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleUploadClick}
                      disabled={uploadMutation.isPending || isProcessing}
                      data-testid="button-upload"
                    >
                      {uploadMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload & Process
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {isProcessing && (
                  <Alert>
                    <Brain className="h-4 w-4" />
                    <AlertDescription>
                      AI is analyzing the NDIS plan and extracting participant goals...
                      <Progress value={33} className="mt-2" />
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Processing Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Goal Extraction</p>
                      <p className="text-xs text-gray-500">Automatically identify all participant goals</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Funding Breakdown</p>
                      <p className="text-xs text-gray-500">Smart allocation of budget to goals</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Service Agreement</p>
                      <p className="text-xs text-gray-500">Generate comprehensive agreements</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            {selectedDocument?.extractedData ? (
              <div className="space-y-4">
                {(selectedDocument.extractedData as { goals?: ExtractedGoal[] })?.goals?.map((goal, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{goal.title}</h3>
                          <Badge>{goal.priority}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{goal.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {goal.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${goal.suggestedBudget}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) || (
                  <Alert>
                    <Target className="h-4 w-4" />
                    <AlertDescription>
                      No goals found in extracted data.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <Alert>
                <Target className="h-4 w-4" />
                <AlertDescription>
                  Goals extracted from the NDIS plan will appear here after processing.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="agreements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Digital Service Agreements</CardTitle>
                <CardDescription>Generated agreements with e-signature capability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {serviceAgreements.map((agreement) => (
                    <div key={agreement.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">Agreement #{agreement.agreementNumber}</p>
                        <p className="text-sm text-gray-500">
                          Created: {agreement.createdAt ? new Date(String(agreement.createdAt)).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(agreement.status || 'draft')}
                        <Button variant="outline" size="sm" data-testid={`button-view-${agreement.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {agreement.status === "draft" && (
                          <Button 
                            size="sm"
                            onClick={() => {
                              setShowAgreementDialog(true);
                            }}
                            data-testid={`button-send-${agreement.id}`}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Send
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {planDocuments.filter(d => d.processingStatus === "completed").map((doc) => (
                    <div key={doc.id} className="flex justify-end">
                      <Button
                        onClick={() => generateAgreementMutation.mutate(doc.id)}
                        disabled={generateAgreementMutation.isPending}
                        data-testid={`button-generate-${doc.id}`}
                      >
                        {generateAgreementMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4 mr-2" />
                            Generate Agreement
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Processing History</CardTitle>
                <CardDescription>Track all uploaded and processed NDIS plans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {planDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                        <div className="space-y-1">
                          <p className="font-medium">{doc.fileName}</p>
                          <p className="text-sm text-gray-500">
                            Uploaded: {doc.createdAt ? new Date(String(doc.createdAt)).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(doc.processingStatus)}
                        {doc.processingStatus === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => processMutation.mutate(doc.id)}
                            disabled={processMutation.isPending}
                            data-testid={`button-process-${doc.id}`}
                          >
                            <Brain className="h-4 w-4 mr-1" />
                            Process
                          </Button>
                        )}
                        {doc.processingStatus === "completed" && (
                          <Button variant="outline" size="sm" data-testid={`button-download-${doc.id}`}>
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Send Agreement Dialog */}
      <Dialog open={showAgreementDialog} onOpenChange={setShowAgreementDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Service Agreement</DialogTitle>
            <DialogDescription>
              Choose how to send the service agreement to the participant for review and signing
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Communication Method</Label>
              <Select 
                value={agreementCommunication.method} 
                onValueChange={(value) => setAgreementCommunication({...agreementCommunication, method: value})}
              >
                <SelectTrigger data-testid="select-communication-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                  </SelectItem>
                  <SelectItem value="sms">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      SMS
                    </div>
                  </SelectItem>
                  <SelectItem value="whatsapp">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      WhatsApp
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                {agreementCommunication.method === "email" ? "Email Address" : "Phone Number"}
              </Label>
              <Input
                placeholder={agreementCommunication.method === "email" ? "participant@email.com" : "+61 4XX XXX XXX"}
                value={agreementCommunication.recipient}
                onChange={(e) => setAgreementCommunication({...agreementCommunication, recipient: e.target.value})}
                data-testid="input-recipient"
              />
            </div>

            <div className="space-y-2">
              <Label>Message (Optional)</Label>
              <Textarea
                placeholder="Add a personal message to accompany the service agreement..."
                value={agreementCommunication.message}
                onChange={(e) => setAgreementCommunication({...agreementCommunication, message: e.target.value})}
                rows={3}
                data-testid="textarea-message"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAgreementDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (serviceAgreements[0]) {
                  sendAgreementMutation.mutate({
                    agreementId: serviceAgreements[0].id,
                    ...agreementCommunication
                  });
                }
              }}
              disabled={!agreementCommunication.recipient || sendAgreementMutation.isPending}
              data-testid="button-send-agreement"
            >
              {sendAgreementMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Agreement
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
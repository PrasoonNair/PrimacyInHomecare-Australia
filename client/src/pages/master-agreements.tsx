import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMasterAgreementSchema, type MasterAgreement, type InsertMasterAgreement } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { 
  FileTextIcon, 
  UploadIcon, 
  DownloadIcon, 
  EyeIcon, 
  CheckCircleIcon, 
  ClockIcon,
  XCircleIcon,
  FolderIcon,
  CalendarIcon,
  UserIcon,
  TagIcon
} from "lucide-react";
import { format } from "date-fns";

export default function MasterAgreements() {
  const [activeTab, setActiveTab] = useState("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();

  const { data: agreements = [], isLoading } = useQuery<MasterAgreement[]>({
    queryKey: ["/api/master-agreements"],
  });

  const uploadForm = useForm({
    resolver: zodResolver(insertMasterAgreementSchema.extend({
      effectiveFrom: insertMasterAgreementSchema.shape.effectiveFrom.optional(),
      expiresAt: insertMasterAgreementSchema.shape.expiresAt.optional(),
      fileSize: insertMasterAgreementSchema.shape.fileSize.optional(),
    })),
    defaultValues: {
      documentType: "service_agreement",
      title: "",
      description: "",
      fileName: "",
      fileUrl: "",
      mimeType: "",
      version: "1.0",
      isActive: true,
      category: "operational",
      accessLevel: "staff",
      complianceRequired: false,
      effectiveFrom: "",
      expiresAt: "",
      fileSize: 0,
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("/api/master-agreements", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master-agreements"] });
      setUploadDialogOpen(false);
      uploadForm.reset();
      toast({
        title: "Master Agreement Uploaded",
        description: "The document has been successfully uploaded and is now available.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload master agreement",
        variant: "destructive",
      });
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async (agreementId: string) => {
      // This would typically create a download link or open the file
      const agreement = agreements.find(a => a.id === agreementId);
      if (agreement) {
        window.open(agreement.fileUrl, '_blank');
        // Log the access
        await apiRequest(`/api/master-agreements/${agreementId}/access`, {
          method: "POST",
          body: JSON.stringify({ accessType: "download" }),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master-agreements"] });
      toast({
        title: "Download Started",
        description: "The document download has been initiated.",
      });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ agreementId, action, notes }: { agreementId: string; action: string; notes?: string }) => {
      const response = await apiRequest(`/api/master-agreements/${agreementId}/approve`, {
        method: "POST",
        body: JSON.stringify({ action, notes }),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master-agreements"] });
      toast({
        title: "Agreement Updated",
        description: "The approval status has been updated.",
      });
    },
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "approved": return "default";
      case "pending": return "secondary";
      case "rejected": return "destructive";
      default: return "outline";
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case "service_agreement": return "Service Agreement";
      case "schads": return "SCHADS Award";
      case "ndis_price_guide": return "NDIS Price Guide";
      case "invoice_template": return "Invoice Template";
      case "payroll_template": return "Payroll Template";
      default: return type;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "financial": return "bg-green-100 text-green-800";
      case "legal": return "bg-blue-100 text-blue-800";
      case "operational": return "bg-purple-100 text-purple-800";
      case "hr": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredAgreements = agreements.filter(agreement => {
    if (activeTab !== "all" && agreement.documentType !== activeTab) return false;
    if (selectedCategory !== "all" && agreement.category !== selectedCategory) return false;
    return true;
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // In a real implementation, this would upload to Google Cloud Storage
    // For now, we'll simulate the upload
    const mockFileUrl = `https://storage.googleapis.com/mock-bucket/${Date.now()}-${file.name}`;
    
    uploadForm.setValue("fileName", file.name);
    uploadForm.setValue("fileUrl", mockFileUrl);
    uploadForm.setValue("mimeType", file.type);
    uploadForm.setValue("fileSize", file.size);
    
    if (!uploadForm.getValues("title")) {
      uploadForm.setValue("title", file.name.replace(/\.[^/.]+$/, "")); // Remove extension
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Master Agreements</h1>
          <p className="text-muted-foreground">
            Manage reference documents including service agreements, SCHADS, NDIS price guides, and templates
          </p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48" data-testid="select-category-filter">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-upload-agreement">
                <UploadIcon className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Upload Master Agreement</DialogTitle>
              </DialogHeader>
              <Form {...uploadForm}>
                <form onSubmit={uploadForm.handleSubmit((data) => uploadMutation.mutate(data))} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={uploadForm.control}
                      name="documentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Document Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-document-type">
                                <SelectValue placeholder="Select document type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="service_agreement">Service Agreement</SelectItem>
                              <SelectItem value="schads">SCHADS Award</SelectItem>
                              <SelectItem value="ndis_price_guide">NDIS Price Guide</SelectItem>
                              <SelectItem value="invoice_template">Invoice Template</SelectItem>
                              <SelectItem value="payroll_template">Payroll Template</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={uploadForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="financial">Financial</SelectItem>
                              <SelectItem value="legal">Legal</SelectItem>
                              <SelectItem value="operational">Operational</SelectItem>
                              <SelectItem value="hr">HR</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={uploadForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Document Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter document title" data-testid="input-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={uploadForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter document description" rows={3} data-testid="textarea-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Upload File</label>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                      className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      data-testid="input-file-upload"
                    />
                    {uploadForm.watch("fileName") && (
                      <p className="text-sm text-muted-foreground">Selected: {uploadForm.watch("fileName")}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={uploadForm.control}
                      name="version"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Version</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="1.0" data-testid="input-version" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={uploadForm.control}
                      name="accessLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Access Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-access-level">
                                <SelectValue placeholder="Select access level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="public">Public</SelectItem>
                              <SelectItem value="staff">Staff</SelectItem>
                              <SelectItem value="management">Management</SelectItem>
                              <SelectItem value="admin">Admin Only</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={uploadForm.control}
                      name="effectiveFrom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Effective From</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" data-testid="input-effective-from" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={uploadForm.control}
                      name="expiresAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expires At</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" data-testid="input-expires-at" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setUploadDialogOpen(false)} data-testid="button-cancel">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={uploadMutation.isPending} data-testid="button-submit-upload">
                      {uploadMutation.isPending ? "Uploading..." : "Upload Document"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all" data-testid="tab-all">All Documents</TabsTrigger>
            <TabsTrigger value="service_agreement" data-testid="tab-service-agreement">Service Agreements</TabsTrigger>
            <TabsTrigger value="schads" data-testid="tab-schads">SCHADS</TabsTrigger>
            <TabsTrigger value="ndis_price_guide" data-testid="tab-ndis-price-guide">NDIS Price Guide</TabsTrigger>
            <TabsTrigger value="invoice_template" data-testid="tab-invoice-template">Invoice Templates</TabsTrigger>
            <TabsTrigger value="payroll_template" data-testid="tab-payroll-template">Payroll Templates</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {isLoading ? (
              <div className="text-center py-8" data-testid="loading-agreements">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading master agreements...</p>
              </div>
            ) : filteredAgreements.length === 0 ? (
              <div className="text-center py-8" data-testid="no-agreements">
                <FolderIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No documents found in this category.</p>
                <p className="text-sm text-muted-foreground mt-2">Upload your first master agreement to get started.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredAgreements.map((agreement) => (
                  <Card key={agreement.id} data-testid={`agreement-card-${agreement.id}`}>
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-xl flex items-center gap-2">
                            <FileTextIcon className="h-5 w-5" />
                            {agreement.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {getDocumentTypeLabel(agreement.documentType)} • Version {agreement.version}
                          </CardDescription>
                          {agreement.description && (
                            <p className="text-sm text-muted-foreground mt-2">{agreement.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={getStatusBadgeColor(agreement.approvalStatus || "pending")}>
                            {agreement.approvalStatus || "pending"}
                          </Badge>
                          {agreement.category && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(agreement.category)}`}>
                              {agreement.category}
                            </span>
                          )}
                          {agreement.isActive && (
                            <Badge variant="default">Active</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {agreement.effectiveFrom && (
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                              <span>Effective: {format(new Date(agreement.effectiveFrom), "MMM dd, yyyy")}</span>
                            </div>
                          )}
                          {agreement.expiresAt && (
                            <div className="flex items-center gap-2">
                              <ClockIcon className="h-4 w-4 text-muted-foreground" />
                              <span>Expires: {format(new Date(agreement.expiresAt), "MMM dd, yyyy")}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                            <span>Access: {agreement.accessLevel}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DownloadIcon className="h-4 w-4 text-muted-foreground" />
                            <span>{agreement.downloadCount || 0} downloads</span>
                          </div>
                        </div>

                        {agreement.tags && agreement.tags.length > 0 && (
                          <div className="flex items-center gap-2">
                            <TagIcon className="h-4 w-4 text-muted-foreground" />
                            <div className="flex gap-1 flex-wrap">
                              {agreement.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-2 border-t">
                          <div className="text-xs text-muted-foreground">
                            Uploaded {agreement.createdAt ? format(new Date(agreement.createdAt), "MMM dd, yyyy") : "Unknown"}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadMutation.mutate(agreement.id)}
                              data-testid={`button-view-${agreement.id}`}
                            >
                              <EyeIcon className="mr-2 h-4 w-4" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadMutation.mutate(agreement.id)}
                              data-testid={`button-download-${agreement.id}`}
                            >
                              <DownloadIcon className="mr-2 h-4 w-4" />
                              Download
                            </Button>
                            {agreement.approvalStatus === "pending" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => approveMutation.mutate({ 
                                    agreementId: agreement.id, 
                                    action: "approve" 
                                  })}
                                  data-testid={`button-approve-${agreement.id}`}
                                >
                                  <CheckCircleIcon className="mr-2 h-4 w-4" />
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => approveMutation.mutate({ 
                                    agreementId: agreement.id, 
                                    action: "reject" 
                                  })}
                                  data-testid={`button-reject-${agreement.id}`}
                                >
                                  <XCircleIcon className="mr-2 h-4 w-4" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
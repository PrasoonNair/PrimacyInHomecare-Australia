import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  FileText, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  User,
  Mail,
  Phone,
  Calendar,
  Building,
  Download,
  Eye,
  Lock,
  Camera,
  Fingerprint
} from 'lucide-react';

interface ApplicantPortalData {
  candidate: {
    id: string;
    name: string;
    email: string;
    phone: string;
    position: string;
    applicationId: string;
    status: string;
    invitedAt: string;
    portalExpiresAt: string;
  };
  requirements: Array<{
    id: string;
    title: string;
    description: string;
    type: 'document' | 'form' | 'verification' | 'assessment';
    required: boolean;
    completed: boolean;
    dueDate?: string;
    instructions: string;
  }>;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    uploadedAt: string;
    status: 'pending' | 'verified' | 'rejected';
    notes?: string;
  }>;
  nextSteps: Array<{
    id: string;
    title: string;
    description: string;
    scheduledDate?: string;
    status: 'pending' | 'scheduled' | 'completed';
  }>;
}

export default function ApplicantPortal() {
  const [token, setToken] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const { toast } = useToast();

  // Get token from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    if (urlToken) {
      setToken(urlToken);
      authenticatePortalMutation.mutate(urlToken);
    }
  }, []);

  // Authenticate portal access
  const authenticatePortalMutation = useMutation({
    mutationFn: (token: string) =>
      apiRequest('/api/applicant-portal/authenticate', {
        method: 'POST',
        body: JSON.stringify({ token })
      }),
    onSuccess: () => {
      setIsAuthenticated(true);
      queryClient.invalidateQueries({ queryKey: ['/api/applicant-portal/data'] });
    },
    onError: () => {
      toast({
        title: "Access Denied",
        description: "Invalid or expired portal link. Please contact HR for assistance.",
        variant: "destructive"
      });
    }
  });

  // Fetch portal data
  const { data: portalData } = useQuery<ApplicantPortalData>({
    queryKey: ['/api/applicant-portal/data', token],
    queryFn: () => apiRequest(`/api/applicant-portal/data?token=${token}`),
    enabled: isAuthenticated && !!token
  });

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      formData.append('token', token);
      const response = await fetch('/api/applicant-portal/upload-document', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applicant-portal/data'] });
      setSelectedFile(null);
      setUploadingDocument(false);
      toast({
        title: "Document Uploaded",
        description: "Your document has been uploaded successfully and is being reviewed.",
      });
    }
  });

  // Complete requirement mutation
  const completeRequirementMutation = useMutation({
    mutationFn: (requirementId: string) =>
      apiRequest('/api/applicant-portal/complete-requirement', {
        method: 'POST',
        body: JSON.stringify({ token, requirementId })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applicant-portal/data'] });
      toast({
        title: "Requirement Completed",
        description: "Thank you for completing this requirement.",
      });
    }
  });

  const handleFileUpload = (requirementId: string) => {
    if (!selectedFile) return;
    
    setUploadingDocument(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('requirementId', requirementId);
    
    uploadDocumentMutation.mutate(formData);
  };

  const getRequirementIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-4 w-4" />;
      case 'form': return <User className="h-4 w-4" />;
      case 'verification': return <Shield className="h-4 w-4" />;
      case 'assessment': return <Eye className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProgress = () => {
    if (!portalData?.requirements.length) return 0;
    const completed = portalData.requirements.filter(req => req.completed).length;
    return Math.round((completed / portalData.requirements.length) * 100);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Secure Applicant Portal</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <Lock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">
                  {token ? "Verifying your access..." : "Please use the secure link provided in your invitation."}
                </p>
              </div>
              
              {!token && (
                <div>
                  <Label htmlFor="access-token">Access Token</Label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      id="access-token"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Enter your access token"
                    />
                    <Button 
                      onClick={() => authenticatePortalMutation.mutate(token)}
                      disabled={!token || authenticatePortalMutation.isPending}
                    >
                      Access
                    </Button>
                  </div>
                </div>
              )}

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  This is a secure portal for Primacy Care Australia candidates. 
                  Access is granted only through verified invitation links.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!portalData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-500" />
          <p>Loading your application portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 max-w-4xl">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Welcome, {portalData.candidate.name}</CardTitle>
                <p className="text-gray-600 mt-1">
                  Application for: <strong>{portalData.candidate.position}</strong>
                </p>
              </div>
              <div className="text-right">
                <Badge className="mb-2">Application ID: {portalData.candidate.applicationId}</Badge>
                <p className="text-sm text-gray-500">
                  Portal expires: {new Date(portalData.candidate.portalExpiresAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Application Progress</span>
                  <span className="text-sm text-gray-500">{calculateProgress()}% Complete</span>
                </div>
                <Progress value={calculateProgress()} className="h-2" />
              </div>
              
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Complete all requirements below to proceed to the next stage of our hiring process.
                  Our team will review your submissions within 2-3 business days.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Application Requirements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portalData.requirements.map((requirement) => (
                <div
                  key={requirement.id}
                  className={`p-4 border rounded-lg ${
                    requirement.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getRequirementIcon(requirement.type)}
                        <h4 className="font-semibold">{requirement.title}</h4>
                        {requirement.required && (
                          <Badge variant="outline" className="text-xs">Required</Badge>
                        )}
                        <Badge className={getStatusColor(requirement.completed ? 'completed' : 'pending')}>
                          {requirement.completed ? 'Completed' : 'Pending'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{requirement.description}</p>
                      
                      <div className="text-sm text-gray-500 mb-3">
                        <strong>Instructions:</strong> {requirement.instructions}
                      </div>
                      
                      {requirement.dueDate && (
                        <p className="text-xs text-orange-600">
                          Due: {new Date(requirement.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      {requirement.type === 'document' && !requirement.completed && (
                        <div className="space-y-2">
                          <Input
                            type="file"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            className="text-sm"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleFileUpload(requirement.id)}
                            disabled={!selectedFile || uploadingDocument}
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            Upload
                          </Button>
                        </div>
                      )}
                      
                      {requirement.type === 'form' && !requirement.completed && (
                        <Button
                          size="sm"
                          onClick={() => completeRequirementMutation.mutate(requirement.id)}
                          disabled={completeRequirementMutation.isPending}
                        >
                          <User className="h-3 w-3 mr-1" />
                          Complete Form
                        </Button>
                      )}
                      
                      {requirement.type === 'verification' && !requirement.completed && (
                        <Button
                          size="sm"
                          onClick={() => completeRequirementMutation.mutate(requirement.id)}
                          disabled={completeRequirementMutation.isPending}
                        >
                          <Fingerprint className="h-3 w-3 mr-1" />
                          Verify Identity
                        </Button>
                      )}
                      
                      {requirement.completed && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Uploaded Documents */}
        {portalData.documents.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Your Documents</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {portalData.documents.map((document) => (
                  <div key={document.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4" />
                      <div>
                        <p className="font-medium">{document.name}</p>
                        <p className="text-sm text-gray-500">
                          Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(document.status)}>
                        {document.status.toUpperCase()}
                      </Badge>
                      {document.notes && (
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Notes
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        {portalData.nextSteps.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Next Steps</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {portalData.nextSteps.map((step) => (
                  <div key={step.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm text-gray-600">{step.description}</p>
                      {step.scheduledDate && (
                        <p className="text-sm text-blue-600">
                          Scheduled: {new Date(step.scheduledDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Badge className={getStatusColor(step.status)}>
                      {step.status.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2025 Primacy Care Australia. This is a secure portal for authorized applicants only.</p>
          <p>If you need assistance, please contact our HR team at hr@primacycare.com.au</p>
        </div>
      </div>
    </div>
  );
}
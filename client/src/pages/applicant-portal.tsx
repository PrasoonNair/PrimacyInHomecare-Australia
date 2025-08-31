import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Upload, 
  CheckCircle, 
  Clock, 
  FileText, 
  Eye,
  Download,
  Users,
  GraduationCap,
  Shield,
  Calendar,
  Phone,
  Mail,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { StaffTrainingModules } from '@/components/staff/training-modules';

interface ApplicantApplication {
  id: string;
  applicantName: string;
  email: string;
  phone: string;
  position: string;
  status: 'shortlisted' | 'documents_pending' | 'interview_scheduled' | 'references_pending' | 'contract_pending' | 'hired' | 'rejected';
  invitationSent: boolean;
  documentsUploaded: string[];
  interviewDate?: string;
  contractSigned: boolean;
  trainingProgress: number;
  referees: Array<{
    name: string;
    relationship: string;
    phone: string;
    email: string;
    contacted: boolean;
  }>;
}

export default function ApplicantPortal() {
  const [applicantId, setApplicantId] = useState<string>('');
  const [accessCode, setAccessCode] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const { toast } = useToast();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ applicantId, accessCode }: { applicantId: string; accessCode: string }) => {
      return apiRequest('/api/applicant-portal/login', {
        method: 'POST',
        body: JSON.stringify({ applicantId, accessCode })
      });
    },
    onSuccess: (data) => {
      setIsLoggedIn(true);
      localStorage.setItem('applicant_session', JSON.stringify({ applicantId, accessCode }));
      toast({
        title: "Welcome to Primacy Care Australia",
        description: "Access granted to your application portal.",
      });
    },
    onError: () => {
      toast({
        title: "Access Denied",
        description: "Invalid application ID or access code.",
        variant: "destructive"
      });
    }
  });

  // Check for existing session
  useEffect(() => {
    const session = localStorage.getItem('applicant_session');
    if (session) {
      const { applicantId: savedId, accessCode: savedCode } = JSON.parse(session);
      setApplicantId(savedId);
      setAccessCode(savedCode);
      setIsLoggedIn(true);
    }
  }, []);

  // Fetch application data
  const { data: application } = useQuery<ApplicantApplication>({
    queryKey: ['/api/applicant-portal/application', applicantId],
    queryFn: () => apiRequest(`/api/applicant-portal/application/${applicantId}`),
    enabled: isLoggedIn && !!applicantId
  });

  // Document upload mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiRequest('/api/applicant-portal/upload-document', {
        method: 'POST',
        body: formData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applicant-portal/application'] });
      toast({
        title: "Document Uploaded",
        description: "Your document has been successfully uploaded.",
      });
    }
  });

  // Add referee mutation
  const addRefereeMutation = useMutation({
    mutationFn: async (refereeData: any) => {
      return apiRequest('/api/applicant-portal/add-referee', {
        method: 'POST',
        body: JSON.stringify({ applicantId, ...refereeData })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applicant-portal/application'] });
      toast({
        title: "Referee Added",
        description: "Your referee has been added successfully.",
      });
    }
  });

  // Sign contract mutation
  const signContractMutation = useMutation({
    mutationFn: async (signatureData: any) => {
      return apiRequest('/api/applicant-portal/sign-contract', {
        method: 'POST',
        body: JSON.stringify({ applicantId, ...signatureData })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applicant-portal/application'] });
      toast({
        title: "Contract Signed",
        description: "Your employment contract has been signed successfully!",
      });
    }
  });

  const handleLogin = () => {
    if (!applicantId || !accessCode) {
      toast({
        title: "Missing Information",
        description: "Please enter both Application ID and Access Code.",
        variant: "destructive"
      });
      return;
    }
    loginMutation.mutate({ applicantId, accessCode });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setApplicantId('');
    setAccessCode('');
    localStorage.removeItem('applicant_session');
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shortlisted': return 'bg-blue-100 text-blue-800';
      case 'documents_pending': return 'bg-yellow-100 text-yellow-800';
      case 'interview_scheduled': return 'bg-purple-100 text-purple-800';
      case 'references_pending': return 'bg-orange-100 text-orange-800';
      case 'contract_pending': return 'bg-green-100 text-green-800';
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'shortlisted': return 20;
      case 'documents_pending': return 40;
      case 'interview_scheduled': return 60;
      case 'references_pending': return 80;
      case 'contract_pending': return 90;
      case 'hired': return 100;
      default: return 0;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Applicant Portal
            </CardTitle>
            <p className="text-gray-600">Primacy Care Australia</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="applicantId">Application ID</Label>
              <Input
                id="applicantId"
                type="text"
                placeholder="Enter your Application ID"
                value={applicantId}
                onChange={(e) => setApplicantId(e.target.value)}
                data-testid="input-applicant-id"
              />
            </div>
            <div>
              <Label htmlFor="accessCode">Access Code</Label>
              <Input
                id="accessCode"
                type="password"
                placeholder="Enter your Access Code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                data-testid="input-access-code"
              />
            </div>
            <Button
              onClick={handleLogin}
              className="w-full"
              disabled={loginMutation.isPending}
              data-testid="button-login"
            >
              {loginMutation.isPending ? 'Logging in...' : 'Access Portal'}
            </Button>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your Application ID and Access Code were sent to your email address when you were shortlisted.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4 animate-spin" />
          <p className="text-gray-600">Loading your application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Primacy Care Australia</h1>
              <Badge variant="outline">Applicant Portal</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {application.applicantName}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Application Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900">Position Applied</h3>
                <p className="text-lg text-blue-600">{application.position}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Current Status</h3>
                <Badge className={getStatusColor(application.status)}>
                  {application.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Progress</h3>
                <Progress value={getProgressPercentage(application.status)} className="mt-2" />
                <p className="text-sm text-gray-600 mt-1">
                  {getProgressPercentage(application.status)}% Complete
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="interview">Interview</TabsTrigger>
            <TabsTrigger value="references">References</TabsTrigger>
            <TabsTrigger value="contract">Contract</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {application.status === 'shortlisted' && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Congratulations! You've been shortlisted. Please upload the required documents to proceed.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {application.status === 'documents_pending' && (
                    <Alert>
                      <Upload className="h-4 w-4" />
                      <AlertDescription>
                        Please upload all required documents. Once complete, we'll schedule your interview.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {application.status === 'interview_scheduled' && (
                    <Alert>
                      <Calendar className="h-4 w-4" />
                      <AlertDescription>
                        Your interview has been scheduled. Check the Interview tab for details.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {application.status === 'references_pending' && (
                    <Alert>
                      <Users className="h-4 w-4" />
                      <AlertDescription>
                        Please provide your referee details so we can complete reference checks.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {application.status === 'contract_pending' && (
                    <Alert>
                      <FileText className="h-4 w-4" />
                      <AlertDescription>
                        Your employment contract is ready for signing. Check the Contract tab.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {application.status === 'hired' && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Welcome to the team! Your onboarding training is now available.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <DocumentUploadSection 
              applicantId={applicantId}
              uploadedDocuments={application.documentsUploaded}
              onUpload={(file) => {
                const formData = new FormData();
                formData.append('document', file);
                formData.append('applicantId', applicantId);
                uploadDocumentMutation.mutate(formData);
              }}
            />
          </TabsContent>

          <TabsContent value="interview" className="space-y-6">
            <InterviewSection 
              application={application}
            />
          </TabsContent>

          <TabsContent value="references" className="space-y-6">
            <ReferenceSection 
              referees={application.referees}
              onAddReferee={(refereeData) => addRefereeMutation.mutate(refereeData)}
              canAddReferees={application.status === 'references_pending'}
            />
          </TabsContent>

          <TabsContent value="contract" className="space-y-6">
            <ContractSection 
              application={application}
              onSignContract={(signatureData) => signContractMutation.mutate(signatureData)}
            />
          </TabsContent>

          <TabsContent value="training" className="space-y-6">
            {application.status === 'hired' || application.contractSigned ? (
              <StaffTrainingModules staffId={application.id} isApplicant={true} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <GraduationCap className="h-5 w-5" />
                    <span>Training Modules</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      Training modules will become available once your employment contract is signed and you're officially part of the team.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="bg-blue-50 p-4 rounded-lg mt-4">
                    <h4 className="font-semibold text-blue-800 mb-2">What to expect in your training:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• NDIS Introduction and Core Principles</li>
                      <li>• Person-Centered Support Approaches</li>
                      <li>• Risk Assessment and Safety Procedures</li>
                      <li>• Documentation and Compliance Requirements</li>
                      <li>• Cultural Competency Training</li>
                      <li>• Emergency Response Procedures</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Document Upload Section Component
function DocumentUploadSection({ 
  applicantId, 
  uploadedDocuments, 
  onUpload 
}: { 
  applicantId: string; 
  uploadedDocuments: string[]; 
  onUpload: (file: File) => void; 
}) {
  const requiredDocuments = [
    'Resume/CV',
    'Cover Letter',
    'Qualifications/Certificates',
    'NDIS Worker Screening Check',
    'Working with Children Check',
    'Driver\'s License',
    'First Aid Certificate'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Document Upload</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requiredDocuments.map((docType, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <span className="font-medium">{docType}</span>
              </div>
              <div className="flex items-center space-x-2">
                {uploadedDocuments.includes(docType) ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Uploaded
                  </Badge>
                ) : (
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onUpload(file);
                    }}
                    className="hidden"
                    id={`upload-${index}`}
                  />
                )}
                <label
                  htmlFor={`upload-${index}`}
                  className="cursor-pointer"
                >
                  <Button
                    variant={uploadedDocuments.includes(docType) ? "outline" : "default"}
                    size="sm"
                    asChild
                  >
                    <span>
                      {uploadedDocuments.includes(docType) ? 'Replace' : 'Upload'}
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Interview Section Component
function InterviewSection({ application }: { application: ApplicantApplication }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Interview Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {application.interviewDate ? (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your interview has been scheduled for {new Date(application.interviewDate).toLocaleString()}.
              </AlertDescription>
            </Alert>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Interview Preparation</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Review the NDIS Quality and Safeguards Commission standards</li>
                <li>• Prepare examples of working with people with disabilities</li>
                <li>• Bring copies of your qualifications and certifications</li>
                <li>• Be ready to discuss your motivation for NDIS work</li>
              </ul>
            </div>
          </div>
        ) : (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Your interview will be scheduled once all documents are uploaded and reviewed.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

// Reference Section Component
function ReferenceSection({ 
  referees, 
  onAddReferee, 
  canAddReferees 
}: { 
  referees: any[]; 
  onAddReferee: (data: any) => void; 
  canAddReferees: boolean; 
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [refereeData, setRefereeData] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: ''
  });

  const handleSubmitReferee = () => {
    if (!refereeData.name || !refereeData.phone || !refereeData.email) {
      return;
    }
    
    onAddReferee(refereeData);
    setRefereeData({ name: '', relationship: '', phone: '', email: '' });
    setShowAddForm(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Professional References</span>
          </div>
          {canAddReferees && referees.length < 3 && (
            <Button
              onClick={() => setShowAddForm(true)}
              size="sm"
              data-testid="button-add-referee"
            >
              Add Referee
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {referees.map((referee, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{referee.name}</h4>
                  <p className="text-sm text-gray-600">{referee.relationship}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm">
                    <span className="flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {referee.phone}
                    </span>
                    <span className="flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      {referee.email}
                    </span>
                  </div>
                </div>
                <Badge variant={referee.contacted ? "default" : "secondary"}>
                  {referee.contacted ? 'Contacted' : 'Pending'}
                </Badge>
              </div>
            </div>
          ))}

          {showAddForm && (
            <div className="p-4 border-2 border-dashed rounded-lg space-y-4">
              <h4 className="font-semibold">Add New Referee</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={refereeData.name}
                    onChange={(e) => setRefereeData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Referee's full name"
                  />
                </div>
                <div>
                  <Label>Relationship</Label>
                  <Input
                    value={refereeData.relationship}
                    onChange={(e) => setRefereeData(prev => ({ ...prev, relationship: e.target.value }))}
                    placeholder="e.g., Previous Manager"
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={refereeData.phone}
                    onChange={(e) => setRefereeData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Contact phone number"
                  />
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input
                    value={refereeData.email}
                    onChange={(e) => setRefereeData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Contact email address"
                    type="email"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSubmitReferee} size="sm">
                  Add Referee
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {referees.length === 0 && !showAddForm && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No references added yet</p>
              {canAddReferees && (
                <p className="text-sm">Please add at least 2 professional references</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Contract Section Component
function ContractSection({ 
  application, 
  onSignContract 
}: { 
  application: ApplicantApplication; 
  onSignContract: (data: any) => void; 
}) {
  const [showContract, setShowContract] = useState(false);
  const [agreementChecked, setAgreementChecked] = useState(false);

  const handleSignContract = () => {
    if (!agreementChecked) {
      return;
    }
    
    onSignContract({
      signedAt: new Date().toISOString(),
      ipAddress: 'xxx.xxx.xxx.xxx', // Would be actual IP
      signatureType: 'digital'
    });
  };

  if (application.status !== 'contract_pending' && !application.contractSigned) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Employment Contract</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Your employment contract will be available here once you complete the interview and reference check process.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Employment Contract</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {application.contractSigned ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Congratulations! You have successfully signed your employment contract. Welcome to Primacy Care Australia!
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Your employment contract is ready for digital signing. Please review carefully before signing.
              </AlertDescription>
            </Alert>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowContract(!showContract)}
                data-testid="button-view-contract"
              >
                <Eye className="h-4 w-4 mr-2" />
                {showContract ? 'Hide' : 'View'} Contract
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>

            {showContract && (
              <div className="bg-gray-50 p-6 rounded-lg border max-h-96 overflow-y-auto">
                <h4 className="font-bold text-center mb-4">EMPLOYMENT AGREEMENT</h4>
                <div className="space-y-4 text-sm">
                  <p><strong>Between:</strong> Primacy Care Australia (ABN: 12 345 678 901)</p>
                  <p><strong>And:</strong> {application.applicantName}</p>
                  <p><strong>Position:</strong> {application.position}</p>
                  <p>This Employment Agreement is made on {new Date().toLocaleDateString()}.</p>
                  
                  <div className="space-y-2">
                    <h5 className="font-semibold">1. POSITION AND COMMENCEMENT</h5>
                    <p>1.1 The Employee will be employed as {application.position}.</p>
                    <p>1.2 Employment will commence as agreed between the parties.</p>
                    <p>1.3 The Employee's employment is subject to a probationary period of 6 months.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="font-semibold">2. NDIS COMPLIANCE</h5>
                    <p>2.1 The Employee must maintain current NDIS Worker Screening Check.</p>
                    <p>2.2 The Employee agrees to maintain confidentiality of all participant information.</p>
                    <p>2.3 The Employee will comply with all NDIS Quality and Safeguards standards.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="font-semibold">3. GENERAL TERMS</h5>
                    <p>3.1 This agreement is subject to the Fair Work Act 2009 and SCHADS Award.</p>
                    <p>3.2 Standard working hours are as per the SCHADS Award provisions.</p>
                    <p>3.3 The Employee will receive all entitlements as per the SCHADS Award.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="agreement"
                checked={agreementChecked}
                onChange={(e) => setAgreementChecked(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="agreement" className="text-sm">
                I have read, understood, and agree to all terms and conditions of this employment contract.
              </label>
            </div>

            <Button
              onClick={handleSignContract}
              disabled={!agreementChecked}
              className="w-full"
              data-testid="button-sign-contract"
            >
              <FileText className="h-4 w-4 mr-2" />
              Digitally Sign Contract
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
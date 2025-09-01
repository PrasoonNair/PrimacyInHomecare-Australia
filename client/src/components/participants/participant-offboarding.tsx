import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  UserX, 
  FileText, 
  Calendar, 
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  MessageSquare,
  TrendingDown,
  Download,
  Send,
  Users,
  Building,
  Shield,
  Star,
  BarChart3,
  Receipt,
  Archive
} from 'lucide-react';
import { format } from 'date-fns';

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  ndisNumber: string;
  currentPlan?: any;
  status: string;
}

interface ParticipantOffboardingCase {
  id: string;
  participantId: string;
  participantName: string;
  ndisNumber: string;
  exitDate: string;
  exitReason: string;
  exitType: string; // plan_ended, participant_choice, provider_initiated, deceased, moved
  finalInvoiceCompleted: boolean;
  clientSurveyCompleted: boolean;
  offboardingStatus: string; // initiated, invoicing, survey_pending, completed
  assignedCoordinator: string;
  completionPercentage: number;
  outstandingAmount: number;
  finalShiftDate: string;
  createdAt: string;
}

interface ClientExitSurvey {
  id: string;
  participantId: string;
  overallSatisfaction: number;
  serviceQualityRating: number;
  staffProfessionalismRating: number;
  communicationRating: number;
  valueForMoneyRating: number;
  goalAchievementRating: number;
  wouldRecommendService: boolean;
  reasonForLeaving: string;
  improvementSuggestions: string;
  additionalComments: string;
  submittedAt: string;
  completedBy: string; // participant, guardian, advocate
}

interface FinalInvoicing {
  id: string;
  participantId: string;
  finalShiftDate: string;
  totalOutstandingHours: number;
  totalOutstandingAmount: number;
  invoiceGenerated: boolean;
  invoiceNumber?: string;
  paidInFull: boolean;
  reconciliationComplete: boolean;
  ndisClaimSubmitted: boolean;
}

export function ParticipantOffboarding() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedParticipant, setSelectedParticipant] = useState<string>('');
  const [showNewOffboardingForm, setShowNewOffboardingForm] = useState(false);
  const [selectedCase, setSelectedCase] = useState<string>('');
  const { toast } = useToast();

  // Fetch active participants
  const { data: participants = [] } = useQuery<Participant[]>({
    queryKey: ['/api/participants'],
    queryFn: () => apiRequest('/api/participants')
  });

  // Fetch offboarding cases
  const { data: offboardingCases = [] } = useQuery<ParticipantOffboardingCase[]>({
    queryKey: ['/api/participants/offboarding-cases'],
    queryFn: () => apiRequest('/api/participants/offboarding-cases')
  });

  // Fetch client exit surveys
  const { data: clientSurveys = [] } = useQuery<ClientExitSurvey[]>({
    queryKey: ['/api/participants/exit-surveys'],
    queryFn: () => apiRequest('/api/participants/exit-surveys')
  });

  // Fetch final invoicing data
  const { data: finalInvoicing = [] } = useQuery<FinalInvoicing[]>({
    queryKey: ['/api/participants/final-invoicing'],
    queryFn: () => apiRequest('/api/participants/final-invoicing')
  });

  // Create offboarding case mutation
  const createOffboardingMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest('/api/participants/offboarding-cases', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/participants/offboarding-cases'] });
      setShowNewOffboardingForm(false);
      toast({
        title: "Participant Offboarding Initiated",
        description: "Exit process has been started and final invoicing will be processed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to initiate participant offboarding process.",
        variant: "destructive"
      });
    }
  });

  // Generate final invoice mutation
  const generateFinalInvoiceMutation = useMutation({
    mutationFn: (participantId: string) =>
      apiRequest(`/api/participants/${participantId}/generate-final-invoice`, {
        method: 'POST'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/participants/final-invoicing'] });
      queryClient.invalidateQueries({ queryKey: ['/api/participants/offboarding-cases'] });
      toast({
        title: "Final Invoice Generated",
        description: "Final invoice has been created and submitted to NDIS.",
      });
    }
  });

  // Send exit survey mutation
  const sendExitSurveyMutation = useMutation({
    mutationFn: (participantId: string) =>
      apiRequest(`/api/participants/${participantId}/send-exit-survey`, {
        method: 'POST'
      }),
    onSuccess: () => {
      toast({
        title: "Exit Survey Sent",
        description: "Client exit survey invitation has been sent to participant/guardian.",
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'survey_pending': return 'bg-yellow-100 text-yellow-800';
      case 'invoicing': return 'bg-blue-100 text-blue-800';
      case 'initiated': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getExitTypeColor = (type: string) => {
    switch (type) {
      case 'plan_ended': return 'bg-blue-100 text-blue-800';
      case 'participant_choice': return 'bg-green-100 text-green-800';
      case 'provider_initiated': return 'bg-red-100 text-red-800';
      case 'deceased': return 'bg-gray-100 text-gray-800';
      case 'moved': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const activeParticipants = participants.filter(p => p.status === 'active');
  const activeOffboardingCases = offboardingCases.filter(c => c.offboardingStatus !== 'completed');
  const completedOffboardingCases = offboardingCases.filter(c => c.offboardingStatus === 'completed');

  return (
    <div className="space-y-6" data-testid="participant-offboarding">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserX className="h-5 w-5" />
            <span>Participant Exit & Offboarding</span>
            <Badge variant="outline">Service Delivery</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Comprehensive participant exit management including final shift invoicing, NDIS claim reconciliation, 
              and client satisfaction surveys to ensure smooth service transitions.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="offboarding" data-testid="tab-offboarding">Active Cases</TabsTrigger>
          <TabsTrigger value="invoicing" data-testid="tab-invoicing">Final Invoicing</TabsTrigger>
          <TabsTrigger value="surveys" data-testid="tab-surveys">Exit Surveys</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{activeOffboardingCases.length}</p>
                    <p className="text-sm text-gray-600">Active Exit Cases</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      ${activeOffboardingCases.reduce((sum, c) => sum + c.outstandingAmount, 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Outstanding Invoices</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{clientSurveys.length}</p>
                    <p className="text-sm text-gray-600">Exit Surveys</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Star className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {clientSurveys.length > 0 ? 
                        Math.round(clientSurveys.reduce((sum, s) => sum + s.overallSatisfaction, 0) / clientSurveys.length * 10) / 10 
                        : 0}
                    </p>
                    <p className="text-sm text-gray-600">Avg Satisfaction</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Exit Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeOffboardingCases.slice(0, 5).map(case_ => (
                  <div key={case_.id} className="flex justify-between items-center p-4 border rounded">
                    <div>
                      <h4 className="font-semibold">{case_.participantName}</h4>
                      <p className="text-sm text-gray-600">NDIS: {case_.ndisNumber}</p>
                      <p className="text-sm text-gray-500">Exit date: {new Date(case_.exitDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(case_.offboardingStatus)}>
                        {case_.offboardingStatus.replace('_', ' ')}
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">${case_.outstandingAmount.toLocaleString()} outstanding</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button 
                  onClick={() => setShowNewOffboardingForm(true)}
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  data-testid="button-new-exit"
                >
                  <UserX className="h-6 w-6" />
                  <span>Initiate Exit</span>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                >
                  <Receipt className="h-6 w-6" />
                  <span>Generate Final Invoice</span>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                >
                  <MessageSquare className="h-6 w-6" />
                  <span>Send Exit Survey</span>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                >
                  <Download className="h-6 w-6" />
                  <span>Export Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Cases Tab */}
        <TabsContent value="offboarding" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Active Exit Cases</h2>
            <Button 
              onClick={() => setShowNewOffboardingForm(true)}
              data-testid="button-new-case"
            >
              <UserX className="h-4 w-4 mr-2" />
              New Exit Case
            </Button>
          </div>

          <div className="grid gap-4">
            {activeOffboardingCases.map(case_ => (
              <Card key={case_.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{case_.participantName}</CardTitle>
                      <p className="text-sm text-gray-600">NDIS: {case_.ndisNumber}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Badge className={getStatusColor(case_.offboardingStatus)}>
                        {case_.offboardingStatus.replace('_', ' ')}
                      </Badge>
                      <Badge className={getExitTypeColor(case_.exitType)}>
                        {case_.exitType.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Exit Date:</span>
                      <p>{new Date(case_.exitDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium">Final Shift:</span>
                      <p>{new Date(case_.finalShiftDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium">Outstanding:</span>
                      <p>${case_.outstandingAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="font-medium">Progress:</span>
                      <p>{case_.completionPercentage}% complete</p>
                    </div>
                  </div>
                  
                  {case_.exitReason && (
                    <div className="mt-4">
                      <span className="font-medium">Exit Reason:</span>
                      <p className="text-sm text-gray-600">{case_.exitReason}</p>
                    </div>
                  )}

                  <div className="mt-4 flex space-x-2">
                    {!case_.finalInvoiceCompleted && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => generateFinalInvoiceMutation.mutate(case_.participantId)}
                      >
                        <Receipt className="h-3 w-3 mr-1" />
                        Generate Final Invoice
                      </Button>
                    )}
                    {!case_.clientSurveyCompleted && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => sendExitSurveyMutation.mutate(case_.participantId)}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Send Exit Survey
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Archive className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Final Invoicing Tab */}
        <TabsContent value="invoicing" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Final Shift Invoicing</h2>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Invoicing Report
            </Button>
          </div>

          <div className="grid gap-4">
            {finalInvoicing.map(invoice => (
              <Card key={invoice.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Final Invoice Processing</CardTitle>
                      <p className="text-sm text-gray-600">
                        Participant ID: {invoice.participantId} • Final Shift: {new Date(invoice.finalShiftDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant={invoice.invoiceGenerated ? "default" : "secondary"}>
                        {invoice.invoiceGenerated ? "Invoice Generated" : "Pending"}
                      </Badge>
                      {invoice.invoiceNumber && (
                        <Badge variant="outline">
                          {invoice.invoiceNumber}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Outstanding Hours:</span>
                      <p>{invoice.totalOutstandingHours}h</p>
                    </div>
                    <div>
                      <span className="font-medium">Amount:</span>
                      <p>${invoice.totalOutstandingAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="font-medium">NDIS Claim:</span>
                      <p className={invoice.ndisClaimSubmitted ? "text-green-600" : "text-yellow-600"}>
                        {invoice.ndisClaimSubmitted ? "Submitted" : "Pending"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Payment:</span>
                      <p className={invoice.paidInFull ? "text-green-600" : "text-red-600"}>
                        {invoice.paidInFull ? "Paid in Full" : "Outstanding"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    {!invoice.invoiceGenerated && (
                      <Button size="sm" variant="outline">
                        <Receipt className="h-3 w-3 mr-1" />
                        Generate Invoice
                      </Button>
                    )}
                    {invoice.invoiceGenerated && !invoice.ndisClaimSubmitted && (
                      <Button size="sm" variant="outline">
                        <Send className="h-3 w-3 mr-1" />
                        Submit NDIS Claim
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <FileText className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Exit Surveys Tab */}
        <TabsContent value="surveys" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Client Exit Survey Responses</h2>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Survey Data
            </Button>
          </div>

          <div className="grid gap-4">
            {clientSurveys.map(survey => (
              <Card key={survey.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Client Exit Survey</CardTitle>
                      <p className="text-sm text-gray-600">
                        Participant: {survey.participantId} • Submitted: {new Date(survey.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant="outline">
                        Overall: {survey.overallSatisfaction}/5
                      </Badge>
                      <Badge variant={survey.wouldRecommendService ? "default" : "destructive"}>
                        {survey.wouldRecommendService ? "Would Recommend" : "Would Not Recommend"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Service Quality:</span>
                        <p>{survey.serviceQualityRating}/5</p>
                      </div>
                      <div>
                        <span className="font-medium">Staff Professional:</span>
                        <p>{survey.staffProfessionalismRating}/5</p>
                      </div>
                      <div>
                        <span className="font-medium">Communication:</span>
                        <p>{survey.communicationRating}/5</p>
                      </div>
                      <div>
                        <span className="font-medium">Value for Money:</span>
                        <p>{survey.valueForMoneyRating}/5</p>
                      </div>
                      <div>
                        <span className="font-medium">Goal Achievement:</span>
                        <p>{survey.goalAchievementRating}/5</p>
                      </div>
                      <div>
                        <span className="font-medium">Completed By:</span>
                        <p className="capitalize">{survey.completedBy}</p>
                      </div>
                    </div>

                    <div>
                      <span className="font-medium">Reason for Leaving:</span>
                      <p className="text-sm text-gray-600 mt-1">{survey.reasonForLeaving}</p>
                    </div>

                    {survey.improvementSuggestions && (
                      <div>
                        <span className="font-medium">Improvement Suggestions:</span>
                        <p className="text-sm text-gray-600 mt-1">{survey.improvementSuggestions}</p>
                      </div>
                    )}

                    {survey.additionalComments && (
                      <div>
                        <span className="font-medium">Additional Comments:</span>
                        <p className="text-sm text-gray-600 mt-1">{survey.additionalComments}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <h2 className="text-2xl font-semibold">Exit Analytics & Insights</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Exit Reasons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Plan Ended', 'Moved Location', 'Service Quality', 'Cost Concerns', 'Provider Change', 'Other'].map(reason => {
                    const count = clientSurveys.filter(s => s.reasonForLeaving.includes(reason)).length;
                    const percentage = clientSurveys.length > 0 ? (count / clientSurveys.length * 100).toFixed(1) : 0;
                    return (
                      <div key={reason} className="flex justify-between items-center">
                        <span className="text-sm">{reason}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{count}</span>
                          <span className="text-xs text-gray-500">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Satisfaction Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: 'Overall', key: 'overallSatisfaction' },
                    { label: 'Service Quality', key: 'serviceQualityRating' },
                    { label: 'Staff Professional', key: 'staffProfessionalismRating' },
                    { label: 'Communication', key: 'communicationRating' },
                    { label: 'Goal Achievement', key: 'goalAchievementRating' }
                  ].map(item => {
                    const avg = clientSurveys.length > 0 ? 
                      (clientSurveys.reduce((sum, s) => sum + s[item.key as keyof ClientExitSurvey], 0) / clientSurveys.length).toFixed(1) 
                      : 0;
                    return (
                      <div key={item.key} className="flex justify-between items-center">
                        <span className="text-sm">{item.label}</span>
                        <Badge variant="outline">{avg}/5</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Outstanding</span>
                    <span className="font-medium">${finalInvoicing.reduce((sum, f) => sum + f.totalOutstandingAmount, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Invoices Generated</span>
                    <Badge variant="outline">{finalInvoicing.filter(f => f.invoiceGenerated).length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">NDIS Claims Submitted</span>
                    <Badge variant="outline">{finalInvoicing.filter(f => f.ndisClaimSubmitted).length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Paid in Full</span>
                    <Badge variant="outline">{finalInvoicing.filter(f => f.paidInFull).length}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Offboarding Form Modal */}
      {showNewOffboardingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Initiate Participant Exit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="participant-select">Participant</Label>
                <Select value={selectedParticipant} onValueChange={setSelectedParticipant}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select participant" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeParticipants.map(participant => (
                      <SelectItem key={participant.id} value={participant.id}>
                        {participant.firstName} {participant.lastName} - {participant.ndisNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="exit-date">Exit Date</Label>
                  <Input type="date" id="exit-date" />
                </div>
                <div>
                  <Label htmlFor="final-shift-date">Final Shift Date</Label>
                  <Input type="date" id="final-shift-date" />
                </div>
              </div>

              <div>
                <Label htmlFor="exit-type">Exit Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exit type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plan_ended">Plan Ended</SelectItem>
                    <SelectItem value="participant_choice">Participant Choice</SelectItem>
                    <SelectItem value="provider_initiated">Provider Initiated</SelectItem>
                    <SelectItem value="deceased">Deceased</SelectItem>
                    <SelectItem value="moved">Moved Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="exit-reason">Exit Reason</Label>
                <Textarea 
                  id="exit-reason" 
                  placeholder="Enter detailed reason for participant exit"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewOffboardingForm(false)}
                >
                  Cancel
                </Button>
                <Button>
                  Initiate Exit Process
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
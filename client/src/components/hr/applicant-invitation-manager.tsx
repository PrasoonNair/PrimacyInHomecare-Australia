import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  UserCheck, 
  UserX, 
  Mail, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Eye,
  Copy,
  ExternalLink
} from 'lucide-react';

interface ShortlistedApplicant {
  id: string;
  name: string;
  email: string;
  position: string;
  applicationDate: string;
  invitationSent: boolean;
  portalAccess: boolean;
  lastLogin?: string;
  status: 'shortlisted' | 'invited' | 'documents_pending' | 'interview_scheduled' | 'references_pending' | 'contract_pending' | 'hired' | 'rejected';
}

export function ApplicantInvitationManager() {
  const [selectedApplicant, setSelectedApplicant] = useState<ShortlistedApplicant | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const { toast } = useToast();

  // Fetch shortlisted applicants
  const { data: applicants = [] } = useQuery<ShortlistedApplicant[]>({
    queryKey: ['/api/recruitment/shortlisted-applicants'],
    queryFn: () => apiRequest('/api/recruitment/shortlisted-applicants')
  });

  // Send invitation mutation
  const sendInvitationMutation = useMutation({
    mutationFn: ({ applicantId, email }: { applicantId: string; email: string }) =>
      apiRequest('/api/applicant-portal/send-invitation', {
        method: 'POST',
        body: JSON.stringify({ applicantId, email })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recruitment/shortlisted-applicants'] });
      setShowInviteDialog(false);
      toast({
        title: "Invitation Sent",
        description: "The applicant portal invitation has been sent successfully.",
      });
    }
  });

  // Deactivate applicant mutation
  const deactivateApplicantMutation = useMutation({
    mutationFn: (applicantId: string) =>
      apiRequest(`/api/applicant-portal/deactivate/${applicantId}`, {
        method: 'PATCH'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recruitment/shortlisted-applicants'] });
      toast({
        title: "Access Deactivated",
        description: "Applicant portal access has been deactivated.",
      });
    }
  });

  const handleSendInvitation = (applicant: ShortlistedApplicant) => {
    setSelectedApplicant(applicant);
    setShowInviteDialog(true);
  };

  const handleConfirmInvitation = () => {
    if (selectedApplicant) {
      sendInvitationMutation.mutate({
        applicantId: selectedApplicant.id,
        email: selectedApplicant.email
      });
    }
  };

  const handleDeactivateAccess = (applicantId: string) => {
    if (confirm('Are you sure you want to deactivate portal access for this applicant?')) {
      deactivateApplicantMutation.mutate(applicantId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shortlisted': return 'bg-blue-100 text-blue-800';
      case 'invited': return 'bg-purple-100 text-purple-800';
      case 'documents_pending': return 'bg-yellow-100 text-yellow-800';
      case 'interview_scheduled': return 'bg-indigo-100 text-indigo-800';
      case 'references_pending': return 'bg-orange-100 text-orange-800';
      case 'contract_pending': return 'bg-green-100 text-green-800';
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const copyPortalLink = () => {
    const portalUrl = `${window.location.origin}/applicant-portal`;
    navigator.clipboard.writeText(portalUrl);
    toast({
      title: "Link Copied",
      description: "Portal link has been copied to clipboard.",
    });
  };

  return (
    <Card data-testid="applicant-invitation-manager">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Send className="h-5 w-5" />
            <span>Applicant Portal Management</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyPortalLink}
              data-testid="button-copy-portal-link"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy Portal Link
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/applicant-portal', '_blank')}
              data-testid="button-open-portal"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Portal
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 border rounded-lg bg-blue-50">
              <div className="text-2xl font-bold text-blue-600">
                {applicants.filter(a => a.status === 'shortlisted').length}
              </div>
              <p className="text-sm text-gray-600">Ready to Invite</p>
            </div>
            <div className="text-center p-3 border rounded-lg bg-purple-50">
              <div className="text-2xl font-bold text-purple-600">
                {applicants.filter(a => a.invitationSent).length}
              </div>
              <p className="text-sm text-gray-600">Invitations Sent</p>
            </div>
            <div className="text-center p-3 border rounded-lg bg-green-50">
              <div className="text-2xl font-bold text-green-600">
                {applicants.filter(a => a.portalAccess && a.lastLogin).length}
              </div>
              <p className="text-sm text-gray-600">Active Users</p>
            </div>
            <div className="text-center p-3 border rounded-lg bg-orange-50">
              <div className="text-2xl font-bold text-orange-600">
                {applicants.filter(a => a.invitationSent && !a.lastLogin).length}
              </div>
              <p className="text-sm text-gray-600">Pending Login</p>
            </div>
          </div>

          {/* Applicant List */}
          {applicants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserCheck className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No shortlisted applicants</p>
              <p className="text-sm">Shortlisted candidates will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applicants.map((applicant) => (
                <div 
                  key={applicant.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  data-testid={`applicant-${applicant.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold">{applicant.name}</h4>
                      <Badge className={getStatusColor(applicant.status)}>
                        {applicant.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {applicant.portalAccess && (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Portal Active
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Position:</strong> {applicant.position}</p>
                      <p><strong>Email:</strong> {applicant.email}</p>
                      <p><strong>Applied:</strong> {new Date(applicant.applicationDate).toLocaleDateString()}</p>
                      {applicant.lastLogin && (
                        <p><strong>Last Login:</strong> {new Date(applicant.lastLogin).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!applicant.invitationSent ? (
                      <Button
                        size="sm"
                        onClick={() => handleSendInvitation(applicant)}
                        disabled={sendInvitationMutation.isPending}
                        data-testid={`button-invite-${applicant.id}`}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Send Invitation
                      </Button>
                    ) : (
                      <>
                        {applicant.portalAccess && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeactivateAccess(applicant.id)}
                            disabled={deactivateApplicantMutation.isPending}
                            data-testid={`button-deactivate-${applicant.id}`}
                          >
                            <UserX className="h-3 w-3 mr-1" />
                            Deactivate
                          </Button>
                        )}
                        <Badge variant="secondary">
                          <Mail className="h-3 w-3 mr-1" />
                          Invited
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invitation Dialog */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Portal Invitation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedApplicant && (
                <>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      This will send an email invitation to {selectedApplicant.name} with their portal access credentials.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-3">
                    <div>
                      <Label>Applicant Name</Label>
                      <Input value={selectedApplicant.name} disabled />
                    </div>
                    <div>
                      <Label>Email Address</Label>
                      <Input value={selectedApplicant.email} disabled />
                    </div>
                    <div>
                      <Label>Position</Label>
                      <Input value={selectedApplicant.position} disabled />
                    </div>
                  </div>

                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      The invitation email will include:
                      <ul className="list-disc list-inside mt-2 text-sm">
                        <li>Application ID and access code</li>
                        <li>Link to the applicant portal</li>
                        <li>Instructions for document upload</li>
                        <li>Next steps in the process</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <div className="flex space-x-2 pt-4">
                    <Button
                      onClick={handleConfirmInvitation}
                      disabled={sendInvitationMutation.isPending}
                      data-testid="button-confirm-invitation"
                    >
                      {sendInvitationMutation.isPending ? 'Sending...' : 'Send Invitation'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowInviteDialog(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
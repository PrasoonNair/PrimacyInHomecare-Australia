import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  Send, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Shield,
  Link,
  Copy,
  Eye,
  Calendar,
  FileText,
  Settings,
  Zap
} from 'lucide-react';

interface ShortlistedCandidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  applicationSource: string;
  shortlistedAt: string;
  score: number;
  status: 'shortlisted' | 'invited' | 'portal_accessed' | 'documents_submitted' | 'interview_scheduled';
  preferredContact: 'email' | 'sms' | 'whatsapp';
  invitationsSent: Array<{
    channel: string;
    sentAt: string;
    status: 'sent' | 'delivered' | 'read' | 'clicked';
  }>;
  secureToken: string;
  portalAccessed: boolean;
  lastPortalActivity: string | null;
}

interface InvitationTemplate {
  id: string;
  name: string;
  subject: string;
  emailContent: string;
  smsContent: string;
  whatsappContent: string;
  includeSecureLink: boolean;
  customFields: Record<string, string>;
}

export function CandidateInvitationSystem() {
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [showInvitationDialog, setShowInvitationDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [invitationChannels, setInvitationChannels] = useState({
    email: true,
    sms: false,
    whatsapp: false
  });
  const [customMessage, setCustomMessage] = useState('');
  const [scheduledSend, setScheduledSend] = useState(false);
  const [sendDateTime, setSendDateTime] = useState('');
  const { toast } = useToast();

  // Fetch shortlisted candidates
  const { data: candidates = [] } = useQuery<ShortlistedCandidate[]>({
    queryKey: ['/api/recruitment/shortlisted-candidates'],
    queryFn: () => apiRequest('/api/recruitment/shortlisted-candidates')
  });

  // Fetch invitation templates
  const { data: templates = [] } = useQuery<InvitationTemplate[]>({
    queryKey: ['/api/recruitment/invitation-templates'],
    queryFn: () => apiRequest('/api/recruitment/invitation-templates')
  });

  // Send invitations mutation
  const sendInvitationsMutation = useMutation({
    mutationFn: (invitationData: any) =>
      apiRequest('/api/recruitment/send-invitations', {
        method: 'POST',
        body: JSON.stringify(invitationData)
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/recruitment/shortlisted-candidates'] });
      toast({
        title: "Invitations Sent Successfully",
        description: `${data.sent} invitations sent via ${data.channels.join(', ')}`,
      });
      setShowInvitationDialog(false);
      setSelectedCandidates([]);
    }
  });

  // Generate secure portal link mutation
  const generatePortalLinkMutation = useMutation({
    mutationFn: (candidateId: string) =>
      apiRequest('/api/recruitment/generate-portal-link', {
        method: 'POST',
        body: JSON.stringify({ candidateId })
      }),
    onSuccess: (data) => {
      navigator.clipboard.writeText(data.portalUrl);
      toast({
        title: "Portal Link Generated",
        description: "Secure link copied to clipboard",
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shortlisted': return 'bg-blue-100 text-blue-800';
      case 'invited': return 'bg-yellow-100 text-yellow-800';
      case 'portal_accessed': return 'bg-purple-100 text-purple-800';
      case 'documents_submitted': return 'bg-green-100 text-green-800';
      case 'interview_scheduled': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <Phone className="h-4 w-4" />;
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      default: return <Send className="h-4 w-4" />;
    }
  };

  const handleCandidateSelect = (candidateId: string) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const invitedCandidates = candidates.filter(c => c.status !== 'shortlisted');
  const pendingCandidates = candidates.filter(c => c.status === 'shortlisted');

  return (
    <div className="space-y-6" data-testid="candidate-invitation-system">
      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Candidate Invitation Management</span>
              <Badge variant="outline">{candidates.length} candidates</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCandidates(pendingCandidates.map(c => c.id))}
                disabled={pendingCandidates.length === 0}
                data-testid="button-select-all"
              >
                Select All Pending
              </Button>
              <Button
                size="sm"
                onClick={() => setShowInvitationDialog(true)}
                disabled={selectedCandidates.length === 0}
                data-testid="button-send-invitations"
              >
                <Send className="h-3 w-3 mr-1" />
                Send Invitations ({selectedCandidates.length})
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg bg-blue-50">
              <div className="text-2xl font-bold text-blue-600">{pendingCandidates.length}</div>
              <p className="text-sm text-gray-600">Awaiting Invitation</p>
            </div>
            <div className="text-center p-4 border rounded-lg bg-yellow-50">
              <div className="text-2xl font-bold text-yellow-600">
                {candidates.filter(c => c.status === 'invited').length}
              </div>
              <p className="text-sm text-gray-600">Invitations Sent</p>
            </div>
            <div className="text-center p-4 border rounded-lg bg-purple-50">
              <div className="text-2xl font-bold text-purple-600">
                {candidates.filter(c => c.portalAccessed).length}
              </div>
              <p className="text-sm text-gray-600">Portal Accessed</p>
            </div>
            <div className="text-center p-4 border rounded-lg bg-green-50">
              <div className="text-2xl font-bold text-green-600">
                {candidates.filter(c => c.status === 'documents_submitted').length}
              </div>
              <p className="text-sm text-gray-600">Documents Submitted</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Candidates List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Shortlisted Candidates</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {candidates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No shortlisted candidates</p>
              <p className="text-sm">Candidates will appear here after screening</p>
            </div>
          ) : (
            <div className="space-y-3">
              {candidates.map((candidate) => (
                <div 
                  key={candidate.id} 
                  className={`p-4 border rounded-lg ${
                    selectedCandidates.includes(candidate.id) ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  data-testid={`candidate-${candidate.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.includes(candidate.id)}
                        onChange={() => handleCandidateSelect(candidate.id)}
                        className="h-4 w-4"
                        disabled={candidate.status !== 'shortlisted'}
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold">{candidate.name}</h4>
                          <Badge className={getStatusColor(candidate.status)}>
                            {candidate.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            Score: {candidate.score}/100
                          </Badge>
                          {candidate.portalAccessed && (
                            <Badge variant="secondary">
                              <Shield className="h-3 w-3 mr-1" />
                              Portal Active
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Position:</strong> {candidate.position}</p>
                          <p><strong>Email:</strong> {candidate.email}</p>
                          <p><strong>Phone:</strong> {candidate.phone}</p>
                          <p><strong>Source:</strong> {candidate.applicationSource}</p>
                          <p><strong>Shortlisted:</strong> {new Date(candidate.shortlistedAt).toLocaleString()}</p>
                          {candidate.lastPortalActivity && (
                            <p><strong>Last Portal Activity:</strong> {new Date(candidate.lastPortalActivity).toLocaleString()}</p>
                          )}
                        </div>

                        {/* Invitation History */}
                        {candidate.invitationsSent.length > 0 && (
                          <div className="mt-3 p-3 bg-gray-50 rounded">
                            <h5 className="text-sm font-semibold mb-2">Invitation History</h5>
                            <div className="flex flex-wrap gap-2">
                              {candidate.invitationsSent.map((invitation, index) => (
                                <div key={index} className="flex items-center space-x-1 text-xs">
                                  {getChannelIcon(invitation.channel)}
                                  <span>{invitation.channel}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {invitation.status}
                                  </Badge>
                                  <span className="text-gray-500">
                                    {new Date(invitation.sentAt).toLocaleDateString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => generatePortalLinkMutation.mutate(candidate.id)}
                        data-testid={`button-portal-link-${candidate.id}`}
                      >
                        <Link className="h-3 w-3 mr-1" />
                        Portal Link
                      </Button>
                      
                      {candidate.status === 'shortlisted' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedCandidates([candidate.id]);
                            setShowInvitationDialog(true);
                          }}
                          data-testid={`button-invite-${candidate.id}`}
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Invite
                        </Button>
                      )}
                      
                      {candidate.portalAccessed && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Invitations Dialog */}
      <Dialog open={showInvitationDialog} onOpenChange={setShowInvitationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Candidate Invitations</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Selected Candidates */}
            <div>
              <Label className="text-base font-semibold">Selected Candidates ({selectedCandidates.length})</Label>
              <div className="mt-2 space-y-1">
                {selectedCandidates.map(id => {
                  const candidate = candidates.find(c => c.id === id);
                  return candidate ? (
                    <div key={id} className="text-sm p-2 bg-gray-50 rounded">
                      {candidate.name} - {candidate.position}
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            {/* Invitation Channels */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Invitation Channels</Label>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 p-3 border rounded">
                  <Mail className="h-4 w-4" />
                  <div className="flex-1">
                    <Label htmlFor="email-channel">Email</Label>
                    <p className="text-xs text-gray-500">Professional email invitation</p>
                  </div>
                  <Switch
                    id="email-channel"
                    checked={invitationChannels.email}
                    onCheckedChange={(checked) => 
                      setInvitationChannels(prev => ({ ...prev, email: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center space-x-2 p-3 border rounded">
                  <Phone className="h-4 w-4" />
                  <div className="flex-1">
                    <Label htmlFor="sms-channel">SMS</Label>
                    <p className="text-xs text-gray-500">Text message invitation</p>
                  </div>
                  <Switch
                    id="sms-channel"
                    checked={invitationChannels.sms}
                    onCheckedChange={(checked) => 
                      setInvitationChannels(prev => ({ ...prev, sms: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center space-x-2 p-3 border rounded">
                  <MessageSquare className="h-4 w-4" />
                  <div className="flex-1">
                    <Label htmlFor="whatsapp-channel">WhatsApp</Label>
                    <p className="text-xs text-gray-500">WhatsApp Business message</p>
                  </div>
                  <Switch
                    id="whatsapp-channel"
                    checked={invitationChannels.whatsapp}
                    onCheckedChange={(checked) => 
                      setInvitationChannels(prev => ({ ...prev, whatsapp: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Template Selection */}
            <div>
              <Label htmlFor="template-select">Invitation Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose invitation template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Message */}
            <div>
              <Label htmlFor="custom-message">Additional Message (Optional)</Label>
              <Textarea
                id="custom-message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Add a personal message to include with the invitation..."
                rows={3}
              />
            </div>

            {/* Scheduled Send */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="scheduled-send"
                  checked={scheduledSend}
                  onCheckedChange={setScheduledSend}
                />
                <Label htmlFor="scheduled-send">Schedule for later</Label>
              </div>
              
              {scheduledSend && (
                <div>
                  <Label htmlFor="send-datetime">Send Date & Time</Label>
                  <Input
                    id="send-datetime"
                    type="datetime-local"
                    value={sendDateTime}
                    onChange={(e) => setSendDateTime(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Security Notice */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                All invitations include secure, time-limited portal links that expire after 7 days. 
                Candidates will be required to verify their identity before accessing the hiring portal.
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-4">
              <Button
                onClick={() => {
                  const activeChannels = Object.entries(invitationChannels)
                    .filter(([_, enabled]) => enabled)
                    .map(([channel, _]) => channel);
                    
                  if (activeChannels.length === 0) {
                    toast({
                      title: "No Channels Selected",
                      description: "Please select at least one invitation channel",
                      variant: "destructive"
                    });
                    return;
                  }

                  sendInvitationsMutation.mutate({
                    candidateIds: selectedCandidates,
                    channels: activeChannels,
                    templateId: selectedTemplate,
                    customMessage,
                    scheduledSend,
                    sendDateTime
                  });
                }}
                disabled={sendInvitationsMutation.isPending || selectedCandidates.length === 0}
                className="flex-1"
              >
                {sendInvitationsMutation.isPending ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : scheduledSend ? (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Invitations
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Invitations Now
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowInvitationDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
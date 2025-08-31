import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Download, 
  Send, 
  Eye, 
  CheckCircle, 
  Clock,
  User,
  DollarSign,
  Calendar,
  Award
} from 'lucide-react';

interface ContractTemplate {
  id: string;
  name: string;
  type: 'full_time' | 'part_time' | 'casual' | 'contract';
  template: string;
  variables: string[];
  isDefault: boolean;
}

interface ContractData {
  applicantId: string;
  applicantName: string;
  position: string;
  department: string;
  employmentType: 'full_time' | 'part_time' | 'casual' | 'contract';
  startDate: string;
  salary: string;
  probationPeriod: number;
  workLocation: string;
  reportingManager: string;
  schacsLevel: string;
  allowances: string[];
  benefits: string[];
  specialConditions: string;
}

interface GeneratedContract {
  id: string;
  applicantId: string;
  templateId: string;
  content: string;
  status: 'draft' | 'sent' | 'signed' | 'executed';
  generatedAt: string;
  sentAt?: string;
  signedAt?: string;
  esignatureEnvelopeId?: string;
}

export function ContractGenerator({ applicationId, onContractGenerated }: { 
  applicationId: string; 
  onContractGenerated?: (contract: GeneratedContract) => void;
}) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [contractData, setContractData] = useState<Partial<ContractData>>({});
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [generatedContract, setGeneratedContract] = useState<string>('');
  const { toast } = useToast();

  // Fetch contract templates
  const { data: templates = [] } = useQuery<ContractTemplate[]>({
    queryKey: ['/api/hr/contract-templates'],
    queryFn: () => apiRequest('/api/hr/contract-templates')
  });

  // Fetch application details
  const { data: application } = useQuery({
    queryKey: ['/api/recruitment/applications', applicationId],
    queryFn: () => apiRequest(`/api/recruitment/applications/${applicationId}`)
  });

  // Generate contract mutation
  const generateContractMutation = useMutation({
    mutationFn: async (data: ContractData) => {
      return apiRequest('/api/hr/contracts/generate', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (contract) => {
      toast({
        title: "Contract Generated",
        description: "Employment contract has been successfully generated.",
      });
      setGeneratedContract(contract.content);
      onContractGenerated?.(contract);
      queryClient.invalidateQueries({ queryKey: ['/api/hr/contracts'] });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate contract. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Send for e-signature mutation
  const sendForSignatureMutation = useMutation({
    mutationFn: async (contractId: string) => {
      return apiRequest(`/api/hr/contracts/${contractId}/send-signature`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast({
        title: "Contract Sent",
        description: "Contract has been sent for electronic signature.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hr/contracts'] });
    }
  });

  const handleGenerateContract = () => {
    if (!selectedTemplate || !contractData.applicantName) {
      toast({
        title: "Missing Information",
        description: "Please select a template and fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    generateContractMutation.mutate({
      ...contractData,
      applicantId: applicationId,
      templateId: selectedTemplate
    } as ContractData);
  };

  const handlePreviewContract = () => {
    if (!selectedTemplate || !contractData.applicantName) {
      toast({
        title: "Missing Information", 
        description: "Please select a template and fill in required fields for preview.",
        variant: "destructive"
      });
      return;
    }

    // Generate preview (mock implementation)
    const template = templates.find(t => t.id === selectedTemplate);
    if (template) {
      let preview = template.template;
      
      // Replace variables with actual data
      Object.entries(contractData).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        preview = preview.replace(new RegExp(placeholder, 'g'), String(value || '[TO BE FILLED]'));
      });
      
      setGeneratedContract(preview);
      setPreviewDialogOpen(true);
    }
  };

  return (
    <div className="space-y-6" data-testid="contract-generator">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Contract Generation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template Selection */}
          <div>
            <Label htmlFor="template">Contract Template</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Select contract template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center space-x-2">
                      <span>{template.name}</span>
                      <Badge variant="outline">{template.type}</Badge>
                      {template.isDefault && <Badge variant="secondary">Default</Badge>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contract Details Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="applicantName">Applicant Name</Label>
              <Input
                id="applicantName"
                value={contractData.applicantName || application?.applicantName || ''}
                onChange={(e) => setContractData(prev => ({ ...prev, applicantName: e.target.value }))}
                data-testid="input-applicant-name"
              />
            </div>

            <div>
              <Label htmlFor="position">Position Title</Label>
              <Input
                id="position"
                value={contractData.position || application?.position || ''}
                onChange={(e) => setContractData(prev => ({ ...prev, position: e.target.value }))}
                data-testid="input-position"
              />
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Select
                value={contractData.department || ''}
                onValueChange={(value) => setContractData(prev => ({ ...prev, department: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intake">Intake</SelectItem>
                  <SelectItem value="service_delivery">Service Delivery</SelectItem>
                  <SelectItem value="hr_recruitment">HR & Recruitment</SelectItem>
                  <SelectItem value="finance_awards">Finance & Awards</SelectItem>
                  <SelectItem value="compliance_quality">Compliance & Quality</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="employmentType">Employment Type</Label>
              <Select
                value={contractData.employmentType || ''}
                onValueChange={(value) => setContractData(prev => ({ ...prev, employmentType: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="part_time">Part Time</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={contractData.startDate || ''}
                onChange={(e) => setContractData(prev => ({ ...prev, startDate: e.target.value }))}
                data-testid="input-start-date"
              />
            </div>

            <div>
              <Label htmlFor="salary">Annual Salary</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="salary"
                  className="pl-10"
                  value={contractData.salary || ''}
                  onChange={(e) => setContractData(prev => ({ ...prev, salary: e.target.value }))}
                  placeholder="65,000"
                  data-testid="input-salary"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="schacsLevel">SCHADS Classification</Label>
              <Select
                value={contractData.schacsLevel || ''}
                onValueChange={(value) => setContractData(prev => ({ ...prev, schacsLevel: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select SCHADS level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="level_1">Level 1 - Entry Support Worker</SelectItem>
                  <SelectItem value="level_2">Level 2 - Support Worker</SelectItem>
                  <SelectItem value="level_3">Level 3 - Senior Support Worker</SelectItem>
                  <SelectItem value="level_4">Level 4 - Coordinator</SelectItem>
                  <SelectItem value="level_5">Level 5 - Senior Coordinator</SelectItem>
                  <SelectItem value="level_6">Level 6 - Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reportingManager">Reporting Manager</Label>
              <Input
                id="reportingManager"
                value={contractData.reportingManager || ''}
                onChange={(e) => setContractData(prev => ({ ...prev, reportingManager: e.target.value }))}
                data-testid="input-reporting-manager"
              />
            </div>

            <div>
              <Label htmlFor="workLocation">Work Location</Label>
              <Input
                id="workLocation"
                value={contractData.workLocation || ''}
                onChange={(e) => setContractData(prev => ({ ...prev, workLocation: e.target.value }))}
                placeholder="Sydney, NSW"
                data-testid="input-work-location"
              />
            </div>

            <div>
              <Label htmlFor="probationPeriod">Probation Period (months)</Label>
              <Input
                id="probationPeriod"
                type="number"
                min="0"
                max="12"
                value={contractData.probationPeriod || 6}
                onChange={(e) => setContractData(prev => ({ ...prev, probationPeriod: parseInt(e.target.value) }))}
                data-testid="input-probation-period"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="specialConditions">Special Conditions</Label>
            <Textarea
              id="specialConditions"
              value={contractData.specialConditions || ''}
              onChange={(e) => setContractData(prev => ({ ...prev, specialConditions: e.target.value }))}
              placeholder="Any special conditions or notes for this contract..."
              rows={3}
              data-testid="textarea-special-conditions"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handlePreviewContract}
              disabled={!selectedTemplate}
              data-testid="button-preview-contract"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview Contract
            </Button>

            <Button
              onClick={handleGenerateContract}
              disabled={generateContractMutation.isPending || !selectedTemplate}
              data-testid="button-generate-contract"
            >
              {generateContractMutation.isPending ? (
                <Clock className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Generate Contract
            </Button>

            {generatedContract && (
              <Button
                variant="default"
                onClick={() => sendForSignatureMutation.mutate('contract-id')}
                disabled={sendForSignatureMutation.isPending}
                data-testid="button-send-signature"
              >
                <Send className="h-4 w-4 mr-2" />
                Send for E-Signature
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contract Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Contract Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {generatedContract}
              </pre>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
                Close Preview
              </Button>
              <Button onClick={handleGenerateContract}>
                Generate Final Contract
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contract Status Indicators */}
      {application && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Application Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Interview Completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">References Verified</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm">Contract Generation Ready</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
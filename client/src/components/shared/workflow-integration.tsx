import React, { useState } from 'react';
import { Workflow, ArrowRight, CheckCircle, Clock, AlertCircle, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';

interface WorkflowIntegrationProps {
  selectedItems: string[];
  itemType: 'staff' | 'participants';
  onWorkflowAction: (action: string, data: any) => Promise<void>;
}

interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  completedDate?: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  stages: WorkflowStage[];
  applicableItems: string[];
}

export function WorkflowIntegration({ selectedItems, itemType, onWorkflowAction }: WorkflowIntegrationProps) {
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock workflow templates - in real implementation, fetch from API
  const workflowTemplates: WorkflowTemplate[] = itemType === 'participants' ? [
    {
      id: 'participant-onboarding',
      name: 'Participant Onboarding',
      description: 'Complete NDIS participant onboarding process',
      stages: [
        { id: 'referral', name: 'Referral Received', description: 'Initial referral documentation', status: 'completed' },
        { id: 'verification', name: 'Data Verification', description: 'Verify participant information', status: 'current' },
        { id: 'agreement', name: 'Service Agreement', description: 'Prepare and send service agreement', status: 'pending' },
        { id: 'funding', name: 'Funding Verification', description: 'Verify NDIS funding', status: 'pending' },
        { id: 'allocation', name: 'Staff Allocation', description: 'Assign appropriate support workers', status: 'pending' },
        { id: 'meetgreet', name: 'Meet & Greet', description: 'Initial participant meeting', status: 'pending' },
        { id: 'commencement', name: 'Service Commencement', description: 'Begin service delivery', status: 'pending' }
      ],
      applicableItems: selectedItems
    },
    {
      id: 'plan-review',
      name: 'NDIS Plan Review',
      description: 'Comprehensive plan review and goal assessment',
      stages: [
        { id: 'assessment', name: 'Current Assessment', description: 'Review current plan status', status: 'pending' },
        { id: 'goals', name: 'Goal Evaluation', description: 'Assess progress on existing goals', status: 'pending' },
        { id: 'budget', name: 'Budget Analysis', description: 'Analyze budget utilization', status: 'pending' },
        { id: 'recommendations', name: 'Recommendations', description: 'Prepare improvement recommendations', status: 'pending' },
        { id: 'documentation', name: 'Documentation', description: 'Complete review documentation', status: 'pending' }
      ],
      applicableItems: selectedItems
    },
    {
      id: 'service-transition',
      name: 'Service Transition',
      description: 'Transition participants between service types',
      stages: [
        { id: 'evaluation', name: 'Current Service Evaluation', description: 'Assess current service effectiveness', status: 'pending' },
        { id: 'needs', name: 'Needs Assessment', description: 'Identify new service requirements', status: 'pending' },
        { id: 'planning', name: 'Transition Planning', description: 'Plan transition timeline', status: 'pending' },
        { id: 'implementation', name: 'Implementation', description: 'Execute transition plan', status: 'pending' },
        { id: 'monitoring', name: 'Monitoring', description: 'Monitor transition effectiveness', status: 'pending' }
      ],
      applicableItems: selectedItems
    }
  ] : [
    {
      id: 'staff-onboarding',
      name: 'Staff Onboarding',
      description: 'Complete staff onboarding and orientation',
      stages: [
        { id: 'documentation', name: 'Documentation Review', description: 'Verify qualifications and documents', status: 'pending' },
        { id: 'orientation', name: 'Orientation Program', description: 'Complete organizational orientation', status: 'pending' },
        { id: 'training', name: 'NDIS Training', description: 'Complete NDIS-specific training', status: 'pending' },
        { id: 'shadowing', name: 'Job Shadowing', description: 'Shadow experienced staff member', status: 'pending' },
        { id: 'assessment', name: 'Competency Assessment', description: 'Assess job readiness', status: 'pending' },
        { id: 'activation', name: 'Profile Activation', description: 'Activate full system access', status: 'pending' }
      ],
      applicableItems: selectedItems
    },
    {
      id: 'performance-review',
      name: 'Performance Review',
      description: 'Conduct comprehensive performance evaluation',
      stages: [
        { id: 'self-assessment', name: 'Self Assessment', description: 'Staff completes self-evaluation', status: 'pending' },
        { id: 'goal-review', name: 'Goal Review', description: 'Review previous period goals', status: 'pending' },
        { id: 'feedback', name: 'Feedback Collection', description: 'Collect participant and colleague feedback', status: 'pending' },
        { id: 'meeting', name: 'Review Meeting', description: 'Conduct formal review meeting', status: 'pending' },
        { id: 'planning', name: 'Development Planning', description: 'Plan professional development', status: 'pending' }
      ],
      applicableItems: selectedItems
    },
    {
      id: 'certification-renewal',
      name: 'Certification Renewal',
      description: 'Manage certification and qualification renewals',
      stages: [
        { id: 'identification', name: 'Identify Expiring Certs', description: 'Identify expiring certifications', status: 'pending' },
        { id: 'planning', name: 'Renewal Planning', description: 'Plan renewal timeline', status: 'pending' },
        { id: 'training', name: 'Required Training', description: 'Complete any required training', status: 'pending' },
        { id: 'examination', name: 'Examination/Assessment', description: 'Complete required examinations', status: 'pending' },
        { id: 'documentation', name: 'Documentation Update', description: 'Update system with new certifications', status: 'pending' }
      ],
      applicableItems: selectedItems
    }
  ];

  const getStageIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'current':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const calculateProgress = (stages: WorkflowStage[]) => {
    const completedStages = stages.filter(stage => stage.status === 'completed').length;
    return (completedStages / stages.length) * 100;
  };

  const handleStartWorkflow = async () => {
    if (!selectedWorkflow) {
      toast({
        title: "No Workflow Selected",
        description: "Please select a workflow to start",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onWorkflowAction('startWorkflow', {
        workflowId: selectedWorkflow,
        items: selectedItems
      });
      
      toast({
        title: "Workflow Started",
        description: `Started workflow for ${selectedItems.length} ${itemType}`,
      });
      
      setShowWorkflowDialog(false);
      setSelectedWorkflow('');
    } catch (error) {
      toast({
        title: "Workflow Failed",
        description: "Failed to start workflow. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedItems.length === 0) return null;

  const selectedTemplate = workflowTemplates.find(t => t.id === selectedWorkflow);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowWorkflowDialog(true)}
        className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
        data-testid="button-start-workflow"
      >
        <Workflow className="h-4 w-4 mr-1" />
        Start Workflow
      </Button>

      <Dialog open={showWorkflowDialog} onOpenChange={setShowWorkflowDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Workflow className="h-5 w-5 text-purple-600" />
              <span>Start Workflow</span>
            </DialogTitle>
            <DialogDescription>
              Select a workflow to apply to {selectedItems.length} selected {itemType}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Workflow Template
              </label>
              <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
                <SelectTrigger data-testid="select-workflow-template">
                  <SelectValue placeholder="Choose a workflow..." />
                </SelectTrigger>
                <SelectContent>
                  {workflowTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{template.name}</span>
                        <span className="text-sm text-gray-500">{template.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplate && (
              <Card className="mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{selectedTemplate.name}</span>
                    <Badge variant="outline" className="text-sm">
                      {selectedTemplate.stages.length} stages
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
                  
                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress Preview</span>
                      <span>{Math.round(calculateProgress(selectedTemplate.stages))}%</span>
                    </div>
                    <Progress value={calculateProgress(selectedTemplate.stages)} className="h-2" />
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-800 mb-2">Workflow Stages:</h4>
                    {selectedTemplate.stages.map((stage, index) => (
                      <div key={stage.id} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                        <div className="flex-shrink-0">
                          {getStageIcon(stage.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">{stage.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {stage.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">{stage.description}</p>
                        </div>
                        {index < selectedTemplate.stages.length - 1 && (
                          <ArrowRight className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Users className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          Impact: {selectedItems.length} {itemType}
                        </p>
                        <p className="text-xs text-blue-600">
                          This workflow will be applied to all selected {itemType}. 
                          Each will progress through the stages independently.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWorkflowDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleStartWorkflow} 
              disabled={!selectedWorkflow || isLoading}
              data-testid="button-start-selected-workflow"
            >
              {isLoading ? 'Starting...' : 'Start Workflow'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}